// The 16-stage project lifecycle from Phase 4, plus 'awaiting_payment' — a
// legacy-compat value save_project_configuration still writes on every
// public configurator save (that RPC is deliberately left untouched, see
// supabase/migrations/20260817250000_phase4_lifecycle_price_snapshot.sql).
// Included here so the admin status dropdown always has a matching <option>
// for a project's current value, never a silently-mismatched select.
export const PROJECT_STATUSES = [
  "lead",
  "configuration_started",
  "checkout_initiated",
  "payment_pending",
  "awaiting_payment",
  "payment_confirmed",
  "awaiting_information",
  "in_queue",
  "in_progress",
  "internal_review",
  "client_review",
  "revision_requested",
  "revision_in_progress",
  "completed",
  "closed",
  "cancelled",
  "refunded",
] as const;

export function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}
