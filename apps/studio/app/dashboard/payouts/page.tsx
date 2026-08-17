import { createClient } from "@zebraish/lib/supabase/server";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@zebraish/lib/format";

export default async function CollaboratorPayoutsPage() {
  const supabase = await createClient();

  const { data: payouts } = await supabase
    .from("collaborator_payouts")
    .select("*")
    .order("week_of", { ascending: false });

  return (
    <div>
      <PageHeader title="Payout history" description="Every payout marked paid, by week." />
      <Card className="p-0">
        {payouts?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Week covered</th>
                  <th className="px-5 py-3">Date paid</th>
                  <th className="px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((p) => (
                  <tr key={p.payout_id}>
                    <td className="px-5 py-3 text-fg-muted">{formatDate(p.week_of)}</td>
                    <td className="px-5 py-3">{formatDate(p.paid_at)}</td>
                    <td className="tabular-nums px-5 py-3 font-medium">{formatMoney(p.total_amount, p.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No payouts yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
