-- ============================================================================
-- Phase 0 — Repo & Data Foundation Hygiene
-- ============================================================================
-- Two independent, low-risk fixes flagged by the Supabase advisor:
--
-- 1. Eight foreign-key columns have no supporting index (the advisor's live
--    re-check after the first seven surfaced an eighth: audit_log's own
--    self-referencing corrects_entry_id). Irrelevant at today's row counts,
--    but every phase from here on adds joins/filters across these tables,
--    so add them now while it's free.
-- 2. is_privileged_caller() is the one function in the schema without an
--    explicit `search_path`, unlike every other SECURITY DEFINER/STABLE
--    function here — a mutable search_path on a function used as the gate
--    for every money-moving RPC is worth closing even though it's a WARN,
--    not an ERROR.
-- ============================================================================

create index if not exists idx_payments_project_id on public.payments (project_id);
create index if not exists idx_commission_entries_collaborator_id on public.commission_entries (collaborator_id);
create index if not exists idx_commission_entries_payment_id on public.commission_entries (payment_id);
create index if not exists idx_commission_entries_payout_id on public.commission_entries (payout_id);
create index if not exists idx_commission_entries_adjustment_for on public.commission_entries (adjustment_for);
create index if not exists idx_profiles_collaborator_id on public.profiles (collaborator_id);
create index if not exists idx_projects_introduced_by on public.projects (introduced_by);
create index if not exists idx_audit_log_corrects_entry_id on public.audit_log (corrects_entry_id);

create or replace function public.is_privileged_caller()
returns boolean
language sql
stable
set search_path to 'public'
as $function$
  select public.is_admin()
    or coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role';
$function$;
