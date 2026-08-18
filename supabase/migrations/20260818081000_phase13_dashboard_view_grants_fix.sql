-- Phase 13 follow-up: this project's default privileges grant `anon` and
-- `authenticated` full read/write access to every newly created relation
-- (same class of issue found for functions in Phases 5 and 11 — this is
-- the first time it showed up on views/tables rather than functions).
-- security_invoker views still correctly return zero rows to anon (the
-- underlying payments/projects/etc. RLS has no anon policy), so this was
-- not exploitable, but it violates the same defense-in-depth standard
-- applied everywhere else in this codebase. Tighten to SELECT-only for
-- authenticated (the admin app's own session role), nothing for anon.

revoke all on public.kpi_payment_status_counts from anon, authenticated;
grant select on public.kpi_payment_status_counts to authenticated;

revoke all on public.kpi_project_status_counts from anon, authenticated;
grant select on public.kpi_project_status_counts to authenticated;

revoke all on public.kpi_commission_totals from anon, authenticated;
grant select on public.kpi_commission_totals to authenticated;

revoke all on public.revenue_by_service from anon, authenticated;
grant select on public.revenue_by_service to authenticated;

revoke all on public.revenue_by_country from anon, authenticated;
grant select on public.revenue_by_country to authenticated;

revoke all on public.revenue_by_currency from anon, authenticated;
grant select on public.revenue_by_currency to authenticated;

revoke all on public.revenue_by_payment_method from anon, authenticated;
grant select on public.revenue_by_payment_method to authenticated;

revoke all on public.revenue_by_collaborator from anon, authenticated;
grant select on public.revenue_by_collaborator to authenticated;

revoke all on public.revenue_by_project_status from anon, authenticated;
grant select on public.revenue_by_project_status to authenticated;
