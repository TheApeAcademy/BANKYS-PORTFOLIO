import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { getAccessCode } from "@/lib/actions/collaborator-auth";
import { Card, PageHeader, StatCard, EmptyState } from "@/components/ui";
import { StatusPill } from "@/components/StatusPill";
import { formatMoney, formatDate, mondayOf } from "@zebraish/lib/format";
import { getServerT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dictionary";

type LedgerRow = {
  entry_id: string;
  project_code: string;
  payment_amount: number;
  payment_currency: string;
  commission_amount: number;
  commission_currency: string;
  status: string;
  week_of: string;
};

export default async function CollaboratorDashboardPage() {
  const code = await getAccessCode();
  if (!code) redirect("/login");
  const t = await getServerT();

  const supabase = await createClient();
  const currentWeek = mondayOf();

  const { data: rowsRaw } = await supabase
    .rpc("get_collaborator_ledger_by_code", { p_code: code })
    .order("week_of", { ascending: false })
    .order("received_at", { ascending: false });
  const rows = (rowsRaw ?? []) as LedgerRow[];

  const currentWeekRows = rows.filter((r) => r.week_of === currentWeek);
  const currentWeekTotal = currentWeekRows
    .filter((r) => r.status !== "EXCLUDED")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const termToDateTotal = rows
    .filter((r) => r.status !== "EXCLUDED")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);
  const currency = rows[0]?.commission_currency ?? "NGN";

  return (
    <div>
      <PageHeader title={t("dash.title")} description={t("dash.weekOf", { date: formatDate(currentWeek) })} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label={t("dash.runningTotal")} value={formatMoney(currentWeekTotal, currency)} />
        <StatCard label={t("dash.termToDate")} value={formatMoney(termToDateTotal, currency)} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">{t("dash.transactions")}</h2>
        <Card className="p-0">
          {currentWeekRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                    <th className="px-5 py-3">{t("dash.col.projectId")}</th>
                    <th className="px-5 py-3">{t("dash.col.payment")}</th>
                    <th className="px-5 py-3">{t("dash.col.commission")}</th>
                    <th className="px-5 py-3">{t("dash.col.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentWeekRows.map((r) => (
                    <tr key={r.entry_id}>
                      <td className="tabular-nums px-5 py-3">{r.project_code}</td>
                      <td className="tabular-nums px-5 py-3">{formatMoney(r.payment_amount, r.payment_currency)}</td>
                      <td className="tabular-nums px-5 py-3">{formatMoney(r.commission_amount, r.commission_currency)}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={r.status} label={t(`status.${r.status}` as DictKey)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>{t("dash.empty")}</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
