-- ============================================================================
-- Phase 12 — Security Hardening
--
-- No RBAC (per the founder's decision) — this hardens the single admin
-- account, not a permission matrix. Three pieces:
--   1. rate_limit_counters + check_rate_limit()/cleanup_rate_limit_counters()
--      — fixed-window counters in Postgres rather than a new external
--      dependency (Upstash etc.) that would need founder-side provisioning
--      before it could even be tested. Used by both apps' login forms and
--      studio's /start/pay and /track token lookups.
--   2. list_my_sessions()/revoke_my_session() — reads/deletes directly from
--      auth.sessions (Supabase's own session store; there is no client-SDK
--      "list/revoke one session" API, only signOut({scope}), so direct
--      access to auth.sessions — scoped strictly to auth.uid() — is the
--      documented approach: "You can correlate this ID with the primary key
--      of the auth.sessions table.").
--   3. Login events already flow into system_events (failures) and
--      activity_events (successes, event_type='login') since Phase 3 —
--      no new login_events table needed, per the plan's own "or reuse"
--      allowance. MFA enrollment/enforcement is wired entirely in
--      apps/admin via supabase-js's native auth.mfa API; no schema needed
--      for that piece beyond what Supabase Auth already stores.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Rate limiting — fixed-window counters, one row per (key, window).
-- ----------------------------------------------------------------------------

create table public.rate_limit_counters (
  rate_key text not null,
  window_start timestamptz not null,
  attempts integer not null default 1,
  primary key (rate_key, window_start)
);

alter table public.rate_limit_counters enable row level security;
-- No policies for any role — not even admin reads this directly; it's
-- purely an internal counter, reachable only through the functions below.

create or replace function public.check_rate_limit(p_key text, p_max_attempts int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_window_start timestamptz;
  v_attempts int;
begin
  -- Bounds checks: this function is anon-callable (rate limiting has to run
  -- before a caller is authenticated), so it can't trust its own inputs —
  -- these caps bound the worst-case row size/count an abusive caller could
  -- produce before the daily cleanup sweeps them.
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 then
    raise exception 'invalid rate limit key';
  end if;
  if p_window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit window';
  end if;
  if p_max_attempts not between 1 and 10000 then
    raise exception 'invalid rate limit threshold';
  end if;

  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limit_counters (rate_key, window_start, attempts)
  values (p_key, v_window_start, 1)
  on conflict (rate_key, window_start) do update set attempts = rate_limit_counters.attempts + 1
  returning attempts into v_attempts;

  return v_attempts <= p_max_attempts;
end;
$function$;

revoke execute on function public.check_rate_limit(text, int, int) from public;
grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated, service_role;

create or replace function public.cleanup_rate_limit_counters()
returns void
language sql
security definer
set search_path to 'public'
as $function$
  delete from public.rate_limit_counters where window_start < now() - interval '1 day';
$function$;

revoke execute on function public.cleanup_rate_limit_counters() from public;
revoke execute on function public.cleanup_rate_limit_counters() from anon;
revoke execute on function public.cleanup_rate_limit_counters() from authenticated;
grant execute on function public.cleanup_rate_limit_counters() to service_role;

-- ----------------------------------------------------------------------------
-- Active-session management — direct access to auth.sessions, strictly
-- scoped to the calling user's own sessions (never cross-user).
-- ----------------------------------------------------------------------------

create or replace function public.list_my_sessions()
returns table (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  refreshed_at timestamp,
  user_agent text,
  ip inet,
  aal text,
  is_current boolean
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  return query
  select
    s.id, s.created_at, s.updated_at, s.refreshed_at, s.user_agent, s.ip, s.aal::text,
    s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
  from auth.sessions s
  where s.user_id = auth.uid()
  order by coalesce(s.refreshed_at, s.updated_at, s.created_at) desc;
end;
$function$;

revoke execute on function public.list_my_sessions() from public;
revoke execute on function public.list_my_sessions() from anon;
grant execute on function public.list_my_sessions() to authenticated, service_role;

create or replace function public.revoke_my_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  if p_session_id = nullif(auth.jwt() ->> 'session_id', '')::uuid then
    raise exception 'cannot revoke your current session — sign out instead';
  end if;

  delete from auth.sessions where id = p_session_id and user_id = auth.uid();
end;
$function$;

revoke execute on function public.revoke_my_session(uuid) from public;
revoke execute on function public.revoke_my_session(uuid) from anon;
grant execute on function public.revoke_my_session(uuid) to authenticated, service_role;
