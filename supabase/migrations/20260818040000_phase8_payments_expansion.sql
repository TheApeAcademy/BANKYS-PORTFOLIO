-- ============================================================================
-- Phase 8 — Payments Expansion: statuses, refunds, disputes
-- ============================================================================
-- Every DB dependency on the old 6-value payment_status vocabulary was
-- checked before this migration was written: record_payment/
-- record_gateway_payment never set payment_status explicitly (rely on the
-- column default), record_partial_refund sets 'refunded'/'partial_refund',
-- exclude_payment sets 'cancelled'/'fraudulent'/'chargeback', and
-- customer_overview filters on payment_status = 'normal'. All are updated
-- here; app-side references are fixed in the same commit as this file.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Swap the CHECK constraint to the expanded (superset) vocabulary FIRST,
-- THEN run the data migration (old -> new values). Doing it in the other
-- order — as an earlier draft of this migration did — fails: the UPDATE
-- that remaps 'normal' -> 'successful' would still be validated against
-- the OLD constraint (which doesn't contain 'successful') since it hadn't
-- been dropped yet. The new set is a strict superset of the old one, so
-- swapping first never risks rejecting any pre-migration value either.
-- 'normal' -> 'successful' (clean remap). 'partial_refund' ->
-- 'partially_refunded' (renamed for consistency with the rest of the new
-- set, no semantic change). 'fraudulent' is kept as-is, unchanged — it has
-- no clean equivalent in the spec's list and is operationally distinct
-- from 'disputed' (a fraud flag vs. an active gateway dispute).
-- ----------------------------------------------------------------------------

alter table public.payments drop constraint payments_payment_status_check;
alter table public.payments add constraint payments_payment_status_check check (
  payment_status in (
    'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded',
    'partially_refunded', 'disputed', 'chargeback', 'fraudulent',
    -- transitional: dropped once the data migration below has run
    'normal', 'partial_refund'
  )
);

update public.payments set payment_status = 'successful' where payment_status = 'normal';
update public.payments set payment_status = 'partially_refunded' where payment_status = 'partial_refund';

-- Now that no row uses the old values, tighten the constraint to the final
-- vocabulary (drops 'normal'/'partial_refund' as allowed going forward).
alter table public.payments drop constraint payments_payment_status_check;
alter table public.payments add constraint payments_payment_status_check check (
  payment_status in (
    'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded',
    'partially_refunded', 'disputed', 'chargeback', 'fraudulent'
  )
);
alter table public.payments alter column payment_status set default 'successful';

-- ----------------------------------------------------------------------------
-- 2. Fee/net breakdown columns. Nullable — this schema has no automated way
-- to populate them yet. The existing FlutterwaveTransaction type
-- (apps/studio/lib/flutterwave.ts) doesn't currently capture fee fields at
-- all, and this sandbox's network egress to api.flutterwave.com is blocked
-- (see the plan's Verification Approach notes), so the real verify-response
-- field names (Flutterwave's docs describe app_fee/charged_amount/
-- amount_settled, but that can't be confirmed live from here) are NOT
-- guessed at and wired into the webhook/verify path in this migration —
-- that needs live testing outside this sandbox. For now these are
-- admin-fillable via the UI; automatic gateway parsing is a follow-up.
-- ----------------------------------------------------------------------------

alter table public.payments add column gross_amount numeric;
alter table public.payments add column gateway_fee numeric;
alter table public.payments add column net_amount numeric;

-- ----------------------------------------------------------------------------
-- 3. payment_disputes — chargeback/dispute was previously just a bare
-- payment_status with no supporting detail.
-- ----------------------------------------------------------------------------

create table public.payment_disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  opened_at timestamptz not null default now(),
  reason text not null,
  gateway_dispute_id text,
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'resolved')),
  resolved_at timestamptz,
  resolution text
);

create index idx_payment_disputes_payment_id on public.payment_disputes (payment_id);

alter table public.payment_disputes enable row level security;
create policy payment_disputes_admin_select on public.payment_disputes for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- open_dispute — admin-only. Sets the payment to 'disputed' (excluded from
-- commission the same way exclude_payment excludes cancelled/fraudulent/
-- chargeback payments — a disputed payment's outcome isn't final yet, so
-- paying commission on it would be premature) and opens a payment_disputes
-- row. Reuses exclude_payment's PENDING/PAID branching for the commission
-- side so both paths behave identically instead of duplicating that logic.
-- ----------------------------------------------------------------------------

create or replace function public.open_dispute(
  p_payment_id uuid, p_reason text, p_gateway_dispute_id text, p_actor text
)
returns public.payment_disputes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dispute public.payment_disputes;
  v_entry record;
  v_adj_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'a reason is required to open a dispute';
  end if;

  update public.payments set payment_status = 'disputed' where id = p_payment_id;

  insert into public.payment_disputes (payment_id, reason, gateway_dispute_id)
  values (p_payment_id, p_reason, p_gateway_dispute_id)
  returning * into v_dispute;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PAYMENT_DISPUTE_OPENED', 'payment', p_payment_id, p_reason,
    jsonb_build_object('dispute_id', v_dispute.id, 'gateway_dispute_id', p_gateway_dispute_id));

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

  return v_dispute;
end;
$function$;

revoke execute on function public.open_dispute(uuid, text, text, text) from public;
revoke execute on function public.open_dispute(uuid, text, text, text) from anon;
grant execute on function public.open_dispute(uuid, text, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- resolve_dispute — admin-only. 'won' means Zebraish keeps the money (the
-- payment reverts to 'successful' and excluded commission is NOT
-- automatically restored — a human decides whether to re-include it,
-- consistent with exclude_payment never auto-reversing either). 'lost'
-- means the payment stays excluded and the payment_status moves to
-- 'chargeback' (the money is gone).
-- ----------------------------------------------------------------------------

create or replace function public.resolve_dispute(
  p_dispute_id uuid, p_outcome text, p_resolution text, p_actor text
)
returns public.payment_disputes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dispute public.payment_disputes;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_outcome not in ('won', 'lost') then
    raise exception 'invalid outcome: %, expected won or lost', p_outcome;
  end if;

  update public.payment_disputes
    set status = p_outcome, resolved_at = now(), resolution = p_resolution
    where id = p_dispute_id
    returning * into v_dispute;

  if v_dispute.id is null then
    raise exception 'dispute % not found', p_dispute_id;
  end if;

  update public.payments
    set payment_status = case when p_outcome = 'won' then 'successful' else 'chargeback' end
    where id = v_dispute.payment_id;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PAYMENT_DISPUTE_RESOLVED', 'payment', v_dispute.payment_id, p_resolution,
    jsonb_build_object('dispute_id', v_dispute.id, 'outcome', p_outcome));

  return v_dispute;
end;
$function$;

revoke execute on function public.resolve_dispute(uuid, text, text, text) from public;
revoke execute on function public.resolve_dispute(uuid, text, text, text) from anon;
grant execute on function public.resolve_dispute(uuid, text, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4. record_partial_refund: rewired to write 'partially_refunded' instead of
-- 'partial_refund', and to set audit_log.corrects_entry_id on the
-- PAYMENT_REFUNDED row it inserts — this column already existed but was
-- never actually populated by anything in the schema; a refund is exactly
-- the kind of correction it was added for. Everything else (the
-- PENDING-vs-PAID commission recalculation branching) is unchanged.
-- ----------------------------------------------------------------------------

create or replace function public.record_partial_refund(
  p_payment_id uuid, p_refund_amount numeric, p_actor text, p_reason text default 'partial refund'::text
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
  v_refund_log_id bigint;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if v_payment.id is null then raise exception 'payment % not found', p_payment_id; end if;

  v_new_refunded := least(v_payment.refunded_amount + p_refund_amount, v_payment.amount);
  v_net_amount := v_payment.amount - v_new_refunded;

  update public.payments
    set refunded_amount = v_new_refunded,
        payment_status = case when v_new_refunded >= v_payment.amount then 'refunded' else 'partially_refunded' end
    where id = p_payment_id;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PAYMENT_REFUNDED', 'payment', p_payment_id, p_reason,
    jsonb_build_object('refund_amount', p_refund_amount, 'net_amount', v_net_amount))
  returning id into v_refund_log_id;

  for v_entry in
    select * from public.commission_entries where payment_id = p_payment_id and adjustment_for is null and status <> 'EXCLUDED'
  loop
    select round(v_net_amount * c.commission_rate, 2) into v_new_commission
    from public.collaborators c where c.id = v_entry.collaborator_id;

    v_delta := v_new_commission - v_entry.amount;
    if v_delta <> 0 then
      if v_entry.status = 'PENDING' then
        update public.commission_entries set amount = v_new_commission where id = v_entry.id;
        insert into public.audit_log (actor, action, entity_type, entity_id, reason, details, corrects_entry_id)
        values (p_actor, 'COMMISSION_RECALCULATED', 'commission_entry', v_entry.id, p_reason,
          jsonb_build_object('old_amount', v_entry.amount, 'new_amount', v_new_commission), v_refund_log_id);
      else
        insert into public.commission_entries (payment_id, collaborator_id, amount, currency, status, week_of, adjustment_for)
        values (v_entry.payment_id, v_entry.collaborator_id, v_delta, v_entry.currency, 'PENDING', date_trunc('week', now())::date, v_entry.id)
        returning id into v_adj_id;
        insert into public.audit_log (actor, action, entity_type, entity_id, reason, details, corrects_entry_id)
        values (p_actor, 'COMMISSION_ADJUSTMENT_CREATED', 'commission_entry', v_adj_id, p_reason,
          jsonb_build_object('adjustment_for', v_entry.id, 'amount', v_delta, 'original_payment', p_payment_id), v_refund_log_id);
      end if;
    end if;
  end loop;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 5. exclude_payment: allow 'disputed' alongside the existing three
-- exclusion categories — a payment can now be excluded pending a dispute
-- outcome via this same path, sharing its PENDING/PAID commission
-- unwind logic rather than duplicating it in open_dispute for that case.
-- (open_dispute above still exists as the richer path that also creates a
-- payment_disputes row; this just keeps exclude_payment's own status list
-- consistent with the fact that 'disputed' is now a valid payment_status.)
-- ----------------------------------------------------------------------------

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
  if p_new_status not in ('cancelled', 'fraudulent', 'chargeback', 'disputed') then
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

-- ----------------------------------------------------------------------------
-- 6. set_payment_fees — admin-fillable fee/net breakdown, since automatic
-- gateway parsing isn't wired up yet (see the note on the columns above).
-- ----------------------------------------------------------------------------

create or replace function public.set_payment_fees(
  p_payment_id uuid, p_gross_amount numeric, p_gateway_fee numeric, p_net_amount numeric, p_actor text
)
returns public.payments
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_payment public.payments;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  update public.payments
    set gross_amount = p_gross_amount, gateway_fee = p_gateway_fee, net_amount = p_net_amount
    where id = p_payment_id
    returning * into v_payment;

  if v_payment.id is null then
    raise exception 'payment % not found', p_payment_id;
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PAYMENT_FEES_SET', 'payment', p_payment_id,
    jsonb_build_object('gross_amount', p_gross_amount, 'gateway_fee', p_gateway_fee, 'net_amount', p_net_amount));

  return v_payment;
end;
$function$;

revoke execute on function public.set_payment_fees(uuid, numeric, numeric, numeric, text) from public;
revoke execute on function public.set_payment_fees(uuid, numeric, numeric, numeric, text) from anon;
grant execute on function public.set_payment_fees(uuid, numeric, numeric, numeric, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 7. customer_overview: 'normal' -> 'successful'. Same DROP+CREATE
-- requirement as Phase 2's fix (CREATE OR REPLACE VIEW can't be used here
-- since only the WHERE clause changes, but keeping the pattern consistent
-- with how that earlier fix was done).
-- ----------------------------------------------------------------------------

drop view public.customer_overview;

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
    (select jsonb_object_agg(by_currency.currency, by_currency.total)
     from (
       select pay2.currency, sum(pay2.amount) as total
       from public.payments pay2
       join public.projects p2 on p2.id = pay2.project_id
       where p2.customer_id = c.id and pay2.payment_status = 'successful'
       group by pay2.currency
     ) by_currency),
    '{}'::jsonb
  ) as spent_by_currency,
  max(pay.received_at) as last_payment_at
from public.customers c
left join public.projects p on p.customer_id = c.id
left join public.payments pay on pay.project_id = p.id
group by c.id;
