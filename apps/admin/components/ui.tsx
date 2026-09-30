export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-[20px] p-6 ${className}`}>{children}</div>
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
    <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="kicker flex items-center gap-3">
          <span className="h-px w-7 bg-[rgba(245,245,247,.3)]" aria-hidden />
          Zebraish Bureau
        </p>
        <h1 className="mt-3 text-[clamp(30px,4vw,44px)] font-black uppercase leading-[.95] tracking-[-.035em]">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-fg-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <p className="kicker">{label}</p>
      <p className="tabular-nums mt-3 text-3xl font-black tracking-[-.03em]">{value}</p>
      {sub ? <p className="mt-1 text-xs text-fg-muted">{sub}</p> : null}
    </Card>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-fg-muted">{children}</p>;
}

export const inputCls =
  "rounded-xl border border-[rgba(245,245,247,.16)] bg-[rgba(245,245,247,.05)] px-3.5 py-2.5 text-fg outline-none transition focus:border-[#17c98d] focus:shadow-[0_0_0_3px_rgba(23,201,141,.15)] w-full";
export const buttonCls =
  "btn-primary rounded-full bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-hover disabled:opacity-60";
export const buttonDangerCls =
  "rounded-lg bg-excluded px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60";
export const buttonGhostCls =
  "rounded-full border border-[rgba(245,245,247,.2)] px-5 py-2.5 font-semibold text-fg hover:border-[rgba(245,245,247,.4)] hover:bg-[rgba(245,245,247,.06)] disabled:opacity-60";

/** The Bureau's "Live" pill (green pulse), as on Analytics. */
export function LivePill() {
  return (
    <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-fg-muted">
      <span className="h-[7px] w-[7px] rounded-full bg-[#30D158]" style={{ animation: "livep 2s infinite" }} />
      Live
    </span>
  );
}
