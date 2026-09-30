"use client";

// Studio activity for the Bureau (admin): page visits, contact clicks, the
// intro, the builder, the tracker, collaborator pop-ups. Anonymous by design:
// the visit id lives in memory for one page load and nothing is stored on the
// device, so this stays outside the cookie rules the cookie policy describes.
import { logActivityEvent } from "@/lib/actions/activity";

const visitId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
let sent = 0;
const MAX_PER_LOAD = 80; // a runaway loop can't flood the table

export function track(event: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || sent >= MAX_PER_LOAD) return;
  sent++;
  void logActivityEvent(event, {
    sessionId: visitId,
    path: location.pathname,
    metadata,
  });
}
