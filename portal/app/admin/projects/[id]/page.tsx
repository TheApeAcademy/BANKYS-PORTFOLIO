import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProjectStatus } from "@/lib/actions/projects";
import { Card, PageHeader, EmptyState, inputCls, buttonGhostCls } from "@/components/ui";
import { RecordPaymentForm } from "@/components/RecordPaymentForm";
import { PaymentActions } from "@/components/PaymentActions";
import { formatMoney, formatDate } from "@/lib/format";

const STATUSES = ["new", "in_progress", "completed", "cancelled"];

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", id)
    .order("received_at", { ascending: false });

  const { data: introducer } = project.introduced_by
    ? await supabase.from("collaborators").select("name").eq("id", project.introduced_by).single()
    : { data: null };

  return (
    <div>
      <PageHeader
        title={project.project_code}
        description={`Created ${formatDate(project.created_at)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-4 text-sm font-medium">Client detail</p>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-fg-muted">Name</dt>
              <dd>{project.client_name}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Contact</dt>
              <dd>{project.client_contact ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Introduced by</dt>
              <dd>{introducer?.name ?? "—"} <span className="text-fg-muted">(informational only)</span></dd>
            </div>
            <div>
              <dt className="text-fg-muted">Status</dt>
              <dd>
                <form action={updateProjectStatus.bind(null, project.id)} className="mt-1 flex gap-2">
                  <select name="status" defaultValue={project.status} className={inputCls}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={buttonGhostCls}>
                    Save
                  </button>
                </form>
              </dd>
            </div>
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <Card className="mb-6">
            <p className="mb-4 text-sm font-medium">Record a payment</p>
            <RecordPaymentForm projectId={project.id} />
          </Card>

          <Card className="p-0">
            {payments?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Received</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="tabular-nums px-5 py-3">
                          {formatMoney(p.amount, p.currency)}
                          {p.refunded_amount > 0 ? (
                            <span className="ml-1 text-xs text-fg-muted">
                              (−{formatMoney(p.refunded_amount, p.currency)} refunded)
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 capitalize">{p.type}</td>
                        <td className="px-5 py-3 text-fg-muted">{p.method ?? "—"}</td>
                        <td className="px-5 py-3 text-fg-muted">{formatDate(p.received_at)}</td>
                        <td className="px-5 py-3 capitalize">{p.payment_status.replace("_", " ")}</td>
                        <td className="px-5 py-3">
                          <PaymentActions paymentId={p.id} projectId={project.id} paymentStatus={p.payment_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No payments recorded yet.</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
