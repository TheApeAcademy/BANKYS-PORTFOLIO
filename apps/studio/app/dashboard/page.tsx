import { createClient } from "@zebraish/lib/supabase/server";
import { Card, PageHeader, StatCard, EmptyState } from "@/components/ui";
import { StatusPill } from "@/components/StatusPill";
import { formatMoney, formatDate, mondayOf } from "@zebraish/lib/format";

export default async function CollaboratorDashboardPage() {
  const supabase = await createClient();
  const currentWeek = mondayOf();

  const { data: rows } = await supabase
    .from("collaborator_ledger")
    .select("*")
    .order("week_of", { ascending: false })
    .order("received_at", { ascending: false });

  const currentWeekRows = (rows ?? []).filter((r) => r.week_of === currentWeek);
  const currentWeekTotal = currentWeekRows
    .filter((r) => r.status !== "EXCLUDED")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const termToDateTotal = (rows ?? [])
    .filter((r) => r.status !== "EXCLUDED")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const currency = rows?.[0]?.commission_currency ?? "NGN";

  return (
    <div>
      <PageHeader title="This week" description={`Week of ${formatDate(currentWeek)}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="This week's running total" value={formatMoney(currentWeekTotal, currency)} />
        <StatCard label="Term-to-date total" value={formatMoney(termToDateTotal, currency)} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">This week&apos;s transactions</h2>
        <Card className="p-0">
          {currentWeekRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                    <th className="px-5 py-3">Project ID</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Commission</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentWeekRows.map((r) => (
                    <tr key={r.entry_id}>
                      <td className="tabular-nums px-5 py-3">{r.project_code}</td>
                      <td className="tabular-nums px-5 py-3">{formatMoney(r.payment_amount, r.payment_currency)}</td>
                      <td className="tabular-nums px-5 py-3">{formatMoney(r.commission_amount, r.commission_currency)}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No transactions this week yet.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
