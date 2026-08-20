import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { getAccessCode } from "@/lib/actions/collaborator-auth";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@zebraish/lib/format";

type PayoutRow = {
  payout_id: string;
  week_of: string;
  total_amount: number;
  currency: string;
  paid_at: string;
};

export default async function CollaboratorPayoutsPage() {
  const code = await getAccessCode();
  if (!code) redirect("/login");

  const supabase = await createClient();

  const { data: payoutsRaw } = await supabase
    .rpc("get_collaborator_payouts_by_code", { p_code: code })
    .order("week_of", { ascending: false });
  const payouts = (payoutsRaw ?? []) as PayoutRow[];

  return (
    <div>
      <PageHeader title="Payout history" description="Every payout marked paid, by week." />
      <Card className="p-0">
        {payouts.length ? (
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
