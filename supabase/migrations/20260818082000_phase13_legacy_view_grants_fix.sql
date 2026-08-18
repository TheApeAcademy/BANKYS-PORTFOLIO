-- Same default-ACL issue found on Phase 13's new views also existed,
-- undetected, on every view created since Phase 2 — anon had full
-- read/write grants on customer_overview, project_progress,
-- collaborator_ledger, and collaborator_payouts the entire time. Not
-- exploitable (their underlying tables have no anon RLS policy, so anon
-- always got zero rows), but the same defense-in-depth standard applied
-- everywhere else in this codebase. Found while auditing Phase 13's new
-- views against this exact issue and re-running the check against every
-- existing view, not just the new ones — "leave no stone unturned"
-- applies retroactively too. Tighten to SELECT-only for authenticated.

revoke all on public.customer_overview from anon, authenticated;
grant select on public.customer_overview to authenticated;

revoke all on public.project_progress from anon, authenticated;
grant select on public.project_progress to authenticated;

revoke all on public.collaborator_ledger from anon, authenticated;
grant select on public.collaborator_ledger to authenticated;

revoke all on public.collaborator_payouts from anon, authenticated;
grant select on public.collaborator_payouts to authenticated;
