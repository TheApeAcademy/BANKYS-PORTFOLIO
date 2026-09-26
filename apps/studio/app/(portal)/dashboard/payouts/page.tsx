import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { getAccessCode } from "@/lib/actions/collaborator-auth";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@zebraish/lib/format";
import { getServerT } from "@/lib/i18n/server";

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
  const t = await getServerT();

  const supabase = await createClient();

  const { data: payoutsRaw } = await supabase
    .rpc("get_collaborator_payouts_by_code", { p_code: code })
    .order("week_of", { ascending: false });
  const payouts = (payoutsRaw ?? []) as PayoutRow[];

  return (
    <div>
      <PageHeader title={t("payouts.title")} description={t("payouts.subtitle")} />
      <Card className="p-0">
        {payouts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">{t("payouts.col.week")}</th>
                  <th className="px-5 py-3">{t("payouts.col.datePaid")}</th>
                  <th className="px-5 py-3">{t("payouts.col.amount")}</th>
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
          <EmptyState>{t("payouts.empty")}</EmptyState>
        )}
      </Card>
    </div>
  );
}
