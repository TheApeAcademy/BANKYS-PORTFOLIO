import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { PaymentActions } from "@/components/PaymentActions";
import { formatMoney, formatDate, firstOf } from "@/lib/format";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, type, method, received_at, payment_status, refunded_amount, project_id, projects(project_code, client_name)")
    .order("received_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader title="Payments" description="Every payment recorded across all client projects." />
      <Card className="p-0">
        {payments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Received</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => {
                  const project = firstOf(p.projects);
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-3">
                        <Link href={`/admin/projects/${p.project_id}`} className="tabular-nums font-medium text-accent">
                          {project?.project_code}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{project?.client_name}</td>
                      <td className="tabular-nums px-5 py-3">
                        {formatMoney(p.amount, p.currency)}
                        {p.refunded_amount > 0 ? (
                          <span className="ml-1 text-xs text-fg-muted">
                            (−{formatMoney(p.refunded_amount, p.currency)})
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 capitalize">{p.type}</td>
                      <td className="px-5 py-3 text-fg-muted">{formatDate(p.received_at)}</td>
                      <td className="px-5 py-3 capitalize">{p.payment_status.replace("_", " ")}</td>
                      <td className="px-5 py-3">
                        <PaymentActions paymentId={p.id} projectId={p.project_id} paymentStatus={p.payment_status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No payments recorded yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
