-- ============================================================================
-- Reconciliation migration: the private-access-code collaborator system
-- (commits "Replace collaborator login with a private access code" and
-- "Add a Collaborate section with a public application flow") is already
-- applied AND tracked in Supabase's own migration history on the live
-- project, as versions 016_fix_access_token_generation,
-- 017_collaborator_access_code, 018_access_code_default, and
-- 019_collaborator_applications (`supabase migration list` / the MCP
-- `list_migrations` tool shows them). Those four files were just never
-- pulled back down and committed to this repo's supabase/migrations/
-- directory, so `git` and the live database disagree about history even
-- though the live database itself is internally consistent and correct.
--
-- This file reconstructs that state from the live schema (functions, table
-- DDL, RLS policies, grants — all read directly off the production
-- database) so the repo matches what's actually running. It is NOT meant to
-- be applied as version 016-019 — those version numbers are already taken
-- in Supabase's history — it's a later, self-contained catch-up migration.
-- Every statement is idempotent (IF NOT EXISTS / CREATE OR REPLACE /
-- re-assertable grants and policies), so it's safe to run even though the
-- objects already exist; for a byte-exact copy of 016-019, run
-- `supabase db pull` against this project instead.
-- ============================================================================

-- 1. collaborators.access_code — private sign-in code, replaces the old
--    Supabase Auth-based collaborator login.
alter table public.collaborators
  add column if not exists access_code text not null default replace(gen_random_uuid()::text, '-', '');

-- 2. collaborator_applications — public "become a collaborator" intake.
create table if not exists public.collaborator_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  pitch text not null,
  experience text not null,
  status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  collaborator_id uuid references public.collaborators(id),
  created_at timestamptz not null default now()
);

alter table public.collaborator_applications enable row level security;

drop policy if exists admin_select_collaborator_applications on public.collaborator_applications;
create policy admin_select_collaborator_applications on public.collaborator_applications
  for select using (public.is_admin());

drop policy if exists admin_update_collaborator_applications on public.collaborator_applications;
create policy admin_update_collaborator_applications on public.collaborator_applications
  for update using (public.is_admin()) with check (public.is_admin());

-- 3. RPCs — code-scoped reads (anon, pre-auth) and the public application
--    submission (anon, pre-auth). All SECURITY DEFINER, matching the rest of
--    this app's public-surface RPC pattern.

create or replace function public.get_collaborator_by_code(p_code text)
returns table(id uuid, name text, commission_rate numeric, term_start date, term_end date, active boolean)
language sql
security definer
set search_path to 'public'
as $function$
  select c.id, c.name, c.commission_rate, c.term_start, c.term_end, c.active
  from public.collaborators c
  where c.access_code = p_code;
$function$;

create or replace function public.get_collaborator_ledger_by_code(p_code text)
returns table(
  entry_id uuid, collaborator_id uuid, project_code text,
  payment_amount numeric, payment_currency text, received_at timestamptz, payment_type text,
  commission_amount numeric, commission_currency text, status text, week_of date
)
language sql
security definer
set search_path to 'public'
as $function$
  select ce.id, ce.collaborator_id, p.project_code,
    pay.amount, pay.currency, pay.received_at, pay.type,
    ce.amount, ce.currency, ce.status, ce.week_of
  from public.commission_entries ce
  join public.payments pay on pay.id = ce.payment_id
  join public.projects p on p.id = pay.project_id
  join public.collaborators c on c.id = ce.collaborator_id
  where c.access_code = p_code;
$function$;

create or replace function public.get_collaborator_payouts_by_code(p_code text)
returns table(payout_id uuid, collaborator_id uuid, week_of date, total_amount numeric, currency text, paid_at timestamptz)
language sql
security definer
set search_path to 'public'
as $function$
  select po.id, po.collaborator_id, po.week_of, po.total_amount, po.currency, po.paid_at
  from public.payouts po
  join public.collaborators c on c.id = po.collaborator_id
  where c.access_code = p_code;
$function$;

create or replace function public.submit_collaborator_application(
  p_name text, p_email text, p_phone text, p_pitch text, p_experience text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
begin
  if trim(p_name) = '' or trim(p_pitch) = '' or trim(p_experience) = '' then
    raise exception 'Name, pitch, and experience are required.';
  end if;

  insert into public.collaborator_applications (name, email, phone, pitch, experience)
  values (trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), trim(p_pitch), trim(p_experience))
  returning id into v_id;

  return v_id;
end;
$function$;

revoke execute on function public.get_collaborator_by_code(text) from public;
grant execute on function public.get_collaborator_by_code(text) to anon, authenticated, service_role;

revoke execute on function public.get_collaborator_ledger_by_code(text) from public;
grant execute on function public.get_collaborator_ledger_by_code(text) to anon, authenticated, service_role;

revoke execute on function public.get_collaborator_payouts_by_code(text) from public;
grant execute on function public.get_collaborator_payouts_by_code(text) to anon, authenticated, service_role;

revoke execute on function public.submit_collaborator_application(text, text, text, text, text) from public;
grant execute on function public.submit_collaborator_application(text, text, text, text, text) to anon, authenticated, service_role;

-- 4. collaborators RLS — admins manage everything; a signed-in collaborator
--    (via current_collaborator_id(), set from the access-code cookie at the
--    app layer) can read their own row. Both may already exist; re-assert.
drop policy if exists collaborators_admin_all on public.collaborators;
create policy collaborators_admin_all on public.collaborators
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists collaborators_self_select on public.collaborators;
create policy collaborators_self_select on public.collaborators
  for select using (id = public.current_collaborator_id());
