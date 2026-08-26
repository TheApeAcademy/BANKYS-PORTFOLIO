export function StatusPill({ status, label }: { status: string; label?: string }) {
  const cls =
    status === "PAID"
      ? "pill pill-paid"
      : status === "PENDING"
        ? "pill pill-pending"
        : status === "EXCLUDED"
          ? "pill pill-excluded"
          : "pill pill-neutral";
  return <span className={cls}>{label ?? status}</span>;
}
