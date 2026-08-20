import Link from "next/link";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { formatMoney, formatDateTime } from "@zebraish/lib/format";
import { getKpiSummary, getRevenueTrend, getActivityFeed } from "@/lib/actions/dashboard";
import { CountUp } from "@/components/CountUp";
import { RevenueChart } from "@/components/RevenueChart";
import { LivePoller } from "@/components/LivePoller";

function moneyByCurrency(amounts: Record<string, number>): string {
  const entries = Object.entries(amounts);
  if (entries.length === 0) return formatMoney(0);
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}

export default async function AdminOverviewPage() {
  const [summary, trend, activity] = await Promise.all([
    getKpiSummary(),
    getRevenueTrend("week", 12),
    getActivityFeed(),
  ]);

  const trendCurrencies = [...new Set(trend.map((p) => p.currency))];
  const primaryCurrency = trendCurrencies[0] ?? "NGN";

  return (
    <div>
      <LivePoller intervalSeconds={45} />

      <PageHeader
        title="Overview"
        description="Zebraish projects, payments, and collaborator commissions at a glance — refreshes automatically."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link href="/payments">
          <Card className="h-full transition hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-fg-muted">Revenue this month</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              {summary && Object.keys(summary.revenue_this_month).length
                ? Object.entries(summary.revenue_this_month).map(([currency, amount]) => (
                    <span key={currency} className="mr-3 inline-block">
                      <CountUp value={amount} format="money" currency={currency} />
                    </span>
                  ))
                : formatMoney(0)}
            </p>
          </Card>
        </Link>

        <Link href="/projects">
          <Card className="h-full transition hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-fg-muted">Active projects</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              <CountUp value={summary?.active_projects ?? 0} format="integer" />
            </p>
          </Card>
        </Link>

        <Link href="/payouts">
          <Card className="h-full transition hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-fg-muted">Pending commission</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              {summary ? moneyByCurrency(summary.pending_commission_total) : formatMoney(0)}
            </p>
          </Card>
        </Link>

        <Link href="/payments">
          <Card className="h-full transition hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-fg-muted">Open disputes</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              <CountUp value={summary?.open_disputes ?? 0} format="integer" />
            </p>
          </Card>
        </Link>

        <Link href="/projects">
          <Card className="h-full transition hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-fg-muted">Overdue projects</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              <CountUp value={summary?.overdue_projects ?? 0} format="integer" />
            </p>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Revenue — trailing 12 weeks ({primaryCurrency})</h2>
        <Card>
          <RevenueChart points={trend} currency={primaryCurrency} />
        </Card>
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
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Live activity</h2>
        <Card className="p-0">
          {activity.length ? (
            <ul className="divide-y divide-border">
              {activity.map((row) => {
                const content = (
                  <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <div>
                      <span className="font-medium capitalize">{row.label}</span>
                      {row.detail ? <span className="text-fg-muted"> — {row.detail}</span> : null}
                    </div>
                    <div className="shrink-0 text-xs text-fg-muted">{formatDateTime(row.occurred_at)}</div>
                  </div>
                );
                return (
                  <li key={row.id}>
                    {row.href ? (
                      <Link href={row.href} className="block transition hover:bg-bg-raised">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState>No activity yet.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
