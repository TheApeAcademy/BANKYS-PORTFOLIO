-- ============================================================================
-- BASELINE SCHEMA SNAPSHOT
-- ============================================================================
-- This migration did not create the live schema — it captures it.
--
-- The Zebraish Supabase project (rxyqoaucuwdgpbzgfjqp) was built through 15
-- migrations applied directly against the managed project (001_core_tables
-- through 015_gateway_payment_returns_was_new), none of which were ever
-- committed to this repo. This file is a faithful, hand-verified snapshot of
-- the resulting end-state — every table, column, constraint, function,
-- trigger, view, RLS policy, and grant — captured by introspecting the live
-- database (pg_proc, information_schema, pg_policies, pg_constraint) on
-- 2026-08-17, before any further schema work begins.
--
-- From this point forward, every schema change is a real, incremental,
-- reviewable migration file. This file exists so `supabase db diff` /
-- `supabase migration list` have a true starting point instead of drifting
-- from an undocumented remote state.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------------
-- Sequence backing human-readable project codes (ZB-00001, ZB-00002, ...)
-- ----------------------------------------------------------------------------
create sequence if not exists public.project_code_seq;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.collaborators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  term_start date not null,
  term_end date,
  commission_rate numeric(5,4) not null default 0.10,
  bank_details jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'collaborator')),
  collaborator_id uuid references public.collaborators(id),
  full_name text,
  created_at timestamptz not null default now(),
  constraint collaborator_role_has_collaborator
    check ((role = 'collaborator' and collaborator_id is not null) or role = 'admin')
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text unique,
  client_name text not null,
  client_contact text,
  introduced_by uuid references public.collaborators(id),
  status text not null default 'new'
    check (status in ('draft', 'awaiting_payment', 'new', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  configuration jsonb,
  project_type text,
  quoted_price numeric(12,2),
  quoted_currency text default 'EUR',
  access_token text unique
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'NGN',
  method text,
  received_at timestamptz not null default now(),
  type text not null check (type in ('full', 'installment', 'partial')),
  payment_status text not null default 'normal'
    check (payment_status in ('normal', 'partial_refund', 'refunded', 'chargeback', 'cancelled', 'fraudulent')),
  refunded_amount numeric(12,2) not null default 0,
  recorded_by text,
  created_at timestamptz not null default now(),
  gateway text,
  gateway_ref text unique
);

create table public.commission_entries (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  collaborator_id uuid not null references public.collaborators(id),
  amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'EXCLUDED')),
  week_of date not null,
  adjustment_for uuid references public.commission_entries(id),
  payout_id uuid,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(id),
  week_of date not null,
  total_amount numeric(12,2) not null,
  currency text not null default 'NGN',
  exchange_rate numeric(12,6) not null default 1,
  paid_at timestamptz not null default now(),
  paid_by text not null,
  created_at timestamptz not null default now(),
  unique (collaborator_id, week_of)
);

alter table public.commission_entries
  add constraint commission_entries_payout_id_fkey
  foreign key (payout_id) references public.payouts(id);

create table public.audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  details jsonb not null default '{}'::jsonb,
  corrects_entry_id bigint references public.audit_log(id)
);

-- ----------------------------------------------------------------------------
-- Trigger functions + triggers
-- ----------------------------------------------------------------------------

create or replace function public.set_project_code()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.project_code is null then
    new.project_code := 'ZB-' || lpad(nextval('public.project_code_seq')::text, 5, '0');
  end if;
  return new;
end;
$function$;

create trigger trg_set_project_code
  before insert on public.projects
  for each row execute function public.set_project_code();

create or replace function public.audit_log_immutable()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  raise exception 'audit_log is append-only: % not permitted', tg_op;
end;
$function$;

create trigger trg_audit_log_no_update
  before update on public.audit_log
  for each row execute function public.audit_log_immutable();

create trigger trg_audit_log_no_delete
  before delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- ----------------------------------------------------------------------------
-- Auth/role helper functions
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$function$;

create or replace function public.current_collaborator_id()
returns uuid
language sql
stable security definer
set search_path to 'public'
as $function$
  select collaborator_id from public.profiles where id = auth.uid();
$function$;

-- NOTE: intentionally left without an explicit `set search_path` here to
-- faithfully mirror the live function as introspected — flagged by the
-- Supabase advisor as a mutable-search-path WARN, fixed in the next
-- migration (20260817190000_phase0_hardening.sql), not silently corrected
-- in this snapshot.
create or replace function public.is_privileged_caller()
returns boolean
language sql
stable
as $function$
  select public.is_admin()
    or coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role';
$function$;

-- ----------------------------------------------------------------------------
-- Collaborator-scoped views (self-filtered via current_collaborator_id())
-- ----------------------------------------------------------------------------

create view public.collaborator_ledger
with (security_invoker = false) as
select
  ce.id as entry_id,
  ce.collaborator_id,
  p.project_code,
  pay.amount as payment_amount,
  pay.currency as payment_currency,
  pay.received_at,
  pay.type as payment_type,
  ce.amount as commission_amount,
  ce.currency as commission_currency,
  ce.status,
  ce.week_of
from public.commission_entries ce
join public.payments pay on pay.id = ce.payment_id
join public.projects p on p.id = pay.project_id
where ce.collaborator_id = public.current_collaborator_id();

create view public.collaborator_payouts
with (security_invoker = false) as
select
  id as payout_id,
  collaborator_id,
  week_of,
  total_amount,
  currency,
  paid_at
from public.payouts
where collaborator_id = public.current_collaborator_id();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.collaborators enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.commission_entries enable row level security;
alter table public.payouts enable row level security;
alter table public.audit_log enable row level security;

create policy collaborators_admin_all on public.collaborators
  for all using (public.is_admin()) with check (public.is_admin());
create policy collaborators_self_select on public.collaborators
  for select using (id = public.current_collaborator_id());

create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy profiles_self_or_admin_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy projects_admin_all on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy payments_admin_all on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

create policy commission_entries_admin_all on public.commission_entries
  for all using (public.is_admin()) with check (public.is_admin());
create policy commission_entries_self_select on public.commission_entries
  for select using (collaborator_id = public.current_collaborator_id());

create policy payouts_admin_all on public.payouts
  for all using (public.is_admin()) with check (public.is_admin());
create policy payouts_self_select on public.payouts
  for select using (collaborator_id = public.current_collaborator_id());

create policy audit_log_admin_select on public.audit_log
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Money-moving RPCs — every one SECURITY DEFINER, gated by is_privileged_caller(),
-- writing its own append-only audit_log row. Never bypassed by direct table
-- writes; RLS above has no INSERT/UPDATE policy for non-admins on these tables.
-- ----------------------------------------------------------------------------

create or replace function public.record_payment(
  p_project_id uuid, p_amount numeric, p_currency text, p_method text,
  p_received_at timestamptz, p_type text, p_actor text
)
returns public.payments
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_payment public.payments;
  v_collab record;
  v_commission numeric(12,2);
  v_entry_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  insert into public.payments (project_id, amount, currency, method, received_at, type, recorded_by)
  values (p_project_id, p_amount, coalesce(p_currency,'NGN'), p_method, p_received_at, p_type, p_actor)
  returning * into v_payment;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PAYMENT_RECORDED', 'payment', v_payment.id,
    jsonb_build_object('project_id', p_project_id, 'amount', p_amount, 'currency', v_payment.currency, 'type', p_type));

  for v_collab in
    select * from public.collaborators
    where active and term_start <= p_received_at::date
      and (term_end is null or term_end >= p_received_at::date)
  loop
    v_commission := round(p_amount * v_collab.commission_rate, 2);
    insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of)
    values (v_payment.id, v_collab.id, v_commission, v_payment.currency, 'PENDING', date_trunc('week', p_received_at)::date)
    returning id into v_entry_id;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values (p_actor, 'COMMISSION_CREATED', 'commission_entry', v_entry_id,
      jsonb_build_object('payment_id', v_payment.id, 'collaborator_id', v_collab.id, 'amount', v_commission));
  end loop;

  return v_payment;
end;
$function$;

create or replace function public.record_gateway_payment(
  p_project_id uuid, p_amount numeric, p_currency text, p_gateway text, p_gateway_ref text, p_actor text,
  out payment public.payments, out was_new boolean
)
returns record
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_collab record;
  v_commission numeric(12,2);
  v_entry_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  insert into public.payments (project_id, amount, currency, method, received_at, type, recorded_by, gateway, gateway_ref)
  values (p_project_id, p_amount, coalesce(p_currency,'EUR'), p_gateway, now(), 'full', p_actor, p_gateway, p_gateway_ref)
  on conflict (gateway_ref) do nothing
  returning * into payment;

  if payment.id is null then
    select p.* into payment from public.payments p where p.gateway_ref = p_gateway_ref;
    was_new := false;
    return;
  end if;

  was_new := true;

  update public.projects set status = 'in_progress' where id = p_project_id and status <> 'in_progress';

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PAYMENT_RECORDED', 'payment', payment.id,
    jsonb_build_object('project_id', p_project_id, 'amount', p_amount, 'currency', payment.currency, 'gateway', p_gateway, 'gateway_ref', p_gateway_ref));

  for v_collab in
    select * from public.collaborators
    where active and term_start <= now()::date
      and (term_end is null or term_end >= now()::date)
  loop
    v_commission := round(p_amount * v_collab.commission_rate, 2);
    insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of)
    values (payment.id, v_collab.id, v_commission, payment.currency, 'PENDING', date_trunc('week', now())::date)
    returning id into v_entry_id;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values (p_actor, 'COMMISSION_CREATED', 'commission_entry', v_entry_id,
      jsonb_build_object('payment_id', payment.id, 'collaborator_id', v_collab.id, 'amount', v_commission));
  end loop;
end;
$function$;

create or replace function public.exclude_payment(
  p_payment_id uuid, p_new_status text, p_reason text, p_actor text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_entry record;
  v_adj_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_new_status not in ('cancelled','fraudulent','chargeback') then
    raise exception 'invalid exclusion status: %', p_new_status;
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'a reason is required to exclude a payment';
  end if;

  update public.payments set payment_status = p_new_status where id = p_payment_id;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PAYMENT_EXCLUDED', 'payment', p_payment_id, p_reason, jsonb_build_object('new_status', p_new_status));

  for v_entry in
    select * from public.commission_entries where payment_id = p_payment_id and status <> 'EXCLUDED' and adjustment_for is null
  loop
    if v_entry.status = 'PENDING' then
      update public.commission_entries set status = 'EXCLUDED' where id = v_entry.id;
      insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
      values (p_actor, 'COMMISSION_EXCLUDED', 'commission_entry', v_entry.id, p_reason, jsonb_build_object('payment_id', p_payment_id));
    elsif v_entry.status = 'PAID' then
      insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of, adjustment_for)
      values (v_entry.payment_id, v_entry.collaborator_id, -v_entry.amount, v_entry.currency, 'PENDING', date_trunc('week', now())::date, v_entry.id)
      returning id into v_adj_id;
      insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
      values (p_actor, 'COMMISSION_ADJUSTMENT_CREATED', 'commission_entry', v_adj_id, p_reason,
        jsonb_build_object('adjustment_for', v_entry.id, 'amount', -v_entry.amount, 'original_payment', p_payment_id));
    end if;
  end loop;
end;
$function$;

create or replace function public.record_partial_refund(
  p_payment_id uuid, p_refund_amount numeric, p_actor text, p_reason text default 'partial refund'
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_payment public.payments;
  v_entry record;
  v_new_refunded numeric;
  v_net_amount numeric;
  v_new_commission numeric;
  v_delta numeric;
  v_adj_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if v_payment.id is null then raise exception 'payment % not found', p_payment_id; end if;

  v_new_refunded := least(v_payment.refunded_amount + p_refund_amount, v_payment.amount);
  v_net_amount := v_payment.amount - v_new_refunded;

  update public.payments
    set refunded_amount = v_new_refunded,
        payment_status = case when v_new_refunded >= v_payment.amount then 'refunded' else 'partial_refund' end
    where id = p_payment_id;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PAYMENT_REFUNDED', 'payment', p_payment_id, p_reason,
    jsonb_build_object('refund_amount', p_refund_amount, 'net_amount', v_net_amount));

  for v_entry in
    select * from public.commission_entries where payment_id = p_payment_id and adjustment_for is null and status <> 'EXCLUDED'
  loop
    select round(v_net_amount * c.commission_rate, 2) into v_new_commission
    from public.collaborators c where c.id = v_entry.collaborator_id;

    v_delta := v_new_commission - v_entry.amount;
    if v_delta <> 0 then
      if v_entry.status = 'PENDING' then
        update public.commission_entries set amount = v_new_commission where id = v_entry.id;
        insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
        values (p_actor, 'COMMISSION_RECALCULATED', 'commission_entry', v_entry.id, p_reason,
          jsonb_build_object('old_amount', v_entry.amount, 'new_amount', v_new_commission));
      else
        insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of, adjustment_for)
        values (v_entry.payment_id, v_entry.collaborator_id, v_delta, v_entry.currency, 'PENDING', date_trunc('week', now())::date, v_entry.id)
        returning id into v_adj_id;
        insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
        values (p_actor, 'COMMISSION_ADJUSTMENT_CREATED', 'commission_entry', v_adj_id, p_reason,
          jsonb_build_object('adjustment_for', v_entry.id, 'amount', v_delta, 'original_payment', p_payment_id));
      end if;
    end if;
  end loop;
end;
$function$;

create or replace function public.mark_payout_paid(
  p_collaborator_id uuid, p_week_of date, p_exchange_rate numeric, p_currency text, p_actor text
)
returns public.payouts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_total numeric(12,2);
  v_payout public.payouts;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select coalesce(sum(amount * p_exchange_rate), 0) into v_total
  from public.commission_entries
  where collaborator_id = p_collaborator_id and week_of = p_week_of and status = 'PENDING';

  insert into public.payouts (collaborator_id, week_of, total_amount, currency, exchange_rate, paid_by)
  values (p_collaborator_id, p_week_of, v_total, p_currency, p_exchange_rate, p_actor)
  returning * into v_payout;

  update public.commission_entries
    set status = 'PAID', payout_id = v_payout.id
    where collaborator_id = p_collaborator_id and week_of = p_week_of and status = 'PENDING';

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PAYOUT_MARKED_PAID', 'payout', v_payout.id,
    jsonb_build_object('collaborator_id', p_collaborator_id, 'week_of', p_week_of, 'total_amount', v_total, 'currency', p_currency));

  return v_payout;
end;
$function$;

-- ----------------------------------------------------------------------------
-- Public intake/configurator RPCs — anon-callable by design
-- ----------------------------------------------------------------------------

create or replace function public.get_project_by_token(p_access_token text)
returns public.projects
language sql
security definer
set search_path to 'public'
as $function$
  select * from public.projects where access_token = p_access_token;
$function$;

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
begin
  if p_client_name is null or length(trim(p_client_name)) = 0 then
    raise exception 'client name is required';
  end if;

  if p_access_token is not null then
    select * into v_project from public.projects where projects.access_token = p_access_token;
  end if;

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
      status = 'awaiting_payment'
    where id = v_project.id
    returning * into v_project;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values ('portal-configurator', 'PROJECT_UPDATED', 'project', v_project.id,
      jsonb_build_object('project_code', v_project.project_code, 'quoted_price', p_quoted_price));
  else
    v_token := encode(gen_random_bytes(16), 'hex');
    insert into public.projects (client_name, client_contact, project_type, configuration, quoted_price, quoted_currency, status, access_token)
    values (trim(p_client_name), p_client_contact, p_project_type, p_configuration, p_quoted_price, coalesce(p_currency,'EUR'), 'awaiting_payment', v_token)
    returning * into v_project;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values ('portal-configurator', 'PROJECT_CREATED', 'project', v_project.id,
      jsonb_build_object('project_code', v_project.project_code, 'quoted_price', p_quoted_price));
  end if;

  return query select v_project.id, v_project.project_code, v_project.access_token, v_project.status;
end;
$function$;

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
begin
  if p_client_name is null or length(trim(p_client_name)) = 0 then
    raise exception 'client name is required';
  end if;

  insert into public.projects (client_name, client_contact, introduced_by, status)
  values (trim(p_client_name), p_client_contact, p_introduced_by, 'new')
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values ('portal-intake', 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code));

  return v_project.project_code;
end;
$function$;

-- ----------------------------------------------------------------------------
-- Grants — mirrors the live project exactly. Admin-only RPCs have EXECUTE
-- revoked from PUBLIC and re-granted only to authenticated/service_role
-- (admin access happens via a logged-in session or the service-role key,
-- never anonymously); is_privileged_caller() is still the real gate inside
-- each function body either way. Public intake/configurator RPCs are
-- deliberately anon-callable. record_gateway_payment and
-- submit_project_intake were never locked down and keep default
-- PUBLIC-executable grants (harmless: is_privileged_caller() still rejects
-- non-admin/non-service-role callers inside record_gateway_payment).
-- ----------------------------------------------------------------------------

revoke execute on function public.record_payment(uuid, numeric, text, text, timestamptz, text, text) from public;
grant execute on function public.record_payment(uuid, numeric, text, text, timestamptz, text, text) to authenticated, service_role;

revoke execute on function public.exclude_payment(uuid, text, text, text) from public;
grant execute on function public.exclude_payment(uuid, text, text, text) to authenticated, service_role;

revoke execute on function public.record_partial_refund(uuid, numeric, text, text) from public;
grant execute on function public.record_partial_refund(uuid, numeric, text, text) to authenticated, service_role;

revoke execute on function public.mark_payout_paid(uuid, date, numeric, text, text) from public;
grant execute on function public.mark_payout_paid(uuid, date, numeric, text, text) to authenticated, service_role;

revoke execute on function public.get_project_by_token(text) from public;
grant execute on function public.get_project_by_token(text) to anon, authenticated, service_role;

revoke execute on function public.save_project_configuration(text, text, text, text, jsonb, numeric, text) from public;
grant execute on function public.save_project_configuration(text, text, text, text, jsonb, numeric, text) to anon, authenticated, service_role;
