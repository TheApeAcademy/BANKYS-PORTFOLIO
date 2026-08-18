-- ============================================================================
-- Phase 2 — Customer Entity
-- ============================================================================
-- No customer identity exists today — projects.client_name/client_contact
-- are free text, not dedupable across projects. This migration adds:
--   1. public.customers — the new identity table
--   2. projects.customer_id — nullable FK linking projects to it
--   3. find_or_create_customer() — the single, anon-safe upsert-by-email path
--      used by every project-creation surface (public intake, public
--      configurator, and the admin create-project action)
--   4. RLS locking customers down to admin-only (customers never log in)
--   5. A one-time backfill linking existing projects to customers wherever
--      client_contact already looks like an email
--   6. submit_project_intake / save_project_configuration updated to call
--      find_or_create_customer() and set customer_id on every new/updated
--      project going forward
--   7. customer_overview — a plain (non-SECURITY-DEFINER) view aggregating
--      project count / total spent / last activity per customer, for the
--      admin Customers list. Deliberately NOT security definer (unlike
--      collaborator_ledger/collaborator_payouts) — it should respect the
--      querying admin's own RLS transparently, not add a second
--      security-definer-view lint for something that's admin-only anyway.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- customers
-- ----------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  company text,
  country text,
  notes text,
  -- Deliberately plain text with no CHECK, unlike status/payment_status:
  -- the set of sources ('manual', 'auto', future 'import'/'referral', ...)
  -- isn't a closed business-meaningful enum the way lifecycle statuses are.
  -- Matches the existing precedent of payments.method/payments.gateway,
  -- which are also unconstrained text in this schema.
  source text not null default 'manual',
  first_seen_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  -- Self-FK for future dedup/merge tooling (not implemented this phase).
  merged_into_id uuid references public.customers(id),
  constraint customers_not_self_merged check (merged_into_id is null or merged_into_id <> id),
  -- Enforces the "upsert by exact email" contract at the DB level, not just
  -- inside find_or_create_customer() — any future direct insert (e.g. a
  -- later admin "add customer" UI) gets the same dedup guarantee for free,
  -- and it's what makes `on conflict (email)` in the RPC below possible.
  constraint customers_email_unique unique (email)
);

-- Case-insensitive matching, enforced structurally rather than trusted to
-- every caller: email is always normalized to lower(trim(...)) before it's
-- stored, via this BEFORE trigger, so the unique constraint above and every
-- exact-match lookup are case-insensitive without needing an expression
-- index or repeated lower() calls at every call site.
create or replace function public.normalize_customer_email()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.email := nullif(lower(trim(new.email)), '');
  return new;
end;
$function$;

create trigger trg_customers_normalize_email
  before insert or update on public.customers
  for each row execute function public.normalize_customer_email();

create index if not exists idx_customers_merged_into_id on public.customers (merged_into_id);
-- No separate index needed for email lookup — the unique constraint above
-- already creates a supporting btree index on email.

-- Small shared helper so the "is this contact string an email?" heuristic
-- (used by the two RPCs below and the backfill) lives in exactly one place.
create or replace function public.looks_like_email(p_text text)
returns boolean
language sql
immutable
set search_path to 'public'
as $function$
  select p_text is not null and p_text like '%@%';
$function$;

-- ----------------------------------------------------------------------------
-- projects.customer_id
-- ----------------------------------------------------------------------------

alter table public.projects add column customer_id uuid references public.customers(id);
create index if not exists idx_projects_customer_id on public.projects (customer_id);

-- ----------------------------------------------------------------------------
-- RLS — admin-only, no exceptions. Customers have no login of their own
-- (unlike collaborators, which get a self-select policy), so there is no
-- non-admin role that should ever read this table directly.
-- ----------------------------------------------------------------------------

alter table public.customers enable row level security;

create policy customers_admin_all on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- find_or_create_customer — anon-safe upsert-by-email
-- ----------------------------------------------------------------------------
-- Unlike the money-moving RPCs above (record_payment, etc.), this
-- deliberately has NO is_privileged_caller() gate — it's designed to be
-- safe for anon callers by construction:
--   * exact (case-insensitive, via the trigger) email match only, never
--     ILIKE/fuzzy — an anon caller can never browse or guess into other
--     customers by partial name/phone/company
--   * returns ONLY the customer id, not the row. Returning the full row
--     would let anyone who already knows/guesses a customer's email
--     address read that customer's internal admin notes via a direct anon
--     RPC call. uuid is all any caller needs to link a project.
--   * no email at all -> always creates a fresh, unlinked customer row.
--     Matching on name/phone alone is too collision-prone to use as a
--     merge key, so a contact with no email never gets silently merged
--     into someone else.
create or replace function public.find_or_create_customer(
  p_email text, p_name text, p_contact text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_customer_id uuid;
  v_email text := nullif(lower(trim(p_email)), '');
  v_name text := nullif(trim(p_name), '');
begin
  if v_email is null then
    insert into public.customers (full_name, phone, source)
    values (v_name, nullif(trim(p_contact), ''), 'auto')
    returning id into v_customer_id;
    return v_customer_id;
  end if;

  insert into public.customers (full_name, email, phone, source)
  values (v_name, v_email, nullif(trim(p_contact), ''), 'auto')
  on conflict (email) do update
    set last_activity_at = now(),
        -- Backfill-only on match: never let a later, lower-trust
        -- submission (public intake/configurator) silently overwrite a
        -- name/phone that may already have been admin-corrected.
        full_name = coalesce(public.customers.full_name, excluded.full_name),
        phone = coalesce(public.customers.phone, excluded.phone)
  returning id into v_customer_id;

  return v_customer_id;
end;
$function$;

revoke execute on function public.find_or_create_customer(text, text, text) from public;
-- anon: called from submit_project_intake/save_project_configuration.
-- authenticated/service_role: called directly from the admin
-- create-project action.
grant execute on function public.find_or_create_customer(text, text, text) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Backfill: link existing projects to customers wherever client_contact
-- already looks like an email. Reuses find_or_create_customer() itself, so
-- backfilled customers and any customer created after this migration lands
-- dedup identically. Rows where client_contact is null or isn't email-like
-- are simply excluded by the WHERE clause below — customer_id stays null,
-- no error, no guess.
-- ----------------------------------------------------------------------------

do $$
declare
  v_project record;
  v_customer_id uuid;
begin
  for v_project in
    select id, client_name, client_contact
    from public.projects
    where public.looks_like_email(client_contact)
      and customer_id is null
  loop
    -- p_contact passed as null (not client_contact again): the contact
    -- string is already going into the email slot, so there's no separate
    -- phone value to store — passing it twice would put an email address
    -- into customers.phone.
    v_customer_id := public.find_or_create_customer(v_project.client_contact, v_project.client_name, null);
    update public.projects set customer_id = v_customer_id where id = v_project.id;
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- submit_project_intake — full replace, now links customer_id
-- ----------------------------------------------------------------------------

create or replace function public.submit_project_intake(
  p_client_name text, p_client_contact text, p_introduced_by uuid default null
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
  v_customer_id uuid;
begin
  if p_client_name is null or length(trim(p_client_name)) = 0 then
    raise exception 'client name is required';
  end if;

  v_customer_id := public.find_or_create_customer(
    case when public.looks_like_email(p_client_contact) then p_client_contact else null end,
    p_client_name,
    case when public.looks_like_email(p_client_contact) then null else p_client_contact end
  );

  insert into public.projects (client_name, client_contact, introduced_by, status, customer_id)
  values (trim(p_client_name), p_client_contact, p_introduced_by, 'new', v_customer_id)
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values ('portal-intake', 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'customer_id', v_customer_id));

  return v_project.project_code;
end;
$function$;

-- ----------------------------------------------------------------------------
-- save_project_configuration — full replace, now links customer_id
-- ----------------------------------------------------------------------------

create or replace function public.save_project_configuration(
  p_access_token text, p_client_name text, p_client_contact text, p_project_type text,
  p_configuration jsonb, p_quoted_price numeric, p_currency text default 'EUR'
)
returns table(project_id uuid, project_code text, access_token text, status text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
  v_token text;
  v_customer_id uuid;
begin
  if p_client_name is null or length(trim(p_client_name)) = 0 then
    raise exception 'client name is required';
  end if;

  if p_access_token is not null then
    select * into v_project from public.projects where projects.access_token = p_access_token;
  end if;

  -- Recomputed on every save (not just first creation) so editing the
  -- contact field mid-draft re-links to the correct customer instead of
  -- sticking with whatever matched on the first save.
  v_customer_id := public.find_or_create_customer(
    case when public.looks_like_email(p_client_contact) then p_client_contact else null end,
    p_client_name,
    case when public.looks_like_email(p_client_contact) then null else p_client_contact end
  );

  if v_project.id is not null then
    if v_project.status not in ('draft','awaiting_payment') then
      raise exception 'this project can no longer be edited';
    end if;
    update public.projects set
      client_name = trim(p_client_name),
      client_contact = p_client_contact,
      project_type = p_project_type,
      configuration = p_configuration,
      quoted_price = p_quoted_price,
      quoted_currency = coalesce(p_currency,'EUR'),
      status = 'awaiting_payment',
      customer_id = v_customer_id
    where id = v_project.id
    returning * into v_project;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values ('portal-configurator', 'PROJECT_UPDATED', 'project', v_project.id,
      jsonb_build_object('project_code', v_project.project_code, 'quoted_price', p_quoted_price));
  else
    v_token := encode(gen_random_bytes(16), 'hex');
    insert into public.projects (client_name, client_contact, project_type, configuration, quoted_price, quoted_currency, status, access_token, customer_id)
    values (trim(p_client_name), p_client_contact, p_project_type, p_configuration, p_quoted_price, coalesce(p_currency,'EUR'), 'awaiting_payment', v_token, v_customer_id)
    returning * into v_project;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values ('portal-configurator', 'PROJECT_CREATED', 'project', v_project.id,
      jsonb_build_object('project_code', v_project.project_code, 'quoted_price', p_quoted_price));
  end if;

  return query select v_project.id, v_project.project_code, v_project.access_token, v_project.status;
end;
$function$;

-- ----------------------------------------------------------------------------
-- customer_overview — admin Customers list aggregate. Plain view (querying
-- admin's own session applies), not SECURITY DEFINER: it only ever needs to
-- be readable by admins, and admins already have full SELECT on customers/
-- projects/payments via the existing _admin_all policies, so there's
-- nothing here that needs to bypass RLS.
-- ----------------------------------------------------------------------------

-- Views default to security_invoker = false (owner-privilege execution,
-- bypassing the querying user's RLS) unless set explicitly — the opposite
-- of what's intended here, so security_invoker = true is required, not
-- optional, to actually get "respect the querying admin's own RLS".
--
-- spent_by_currency is a {currency: total} jsonb map, not a single summed
-- number — payments.currency varies per payment (NGN default, but EUR/USD/
-- GBP depending on gateway/manual entry), so summing amounts across
-- currencies into one number would silently add NGN and EUR values
-- together as if they were the same unit. Matches the {currency: amount}
-- map pattern already used elsewhere in the app (e.g. the admin overview
-- page's pendingByCurrency).
create view public.customer_overview
with (security_invoker = true) as
select
  c.id as customer_id,
  c.full_name,
  c.email,
  c.phone,
  c.country,
  c.first_seen_at,
  c.last_activity_at,
  count(distinct p.id) as project_count,
  coalesce(
    (
      select jsonb_object_agg(by_currency.currency, by_currency.total)
      from (
        select pay2.currency, sum(pay2.amount) as total
        from public.payments pay2
        join public.projects p2 on p2.id = pay2.project_id
        where p2.customer_id = c.id and pay2.payment_status = 'normal'
        group by pay2.currency
      ) by_currency
    ),
    '{}'::jsonb
  ) as spent_by_currency,
  max(pay.received_at) as last_payment_at
from public.customers c
left join public.projects p on p.customer_id = c.id
left join public.payments pay on pay.project_id = p.id
group by c.id;
