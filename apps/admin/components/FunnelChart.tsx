import type { FunnelStage } from "@/lib/actions/analytics";

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.event_count), 1);

  return (
    <div className="flex flex-col gap-3">
      {stages.map((s) => (
        <div key={s.stage_order}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>{s.stage_label}</span>
            <span className="text-fg-muted">
              {s.event_count}
              {s.pct_of_previous_stage !== null ? ` · ${s.pct_of_previous_stage}% of previous stage` : ""}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-raised">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(2, (s.event_count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
