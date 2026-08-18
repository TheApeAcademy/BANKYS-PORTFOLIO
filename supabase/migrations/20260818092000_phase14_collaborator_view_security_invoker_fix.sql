-- Advisor turned up a real inconsistency from Phase 9: collaborator_ledger
-- and collaborator_payouts were created without security_invoker = true,
-- unlike every other view in this codebase (customer_overview,
-- project_progress, and Phase 13's nine new views). Both already have a
-- correct self-scoping `where collaborator_id = current_collaborator_id()`
-- clause baked into the view itself, so the visible result set is
-- identical either way — current_collaborator_id() reads the caller's own
-- JWT regardless of security_invoker, so this was not exploitable — but
-- running as the view owner (postgres) means the underlying tables' RLS is
-- bypassed entirely rather than acting as a second enforcement layer.
-- Fixed for the same defense-in-depth/consistency reasoning as every other
-- finding this session.
alter view public.collaborator_ledger set (security_invoker = true);
alter view public.collaborator_payouts set (security_invoker = true);
