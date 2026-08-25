import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState, buttonGhostCls } from "@/components/ui";
import { PaymentActions } from "@/components/PaymentActions";
import { DisputeActions } from "@/components/DisputeActions";
import { BankTransferReconcileActions } from "@/components/BankTransferReconcileActions";
import { formatMoney, formatDate, formatDateTime, firstOf } from "@zebraish/lib/format";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: pendingTransfers } = await supabase
    .from("payments")
    .select("id, amount, currency, created_at, project_id, projects(project_code, client_name)")
    .in("payment_status", ["pending_transfer", "requires_review"])
    .order("created_at", { ascending: true });

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, type, method, received_at, payment_status, refunded_amount, project_id, projects(project_code, client_name)")
    .order("received_at", { ascending: false })
    .limit(200);

  const { data: openDisputes } = await supabase
    .from("payment_disputes")
    .select("id, opened_at, reason, gateway_dispute_id, payment_id, payments(amount, currency, project_id, projects(project_code, client_name))")
    .eq("status", "open")
    .order("opened_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Every payment recorded across all client projects."
        action={
          <Link href="/settings/bank-transfer" className={buttonGhostCls}>
            Manage receiving accounts
          </Link>
        }
      />

      <Card className="mb-6 p-0">
        <p className="p-5 pb-0 text-sm font-medium">Pending bank transfers</p>
        {pendingTransfers?.length ? (
          <div className="overflow-x-auto">
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Expected amount</th>
                  <th className="px-5 py-3">Initiated</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingTransfers.map((t) => {
                  const project = firstOf(t.projects);
                  return (
                    <tr key={t.id}>
                      <td className="px-5 py-3">
                        <Link href={`/projects/${t.project_id}`} className="font-medium text-accent">
                          {project?.project_code}
                        </Link>
                        <span className="ml-1 text-fg-muted">{project?.client_name}</span>
                      </td>
                      <td className="tabular-nums px-5 py-3">{formatMoney(t.amount, t.currency)}</td>
                      <td className="px-5 py-3 text-fg-muted">{formatDateTime(t.created_at)}</td>
                      <td className="px-5 py-3">
                        <BankTransferReconcileActions paymentId={t.id} projectId={t.project_id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState>No bank transfers awaiting confirmation.</EmptyState>
          </div>
        )}
      </Card>

      <Card className="mb-6 p-0">
        <p className="p-5 pb-0 text-sm font-medium">Open disputes</p>
        {openDisputes?.length ? (
          <div className="overflow-x-auto">
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Opened</th>
                  <th className="px-5 py-3">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openDisputes.map((d) => {
                  const payment = firstOf(d.payments);
                  const project = firstOf(payment?.projects);
                  return (
                    <tr key={d.id}>
                      <td className="px-5 py-3">
                        <Link href={`/projects/${payment?.project_id}`} className="font-medium text-accent">
                          {project?.project_code}
                        </Link>
                        <span className="ml-1 text-fg-muted">{project?.client_name}</span>
                      </td>
                      <td className="tabular-nums px-5 py-3">
                        {payment ? formatMoney(payment.amount, payment.currency) : "—"}
                      </td>
                      <td className="px-5 py-3 text-fg-muted">
                        {d.reason}
                        {d.gateway_dispute_id ? <span className="ml-1 text-xs">({d.gateway_dispute_id})</span> : null}
                      </td>
                      <td className="px-5 py-3 text-fg-muted">{formatDateTime(d.opened_at)}</td>
                      <td className="px-5 py-3">
                        <DisputeActions disputeId={d.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState>No open disputes.</EmptyState>
          </div>
        )}
      </Card>

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
                        <Link href={`/projects/${p.project_id}`} className="tabular-nums font-medium text-accent">
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
                      <td className="px-5 py-3 capitalize">{p.payment_status.replaceAll("_", " ")}</td>
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
