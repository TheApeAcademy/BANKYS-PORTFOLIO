-- ============================================================================
-- Retroactive security fix — TRUNCATE granted to anon/authenticated on
-- EVERY public table, project-wide, since before Phase 0.
--
-- Found while double-checking Phase 14's new revenue_goals table against
-- the Phase 13 anon-default-ACL lesson: information_schema.role_table_grants
-- showed `authenticated` holding TRUNCATE on it despite an is_admin()-only
-- RLS policy. Checking whether this was table-specific turned up the real
-- scope: `select defaclacl from pg_default_acl where defaclnamespace =
-- 'public'::regnamespace` shows Supabase's own default project bootstrap
-- grants `arwdDxtm` (ALL, including TRUNCATE) to anon/authenticated/
-- service_role for every future table created by the `postgres` role in
-- `public` — this is Supabase's own standard project initialization, not a
-- mistake introduced by any migration in this repo. It affects all 25
-- public tables, including payments, commission_entries, payouts, and the
-- append-only audit_log/project_stage_history/commission_entries history
-- tables.
--
-- This matters because TRUNCATE is NOT subject to row-level security in
-- Postgres — RLS gates SELECT/INSERT/UPDATE/DELETE, but a role with the
-- table-level TRUNCATE privilege can empty the entire table regardless of
-- any RLS policy. Concretely: right now, any logged-in collaborator
-- (`authenticated` role, e.g. from apps/studio) could run
-- `truncate public.payments;` directly against the Data API and it would
-- succeed — the is_admin()-gated `payments_admin_all` policy never even
-- gets consulted for TRUNCATE. The append-only guard on audit_log/
-- project_stage_history (a BEFORE DELETE FOR EACH ROW trigger) also would
-- not fire on TRUNCATE, since statement-level TRUNCATE doesn't invoke
-- per-row triggers — meaning TRUNCATE could wipe those "immutable" history
-- tables too, despite the trigger correctly blocking DELETE.
--
-- Fix: revoke TRUNCATE (and, for the same minimal-privilege reasoning,
-- REFERENCES/TRIGGER — neither is needed by anon/authenticated for any
-- table in this schema) from anon and authenticated on every existing
-- public table, then adjust the default privileges so future tables don't
-- inherit this either. anon additionally loses ALL privileges outright on
-- every table it still held them on — every anon-reachable read/write in
-- this schema goes through a SECURITY DEFINER RPC, never a direct table
-- grant, so anon should hold no direct table privileges anywhere.
-- ============================================================================

do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke truncate, references, trigger on public.%I from authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- Prevent recurrence: future tables created by `postgres` in `public` no
-- longer get TRUNCATE/REFERENCES/TRIGGER for authenticated, or anything at
-- all for anon, by default. SELECT/INSERT/UPDATE/DELETE for authenticated
-- must still be granted explicitly per table going forward (as Phase 14's
-- revenue_goals already does) — this only closes the over-broad default.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from authenticated;
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
