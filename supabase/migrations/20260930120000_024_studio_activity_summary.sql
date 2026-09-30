-- 024: Studio activity for the Bureau (admin overview).
-- The studio now logs anonymous visits and clicks (page_view, contact_*,
-- intro_*, builder_opened, tracker_*, collab_*_opened, language_switched)
-- alongside the existing builder funnel. This summarises them in one call.

create index if not exists activity_events_type_time_idx on public.activity_events (event_type, occurred_at desc);

create or replace function public.studio_activity_summary(p_days int default 7)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_days int := greatest(1, least(coalesce(p_days, 7), 90));
  v_from timestamptz := now() - make_interval(days => v_days);
  v_prev timestamptz := now() - make_interval(days => v_days * 2);
  v_out jsonb;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  with ev as (
    select * from public.activity_events where occurred_at >= v_prev
  ), cur as (
    select * from ev where occurred_at >= v_from
  ), cnt as (
    select event_type, count(*)::int n from cur group by 1
  )
  select jsonb_build_object(
    'days', v_days,
    'visits', (select count(distinct session_id)::int from cur where event_type = 'page_view'),
    'visits_prev', (select count(distinct session_id)::int from ev where event_type = 'page_view' and occurred_at < v_from),
    'visits_today', (select count(distinct session_id)::int from cur where event_type = 'page_view' and occurred_at >= date_trunc('day', now())),
    'page_views', coalesce((select n from cnt where event_type = 'page_view'), 0),
    'events', coalesce((select jsonb_object_agg(event_type, n) from cnt), '{}'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc)
      from (select path, count(*)::int n from cur where event_type = 'page_view' and path is not null group by 1 order by 2 desc limit 6) t
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(d, n) from (select coalesce(metadata->>'device', 'unknown') d, count(*)::int n from cur where event_type = 'page_view' group by 1) t
    ), '{}'::jsonb),
    'langs', coalesce((
      select jsonb_object_agg(l, n) from (select coalesce(metadata->>'lang', 'unknown') l, count(*)::int n from cur where event_type = 'page_view' group by 1) t
    ), '{}'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('host', h, 'visits', n) order by n desc)
      from (select metadata->>'referrer' h, count(*)::int n from cur where event_type = 'page_view' and metadata ? 'referrer' group by 1 order by 2 desc limit 5) t
    ), '[]'::jsonb),
    'applications', (select count(*)::int from public.collaborator_applications where created_at >= v_from),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d::date, 'visits', coalesce(v, 0)) order by d)
      from generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') d
      left join (
        select date_trunc('day', occurred_at) dd, count(distinct session_id)::int v
        from public.activity_events where event_type = 'page_view' and occurred_at >= date_trunc('day', now()) - interval '13 days'
        group by 1
      ) x on x.dd = d
    ), '[]'::jsonb)
  ) into v_out;

  return v_out;
end;
$$;

revoke all on function public.studio_activity_summary(int) from public, anon;
grant execute on function public.studio_activity_summary(int) to authenticated, service_role;
