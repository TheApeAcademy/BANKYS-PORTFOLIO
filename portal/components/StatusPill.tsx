export function StatusPill({ status }: { status: string }) {
  const cls =
    status === "PAID"
      ? "pill pill-paid"
      : status === "PENDING"
        ? "pill pill-pending"
        : status === "EXCLUDED"
          ? "pill pill-excluded"
          : "pill pill-neutral";
  return <span className={cls}>{status}</span>;
}
