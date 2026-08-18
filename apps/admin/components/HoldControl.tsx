"use client";

import { useActionState, useState } from "react";
import { setProjectHold, type ActionState } from "@/lib/actions/project-stages";
import { inputCls, buttonGhostCls } from "@/components/ui";

const initial: ActionState = { error: null };

const HOLD_LABELS: Record<string, string> = {
  on_hold: "On hold",
  awaiting_client: "Awaiting client",
};

// Orthogonal to project_stages by design (see the Phase 5 migration) — this
// never touches stage completion or projects.status, purely a display flag
// with its own audit trail.
export function HoldControl({ projectId, holdState }: { projectId: string; holdState: string | null }) {
  const [state, action, pending] = useActionState(setProjectHold, initial);
  const [next, setNext] = useState(holdState ?? "");

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="project_id" value={projectId} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-fg-muted">Hold status</label>
        <select name="hold_state" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)}>
          <option value="">None — normal progress</option>
          <option value="on_hold">On hold</option>
          <option value="awaiting_client">Awaiting client</option>
        </select>
      </div>
      {next ? (
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-fg-muted">Reason (required)</label>
          <input name="reason" required className={inputCls} placeholder="Why is this paused?" />
        </div>
      ) : null}
      <button type="submit" disabled={pending} className={buttonGhostCls}>
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error ? <p className="w-full text-xs text-excluded">{state.error}</p> : null}
      {holdState ? (
        <p className="w-full text-xs text-fg-muted">Currently: {HOLD_LABELS[holdState] ?? holdState}</p>
      ) : null}
    </form>
  );
}
