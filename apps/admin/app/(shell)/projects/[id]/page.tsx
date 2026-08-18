import { notFound } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { updateProjectStatus } from "@/lib/actions/projects";
import { Card, PageHeader, EmptyState, inputCls, buttonGhostCls } from "@/components/ui";
import { RecordPaymentForm } from "@/components/RecordPaymentForm";
import { PaymentActions } from "@/components/PaymentActions";
import { ProjectTypePicker } from "@/components/ProjectTypePicker";
import { StageChecklist } from "@/components/StageChecklist";
import { HoldControl } from "@/components/HoldControl";
import { formatMoney, formatDate, formatDateTime } from "@zebraish/lib/format";
import { PROJECT_STATUSES, formatStatus } from "@/lib/statuses";

function titleCaseType(id: string) {
  return id.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

  // Snapshots are append-only — a project can accumulate one per save (each
  // configurator resave re-quotes and re-snapshots), so the latest one is
  // "price at purchase"; earlier ones are the price-change history.
  const { data: snapshots } = await supabase
    .from("project_price_snapshots")
    .select("*")
    .eq("project_id", id)
    .order("captured_at", { ascending: false });
  const latestSnapshot = snapshots?.[0] ?? null;

  const { data: stages } = await supabase
    .from("project_stages")
    .select("*")
    .eq("project_id", id)
    .order("stage_order");

  const { data: progress } = await supabase
    .from("project_progress")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  let projectTypeOptions: { id: string; label: string }[] = [];
  if (!project.project_type) {
    const { data: templateTypes } = await supabase
      .from("project_stage_templates")
      .select("project_type")
      .order("project_type");
    const seen = new Set<string>();
    for (const t of templateTypes ?? []) {
      if (!seen.has(t.project_type)) seen.add(t.project_type);
    }
    projectTypeOptions = [...seen].map((id) => ({ id, label: titleCaseType(id) }));
  }

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
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s)}
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
            <p className="mb-4 text-sm font-medium">Price at purchase</p>
            {latestSnapshot ? (
              <div>
                <div className="mb-3 flex flex-col divide-y divide-border rounded-lg border border-border">
                  {Array.isArray(latestSnapshot.lines) && latestSnapshot.lines.length ? (
                    (latestSnapshot.lines as { label: string; price: number }[]).map((line, i) => (
                      <div key={i} className="flex justify-between px-3 py-2 text-sm">
                        <span className="text-fg-muted">{line.label}</span>
                        <span className="tabular-nums">{formatMoney(line.price, latestSnapshot.currency)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-fg-muted">
                      No itemized breakdown for this snapshot ({latestSnapshot.catalogue_source}).
                    </div>
                  )}
                  {latestSnapshot.complexity_multiplier !== 1 ? (
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-fg-muted">Complexity adjustment</span>
                      <span className="tabular-nums">×{latestSnapshot.complexity_multiplier}</span>
                    </div>
                  ) : null}
                  {latestSnapshot.delivery_multiplier !== 1 ? (
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-fg-muted">Delivery speed adjustment</span>
                      <span className="tabular-nums">×{latestSnapshot.delivery_multiplier}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between px-3 py-2.5 text-sm font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums text-accent">
                      {formatMoney(latestSnapshot.total, latestSnapshot.currency)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-fg-muted">
                  Captured {formatDateTime(latestSnapshot.captured_at)} — immutable, never recomputed even if
                  today&apos;s catalogue prices change.
                  {snapshots && snapshots.length > 1 ? ` ${snapshots.length - 1} earlier snapshot(s) exist.` : ""}
                </p>
              </div>
            ) : (
              <EmptyState>No price snapshot recorded for this project yet.</EmptyState>
            )}
          </Card>

          <Card className="mb-6">
            <p className="mb-4 text-sm font-medium">Project stages</p>
            {!project.project_type ? (
              <div>
                <p className="mb-3 text-sm text-fg-muted">
                  No project type set yet — choose one to generate this project&apos;s stage checklist.
                </p>
                <ProjectTypePicker projectId={project.id} options={projectTypeOptions} />
              </div>
            ) : stages && stages.length > 0 ? (
              <div>
                {progress ? (
                  <p className="mb-3 text-sm text-fg-muted">
                    {progress.percent_complete ?? 0}% complete
                    {progress.current_stage_label ? ` — currently: ${progress.current_stage_label}` : ""}
                  </p>
                ) : null}
                <StageChecklist projectId={project.id} stages={stages} />
                <div className="mt-4 border-t border-border pt-4">
                  <HoldControl projectId={project.id} holdState={project.hold_state} />
                </div>
              </div>
            ) : (
              <EmptyState>No stages generated for this project type yet.</EmptyState>
            )}
          </Card>

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
                        <td className="px-5 py-3 capitalize">{p.payment_status.replaceAll("_", " ")}</td>
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
