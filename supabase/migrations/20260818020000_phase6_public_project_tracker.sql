-- ============================================================================
-- Phase 6 — Public Project Tracker
-- ============================================================================
-- Anon-callable RPC returning only public-safe fields for a project looked
-- up by its existing access_token (same token already used by the
-- configurator resume / payment-resume flows — no new identifier minted).
--
-- Deliberately NOT modeled on get_project_by_token (which does `select *`
-- and returns client_contact, quoted_price, etc. — fine for its existing
-- server-only resume-flow callers, but exactly what this RPC must NOT leak
-- since it's meant to sit behind a public, no-login page). Returns an
-- explicit narrow column set instead.
--
-- LEFT JOINs project_progress rather than requiring a row there — a project
-- before project_type is set (Lead..Payment Confirmed, pre-Phase-5 stage
-- generation) has no stage data yet; the tracker page still needs to show
-- something (project_code + lifecycle status) rather than 404.
--
-- project_progress has security_invoker = true, but this function runs
-- SECURITY DEFINER (owned by postgres), so the view is evaluated as the
-- function owner — same trust boundary as every other anon-callable RPC in
-- this schema (submit_project_intake, save_project_configuration, etc.):
-- the function body is the security boundary, not RLS.
-- ============================================================================

-- `stages` is a public-safe per-stage array (order, label, status only — no
-- ids, no timestamps, no completed_by) so the tracker page can render an
-- actual checklist, not just an aggregate percentage, per the spec's
-- "stage list, progress %, current-stage label". Aggregated separately from
-- project_progress (which only carries the per-project aggregate columns,
-- not a per-stage breakdown) via a lateral join straight to project_stages.
create or replace function public.get_project_tracker(p_access_token text)
returns table (
  project_code text,
  status text,
  hold_state text,
  project_type text,
  total_stages int,
  completed_stages int,
  percent_complete numeric,
  current_stage_key text,
  current_stage_label text,
  derived_status text,
  stages jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path to 'public'
as $function$
  select
    p.project_code,
    p.status,
    p.hold_state,
    p.project_type,
    pp.total_stages,
    pp.completed_stages,
    pp.percent_complete,
    pp.current_stage_key,
    pp.current_stage_label,
    pp.derived_status,
    coalesce(sl.stages, '[]'::jsonb) as stages,
    p.created_at
  from public.projects p
  left join public.project_progress pp on pp.project_id = p.id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object('stage_order', ps.stage_order, 'stage_label', ps.stage_label, 'status', ps.status)
      order by ps.stage_order
    ) as stages
    from public.project_stages ps
    where ps.project_id = p.id
  ) sl on true
  where p.access_token = p_access_token;
$function$;

revoke execute on function public.get_project_tracker(text) from public;
grant execute on function public.get_project_tracker(text) to anon, authenticated, service_role;
