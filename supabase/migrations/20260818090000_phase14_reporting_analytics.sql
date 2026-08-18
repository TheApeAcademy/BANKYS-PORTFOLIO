-- ============================================================================
-- Phase 14 — Reporting/Analytics ("10-second business understanding")
--
-- Builds directly on Phase 13's KPI/chart infrastructure. New pieces:
--   1. revenue_goals — plain admin-only table (content management, not a
--      financial mutation, same reasoning as the catalogue/documents tables
--      — no RPC wrapper needed).
--   2. top_services_breakdown() — most requested / highest revenue / highest
--      AOV / fastest growing, joined against the *active* catalogue version
--      for display labels (catalogue_project_types is versioned; joining an
--      inactive version would show stale/wrong labels).
--   3. activity_heatmap() — day-of-week x hour-of-day density from
--      activity_events, last 90 days.
--   4. funnel_summary() — IMPORTANT LIMITATION, stated plainly rather than
--      overclaiming: the existing instrumentation (Phase 3) doesn't carry a
--      single joinable key across every stage — configurator_started/
--      details_reached/submitted carry session_id but not project_id (no
--      project exists yet), while checkout_initiated carries project_id but
--      not session_id, and payment completion isn't its own activity_event
--      at all. A true unique-cohort funnel isn't reconstructable from what's
--      instrumented today. This function reports raw stage volumes (event
--      counts, not deduplicated unique users) with pct-of-previous-stage —
--      the standard simplified-funnel approach when a joinable key isn't
--      available, not a cohort-accurate conversion funnel. The "payment
--      completed" stage is sourced from payments.payment_status='successful'
--      directly (the actual ground truth), not a proxy activity_event.
-- ============================================================================

create table public.revenue_goals (
  id uuid primary key default gen_random_uuid(),
  period date not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  currency text not null default 'NGN',
  created_by text not null,
  created_at timestamptz not null default now(),
  unique (period, currency)
);

alter table public.revenue_goals enable row level security;

create policy revenue_goals_admin_all on public.revenue_goals
  for all using (public.is_admin()) with check (public.is_admin());

-- Applying the Phase 13 lesson proactively this time instead of finding it
-- after the fact: this project grants anon/authenticated full privileges on
-- every new relation by default. Revoke from anon entirely; grant
-- authenticated exactly the DML the admin app needs (RLS still gates every
-- row via is_admin()).
revoke all on public.revenue_goals from anon;
grant select, insert, update, delete on public.revenue_goals to authenticated;

-- ----------------------------------------------------------------------------
-- top_services_breakdown()
-- ----------------------------------------------------------------------------

create or replace function public.top_services_breakdown()
returns table (
  project_type text,
  label text,
  requested_count int,
  revenue jsonb,
  aov jsonb,
  growth_pct numeric
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  return query
  with requested as (
    select coalesce(p.project_type, 'unspecified') as pt, count(*)::int as requested_count
    from public.projects p
    group by 1
  ),
  pay_stats as (
    select coalesce(pr.project_type, 'unspecified') as pt, pay.currency,
           sum(pay.amount) as total_revenue, avg(pay.amount) as avg_order_value
    from public.payments pay
    join public.projects pr on pr.id = pay.project_id
    where pay.payment_status = 'successful'
    group by 1, 2
  ),
  revenue_agg as (
    select pt, jsonb_object_agg(currency, round(total_revenue, 2)) as revenue
    from pay_stats group by pt
  ),
  aov_agg as (
    select pt, jsonb_object_agg(currency, round(avg_order_value, 2)) as aov
    from pay_stats group by pt
  ),
  recent as (
    select
      coalesce(p.project_type, 'unspecified') as pt,
      count(*) filter (where p.created_at >= now() - interval '30 days') as recent_count,
      count(*) filter (
        where p.created_at >= now() - interval '60 days' and p.created_at < now() - interval '30 days'
      ) as prior_count
    from public.projects p
    group by 1
  ),
  labels as (
    select cpt.type_id, cpt.label
    from public.catalogue_project_types cpt
    join public.catalogue_versions cv on cv.id = cpt.version_id
    where cv.is_active
  )
  select
    r.pt,
    coalesce(l.label, r.pt),
    r.requested_count,
    coalesce(rv.revenue, '{}'::jsonb),
    coalesce(av.aov, '{}'::jsonb),
    case
      when rc.prior_count > 0 then round(((rc.recent_count - rc.prior_count)::numeric / rc.prior_count) * 100, 1)
      when rc.recent_count > 0 then 100.0
      else 0.0
    end
  from requested r
  left join revenue_agg rv on rv.pt = r.pt
  left join aov_agg av on av.pt = r.pt
  left join recent rc on rc.pt = r.pt
  left join labels l on l.type_id = r.pt
  order by r.requested_count desc;
end;
$function$;

revoke execute on function public.top_services_breakdown() from public;
revoke execute on function public.top_services_breakdown() from anon;
grant execute on function public.top_services_breakdown() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- activity_heatmap()
-- ----------------------------------------------------------------------------

create or replace function public.activity_heatmap()
returns table (day_of_week int, hour_of_day int, event_count int)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  return query
  select extract(dow from occurred_at)::int, extract(hour from occurred_at)::int, count(*)::int
  from public.activity_events
  where occurred_at >= now() - interval '90 days'
  group by 1, 2
  order by 1, 2;
end;
$function$;

revoke execute on function public.activity_heatmap() from public;
revoke execute on function public.activity_heatmap() from anon;
grant execute on function public.activity_heatmap() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- funnel_summary() — see the file header for the count-based-approximation
-- caveat.
-- ----------------------------------------------------------------------------

create or replace function public.funnel_summary()
returns table (stage_order int, stage_label text, event_count int, pct_of_previous_stage numeric)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_started int;
  v_details int;
  v_submitted int;
  v_checkout int;
  v_paid int;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select count(*) into v_started from public.activity_events where event_type = 'configurator_started';
  select count(*) into v_details from public.activity_events where event_type = 'configurator_details_reached';
  select count(*) into v_submitted from public.activity_events where event_type = 'configurator_submitted';
  select count(*) into v_checkout from public.activity_events where event_type = 'checkout_initiated';
  select count(*) into v_paid from public.payments where payment_status = 'successful';

  return query
  select 1, 'Configurator started', v_started, null::numeric
  union all
  select 2, 'Reached project details', v_details,
    case when v_started > 0 then round((v_details::numeric / v_started) * 100, 1) end
  union all
  select 3, 'Configuration submitted', v_submitted,
    case when v_details > 0 then round((v_submitted::numeric / v_details) * 100, 1) end
  union all
  select 4, 'Checkout started', v_checkout,
    case when v_submitted > 0 then round((v_checkout::numeric / v_submitted) * 100, 1) end
  union all
  select 5, 'Payment completed', v_paid,
    case when v_checkout > 0 then round((v_paid::numeric / v_checkout) * 100, 1) end;
end;
$function$;

revoke execute on function public.funnel_summary() from public;
revoke execute on function public.funnel_summary() from anon;
grant execute on function public.funnel_summary() to authenticated, service_role;
