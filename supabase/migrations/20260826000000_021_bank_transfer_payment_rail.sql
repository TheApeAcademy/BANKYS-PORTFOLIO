-- ============================================================================
-- 021 — Manual Bank Transfer payment rail (Payoneer receiving accounts).
--
-- Extends the existing payments/projects model rather than introducing a
-- separate orders table: `method`/`gateway` already distinguish payment
-- channel from provider (see record_gateway_payment), so this rail just
-- uses method='bank_transfer', gateway='payoneer', and a new
-- payment_status value ('pending_transfer') that sits before 'successful'.
-- The client only ever creates a *pending* row; only an admin action moves
-- it to 'successful' — never a client-side redirect or button click.
-- ============================================================================

alter table public.payments drop constraint if exists payments_payment_status_check;
alter table public.payments add constraint payments_payment_status_check check (
  payment_status = any (array[
    'pending','processing','successful','failed','cancelled','refunded',
    'partially_refunded','disputed','chargeback','fraudulent',
    'pending_transfer','requires_review'
  ])
);

-- ----------------------------------------------------------------------------
-- Receiving accounts — admin-entered, real values only (never invented by
-- the app). One row per currency. `details` stays a flexible jsonb bag
-- rather than a rigid iban/sort_code/routing_number schema, since exactly
-- which fields Payoneer provides differs per currency/account and must
-- never be guessed.
-- ----------------------------------------------------------------------------
create table public.bank_transfer_receiving_accounts (
  id uuid primary key default gen_random_uuid(),
  currency text not null unique,
  provider text not null default 'payoneer',
  beneficiary_name text not null,
  details jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.bank_transfer_receiving_accounts enable row level security;
create policy bank_transfer_accounts_admin_all on public.bank_transfer_receiving_accounts
  for all using (public.is_admin()) with check (public.is_admin());

-- Public read (anon, pre-auth) of one currency's active instructions — the
-- checkout page needs this before the client has any session.
create or replace function public.get_bank_transfer_instructions(p_currency text)
returns table(beneficiary_name text, details jsonb, provider text)
language sql
security definer
set search_path to 'public'
as $function$
  select beneficiary_name, details, provider
  from public.bank_transfer_receiving_accounts
  where currency = upper(trim(p_currency)) and active;
$function$;

revoke execute on function public.get_bank_transfer_instructions(text) from public;
grant execute on function public.get_bank_transfer_instructions(text) to anon, authenticated, service_role;

-- Admin upsert for the settings screen.
create or replace function public.upsert_bank_transfer_account(
  p_currency text, p_beneficiary_name text, p_details jsonb, p_active boolean, p_actor text
)
returns public.bank_transfer_receiving_accounts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_row public.bank_transfer_receiving_accounts;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if trim(coalesce(p_currency, '')) = '' or trim(coalesce(p_beneficiary_name, '')) = '' then
    raise exception 'Currency and beneficiary name are required.';
  end if;

  insert into public.bank_transfer_receiving_accounts (currency, beneficiary_name, details, active, updated_by)
  values (upper(trim(p_currency)), trim(p_beneficiary_name), coalesce(p_details, '{}'::jsonb), coalesce(p_active, true), p_actor)
  on conflict (currency) do update set
    beneficiary_name = excluded.beneficiary_name,
    details = excluded.details,
    active = excluded.active,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into v_row;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'BANK_TRANSFER_ACCOUNT_UPDATED', 'bank_transfer_account', v_row.id,
    jsonb_build_object('currency', v_row.currency, 'active', v_row.active));

  return v_row;
end;
$function$;

revoke execute on function public.upsert_bank_transfer_account(text, text, jsonb, boolean, text) from public;
grant execute on function public.upsert_bank_transfer_account(text, text, jsonb, boolean, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Client-facing intent (anon, pre-auth) — creates a pending_transfer payment
-- row and returns the reference (the project's own code, already unique)
-- and amount to display. Never marks anything paid.
-- ----------------------------------------------------------------------------
create or replace function public.create_bank_transfer_intent(p_access_token text)
returns table(payment_id uuid, project_code text, amount numeric, currency text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
  v_payment public.payments;
begin
  select * into v_project from public.projects where access_token = p_access_token;
  if v_project.id is null then
    raise exception 'Project not found.';
  end if;
  if v_project.quoted_price is null then
    raise exception 'This project does not have a price yet.';
  end if;
  if v_project.status not in ('draft', 'awaiting_payment') then
    raise exception 'This project has already been paid or is no longer awaiting payment.';
  end if;

  -- Reuse an existing still-pending intent for this project rather than
  -- stacking a new row every time the client reopens the bank-transfer
  -- screen (e.g. a page refresh).
  select * into v_payment from public.payments
  where project_id = v_project.id and payment_status = 'pending_transfer' and method = 'bank_transfer'
  limit 1;

  if v_payment.id is null then
    insert into public.payments (project_id, amount, currency, method, type, gateway, payment_status, received_at)
    values (v_project.id, v_project.quoted_price, coalesce(v_project.quoted_currency, 'EUR'), 'bank_transfer', 'full', 'payoneer', 'pending_transfer', now())
    returning * into v_payment;

    update public.projects set status = 'awaiting_payment' where id = v_project.id and status = 'draft';

    perform public.create_notification('payment', 'payment', v_payment.id,
      'Bank transfer initiated — ' || v_project.project_code,
      v_payment.amount::text || ' ' || v_payment.currency || ' expected via bank transfer — confirm once received.');
  end if;

  return query select v_payment.id, v_project.project_code, v_payment.amount, v_payment.currency;
end;
$function$;

revoke execute on function public.create_bank_transfer_intent(text) from public;
grant execute on function public.create_bank_transfer_intent(text) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Admin reconciliation — only these two paths ever move a bank-transfer
-- payment out of pending_transfer. confirm_bank_transfer mirrors
-- record_gateway_payment's commission-entry creation exactly, since this
-- is the moment the payment actually becomes real for accounting purposes.
-- ----------------------------------------------------------------------------
create or replace function public.confirm_bank_transfer(p_payment_id uuid, p_actor text)
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

  update public.payments set payment_status = 'successful', received_at = now()
  where id = p_payment_id and payment_status in ('pending_transfer', 'requires_review')
  returning * into v_payment;

  if v_payment.id is null then
    raise exception 'Payment not found, or not awaiting confirmation.';
  end if;

  update public.projects set status = 'in_progress' where id = v_payment.project_id and status <> 'in_progress';

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'BANK_TRANSFER_CONFIRMED', 'payment', v_payment.id,
    jsonb_build_object('project_id', v_payment.project_id, 'amount', v_payment.amount, 'currency', v_payment.currency));

  for v_collab in
    select * from public.collaborators
    where active and term_start <= now()::date
      and (term_end is null or term_end >= now()::date)
  loop
    v_commission := round(v_payment.amount * v_collab.commission_rate, 2);
    insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of)
    values (v_payment.id, v_collab.id, v_commission, v_payment.currency, 'PENDING', date_trunc('week', now())::date)
    returning id into v_entry_id;

    insert into public.audit_log (actor, action, entity_type, entity_id, details)
    values (p_actor, 'COMMISSION_CREATED', 'commission_entry', v_entry_id,
      jsonb_build_object('payment_id', v_payment.id, 'collaborator_id', v_collab.id, 'amount', v_commission));
  end loop;

  return v_payment;
end;
$function$;

create or replace function public.reject_bank_transfer(p_payment_id uuid, p_reason text, p_actor text)
returns public.payments
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_payment public.payments;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if trim(coalesce(p_reason, '')) = '' then raise exception 'Reason is required.'; end if;

  update public.payments set payment_status = 'failed'
  where id = p_payment_id and payment_status in ('pending_transfer', 'requires_review')
  returning * into v_payment;

  if v_payment.id is null then
    raise exception 'Payment not found, or not awaiting confirmation.';
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'BANK_TRANSFER_REJECTED', 'payment', v_payment.id, p_reason,
    jsonb_build_object('project_id', v_payment.project_id, 'amount', v_payment.amount, 'currency', v_payment.currency));

  return v_payment;
end;
$function$;

revoke execute on function public.confirm_bank_transfer(uuid, text) from public;
revoke execute on function public.confirm_bank_transfer(uuid, text) from anon;
grant execute on function public.confirm_bank_transfer(uuid, text) to authenticated, service_role;

revoke execute on function public.reject_bank_transfer(uuid, text, text) from public;
revoke execute on function public.reject_bank_transfer(uuid, text, text) from anon;
grant execute on function public.reject_bank_transfer(uuid, text, text) to authenticated, service_role;

-- 'bank_transfer_account' as a notification/audit entity type needs no
-- check-constraint change — audit_log.entity_type is unconstrained text
-- (see audit_log definition), same as every other entity_type value here.
