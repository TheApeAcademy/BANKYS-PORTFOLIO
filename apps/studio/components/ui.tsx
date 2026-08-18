export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-bg-card p-6 ${className}`}>{children}</div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-fg-muted">{label}</p>
      <p className="tabular-nums mt-2 text-2xl font-semibold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-fg-muted">{sub}</p> : null}
    </Card>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-fg-muted">{children}</p>;
}

export const inputCls =
  "rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent w-full";
export const buttonCls =
  "rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60";
export const buttonDangerCls =
  "rounded-lg bg-excluded px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60";
export const buttonGhostCls =
  "rounded-lg border border-border px-4 py-2.5 font-medium text-fg transition hover:bg-bg-raised disabled:opacity-60";
