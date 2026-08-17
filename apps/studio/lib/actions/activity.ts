"use server";

import { createClient } from "@zebraish/lib/supabase/server";

/**
 * Best-effort product-activity logging — meaningful funnel/journey events
 * only (configurator steps, checkout, logins), never raw interaction noise.
 * Never throws: a logging failure must not block the actual user action it's
 * attached to (matches the existing best-effort philosophy in lib/email.ts).
 */
export async function logActivityEvent(
  eventType: string,
  options?: { sessionId?: string; projectId?: string; metadata?: Record<string, unknown> },
) {
  try {
    const supabase = await createClient();
    await supabase.rpc("log_activity_event", {
      p_event_type: eventType,
      p_session_id: options?.sessionId ?? null,
      p_project_id: options?.projectId ?? null,
      p_metadata: options?.metadata ?? {},
    });
  } catch {
    // Telemetry, not a critical path — swallow and move on.
  }
}
