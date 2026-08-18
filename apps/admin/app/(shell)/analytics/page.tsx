import { PageHeader, Card, EmptyState } from "@/components/ui";
import { formatMoney } from "@zebraish/lib/format";
import { getKpiSummary, getRevenueTrend } from "@/lib/actions/dashboard";
import { getCurrentRevenueGoals, getTopServices, getActivityHeatmap, getFunnelSummary } from "@/lib/actions/analytics";
import { SetGoalForm } from "@/components/SetGoalForm";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { FunnelChart } from "@/components/FunnelChart";

function pct(actual: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

export default async function AnalyticsPage() {
  const [summary, goals, services, heatmapCells, funnelStages, weekTrend] = await Promise.all([
    getKpiSummary(),
    getCurrentRevenueGoals(),
    getTopServices(),
    getActivityHeatmap(),
    getFunnelSummary(),
    getRevenueTrend("week", 2),
  ]);

  const revenueThisMonth = summary?.revenue_this_month ?? {};
  const maxRequested = Math.max(...services.map((s) => s.requested_count), 1);

  const weekCurrency = weekTrend[0]?.currency;
  const sameCurrency = weekTrend
    .filter((w) => w.currency === weekCurrency)
    .sort((a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime());
  const thisWeek = sameCurrency.at(-1);
  const lastWeek = sameCurrency.length > 1 ? sameCurrency.at(-2) : undefined;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Goals, service demand, and funnel health — the 10-second view of the business."
      />

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Revenue goal — this month</h2>
        <Card>
          {goals.length ? (
            <div className="flex flex-col gap-4">
              {goals.map((g) => {
                const actual = revenueThisMonth[g.currency] ?? 0;
                const progress = pct(actual, g.target_amount);
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>{formatMoney(actual, g.currency)} of {formatMoney(g.target_amount, g.currency)}</span>
                      <span className="text-fg-muted">{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-raised">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mb-4 text-sm text-fg-muted">No goal set for this month yet.</p>
          )}
          <div className="mt-4 border-t border-border pt-4">
            <SetGoalForm defaultCurrency={weekCurrency ?? "NGN"} />
          </div>
        </Card>
      </div>

      {thisWeek || lastWeek ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs uppercase tracking-wide text-fg-muted">This week</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              {formatMoney(thisWeek?.revenue ? Number(thisWeek.revenue) : 0, weekCurrency ?? "NGN")}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-fg-muted">Last week</p>
            <p className="tabular-nums mt-2 text-2xl font-semibold">
              {formatMoney(lastWeek?.revenue ? Number(lastWeek.revenue) : 0, weekCurrency ?? "NGN")}
            </p>
          </Card>
        </div>
      ) : null}

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Project demand by type</h2>
        <Card className="p-0">
          {services.length ? (
            <ul className="divide-y divide-border">
              {services.map((s) => (
                <li key={s.project_type} className="px-5 py-3">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="capitalize">{s.label.replaceAll("_", " ")}</span>
                    <span className="text-fg-muted">{s.requested_count} requested</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-raised">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(2, (s.requested_count / maxRequested) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No projects yet.</EmptyState>
          )}
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Top services</h2>
        <Card className="p-0">
          {services.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Requested</th>
                    <th className="px-5 py-3">Revenue</th>
                    <th className="px-5 py-3">Avg. order value</th>
                    <th className="px-5 py-3">Growth (30d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {services.map((s) => (
                    <tr key={s.project_type}>
                      <td className="px-5 py-3 capitalize">{s.label.replaceAll("_", " ")}</td>
                      <td className="px-5 py-3">{s.requested_count}</td>
                      <td className="px-5 py-3">
                        {Object.entries(s.revenue).length
                          ? Object.entries(s.revenue).map(([c, a]) => formatMoney(a, c)).join(" · ")
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {Object.entries(s.aov).length
                          ? Object.entries(s.aov).map(([c, a]) => formatMoney(a, c)).join(" · ")
                          : "—"}
                      </td>
                      <td className={`px-5 py-3 ${s.growth_pct > 0 ? "text-paid" : s.growth_pct < 0 ? "text-excluded" : "text-fg-muted"}`}>
                        {s.growth_pct > 0 ? "+" : ""}
                        {s.growth_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No data yet.</EmptyState>
          )}
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-fg-muted">Checkout funnel</h2>
          <Card>
            <FunnelChart stages={funnelStages} />
          </Card>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-fg-muted">Activity heatmap — last 90 days</h2>
          <Card>
            <ActivityHeatmap cells={heatmapCells} />
          </Card>
        </div>
      </div>
    </div>
  );
}
