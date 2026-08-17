import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCollaborator } from "@/lib/actions/collaborators";
import { Card, PageHeader, EmptyState, inputCls, buttonCls } from "@/components/ui";
import { StatusPill } from "@/components/StatusPill";
import { formatMoney, formatDate, firstOf } from "@/lib/format";

export default async function CollaboratorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collaborator } = await supabase.from("collaborators").select("*").eq("id", id).single();
  if (!collaborator) notFound();

  const { data: entries } = await supabase
    .from("commission_entries")
    .select("id, amount, currency, status, week_of, payments(amount, currency, received_at, projects(project_code))")
    .eq("collaborator_id", id)
    .order("week_of", { ascending: false })
    .limit(100);

  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .eq("collaborator_id", id)
    .order("week_of", { ascending: false });

  const bank = collaborator.bank_details as Record<string, string | null>;

  return (
    <div>
      <PageHeader title={collaborator.name} description="Collaborator detail, term, and commission history." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <p className="mb-4 text-sm font-medium">Term &amp; rate</p>
            <form action={updateCollaborator} className="flex flex-col gap-3 text-sm">
              <input type="hidden" name="id" value={collaborator.id} />
              <div className="flex flex-col gap-1">
                <label className="text-fg-muted">Term start</label>
                <input type="date" name="term_start" defaultValue={collaborator.term_start} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-fg-muted">Term end</label>
                <input type="date" name="term_end" defaultValue={collaborator.term_end ?? ""} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-fg-muted">Commission rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="commission_rate"
                  defaultValue={(collaborator.commission_rate * 100).toFixed(2)}
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-2 text-fg-muted">
                <input type="checkbox" name="active" defaultChecked={collaborator.active} />
                Active
              </label>
              <button type="submit" className={buttonCls}>
                Save
              </button>
            </form>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium">Bank details</p>
            <dl className="flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-fg-muted">Bank</dt>
                <dd>{bank?.bank_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Account name</dt>
                <dd>{bank?.account_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">Account number</dt>
                <dd className="tabular-nums">{bank?.account_number || "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium">Payout history</p>
            {payouts?.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {payouts.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="text-fg-muted">Week of {formatDate(p.week_of)}</span>
                    <span className="tabular-nums">{formatMoney(p.total_amount, p.currency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">No payouts yet.</p>
            )}
          </Card>
        </div>

        <Card className="p-0 lg:col-span-2">
          {entries?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                    <th className="px-5 py-3">Week of</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Commission</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e) => {
                    const payment = firstOf(e.payments);
                    const project = firstOf(payment?.projects);
                    return (
                      <tr key={e.id}>
                        <td className="px-5 py-3 text-fg-muted">{formatDate(e.week_of)}</td>
                        <td className="tabular-nums px-5 py-3">{project?.project_code ?? "—"}</td>
                        <td className="tabular-nums px-5 py-3">
                          {payment ? formatMoney(payment.amount, payment.currency) : "—"}
                        </td>
                        <td className="tabular-nums px-5 py-3">{formatMoney(e.amount, e.currency)}</td>
                        <td className="px-5 py-3">
                          <StatusPill status={e.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No commission entries yet.</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
