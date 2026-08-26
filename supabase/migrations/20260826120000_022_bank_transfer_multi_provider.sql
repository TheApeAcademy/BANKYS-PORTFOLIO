-- ============================================================================
-- 022 — Allow more than one bank-transfer receiving account per currency
-- (e.g. both a Payoneer and a Skrill account able to receive EUR), instead
-- of the previous one-account-per-currency constraint. A client paying in
-- EUR now sees every active provider and can use whichever one they prefer;
-- admin still manually confirms funds arrived, same as before.
-- ============================================================================

alter table public.bank_transfer_receiving_accounts
  drop constraint if exists bank_transfer_receiving_accounts_currency_key;
alter table public.bank_transfer_receiving_accounts
  add constraint bank_transfer_receiving_accounts_currency_provider_key unique (currency, provider);

-- Now returns every active account for the currency, not just one.
create or replace function public.get_bank_transfer_instructions(p_currency text)
returns table(beneficiary_name text, details jsonb, provider text)
language sql
security definer
set search_path to 'public'
as $function$
  select beneficiary_name, details, provider
  from public.bank_transfer_receiving_accounts
  where currency = upper(trim(p_currency)) and active
  order by provider;
$function$;

-- Admin upsert now also takes provider and is keyed on (currency, provider)
-- instead of currency alone. Signature changed, so drop the old one first —
-- create or replace does not update a function's argument list.
drop function if exists public.upsert_bank_transfer_account(text, text, jsonb, boolean, text);

create or replace function public.upsert_bank_transfer_account(
  p_currency text, p_provider text, p_beneficiary_name text, p_details jsonb, p_active boolean, p_actor text
)
returns public.bank_transfer_receiving_accounts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_row public.bank_transfer_receiving_accounts;
  v_provider text := lower(trim(coalesce(p_provider, '')));
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if trim(coalesce(p_currency, '')) = '' or trim(coalesce(p_beneficiary_name, '')) = '' then
    raise exception 'Currency and beneficiary name are required.';
  end if;
  if v_provider = '' then v_provider := 'payoneer'; end if;

  insert into public.bank_transfer_receiving_accounts (currency, provider, beneficiary_name, details, active, updated_by)
  values (upper(trim(p_currency)), v_provider, trim(p_beneficiary_name), coalesce(p_details, '{}'::jsonb), coalesce(p_active, true), p_actor)
  on conflict (currency, provider) do update set
    beneficiary_name = excluded.beneficiary_name,
    details = excluded.details,
    active = excluded.active,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into v_row;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'BANK_TRANSFER_ACCOUNT_UPDATED', 'bank_transfer_account', v_row.id,
    jsonb_build_object('currency', v_row.currency, 'provider', v_row.provider, 'active', v_row.active));

  return v_row;
end;
$function$;

revoke execute on function public.upsert_bank_transfer_account(text, text, text, jsonb, boolean, text) from public;
grant execute on function public.upsert_bank_transfer_account(text, text, text, jsonb, boolean, text) to authenticated, service_role;

-- The pending-transfer payment row this creates is no longer tied to a
-- single named provider (the client may use any active account shown for
-- the currency) — generalize the gateway label accordingly.
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

  select * into v_payment from public.payments
  where project_id = v_project.id and payment_status = 'pending_transfer' and method = 'bank_transfer'
  limit 1;

  if v_payment.id is null then
    insert into public.payments (project_id, amount, currency, method, type, gateway, payment_status, received_at)
    values (v_project.id, v_project.quoted_price, coalesce(v_project.quoted_currency, 'EUR'), 'bank_transfer', 'full', 'manual', 'pending_transfer', now())
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
