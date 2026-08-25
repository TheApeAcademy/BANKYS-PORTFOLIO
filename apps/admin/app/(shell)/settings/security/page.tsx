import Link from "next/link";
import { PageHeader, Card, EmptyState, buttonCls, buttonGhostCls } from "@/components/ui";
import { MfaEnrollment } from "@/components/MfaEnrollment";
import { getRecentLoginActivity } from "@/lib/actions/security";
import { createClient } from "@zebraish/lib/supabase/server";
import { formatDateTime } from "@zebraish/lib/format";

export default async function SecuritySettingsPage() {
  const [activity, supabase] = await Promise.all([getRecentLoginActivity(), createClient()]);
  const { data: factorData } = await supabase.auth.mfa.listFactors();
  const initialFactor = factorData?.totp.find((f) => f.status === "verified") ?? null;

  return (
    <div>
      <PageHeader
        title="Security"
        description="Two-factor authentication and recent login activity for the admin account."
        action={
          <div className="flex gap-1 text-sm">
            <Link href="/settings/security" className={buttonCls}>
              Security
            </Link>
            <Link href="/settings/sessions" className={buttonGhostCls}>
              Sessions
            </Link>
            <Link href="/settings/bank-transfer" className={buttonGhostCls}>
              Bank Transfer
            </Link>
          </div>
        }
      />

      <Card className="mb-6">
        <p className="mb-4 text-sm font-medium">Two-factor authentication</p>
        <MfaEnrollment initialFactor={initialFactor} />
      </Card>

      <Card className="p-0">
        <p className="p-5 pb-0 text-sm font-medium">Recent login activity</p>
        {activity.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Outcome</th>
                  <th className="px-5 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activity.map((a) => (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{formatDateTime(a.occurred_at)}</td>
                    <td className="px-5 py-3">
                      <span className={a.outcome === "success" ? "pill pill-paid" : "pill pill-excluded"}>
                        {a.outcome === "success" ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-fg-muted">
                      {a.message}
                      {a.metadata && typeof a.metadata === "object" && "email" in a.metadata
                        ? ` — ${String((a.metadata as { email?: string }).email)}`
                        : a.metadata && typeof a.metadata === "object" && "app" in a.metadata
                          ? ` — ${String((a.metadata as { app?: string }).app)}`
                          : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No login activity recorded yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
