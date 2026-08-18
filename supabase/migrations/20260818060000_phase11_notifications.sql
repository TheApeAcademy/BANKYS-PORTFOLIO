-- ============================================================================
-- Phase 11 — Notifications Center
-- ============================================================================
-- recipient stays a plain text column (default 'admin') rather than being
-- dropped, even though there's only one admin today (RBAC explicitly out
-- of scope per the founder's decision) — matches the spec's schema and
-- costs nothing to keep; every current write just uses the default.
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient text not null default 'admin',
  type text not null check (
    type in ('payment', 'project', 'message', 'revision', 'overdue', 'refund', 'chargeback', 'commission_due', 'system_error')
  ),
  entity_type text,
  entity_id uuid,
  title text not null,
  body text,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_unread on public.notifications (recipient, created_at desc)
  where read_at is null and archived_at is null;

alter table public.notifications enable row level security;
create policy notifications_admin_select on public.notifications for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- create_notification — internal helper, not directly callable by any
-- client role (no grants beyond postgres/service_role). Every insert point
-- below calls this instead of inserting into notifications directly, so
-- the table's own shape only needs to change in one place. Safe to leave
-- ungated (ignore is_privileged_caller entirely) precisely because nothing
-- external can reach it — Postgres function-to-function calls don't need
-- an EXECUTE grant when both functions are owned by the same role, so this
-- still works when called from send_client_message (anon-invokable) even
-- though anon never gets a grant on create_notification itself.
-- ----------------------------------------------------------------------------

create or replace function public.create_notification(
  p_type text, p_entity_type text, p_entity_id uuid, p_title text, p_body text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.notifications (type, entity_type, entity_id, title, body)
  values (p_type, p_entity_type, p_entity_id, p_title, p_body);
end;
$function$;

revoke execute on function public.create_notification(text, text, uuid, text, text) from public;
revoke execute on function public.create_notification(text, text, uuid, text, text) from anon;
revoke execute on function public.create_notification(text, text, uuid, text, text) from authenticated;

-- ----------------------------------------------------------------------------
-- mark_notification_read / archive_notification — admin-only.
-- ----------------------------------------------------------------------------

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  update public.notifications set read_at = now() where id = p_notification_id and read_at is null;
end;
$function$;

revoke execute on function public.mark_notification_read(uuid) from public;
revoke execute on function public.mark_notification_read(uuid) from anon;
grant execute on function public.mark_notification_read(uuid) to authenticated, service_role;

create or replace function public.archive_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  update public.notifications set archived_at = now() where id = p_notification_id and archived_at is null;
end;
$function$;

revoke execute on function public.archive_notification(uuid) from public;
revoke execute on function public.archive_notification(uuid) from anon;
grant execute on function public.archive_notification(uuid) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Event-driven notifications — wired into the RPCs that already existed
-- for the events the spec's type list names. Each CREATE OR REPLACE below
-- is the same function body as its current live version with exactly one
-- addition: a create_notification() call at the point the event actually
-- happens, so re-running this migration is safe (idempotent replace, not
-- an ALTER that could drift from the live definition).
-- ----------------------------------------------------------------------------

-- payment: record_payment — exact live body (commission-entry loop
-- unchanged) with one create_notification() call added before the return.
create or replace function public.record_payment(
  p_project_id uuid, p_amount numeric, p_currency text, p_method text,
  p_received_at timestamp with time zone, p_type text, p_actor text
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
  v_project_code text;
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

  select project_code into v_project_code from public.projects where id = p_project_id;
  perform public.create_notification('payment', 'payment', v_payment.id,
    'Payment recorded — ' || coalesce(v_project_code, 'project'),
    p_amount::text || ' ' || v_payment.currency || ' via ' || coalesce(p_method, 'unspecified method'));

  return v_payment;
end;
$function$;

-- refund: record_partial_refund (Phase 8's version, extended with a notify call)
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
  v_project_code text;
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

  select project_code into v_project_code from public.projects where id = v_payment.project_id;
  perform public.create_notification('refund', 'payment', p_payment_id,
    'Refund recorded — ' || coalesce(v_project_code, 'project'),
    p_refund_amount::text || ' ' || v_payment.currency || ': ' || p_reason);

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

-- chargeback: resolve_dispute, only on a 'lost' outcome
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
  v_project_code text;
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

  if p_outcome = 'lost' then
    select p.project_code into v_project_code
    from public.payments pay join public.projects p on p.id = pay.project_id
    where pay.id = v_dispute.payment_id;
    perform public.create_notification('chargeback', 'payment', v_dispute.payment_id,
      'Dispute lost — ' || coalesce(v_project_code, 'project'), p_resolution);
  end if;

  return v_dispute;
end;
$function$;

-- message: send_client_message
create or replace function public.send_client_message(p_access_token text, p_body text)
returns public.project_messages
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
  v_message public.project_messages;
begin
  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'message body cannot be empty';
  end if;

  select * into v_project from public.projects where access_token = p_access_token;
  if v_project.id is null then
    raise exception 'invalid access token';
  end if;

  insert into public.project_messages (project_id, sender_type, sender_label, body)
  values (v_project.id, 'client', v_project.client_name, p_body)
  returning * into v_message;

  perform public.create_notification('message', 'project', v_project.id,
    'New message — ' || v_project.project_code, left(p_body, 200));

  return v_message;
end;
$function$;

-- project: submit_project_intake and create_project_by_admin — exact live
-- bodies (including submit_project_intake's `returns text` of project_code,
-- not the row, and its 'portal-intake' actor / looks_like_email() helper)
-- with one create_notification() call added before each return.
create or replace function public.submit_project_intake(
  p_client_name text, p_client_contact text, p_introduced_by uuid default null::uuid
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
  values (trim(p_client_name), p_client_contact, p_introduced_by, 'lead', v_customer_id)
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values ('portal-intake', 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'customer_id', v_customer_id));

  perform public.create_notification('project', 'project', v_project.id,
    'New lead — ' || v_project.project_code, p_client_name);

  return v_project.project_code;
end;
$function$;

create or replace function public.create_project_by_admin(
  p_client_name text, p_client_contact text, p_customer_id uuid, p_actor text
)
returns public.projects
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_client_name is null or length(trim(p_client_name)) = 0 then
    raise exception 'client name is required';
  end if;

  insert into public.projects (client_name, client_contact, customer_id, status)
  values (trim(p_client_name), nullif(trim(p_client_contact), ''), p_customer_id, 'lead')
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'source', 'admin', 'customer_id', p_customer_id));

  perform public.create_notification('project', 'project', v_project.id,
    'Project created — ' || v_project.project_code, p_client_name);

  return v_project;
end;
$function$;

-- revision: advance_project_stage, only when the newly-current stage maps to revision_in_progress
create or replace function public.advance_project_stage(
  p_project_id uuid, p_stage_key text, p_actor text
)
returns public.project_stages
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_stage public.project_stages;
  v_old_status text;
  v_incomplete_earlier int;
  v_next_stage_key text;
  v_next_status text;
  v_project_code text;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select * into v_stage from public.project_stages
    where project_id = p_project_id and stage_key = p_stage_key
    for update;
  if v_stage.id is null then
    raise exception 'stage % not found for project %', p_stage_key, p_project_id;
  end if;
  if v_stage.status = 'complete' then
    raise exception 'stage % is already complete', p_stage_key;
  end if;

  select count(*) into v_incomplete_earlier
  from public.project_stages
  where project_id = p_project_id
    and stage_order < v_stage.stage_order
    and status <> 'complete';
  if v_incomplete_earlier > 0 then
    raise exception 'cannot complete stage % out of order: % earlier stage(s) not yet complete',
      p_stage_key, v_incomplete_earlier;
  end if;

  v_old_status := v_stage.status;

  update public.project_stages
    set status = 'complete', completed_at = now(), completed_by = p_actor
    where id = v_stage.id
    returning * into v_stage;

  insert into public.project_stage_history (project_id, stage_key, prev_status, new_status, actor, reason)
  values (p_project_id, p_stage_key, v_old_status, 'complete', p_actor, null);

  select st.stage_key into v_next_stage_key
  from public.project_stages st
  where st.project_id = p_project_id and st.status <> 'complete'
  order by st.stage_order limit 1;

  if v_next_stage_key is null then
    v_next_status := 'completed';
  else
    select t.maps_to_status into v_next_status
    from public.project_stage_templates t
    join public.projects p on p.project_type = t.project_type
    where p.id = p_project_id and t.stage_key = v_next_stage_key;
  end if;

  update public.projects
    set status = v_next_status
    where id = p_project_id
      and status not in ('cancelled', 'refunded', 'closed')
      and status <> v_next_status;

  if v_next_status = 'revision_in_progress' then
    select project_code into v_project_code from public.projects where id = p_project_id;
    perform public.create_notification('revision', 'project', p_project_id,
      'Revisions requested — ' || coalesce(v_project_code, 'project'), null);
  end if;

  return v_stage;
end;
$function$;

-- system_error: log_system_event — exact live body with one
-- create_notification() call added, only for error/critical severities.
create or replace function public.log_system_event(
  p_severity text, p_source text, p_message text, p_context jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.system_events (severity, source, message, context)
  values (p_severity, p_source, p_message, coalesce(p_context, '{}'::jsonb));

  if p_severity in ('error', 'critical') then
    perform public.create_notification('system_error', 'system_event', null, p_source || ': ' || p_message, p_severity);
  end if;
end;
$function$;

-- ----------------------------------------------------------------------------
-- detect_scheduled_notifications — called by the Vercel Cron route (service
-- role, no admin session to gate against, hence not is_privileged_caller-
-- gated — the cron route itself is the access boundary, protected by
-- CRON_SECRET). Two checks per the spec: overdue projects (no stage
-- progress in 14 days, still active) and commission due (PENDING entries
-- at least 7 days old, matching the existing weekly payout cadence already
-- used by mondayOf() elsewhere in this codebase). Idempotent per run: skips
-- a project/collaborator if a matching unread notification from the last
-- 24h already exists, so a daily cron doesn't spam duplicates if run more
-- than once.
-- ----------------------------------------------------------------------------

create or replace function public.detect_scheduled_notifications()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project record;
  v_collab record;
begin
  for v_project in
    select p.id, p.project_code,
      greatest(p.created_at, coalesce(max(h.occurred_at), p.created_at)) as last_activity
    from public.projects p
    left join public.project_stage_history h on h.project_id = p.id
    where p.status not in ('completed', 'closed', 'cancelled', 'refunded', 'lead')
    group by p.id, p.project_code, p.created_at
    having greatest(p.created_at, coalesce(max(h.occurred_at), p.created_at)) < now() - interval '14 days'
  loop
    if not exists (
      select 1 from public.notifications
      where type = 'overdue' and entity_id = v_project.id and created_at > now() - interval '24 hours'
    ) then
      perform public.create_notification('overdue', 'project', v_project.id,
        'No activity in 14+ days — ' || v_project.project_code, null);
    end if;
  end loop;

  for v_collab in
    select c.id, c.name, min(ce.week_of) as oldest_pending
    from public.collaborators c
    join public.commission_entries ce on ce.collaborator_id = c.id and ce.status = 'PENDING'
    group by c.id, c.name
    having min(ce.week_of) < (current_date - interval '7 days')
  loop
    if not exists (
      select 1 from public.notifications
      where type = 'commission_due' and entity_id = v_collab.id and created_at > now() - interval '24 hours'
    ) then
      perform public.create_notification('commission_due', 'collaborator', v_collab.id,
        'Commission payout due — ' || v_collab.name, 'Pending since ' || v_collab.oldest_pending);
    end if;
  end loop;
end;
$function$;

-- Cron-only: revoke from every role except service_role, including
-- authenticated — this project's default privileges grant `authenticated`
-- EXECUTE directly on every new function (same as `anon`, discovered in
-- Phase 5), so without the explicit revoke here any logged-in collaborator
-- could call this and trigger notification generation, not just Vercel
-- Cron via service_role. Caught by re-checking get_advisors after applying
-- and finding this one in the `authenticated_security_definer_function_
-- executable` WARN list when it should never have been reachable at all.
revoke execute on function public.detect_scheduled_notifications() from public;
revoke execute on function public.detect_scheduled_notifications() from anon;
revoke execute on function public.detect_scheduled_notifications() from authenticated;
grant execute on function public.detect_scheduled_notifications() to service_role;
