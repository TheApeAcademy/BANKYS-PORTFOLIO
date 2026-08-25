import Link from "next/link";
import { PageHeader, Card, EmptyState, buttonCls, buttonGhostCls, buttonDangerCls } from "@/components/ui";
import { getMySessions, revokeSession } from "@/lib/actions/security";
import { formatDateTime } from "@zebraish/lib/format";

export default async function SessionsSettingsPage() {
  const sessions = await getMySessions();

  return (
    <div>
      <PageHeader
        title="Active sessions"
        description="Every device currently signed in to this admin account."
        action={
          <div className="flex gap-1 text-sm">
            <Link href="/settings/security" className={buttonGhostCls}>
              Security
            </Link>
            <Link href="/settings/sessions" className={buttonCls}>
              Sessions
            </Link>
            <Link href="/settings/bank-transfer" className={buttonGhostCls}>
              Bank Transfer
            </Link>
          </div>
        }
      />

      <Card className="p-0">
        {sessions.length ? (
          <ul className="divide-y divide-border">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {s.ip ?? "Unknown IP"}
                    {s.is_current ? <span className="pill pill-paid ml-2">This device</span> : null}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-fg-muted" title={s.user_agent ?? undefined}>
                    {s.user_agent ?? "Unknown device"}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    Active since {formatDateTime(s.created_at)}
                    {s.refreshed_at ? ` — last active ${formatDateTime(s.refreshed_at)}` : ""}
                  </p>
                </div>
                {!s.is_current ? (
                  <form action={revokeSession.bind(null, s.id)}>
                    <button type="submit" className={buttonDangerCls}>
                      Revoke
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No active sessions found.</EmptyState>
        )}
      </Card>
    </div>
  );
}
