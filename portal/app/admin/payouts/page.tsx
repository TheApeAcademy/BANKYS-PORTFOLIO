import { createClient } from "@/lib/supabase/server";
import { markPayoutPaid } from "@/lib/actions/payouts";
import { PageHeader, Card, EmptyState, inputCls, buttonCls } from "@/components/ui";
import { formatMoney, formatDate, firstOf } from "@/lib/format";

type PendingGroup = {
  collaboratorId: string;
  collaboratorName: string;
  weekOf: string;
  currency: string;
  total: number;
  count: number;
};

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("commission_entries")
    .select("collaborator_id, amount, currency, week_of, collaborators(name)")
    .eq("status", "PENDING")
    .order("week_of", { ascending: true });

  const groups = new Map<string, PendingGroup>();
  for (const e of entries ?? []) {
    const key = `${e.collaborator_id}__${e.week_of}__${e.currency}`;
    const collaborator = firstOf(e.collaborators);
    const existing = groups.get(key);
    if (existing) {
      existing.total += Number(e.amount);
      existing.count += 1;
    } else {
      groups.set(key, {
        collaboratorId: e.collaborator_id,
        collaboratorName: collaborator?.name ?? "—",
        weekOf: e.week_of,
        currency: e.currency,
        total: Number(e.amount),
        count: 1,
      });
    }
  }

  const rows = [...groups.values()].sort((a, b) => a.weekOf.localeCompare(b.weekOf));

  return (
    <div>
      <PageHeader
        title="Payout review"
        description="Pending commission grouped by collaborator and week. Review against payments, send the bank transfer manually, then mark paid."
      />

      <Card className="p-0">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Week of</th>
                  <th className="px-5 py-3">Collaborator</th>
                  <th className="px-5 py-3">Entries</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Mark paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={`${r.collaboratorId}-${r.weekOf}-${r.currency}`}>
                    <td className="px-5 py-3 text-fg-muted">{formatDate(r.weekOf)}</td>
                    <td className="px-5 py-3">{r.collaboratorName}</td>
                    <td className="tabular-nums px-5 py-3">{r.count}</td>
                    <td className="tabular-nums px-5 py-3 font-medium">{formatMoney(r.total, r.currency)}</td>
                    <td className="px-5 py-3">
                      <form action={markPayoutPaid} className="flex items-center gap-2">
                        <input type="hidden" name="collaborator_id" value={r.collaboratorId} />
                        <input type="hidden" name="week_of" value={r.weekOf} />
                        <input type="hidden" name="currency" value={r.currency} />
                        <input
                          name="exchange_rate"
                          type="number"
                          step="0.000001"
                          defaultValue="1"
                          title="Exchange rate to apply at payout time (1 if paying in the same currency)"
                          className={`${inputCls} w-24`}
                        />
                        <button type="submit" className={buttonCls}>
                          Mark paid
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No pending commission right now — everything is paid or excluded.</EmptyState>
        )}
      </Card>
    </div>
  );
}
