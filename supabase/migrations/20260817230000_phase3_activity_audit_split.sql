-- ============================================================================
-- Phase 3 — Activity/Audit Log Split
-- ============================================================================
-- Splits three concerns that today's single audit_log table conflates:
--   1. audit_log (unchanged table) = admin activity. Closes a real
--      inconsistency: createProjectByAdmin/updateProjectStatus
--      (lib/actions/projects.ts) and createCollaborator/updateCollaborator
--      (lib/actions/collaborators.ts) wrote audit_log directly from the
--      Next.js server action instead of via a SECURITY DEFINER RPC, unlike
--      every money-moving RPC (record_payment, exclude_payment, ...). Five
--      new RPCs below close this gap (see the collaborator-login note).
--   2. system_events (new) = system audit: auth failures, webhook failures,
--      API/job errors.
--   3. activity_events (new) = product/website activity: page views,
--      configurator steps, checkout funnel, logins. Meaningful events only,
--      per the spec's "not surveillance footage" instruction.
--
-- App-layer changes (projects.ts/collaborators.ts calling the new RPCs
-- instead of direct table inserts; instrumenting the webhook catch block,
-- login failures, and the configurator with log_system_event/
-- log_activity_event calls) are a separate, non-DB step, done after this
-- migration is applied.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1a. create_project_by_admin — replaces createProjectByAdmin's two-step
-- table-insert + manual audit_log insert with a single atomic RPC. Takes
-- p_customer_id as an already-resolved uuid rather than resolving it
-- internally — find_or_create_customer() stays a separate, anon-grantable
-- app-layer .rpc() call shared with the public intake/configurator paths.
-- ----------------------------------------------------------------------------

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
  values (trim(p_client_name), nullif(trim(p_client_contact), ''), p_customer_id, 'new')
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'source', 'admin', 'customer_id', p_customer_id));

  return v_project;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 1b. update_project_status — also fixes a latent correctness bug in the
-- original app code: the direct-insert version fired the audit_log insert
-- unconditionally even if the .update() call had failed/no-opped (e.g. an
-- invalid status tripping the projects.status CHECK constraint), because the
-- two writes were never atomic. Inside a single plpgsql function, a failed
-- update raises and aborts the whole transaction, so no phantom audit row is
-- ever written for a status change that didn't happen. old_status is
-- recorded alongside new_status, matching the old/new-value pattern already
-- used by COMMISSION_RECALCULATED etc.
-- ----------------------------------------------------------------------------

create or replace function public.update_project_status(
  p_project_id uuid, p_status text, p_actor text
)
returns public.projects
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_old_status text;
  v_project public.projects;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_status is null or length(trim(p_status)) = 0 then
    raise exception 'status is required';
  end if;

  select status into v_old_status from public.projects where id = p_project_id for update;
  if v_old_status is null then
    raise exception 'project % not found', p_project_id;
  end if;

  update public.projects set status = p_status where id = p_project_id
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PROJECT_STATUS_CHANGED', 'project', p_project_id,
    jsonb_build_object('old_status', v_old_status, 'status', p_status));

  return v_project;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 1c. create_collaborator_record — covers only the collaborators-table
-- insert + its COLLABORATOR_CREATED audit row. The Supabase Auth signUp()
-- call cannot move into SQL and stays in the app layer, unchanged.
-- ----------------------------------------------------------------------------

create or replace function public.create_collaborator_record(
  p_name text, p_email text, p_term_start date, p_commission_rate numeric, p_actor text,
  p_term_end date default null, p_bank_details jsonb default '{}'::jsonb
)
returns public.collaborators
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_collaborator public.collaborators;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  if p_term_start is null then
    raise exception 'term start date is required';
  end if;

  insert into public.collaborators (name, email, term_start, term_end, commission_rate, bank_details)
  values (trim(p_name), nullif(trim(p_email), ''), p_term_start, p_term_end, p_commission_rate, coalesce(p_bank_details, '{}'::jsonb))
  returning * into v_collaborator;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'COLLABORATOR_CREATED', 'collaborator', v_collaborator.id,
    jsonb_build_object('name', p_name, 'term_start', p_term_start, 'term_end', p_term_end, 'commission_rate', p_commission_rate));

  return v_collaborator;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 1d. update_collaborator_record
-- p_commission_rate default null = "leave unchanged", mirroring the
-- original ternary (commissionRateRaw ? ... : undefined).
-- ----------------------------------------------------------------------------

create or replace function public.update_collaborator_record(
  p_id uuid, p_term_start date, p_active boolean, p_actor text,
  p_term_end date default null, p_commission_rate numeric default null
)
returns public.collaborators
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_collaborator public.collaborators;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_id is null or p_term_start is null then
    raise exception 'id and term start date are required';
  end if;

  update public.collaborators set
    term_start = p_term_start,
    term_end = p_term_end,
    commission_rate = coalesce(p_commission_rate, commission_rate),
    active = p_active
  where id = p_id
  returning * into v_collaborator;

  if v_collaborator.id is null then
    raise exception 'collaborator % not found', p_id;
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'COLLABORATOR_UPDATED', 'collaborator', p_id,
    jsonb_build_object('term_start', p_term_start, 'term_end', p_term_end, 'commission_rate', p_commission_rate, 'active', p_active));

  return v_collaborator;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 1e. link_collaborator_login — covers the profiles insert +
-- COLLABORATOR_LOGIN_CREATED audit row that createCollaborator also writes.
-- The app layer still calls anon.auth.signUp() itself (cannot move into
-- SQL), then passes the resulting auth user id in here — this is what makes
-- collaborators.ts fully RPC-based instead of only half-fixed.
-- ----------------------------------------------------------------------------

create or replace function public.link_collaborator_login(
  p_collaborator_id uuid, p_profile_id uuid, p_full_name text, p_email text, p_actor text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  insert into public.profiles (id, role, collaborator_id, full_name)
  values (p_profile_id, 'collaborator', p_collaborator_id, p_full_name);

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'COLLABORATOR_LOGIN_CREATED', 'collaborator', p_collaborator_id,
    jsonb_build_object('email', p_email));
end;
$function$;

-- ----------------------------------------------------------------------------
-- Grants for the five admin-only RPCs above — same pattern as
-- record_payment/exclude_payment: revoked from PUBLIC, granted only to
-- authenticated + service_role. Never anon-callable; is_privileged_caller()
-- inside each body is still the real gate.
-- ----------------------------------------------------------------------------

revoke execute on function public.create_project_by_admin(text, text, uuid, text) from public;
grant execute on function public.create_project_by_admin(text, text, uuid, text) to authenticated, service_role;

revoke execute on function public.update_project_status(uuid, text, text) from public;
grant execute on function public.update_project_status(uuid, text, text) to authenticated, service_role;

revoke execute on function public.create_collaborator_record(text, text, date, numeric, text, date, jsonb) from public;
grant execute on function public.create_collaborator_record(text, text, date, numeric, text, date, jsonb) to authenticated, service_role;

revoke execute on function public.update_collaborator_record(uuid, date, boolean, text, date, numeric) from public;
grant execute on function public.update_collaborator_record(uuid, date, boolean, text, date, numeric) to authenticated, service_role;

revoke execute on function public.link_collaborator_login(uuid, uuid, text, text, text) from public;
grant execute on function public.link_collaborator_login(uuid, uuid, text, text, text) to authenticated, service_role;

-- ============================================================================
-- 2. system_events — system audit (auth failures, webhook failures, API/job
-- errors). Append-only, admin-read-only, but writable from anon/pre-auth
-- contexts — see log_system_event below for why.
-- ============================================================================

create table public.system_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  severity text not null check (severity in ('info', 'warning', 'error', 'critical')),
  source text not null,
  message text not null,
  context jsonb not null default '{}'::jsonb
);

create index if not exists idx_system_events_occurred_at on public.system_events (occurred_at);
create index if not exists idx_system_events_severity on public.system_events (severity);

alter table public.system_events enable row level security;

-- Mirrors audit_log_admin_select. No insert/update/delete policy for
-- anon/authenticated is defined at all — Postgres RLS defaults to deny with
-- no matching policy, so direct writes from those roles are blocked; only
-- log_system_event() (SECURITY DEFINER, bypasses RLS as the function owner)
-- and service_role (which bypasses RLS entirely) can write.
create policy system_events_admin_select on public.system_events
  for select using (public.is_admin());

-- Append-only, same philosophy as audit_log — a system/error log with
-- editable rows defeats its own purpose. Shared guard function
-- (parameterized by tg_table_name) rather than copying audit_log_immutable(),
-- whose error text is hardcoded to "audit_log" — audit_log's own trigger
-- function is left untouched.
create or replace function public.append_only_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  raise exception '% is append-only: % not permitted', tg_table_name, tg_op;
end;
$function$;

create trigger trg_system_events_no_update
  before update on public.system_events
  for each row execute function public.append_only_guard();
create trigger trg_system_events_no_delete
  before delete on public.system_events
  for each row execute function public.append_only_guard();

-- ----------------------------------------------------------------------------
-- log_system_event — deliberately NOT gated by is_privileged_caller().
-- Auth-failure logging (a failed signInWithPassword in either app's signIn
-- action) and webhook-signature-failure logging (before any Supabase call
-- is even made) both need to log from a caller that is, by definition, not
-- yet authenticated and not the service role. Gating this the same way as
-- create_project_by_admin etc. would silently swallow exactly the events
-- this table exists to capture. Safe to leave open because the table has no
-- sensitive read surface (SELECT is admin-only above) and nothing reads
-- system_events to make an authorization decision — worst case of a
-- malicious anon caller is log noise/storage cost, not a privilege bypass.
-- KNOWN LIMITATION: anon-writable with no rate limiting — same caveat as
-- log_activity_event below. Phase 12 is where rate limiting lands, not here.
-- ----------------------------------------------------------------------------

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
end;
$function$;

revoke execute on function public.log_system_event(text, text, text, jsonb) from public;
grant execute on function public.log_system_event(text, text, text, jsonb) to anon, authenticated, service_role;

-- ============================================================================
-- 3. activity_events — product/website activity (page views, configurator
-- steps, checkout funnel, logins). Feeds Phase 13's live activity feed and
-- Phase 14's funnel/heatmap — indexed for both time-range and
-- per-customer/per-project queries now, not backfilled later.
-- ============================================================================

create table public.activity_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type text not null,
  session_id text,
  customer_id uuid references public.customers(id),
  project_id uuid references public.projects(id),
  path text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_activity_events_customer_id on public.activity_events (customer_id);
create index if not exists idx_activity_events_project_id on public.activity_events (project_id);
create index if not exists idx_activity_events_occurred_at on public.activity_events (occurred_at);
-- The configurator/checkout funnel groups steps by session before a
-- customer_id exists (anon visitor, pre-checkout), so session_id is the only
-- correlating key for a large share of rows.
create index if not exists idx_activity_events_session_id on public.activity_events (session_id);

alter table public.activity_events enable row level security;

-- Admin-only SELECT, no non-admin SELECT at all — session_ids in this table
-- shouldn't be readable back by anyone, including the collaborator role that
-- has self-select access elsewhere in this schema.
create policy activity_events_admin_select on public.activity_events
  for select using (public.is_admin());

create trigger trg_activity_events_no_update
  before update on public.activity_events
  for each row execute function public.append_only_guard();
create trigger trg_activity_events_no_delete
  before delete on public.activity_events
  for each row execute function public.append_only_guard();

-- ----------------------------------------------------------------------------
-- log_activity_event — anon-callable by design (configurator steps,
-- checkout, page views all happen before any login exists).
-- KNOWN LIMITATION: this makes activity_events an anon-writable table with
-- no rate limiting — a hostile caller can hit this RPC directly and fill the
-- table with junk rows. Accepted as-is for this phase per the roadmap; rate
-- limiting is explicitly Phase 12's job, not retrofitted here. The only
-- mitigation in place right now is that it's write-only (no anon SELECT) and
-- purely additive telemetry — it cannot corrupt or expose other data.
-- ----------------------------------------------------------------------------

create or replace function public.log_activity_event(
  p_event_type text, p_session_id text, p_customer_id uuid default null,
  p_project_id uuid default null, p_path text default null, p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_event_type is null or length(trim(p_event_type)) = 0 then
    raise exception 'event_type is required';
  end if;

  insert into public.activity_events (event_type, session_id, customer_id, project_id, path, metadata)
  values (trim(p_event_type), p_session_id, p_customer_id, p_project_id, p_path, coalesce(p_metadata, '{}'::jsonb));
end;
$function$;

revoke execute on function public.log_activity_event(text, text, uuid, uuid, text, jsonb) from public;
grant execute on function public.log_activity_event(text, text, uuid, uuid, text, jsonb) to anon, authenticated, service_role;
