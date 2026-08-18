import { Logo } from "@/components/Logo";
import { getProjectTracker } from "@/lib/actions/tracker";
import { formatDate } from "@zebraish/lib/format";

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const HOLD_LABELS: Record<string, string> = {
  on_hold: "This project is currently on hold.",
  awaiting_client: "We're waiting on information from you to continue.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const project = token ? await getProjectTracker(token) : null;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <Logo />

      <div className="mt-8 w-full max-w-lg rounded-2xl border border-border bg-bg-card p-8">
        <h1 className="mb-6 text-lg font-semibold">Track your project</h1>

        <form method="get" className="mb-6 flex gap-2">
          <input
            name="token"
            defaultValue={token}
            placeholder="Paste your project link's token"
            className="w-full rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover"
          >
            Track
          </button>
        </form>

        {token && !project ? (
          <p className="text-sm text-fg-muted">
            We couldn&apos;t find a project for that link. Double-check the link we sent you, or reach out if you
            think this is a mistake.
          </p>
        ) : null}

        {project ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{project.project_code}</p>
                <p className="text-xs text-fg-muted">Started {formatDate(project.created_at)}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs capitalize text-fg-muted">
                {formatLabel(project.status)}
              </span>
            </div>

            {project.hold_state ? (
              <p className="mb-6 rounded-lg border border-accent/40 bg-bg-raised px-4 py-3 text-sm text-fg">
                {HOLD_LABELS[project.hold_state] ?? "This project is currently paused."}
              </p>
            ) : null}

            {project.stages.length > 0 ? (
              <div>
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-fg-muted">
                    <span>{project.percent_complete ?? 0}% complete</span>
                    {project.current_stage_label ? <span>Currently: {project.current_stage_label}</span> : null}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-raised">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${project.percent_complete ?? 0}%` }}
                    />
                  </div>
                </div>

                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {project.stages.map((stage) => (
                    <li key={stage.stage_order} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                          stage.status === "complete" ? "border-accent bg-accent text-white" : "border-border"
                        }`}
                      >
                        {stage.status === "complete" ? "✓" : ""}
                      </span>
                      <span className={`text-sm ${stage.status === "complete" ? "text-fg" : "text-fg-muted"}`}>
                        {stage.stage_label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">
                Your project is being set up — a detailed stage checklist will appear here shortly.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
