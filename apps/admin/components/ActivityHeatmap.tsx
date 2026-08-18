import type { HeatmapCell } from "@/lib/actions/analytics";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ cells }: { cells: HeatmapCell[] }) {
  if (cells.length === 0) {
    return <p className="py-6 text-center text-sm text-fg-muted">No activity recorded in the last 90 days yet.</p>;
  }

  const max = Math.max(...cells.map((c) => c.event_count), 1);
  const byKey = new Map(cells.map((c) => [`${c.day_of_week}-${c.hour_of_day}`, c.event_count]));

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid grid-cols-[auto_repeat(24,1fr)] gap-1 text-xs">
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center text-fg-muted">
            {h % 6 === 0 ? h : ""}
          </div>
        ))}
        {DAY_LABELS.map((label, dow) => (
          <div key={label} className="contents">
            <div className="pr-2 text-fg-muted">{label}</div>
            {Array.from({ length: 24 }, (_, hour) => {
              const count = byKey.get(`${dow}-${hour}`) ?? 0;
              const intensity = count === 0 ? 0 : 0.15 + 0.85 * (count / max);
              return (
                <div
                  key={hour}
                  title={`${label} ${hour}:00 — ${count} event${count === 1 ? "" : "s"}`}
                  className="h-4 w-4 rounded-sm"
                  style={{ background: count === 0 ? "var(--bg-raised)" : `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, var(--bg-raised))` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
