"use client";

import { useActionState } from "react";
import { advanceProjectStage, revertProjectStage, type ActionState } from "@/lib/actions/project-stages";
import { inputCls, buttonCls, buttonGhostCls } from "@/components/ui";

type Stage = {
  stage_key: string;
  stage_order: number;
  stage_label: string;
  status: "not_started" | "in_progress" | "complete";
  completed_at: string | null;
  completed_by: string | null;
};

const initial: ActionState = { error: null };

// Sequential lock, mirroring the server-side enforcement in
// advance_project_stage: only the first not-yet-complete stage (in
// stage_order) is actionable. Everything after it is disabled in the UI so
// a click can never even attempt an out-of-order completion.
export function StageChecklist({ projectId, stages }: { projectId: string; stages: Stage[] }) {
  const [advanceState, advanceAction, advancePending] = useActionState(advanceProjectStage, initial);
  const sorted = [...stages].sort((a, b) => a.stage_order - b.stage_order);
  const firstIncompleteIndex = sorted.findIndex((s) => s.status !== "complete");

  return (
    <div>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {sorted.map((stage, i) => {
          const isComplete = stage.status === "complete";
          const isActionable = i === firstIncompleteIndex;
          const isLocked = !isComplete && !isActionable;

          return (
            <div key={stage.stage_key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                    isComplete ? "border-accent bg-accent text-white" : "border-border"
                  }`}
                >
                  {isComplete ? "✓" : ""}
                </span>
                <div>
                  <p className={`text-sm ${isLocked ? "text-fg-muted" : "text-fg"}`}>{stage.stage_label}</p>
                  {isComplete && stage.completed_at ? (
                    <p className="text-xs text-fg-muted">
                      Completed {new Date(stage.completed_at).toLocaleDateString()}
                      {stage.completed_by ? ` by ${stage.completed_by}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>

              {isActionable ? (
                <form action={advanceAction}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="stage_key" value={stage.stage_key} />
                  <button type="submit" disabled={advancePending} className={buttonCls}>
                    {advancePending ? "Saving…" : "Mark complete"}
                  </button>
                </form>
              ) : isComplete ? (
                <RevertControl projectId={projectId} stageKey={stage.stage_key} />
              ) : (
                <span className="text-xs text-fg-muted">Locked</span>
              )}
            </div>
          );
        })}
      </div>
      {advanceState.error ? <p className="mt-2 text-xs text-excluded">{advanceState.error}</p> : null}
    </div>
  );
}

// Reverting resets the target stage AND every later stage (server-enforced
// cascade) — the reason field exists because that's a meaningful
// correction, not a routine action, and the RPC itself requires it.
function RevertControl({ projectId, stageKey }: { projectId: string; stageKey: string }) {
  const [state, action, pending] = useActionState(revertProjectStage, initial);

  return (
    <details className="text-xs">
      <summary className="cursor-pointer select-none text-fg-muted hover:text-fg">Revert</summary>
      <form action={action} className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-bg-raised p-3">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="stage_key" value={stageKey} />
        <input name="reason" placeholder="Reason (required, logged)" required className={inputCls} />
        <button type="submit" disabled={pending} className={buttonGhostCls}>
          {pending ? "Reverting…" : "Revert this and later stages"}
        </button>
        {state.error ? <p className="text-excluded">{state.error}</p> : null}
      </form>
    </details>
  );
}
