-- ============================================================================
-- Phase 5 — Project Stage Tracking System
-- ============================================================================
-- New per-project-type stage checklists that drive progress %, current
-- stage, and (within the in_queue..completed range) projects.status
-- automatically, plus an orthogonal admin-set hold flag that never touches
-- any of that derivation.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. project_stage_templates — static reference data: the ordered stage
-- list per project_type, seeded below from the 12 PROJECT_TYPES in
-- apps/studio/lib/catalogue/catalogue.ts.
--
-- maps_to_status is the data-driven mechanism for the status-sync problem:
-- rather than hardcoding a stage_key -> projects.status mapping in the RPCs
-- (which would need 12 different branches for 12 different stage-key
-- vocabularies), each template row declares what projects.status should
-- become WHILE that stage is the current (first-non-complete) stage.
-- advance_project_stage/revert_project_stage both just look up the new
-- current stage's maps_to_status and apply it — entirely data-driven, zero
-- per-project-type logic in the RPC bodies.
--
-- RLS: admin-only SELECT, for consistency with every other table in this
-- schema. Phase 6's public tracker reads through its own SECURITY DEFINER
-- RPC (get_project_tracker), which bypasses this RLS as the function owner
-- regardless of caller role — there is no scenario where Phase 6 needs
-- anon-direct table access here.
-- ----------------------------------------------------------------------------

create table public.project_stage_templates (
  id uuid primary key default gen_random_uuid(),
  project_type text not null,
  stage_order int not null,
  stage_key text not null,
  stage_label text not null,
  -- Restricted to the stage-derived slice of projects.status's 17-value
  -- CHECK (apps/admin/lib/statuses.ts). 'closed' is deliberately excluded —
  -- it stays a manual admin step via update_project_status, never
  -- auto-derived from stage completion. 'revision_requested' is also
  -- excluded (see decision notes) — Revisions-type stages map to
  -- 'revision_in_progress' instead, to avoid a second per-stage-status
  -- mapping column just for that one distinction.
  maps_to_status text not null,
  constraint project_stage_templates_stage_order_positive check (stage_order >= 1),
  constraint project_stage_templates_maps_to_status_check check (
    maps_to_status in (
      'in_queue', 'in_progress', 'internal_review', 'client_review',
      'revision_in_progress', 'completed'
    )
  ),
  unique (project_type, stage_order),
  unique (project_type, stage_key)
);

alter table public.project_stage_templates enable row level security;

create policy project_stage_templates_admin_select on public.project_stage_templates
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. project_stages — per-project instantiation of the matching template.
-- No direct write policy for ANY role, including admin — every mutation
-- must go through an audited path (the trigger below for creation,
-- advance_project_stage/revert_project_stage for status changes).
-- ----------------------------------------------------------------------------

create table public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  stage_key text not null,
  stage_order int not null,
  stage_label text not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  completed_at timestamptz,
  completed_by text,
  unique (project_id, stage_key)
);

create index if not exists idx_project_stages_project_id on public.project_stages (project_id);

alter table public.project_stages enable row level security;

create policy project_stages_admin_select on public.project_stages
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. generate_project_stages — auto-generates project_stages from the
-- matching template whenever a project's project_type is set (AFTER INSERT
-- OR UPDATE OF project_type on projects).
--
-- SECURITY DEFINER: the firing statement is very often
-- save_project_configuration, called by an anonymous customer, and
-- project_stages has admin-only RLS with no INSERT policy for any role —
-- without SECURITY DEFINER here, the trigger's own insert would be blocked
-- whenever it fires from a non-admin session.
--
-- Deliberately NOT gated by is_privileged_caller() — it must also fire for
-- the anon-callable save_project_configuration path. Safe to leave ungated
-- because it only ever inserts rows copied verbatim from
-- project_stage_templates (static, non-attacker-controlled reference data)
-- keyed off the row's own already-validated id/project_type.
--
-- Idempotency / re-fire guard: exits early if project_stages rows already
-- exist for this project — covers both a resave re-setting project_type to
-- the same value, AND project_type later changing to a genuinely different
-- value after stages already exist (e.g. admin recategorizes a
-- miscategorized project). DECIDED: stages are NOT regenerated/replaced in
-- that second case — deleting and recreating would destroy completed_at/
-- completed_by history and could retroactively "uncomplete" real work.
-- This is a real edge case a future "recategorize project" admin action
-- should detect and handle deliberately; not silently papered over here.
-- ----------------------------------------------------------------------------

create or replace function public.generate_project_stages()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if exists (select 1 from public.project_stages where project_id = new.id) then
    return new;
  end if;

  insert into public.project_stages (project_id, stage_key, stage_order, stage_label, status)
  select new.id, t.stage_key, t.stage_order, t.stage_label, 'not_started'
  from public.project_stage_templates t
  where t.project_type = new.project_type
  order by t.stage_order;

  return new;
end;
$function$;

create trigger trg_generate_project_stages
  after insert or update of project_type on public.projects
  for each row
  when (new.project_type is not null)
  execute function public.generate_project_stages();

-- ----------------------------------------------------------------------------
-- 4. project_stage_history — immutable, one row per stage status change.
-- ----------------------------------------------------------------------------

create table public.project_stage_history (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id),
  stage_key text not null,
  prev_status text not null,
  new_status text not null,
  actor text not null,
  reason text,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_project_stage_history_project_id on public.project_stage_history (project_id);

alter table public.project_stage_history enable row level security;

create policy project_stage_history_admin_select on public.project_stage_history
  for select using (public.is_admin());

create trigger trg_project_stage_history_no_update
  before update on public.project_stage_history
  for each row execute function public.append_only_guard();
create trigger trg_project_stage_history_no_delete
  before delete on public.project_stage_history
  for each row execute function public.append_only_guard();

-- ----------------------------------------------------------------------------
-- 5. advance_project_stage — admin-only, sequential-completion enforced
-- server-side (defense-in-depth behind the admin UI's own lock), writes
-- project_stage_history, and syncs projects.status to the new current
-- stage's maps_to_status.
--
-- Terminal-status guard: never overwrites projects.status if it is already
-- 'cancelled', 'refunded', or 'closed' — those are explicit, final admin
-- actions taken outside the stage flow, and a stray/late stage-checkbox
-- toggle must never silently reopen a project deliberately closed out.
-- ----------------------------------------------------------------------------

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

  return v_stage;
end;
$function$;

-- ----------------------------------------------------------------------------
-- 6. revert_project_stage — resets the target stage AND every later-ordered
-- stage back to not_started, one project_stage_history row per stage that
-- actually changed. Reason required. Syncs projects.status backward, same
-- mechanism and terminal-status guard as advance_project_stage.
-- ----------------------------------------------------------------------------

create or replace function public.revert_project_stage(
  p_project_id uuid, p_stage_key text, p_actor text, p_reason text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_target_order int;
  v_row record;
  v_next_stage_key text;
  v_next_status text;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'a reason is required to revert a stage';
  end if;

  select stage_order into v_target_order
  from public.project_stages
  where project_id = p_project_id and stage_key = p_stage_key;
  if v_target_order is null then
    raise exception 'stage % not found for project %', p_stage_key, p_project_id;
  end if;

  for v_row in
    select * from public.project_stages
    where project_id = p_project_id and stage_order >= v_target_order and status <> 'not_started'
    order by stage_order
    for update
  loop
    update public.project_stages
      set status = 'not_started', completed_at = null, completed_by = null
      where id = v_row.id;

    insert into public.project_stage_history (project_id, stage_key, prev_status, new_status, actor, reason)
    values (p_project_id, v_row.stage_key, v_row.status, 'not_started', p_actor, p_reason);
  end loop;

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
end;
$function$;

revoke execute on function public.advance_project_stage(uuid, text, text) from public;
grant execute on function public.advance_project_stage(uuid, text, text) to authenticated, service_role;

revoke execute on function public.revert_project_stage(uuid, text, text, text) from public;
grant execute on function public.revert_project_stage(uuid, text, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 7a. projects.hold_state — the spec-conflict resolution. Completely
-- orthogonal to project_stages/completed_at/project_progress: not read by
-- generate_project_stages, advance_project_stage, or revert_project_stage
-- anywhere above. Added here, before the view below, purely because
-- project_progress (7b) selects it as a passthrough display column and the
-- column must exist first. set_project_hold (section 8) is the only writer
-- — never project_stages or projects.status. Progress %, current stage, and
-- lifecycle status stay 100% derived from stage completion regardless of
-- hold state.
-- ----------------------------------------------------------------------------

alter table public.projects
  add column hold_state text default null
    constraint projects_hold_state_check check (hold_state in ('on_hold', 'awaiting_client'));

create index if not exists idx_projects_hold_state on public.projects (hold_state) where hold_state is not null;

-- ----------------------------------------------------------------------------
-- 7b. project_progress — single source of truth for admin UI now, Phase 6's
-- public tracker next, and any future notification copy.
--
-- security_invoker = true — this view's only intended consumer is an
-- authenticated admin session, and admins already have full read access to
-- project_stages/projects via the existing _admin_select policies.
--
-- near_completion threshold: percent_complete >= 80 (and < 100). Chosen as
-- a percentage rather than "last N stages" because stage-list length
-- varies 7-10 across project types — a percentage scales proportionally
-- regardless of list length.
--
-- hold_state is passed through as a plain display column only — it plays
-- no role in any of the derived columns below.
-- ----------------------------------------------------------------------------

create view public.project_progress
with (security_invoker = true) as
with stage_counts as (
  select
    ps.project_id,
    count(*) as total_stages,
    count(*) filter (where ps.status = 'complete') as completed_stages,
    min(ps.stage_order) filter (where ps.status <> 'complete') as current_stage_order,
    max(ps.stage_order) as last_stage_order
  from public.project_stages ps
  group by ps.project_id
)
select
  p.id as project_id,
  p.project_code,
  p.project_type,
  p.hold_state,
  sc.total_stages,
  sc.completed_stages,
  round(100.0 * sc.completed_stages / nullif(sc.total_stages, 0), 1) as percent_complete,
  coalesce(cur.stage_key, lastst.stage_key) as current_stage_key,
  coalesce(cur.stage_label, lastst.stage_label) as current_stage_label,
  case
    when sc.completed_stages = 0 then 'not_started'
    when sc.completed_stages = sc.total_stages then 'completed'
    when round(100.0 * sc.completed_stages / nullif(sc.total_stages, 0), 1) >= 80 then 'near_completion'
    else 'in_progress'
  end as derived_status
from public.projects p
join stage_counts sc on sc.project_id = p.id
left join public.project_stages cur
  on cur.project_id = p.id and cur.stage_order = sc.current_stage_order
left join public.project_stages lastst
  on lastst.project_id = p.id and lastst.stage_order = sc.last_stage_order;

-- ----------------------------------------------------------------------------
-- 8. set_project_hold — admin-only, audited via audit_log (not
-- project_stage_history — an admin action on the project itself, not a
-- stage transition), action 'PROJECT_HOLD_CHANGED'. p_hold_state may be
-- null (clears the hold) or one of the two allowed values.
--
-- p_reason required only when SETTING a hold, not when clearing one: why
-- work paused is the business-meaningful fact worth auditing; clearing a
-- hold just means "back to normal", which doesn't need its own
-- justification the way pausing does.
-- ----------------------------------------------------------------------------

create or replace function public.set_project_hold(
  p_project_id uuid, p_hold_state text, p_reason text, p_actor text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_old_hold text;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_hold_state is not null and p_hold_state not in ('on_hold', 'awaiting_client') then
    raise exception 'invalid hold_state: %', p_hold_state;
  end if;
  if p_hold_state is not null and (p_reason is null or length(trim(p_reason)) = 0) then
    raise exception 'a reason is required to place a project on hold';
  end if;

  select hold_state into v_old_hold from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'project % not found', p_project_id;
  end if;

  update public.projects set hold_state = p_hold_state where id = p_project_id;

  insert into public.audit_log (actor, action, entity_type, entity_id, reason, details)
  values (p_actor, 'PROJECT_HOLD_CHANGED', 'project', p_project_id, p_reason,
    jsonb_build_object('old_hold_state', v_old_hold, 'new_hold_state', p_hold_state));
end;
$function$;

revoke execute on function public.set_project_hold(uuid, text, text, text) from public;
grant execute on function public.set_project_hold(uuid, text, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- set_project_type — NOT part of the delegated design; added because all 4
-- real projects in production today have project_type = null (all created
-- via the unpriced lead-intake path, not the priced configurator — see
-- Phase 4's backfill), and create_project_by_admin never sets project_type
-- at all. Without an explicit way to assign one, generate_project_stages
-- would never fire for any admin-created/intake-originated project, and
-- the stage checklist would stay permanently empty for every real project
-- that exists right now. This closes that gap: an admin-only RPC that sets
-- project_type (validated against project_stage_templates, so a typo can't
-- silently produce a project with zero stages), which fires
-- trg_generate_project_stages automatically via the existing UPDATE OF
-- project_type trigger — no separate stage-generation call needed.
-- ----------------------------------------------------------------------------

create or replace function public.set_project_type(
  p_project_id uuid, p_project_type text, p_actor text
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
  if p_project_type is null or length(trim(p_project_type)) = 0 then
    raise exception 'project_type is required';
  end if;
  if not exists (select 1 from public.project_stage_templates where project_type = p_project_type) then
    raise exception 'unknown project_type: %', p_project_type;
  end if;

  update public.projects set project_type = p_project_type where id = p_project_id
  returning * into v_project;
  if v_project.id is null then
    raise exception 'project % not found', p_project_id;
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'PROJECT_TYPE_SET', 'project', p_project_id, jsonb_build_object('project_type', p_project_type));

  return v_project;
end;
$function$;

revoke execute on function public.set_project_type(uuid, text, text) from public;
grant execute on function public.set_project_type(uuid, text, text) to authenticated, service_role;

-- ============================================================================
-- 9. Seed data — project_stage_templates, one block per PROJECT_TYPE.
-- ============================================================================

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('website', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('website', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('website', 3, 'design', 'Design', 'in_progress'),
  ('website', 4, 'development', 'Development', 'in_progress'),
  ('website', 5, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('website', 6, 'client_review', 'Client Review', 'client_review'),
  ('website', 7, 'revisions', 'Revisions', 'revision_in_progress'),
  ('website', 8, 'deployment', 'Deployment', 'in_progress'),
  ('website', 9, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('web_app', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('web_app', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('web_app', 3, 'architecture_planning', 'Architecture & Planning', 'in_progress'),
  ('web_app', 4, 'design', 'Design', 'in_progress'),
  ('web_app', 5, 'development', 'Development', 'in_progress'),
  ('web_app', 6, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('web_app', 7, 'client_review', 'Client Review', 'client_review'),
  ('web_app', 8, 'deployment', 'Deployment', 'in_progress'),
  ('web_app', 9, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('saas', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('saas', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('saas', 3, 'architecture_planning', 'Architecture & Planning', 'in_progress'),
  ('saas', 4, 'design', 'Design', 'in_progress'),
  ('saas', 5, 'development', 'Development', 'in_progress'),
  ('saas', 6, 'billing_subscription_setup', 'Billing & Subscription Setup', 'in_progress'),
  ('saas', 7, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('saas', 8, 'client_review', 'Client Review', 'client_review'),
  ('saas', 9, 'deployment', 'Deployment', 'in_progress'),
  ('saas', 10, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('custom_software', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('custom_software', 2, 'requirements_gathering', 'Requirements Gathering', 'in_queue'),
  ('custom_software', 3, 'architecture_planning', 'Architecture & Planning', 'in_progress'),
  ('custom_software', 4, 'design', 'Design', 'in_progress'),
  ('custom_software', 5, 'development', 'Development', 'in_progress'),
  ('custom_software', 6, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('custom_software', 7, 'client_review', 'Client Review', 'client_review'),
  ('custom_software', 8, 'deployment_handover', 'Deployment & Handover', 'in_progress'),
  ('custom_software', 9, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('mobile_app', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('mobile_app', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('mobile_app', 3, 'design', 'Design', 'in_progress'),
  ('mobile_app', 4, 'development', 'Development', 'in_progress'),
  ('mobile_app', 5, 'integration_testing', 'Integration & Testing', 'internal_review'),
  ('mobile_app', 6, 'client_review', 'Client Review', 'client_review'),
  ('mobile_app', 7, 'revisions', 'Revisions', 'revision_in_progress'),
  ('mobile_app', 8, 'app_store_submission', 'App Store Submission', 'in_progress'),
  ('mobile_app', 9, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('ecommerce', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('ecommerce', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('ecommerce', 3, 'design', 'Design', 'in_progress'),
  ('ecommerce', 4, 'store_catalog_setup', 'Store & Catalog Setup', 'in_progress'),
  ('ecommerce', 5, 'payment_integration', 'Payment Integration', 'in_progress'),
  ('ecommerce', 6, 'development', 'Development', 'in_progress'),
  ('ecommerce', 7, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('ecommerce', 8, 'client_review', 'Client Review', 'client_review'),
  ('ecommerce', 9, 'launch', 'Launch', 'in_progress'),
  ('ecommerce', 10, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('ai_application', 1, 'project_submitted', 'Project Submitted', 'in_queue'),
  ('ai_application', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('ai_application', 3, 'ai_architecture_data_strategy', 'AI Architecture & Data Strategy', 'in_progress'),
  ('ai_application', 4, 'design', 'Design', 'in_progress'),
  ('ai_application', 5, 'development', 'Development', 'in_progress'),
  ('ai_application', 6, 'ai_model_integration', 'AI Model Integration', 'in_progress'),
  ('ai_application', 7, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('ai_application', 8, 'client_review', 'Client Review', 'client_review'),
  ('ai_application', 9, 'deployment', 'Deployment', 'in_progress'),
  ('ai_application', 10, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('ai_agent', 1, 'submission', 'Submission', 'in_queue'),
  ('ai_agent', 2, 'requirements', 'Requirements', 'in_queue'),
  ('ai_agent', 3, 'architecture', 'Architecture', 'in_progress'),
  ('ai_agent', 4, 'ai_configuration', 'AI Configuration', 'in_progress'),
  ('ai_agent', 5, 'development', 'Development', 'in_progress'),
  ('ai_agent', 6, 'integration', 'Integration', 'in_progress'),
  ('ai_agent', 7, 'testing', 'Testing', 'internal_review'),
  ('ai_agent', 8, 'client_review', 'Client Review', 'client_review'),
  ('ai_agent', 9, 'deployment', 'Deployment', 'in_progress'),
  ('ai_agent', 10, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('automation', 1, 'submission', 'Submission', 'in_queue'),
  ('automation', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('automation', 3, 'workflow_design', 'Workflow Design', 'in_progress'),
  ('automation', 4, 'development', 'Development', 'in_progress'),
  ('automation', 5, 'integration_setup', 'Integration Setup', 'in_progress'),
  ('automation', 6, 'testing_qa', 'Testing & QA', 'internal_review'),
  ('automation', 7, 'client_review', 'Client Review', 'client_review'),
  ('automation', 8, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('api_backend', 1, 'submission', 'Submission', 'in_queue'),
  ('api_backend', 2, 'requirements_review', 'Requirements Review', 'in_queue'),
  ('api_backend', 3, 'api_design', 'API Design', 'in_progress'),
  ('api_backend', 4, 'development', 'Development', 'in_progress'),
  ('api_backend', 5, 'integration_testing', 'Integration & Testing', 'internal_review'),
  ('api_backend', 6, 'documentation', 'Documentation', 'in_progress'),
  ('api_backend', 7, 'client_review', 'Client Review', 'client_review'),
  ('api_backend', 8, 'deployment', 'Deployment', 'in_progress'),
  ('api_backend', 9, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('branding', 1, 'submission', 'Submission', 'in_queue'),
  ('branding', 2, 'creative_brief', 'Creative Brief', 'in_queue'),
  ('branding', 3, 'concept_development', 'Concept Development', 'in_progress'),
  ('branding', 4, 'design', 'Design', 'in_progress'),
  ('branding', 5, 'client_review', 'Client Review', 'client_review'),
  ('branding', 6, 'revisions', 'Revisions', 'revision_in_progress'),
  ('branding', 7, 'final_assets', 'Final Assets', 'in_progress'),
  ('branding', 8, 'completed', 'Completed', 'completed');

insert into public.project_stage_templates (project_type, stage_order, stage_key, stage_label, maps_to_status) values
  ('marketing', 1, 'submission', 'Submission', 'in_queue'),
  ('marketing', 2, 'strategy_research', 'Strategy & Research', 'in_progress'),
  ('marketing', 3, 'content_creation', 'Content Creation', 'in_progress'),
  ('marketing', 4, 'client_review', 'Client Review', 'client_review'),
  ('marketing', 5, 'launch', 'Launch', 'in_progress'),
  ('marketing', 6, 'optimization', 'Optimization', 'in_progress'),
  ('marketing', 7, 'completed', 'Completed', 'completed');
