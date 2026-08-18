-- ============================================================================
-- Phase 4 — Project Lifecycle Expansion + Price Snapshot
-- ============================================================================
-- Two independent pieces:
--   1. Expands projects.status from the 6-value CHECK to the full 16-stage
--      lifecycle (still text + CHECK, consistent with every other status
--      column in this schema — no enums anywhere today). A data migration
--      remaps existing rows BEFORE the new CHECK is added, so no row is ever
--      left violating the constraint mid-migration.
--   2. New project_price_snapshots table + record_price_snapshot() RPC —
--      an immutable, point-in-time capture of what a project was quoted,
--      written once by the app AFTER a successful save/checkout, never
--      recomputed. This is what stops a later catalogue price change from
--      silently repricing old projects.
--
-- Explicitly OUT of scope for this migration: save_project_configuration
-- and record_gateway_payment are NOT modified here. Snapshot-writing is a
-- separate app-layer RPC call, made after those functions already
-- succeeded, specifically so a bug in the new snapshot path can never newly
-- break project creation/payment confirmation, which work today.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. projects.status lifecycle expansion
-- ----------------------------------------------------------------------------
-- Old CHECK (projects_status_check, from the baseline migration):
--   status in ('draft', 'awaiting_payment', 'new', 'in_progress', 'completed', 'cancelled')
--
-- New 16-stage lifecycle (lower_snake_case):
--   lead, configuration_started, checkout_initiated, payment_pending,
--   payment_confirmed, awaiting_information, in_queue, in_progress,
--   internal_review, client_review, revision_requested, revision_in_progress,
--   completed, closed, cancelled, refunded
--
-- Mapping for the 6 old values:
--   draft            -> configuration_started  (customer mid-configurator)
--   awaiting_payment -> payment_pending         (quoted, sent to checkout)
--   new              -> lead                    (fresh intake, pre-configurator)
--   in_progress      -> stays in_progress        (record_gateway_payment, left
--                                                  untouched, writes this literal
--                                                  string on every payment confirm)
--   completed        -> stays completed          (already a literal member of the
--                                                  new 16-value set)
--   cancelled        -> stays cancelled           (already a literal member of the
--                                                  new 16-value set)
--
-- Ordering: the OLD constraint is dropped first, then rows are remapped,
-- then the NEW constraint is added. Adding the new constraint LAST is what
-- actually validates "no row violates it" — if the remap ever missed a row,
-- this ADD CONSTRAINT is where it would loudly fail, not silently pass.
-- ----------------------------------------------------------------------------

-- Default 'new' -> 'lead': 'new' is being fully retired below (both writers
-- of the literal string are updated in this same migration), so the column
-- default must move with it.
alter table public.projects alter column status set default 'lead';

alter table public.projects drop constraint projects_status_check;

update public.projects set status = 'configuration_started' where status = 'draft';
update public.projects set status = 'payment_pending' where status = 'awaiting_payment';
update public.projects set status = 'lead' where status = 'new';

-- 'awaiting_payment' is deliberately kept as a 17th, legacy-compat allowed
-- value alongside the clean 16-value lifecycle — NOT because any row should
-- have it after the remap above, but because save_project_configuration
-- (explicitly left untouched this migration) sets status = 'awaiting_payment'
-- literally on EVERY future customer save, both create and update. Dropping
-- this value would break the live /start configurator — a revenue path —
-- on its very next save after this migration lands. Mirrors the existing
-- 'fraudulent'-alongside-a-clean-set precedent planned for Phase 8.
alter table public.projects add constraint projects_status_check
  check (status in (
    'lead', 'configuration_started', 'checkout_initiated', 'payment_pending',
    'payment_confirmed', 'awaiting_information', 'in_queue', 'in_progress',
    'internal_review', 'client_review', 'revision_requested', 'revision_in_progress',
    'completed', 'closed', 'cancelled', 'refunded',
    'awaiting_payment'
  ));

-- ----------------------------------------------------------------------------
-- 1b. submit_project_intake / create_project_by_admin — full replace, only
-- change: the literal status string 'new' -> 'lead'. Leaving these writing
-- 'new' would mean every admin-created project and every public lead
-- intake starts failing the new CHECK constraint the moment this migration
-- lands. Everything else is byte-for-byte identical to the Phase 2/3
-- versions. Grants are untouched — CREATE OR REPLACE FUNCTION doesn't need
-- re-granting.
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
  values (trim(p_client_name), p_client_contact, p_introduced_by, 'lead', v_customer_id)
  returning * into v_project;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values ('portal-intake', 'PROJECT_CREATED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'customer_id', v_customer_id));

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

  return v_project;
end;
$function$;

-- ============================================================================
-- 2. project_price_snapshots — immutable point-in-time price capture
-- ============================================================================
-- Mirrors packages/lib/src/catalogue/types.ts's PricedLine[]/QuoteResult
-- shape (lines/subtotal/complexityMultiplier/deliveryMultiplier/total),
-- just persisted for the first time. Written once, never recomputed —
-- catalogue_source is a free-text tag (e.g. 'configurator-v1') for now;
-- Phase 7 supersedes this with a real catalogue_version_id FK once pricing
-- moves into the DB, so it's deliberately plain text here, matching the
-- schema's existing precedent of not over-constraining fields known to
-- evolve (customers.source has the identical justification in Phase 2).
-- ============================================================================

create table public.project_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  captured_at timestamptz not null default now(),
  catalogue_source text not null,
  lines jsonb not null,
  subtotal numeric(12,2) not null,
  complexity_multiplier numeric(6,3) not null default 1,
  delivery_multiplier numeric(6,3) not null default 1,
  total numeric(12,2) not null,
  currency text not null,
  constraint project_price_snapshots_totals_nonnegative check (subtotal >= 0 and total >= 0)
);

create index if not exists idx_project_price_snapshots_project_id on public.project_price_snapshots (project_id);

alter table public.project_price_snapshots enable row level security;

-- Admin-only SELECT, no anon/authenticated policy at all — financial
-- records, and the owning customer has no login to read them back through
-- anyway (matches customers/audit_log/system_events/activity_events).
create policy project_price_snapshots_admin_select on public.project_price_snapshots
  for select using (public.is_admin());

-- Append-only, same rationale as system_events/activity_events: a
-- price-at-purchase record that can be silently edited after the fact
-- defeats the entire point of snapshotting it. Reuses
-- public.append_only_guard() (added in Phase 3).
create trigger trg_project_price_snapshots_no_update
  before update on public.project_price_snapshots
  for each row execute function public.append_only_guard();
create trigger trg_project_price_snapshots_no_delete
  before delete on public.project_price_snapshots
  for each row execute function public.append_only_guard();

-- ----------------------------------------------------------------------------
-- record_price_snapshot — deliberately NOT gated by is_privileged_caller().
--
-- Called from the same anon-callable public configurator/checkout flow as
-- save_project_configuration and initiatePayment — both of which run long
-- before any login exists. Gating this admin-only would make it unusable
-- from the one place it actually needs to be called: right after an
-- anonymous customer's configurator save or checkout-initiation succeeds.
-- Matches the log_activity_event/log_system_event/find_or_create_customer
-- precedent of anon-safe-by-construction RPCs — additive-only,
-- telemetry-shaped data, never touches payments/commission_entries/
-- projects.status.
--
-- This is also *why* it's a separate RPC rather than logic baked into
-- save_project_configuration's own transaction: the app calls this AFTER
-- save_project_configuration (or initiatePayment) already returned
-- successfully, in its own try/catch that swallows any failure and never
-- rethrows — a bug or transient failure in snapshot-writing can therefore
-- never newly break project creation/checkout-initiation. Baking this into
-- save_project_configuration's transaction would put a brand-new,
-- unexercised code path directly inside the exact function that already
-- has a documented intermittent "fetch failed" bug in production
-- (apps/studio/lib/actions/configurator.ts) — the worst possible place to
-- add risk.
--
-- KNOWN LIMITATION, same as Phase 3's logging RPCs: anon callable, no rate
-- limiting, and p_project_id is not verified against an access_token, so a
-- malicious anon caller who already has/guesses a project's uuid could
-- write junk snapshot rows against it. Accepted for the same reasons: the
-- table is admin-read-only and append-only so nothing can be corrupted or
-- exposed, and project uuids aren't broadcast anywhere a casual caller
-- would find them (project_code, e.g. ZB-00001, is the public identifier).
-- Phase 12 is where rate limiting lands, not retrofitted here.
-- ----------------------------------------------------------------------------

create or replace function public.record_price_snapshot(
  p_project_id uuid, p_catalogue_source text, p_lines jsonb, p_subtotal numeric,
  p_complexity_multiplier numeric, p_delivery_multiplier numeric, p_total numeric, p_currency text
)
returns public.project_price_snapshots
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_snapshot public.project_price_snapshots;
begin
  if p_project_id is null then
    raise exception 'project_id is required';
  end if;
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project % not found', p_project_id;
  end if;
  if p_catalogue_source is null or length(trim(p_catalogue_source)) = 0 then
    raise exception 'catalogue_source is required';
  end if;
  if p_total is null or p_subtotal is null then
    raise exception 'subtotal and total are required';
  end if;

  insert into public.project_price_snapshots (
    project_id, catalogue_source, lines, subtotal, complexity_multiplier, delivery_multiplier, total, currency
  )
  values (
    p_project_id, trim(p_catalogue_source), coalesce(p_lines, '[]'::jsonb), p_subtotal,
    coalesce(p_complexity_multiplier, 1), coalesce(p_delivery_multiplier, 1), p_total, coalesce(p_currency, 'EUR')
  )
  returning * into v_snapshot;

  return v_snapshot;
end;
$function$;

revoke execute on function public.record_price_snapshot(uuid, text, jsonb, numeric, numeric, numeric, numeric, text) from public;
grant execute on function public.record_price_snapshot(uuid, text, jsonb, numeric, numeric, numeric, numeric, text) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Backfill: the 4 existing real projects (all already paid/in_progress per
-- Phase 2's backfill) have no snapshot today. Best-effort backfill from
-- projects.quoted_price/quoted_currency, tagged catalogue_source='backfill'
-- so it is always programmatically distinguishable from a real
-- checkout-time snapshot. lines = '[]' — the itemized PricedLine[]
-- breakdown was never persisted historically, only the final total, so
-- fabricating line items here would misrepresent data we don't actually
-- have. subtotal/total both set to quoted_price and both multipliers set to
-- 1, since we cannot safely reverse-engineer the actual historical
-- multipliers without re-running the pricing engine against stored
-- configuration, which risks producing a *different* number than what the
-- customer actually paid — exactly the kind of silent repricing this table
-- exists to prevent. captured_at uses the project's earliest recorded
-- payment (falling back to created_at for any priced-but-unpaid row), so
-- the backfilled timestamp reflects when the price was actually locked in.
--
-- Decision: backfill rather than leave snapshot-less, because Phase 4's own
-- admin UI goal is a "price at purchase" section reading this table — for
-- the only 4 real projects in production today, leaving them snapshot-less
-- would make that section permanently blank for every real customer, for
-- data we already have on hand. Idempotent via the NOT EXISTS guard.
-- ----------------------------------------------------------------------------

insert into public.project_price_snapshots (
  project_id, captured_at, catalogue_source, lines, subtotal, complexity_multiplier, delivery_multiplier, total, currency
)
select
  p.id,
  coalesce((select min(pay.received_at) from public.payments pay where pay.project_id = p.id), p.created_at),
  'backfill',
  '[]'::jsonb,
  p.quoted_price,
  1,
  1,
  p.quoted_price,
  coalesce(p.quoted_currency, 'EUR')
from public.projects p
where p.quoted_price is not null
  and not exists (select 1 from public.project_price_snapshots s where s.project_id = p.id);
