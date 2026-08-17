import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, StatCard, Card, EmptyState } from "@/components/ui";
import { formatMoney, formatDateTime, mondayOf } from "@zebraish/lib/format";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const thisWeek = mondayOf();

  const [{ count: projectCount }, { count: pendingCount }, pendingSumRes, recentAuditRes] =
    await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase
        .from("commission_entries")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING"),
      supabase.from("commission_entries").select("amount, currency").eq("status", "PENDING"),
      supabase
        .from("audit_log")
        .select("id, occurred_at, actor, action, entity_type, reason")
        .order("occurred_at", { ascending: false })
        .limit(8),
    ]);

  const pendingByCurrency = new Map<string, number>();
  for (const row of pendingSumRes.data ?? []) {
    pendingByCurrency.set(row.currency, (pendingByCurrency.get(row.currency) ?? 0) + Number(row.amount));
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Zebraish projects, payments, and collaborator commissions at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={String(projectCount ?? 0)} />
        <StatCard label="Pending commission entries" value={String(pendingCount ?? 0)} />
        <StatCard
          label="Pending commission total"
          value={
            pendingByCurrency.size
              ? [...pendingByCurrency.entries()].map(([c, a]) => formatMoney(a, c)).join(" · ")
              : formatMoney(0)
          }
          sub={`Open week ${thisWeek}`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link href="/payouts" className="lg:col-span-1">
          <Card className="h-full transition hover:border-accent">
            <p className="font-medium">Sunday payout review</p>
            <p className="mt-1 text-sm text-fg-muted">Review this week&apos;s pending commissions and mark payouts paid.</p>
          </Card>
        </Link>
        <Link href="/projects" className="lg:col-span-1">
          <Card className="h-full transition hover:border-accent">
            <p className="font-medium">Projects &amp; payments</p>
            <p className="mt-1 text-sm text-fg-muted">Full client detail, search, filter, and manual payment entry.</p>
          </Card>
        </Link>
        <Link href="/collaborators" className="lg:col-span-1">
          <Card className="h-full transition hover:border-accent">
            <p className="font-medium">Collaborators</p>
            <p className="mt-1 text-sm text-fg-muted">Terms, commission rates, and running totals.</p>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Recent activity</h2>
        <Card className="p-0">
          {recentAuditRes.data?.length ? (
            <ul className="divide-y divide-border">
              {recentAuditRes.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <div>
                    <span className="font-medium">{row.action}</span>
                    <span className="text-fg-muted"> · {row.entity_type}</span>
                    {row.reason ? <span className="text-fg-muted"> — {row.reason}</span> : null}
                  </div>
                  <div className="shrink-0 text-xs text-fg-muted">
                    {row.actor} · {formatDateTime(row.occurred_at)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No activity yet.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
