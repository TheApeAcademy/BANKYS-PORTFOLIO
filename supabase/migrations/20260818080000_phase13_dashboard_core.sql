-- ============================================================================
-- Phase 13 — Dashboard Core
--
-- All views here are security_invoker = true and rely entirely on the
-- underlying tables' existing admin-only RLS (payments/projects/customers/
-- collaborators/commission_entries/payouts all have a `*_admin_all` FOR ALL
-- policy gated on is_admin()) — confirmed via pg_policies before writing
-- this, rather than assuming. No new grants needed for the views themselves;
-- the two summary/trend functions are admin-gated explicitly since they're
-- SECURITY DEFINER (needed for the jsonb aggregation across currencies).
--
-- Global search and the live activity feed are deliberately NOT new RPCs —
-- they're plain parallel queries against tables the admin session can
-- already read directly (matching how customers/projects/audit-log pages
-- already query), composed in lib/actions/dashboard.ts.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- kpi_summary() — the top-line stat cards.
-- ----------------------------------------------------------------------------

create or replace function public.kpi_summary()
returns table (
  revenue_this_month jsonb,
  active_projects int,
  pending_commission_total jsonb,
  open_disputes int,
  overdue_projects int
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_revenue jsonb;
  v_active int;
  v_pending jsonb;
  v_disputes int;
  v_overdue int;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select coalesce(jsonb_object_agg(currency, total), '{}'::jsonb) into v_revenue
  from (
    select currency, sum(amount) as total
    from public.payments
    where payment_status = 'successful' and received_at >= date_trunc('month', now())
    group by currency
  ) r;

  select count(*) into v_active
  from public.projects
  where status not in ('completed', 'closed', 'cancelled', 'refunded', 'lead');

  select coalesce(jsonb_object_agg(currency, total), '{}'::jsonb) into v_pending
  from (
    select currency, sum(amount) as total
    from public.commission_entries
    where status = 'PENDING'
    group by currency
  ) c;

  select count(*) into v_disputes from public.payment_disputes where status = 'open';

  -- Mirrors detect_scheduled_notifications()'s overdue definition exactly
  -- (no stage activity in 14+ days, still an active status) so the KPI card
  -- and the notification that fires for the same projects always agree.
  select count(*) into v_overdue
  from (
    select p.id
    from public.projects p
    left join public.project_stage_history h on h.project_id = p.id
    where p.status not in ('completed', 'closed', 'cancelled', 'refunded', 'lead')
    group by p.id, p.created_at
    having greatest(p.created_at, coalesce(max(h.occurred_at), p.created_at)) < now() - interval '14 days'
  ) o;

  return query select v_revenue, v_active, v_pending, v_disputes, v_overdue;
end;
$function$;

revoke execute on function public.kpi_summary() from public;
revoke execute on function public.kpi_summary() from anon;
grant execute on function public.kpi_summary() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- kpi_revenue_by_period() — trend line for the dashboard's revenue chart.
-- ----------------------------------------------------------------------------

create or replace function public.kpi_revenue_by_period(p_granularity text default 'week', p_periods int default 12)
returns table (period_start timestamptz, currency text, revenue numeric)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_granularity not in ('day', 'week', 'month') then
    raise exception 'invalid granularity';
  end if;
  if p_periods not between 1 and 104 then
    raise exception 'invalid period count';
  end if;

  return query
  select date_trunc(p_granularity, p.received_at) as period_start, p.currency, sum(p.amount) as revenue
  from public.payments p
  where p.payment_status = 'successful'
    and p.received_at >= date_trunc(p_granularity, now()) - (p_periods || ' ' || p_granularity)::interval
  group by 1, 2
  order by 1;
end;
$function$;

revoke execute on function public.kpi_revenue_by_period(text, int) from public;
revoke execute on function public.kpi_revenue_by_period(text, int) from anon;
grant execute on function public.kpi_revenue_by_period(text, int) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Status-count views — feed small bar/donut breakdowns.
-- ----------------------------------------------------------------------------

create view public.kpi_payment_status_counts with (security_invoker = true) as
  select payment_status, count(*) as count
  from public.payments
  group by payment_status;

create view public.kpi_project_status_counts with (security_invoker = true) as
  select status, count(*) as count
  from public.projects
  group by status;

create view public.kpi_commission_totals with (security_invoker = true) as
  select status, currency, sum(amount) as total, count(*) as count
  from public.commission_entries
  group by status, currency;

-- ----------------------------------------------------------------------------
-- Revenue breakdowns — successful payments only, one row per (label, currency)
-- since amounts can't be summed across currencies. Feed Phase 13's dashboard
-- (a couple of these) and Phase 14's fuller analytics page (all of them).
-- ----------------------------------------------------------------------------

create view public.revenue_by_service with (security_invoker = true) as
  select coalesce(pr.project_type, 'unspecified') as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  join public.projects pr on pr.id = p.project_id
  where p.payment_status = 'successful'
  group by 1, 2;

create view public.revenue_by_country with (security_invoker = true) as
  select coalesce(c.country, 'unspecified') as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  join public.projects pr on pr.id = p.project_id
  left join public.customers c on c.id = pr.customer_id
  where p.payment_status = 'successful'
  group by 1, 2;

create view public.revenue_by_currency with (security_invoker = true) as
  select p.currency as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  where p.payment_status = 'successful'
  group by 1, 2;

create view public.revenue_by_payment_method with (security_invoker = true) as
  select coalesce(p.method, 'unspecified') as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  where p.payment_status = 'successful'
  group by 1, 2;

create view public.revenue_by_collaborator with (security_invoker = true) as
  select coalesce(col.name, 'none') as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  join public.projects pr on pr.id = p.project_id
  left join public.collaborators col on col.id = pr.introduced_by
  where p.payment_status = 'successful'
  group by 1, 2;

create view public.revenue_by_project_status with (security_invoker = true) as
  select pr.status as label, p.currency, sum(p.amount) as revenue
  from public.payments p
  join public.projects pr on pr.id = p.project_id
  where p.payment_status = 'successful'
  group by 1, 2;
