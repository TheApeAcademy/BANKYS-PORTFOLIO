-- ============================================================================
-- Fix: admin-only RPCs anon-executable despite `revoke ... from public`
-- ============================================================================
-- Discovered while verifying Phase 5. This project's default privileges
-- (`pg_default_acl`, defaclrole = postgres, objtype 'f') grant EXECUTE on
-- every newly-created function directly to `anon` and `authenticated` as
-- named grantees — not via the `PUBLIC` pseudo-role. Every migration this
-- session (Phase 3 onward) followed the pattern
-- `revoke execute ... from public; grant ... to authenticated, service_role;`
-- for admin-only RPCs, matching the pre-existing baseline RPCs' apparent
-- convention — but `revoke ... from public` only strips the PUBLIC grant,
-- never anon's own direct grant, so every admin-only RPC created since
-- Phase 3 has stayed callable (though not exploitable — is_privileged_caller()
-- still blocks with an exception) by anon. Confirmed via
-- information_schema.role_routine_grants: none of the pre-Phase-3 baseline
-- admin RPCs (record_partial_refund, exclude_payment, mark_payout_paid, ...)
-- have this leak, since they were never touched by this session's revoke
-- pattern; every session-authored admin-only RPC does.
--
-- Not a live vulnerability (the internal is_privileged_caller() check still
-- rejects any anon caller before any side effect), but it defeats the
-- intended defense-in-depth and is exactly what the Supabase advisor's
-- "Public Can Execute SECURITY DEFINER Function" WARN is flagging. Fixed
-- here for both the 4 new Phase 5 RPCs and the 5 Phase 3 RPCs that share
-- the same gap.
-- ============================================================================

revoke execute on function public.advance_project_stage(uuid, text, text) from anon;
revoke execute on function public.revert_project_stage(uuid, text, text, text) from anon;
revoke execute on function public.set_project_hold(uuid, text, text, text) from anon;
revoke execute on function public.set_project_type(uuid, text, text) from anon;

revoke execute on function public.create_project_by_admin(text, text, uuid, text) from anon;
revoke execute on function public.update_project_status(uuid, text, text) from anon;
revoke execute on function public.create_collaborator_record(text, text, date, numeric, text, date, jsonb) from anon;
revoke execute on function public.update_collaborator_record(uuid, date, boolean, text, date, numeric) from anon;
revoke execute on function public.link_collaborator_login(uuid, uuid, text, text, text) from anon;
