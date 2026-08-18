import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { Card, PageHeader, StatCard, EmptyState } from "@/components/ui";
import { formatMoney, formatDate, formatDateTime } from "@zebraish/lib/format";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_code, project_type, status, quoted_price, quoted_currency, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);

  const { data: payments } = projectIds.length
    ? await supabase
        .from("payments")
        .select("id, amount, currency, type, payment_status, received_at, project_id, projects(project_code)")
        .in("project_id", projectIds)
        .order("received_at", { ascending: false })
    : { data: [] };

  const spentByCurrency = new Map<string, number>();
  let successfulCount = 0;
  let failedCount = 0;
  for (const p of payments ?? []) {
    if (p.payment_status === "normal") {
      spentByCurrency.set(p.currency, (spentByCurrency.get(p.currency) ?? 0) + Number(p.amount));
      successfulCount += 1;
    } else if (["cancelled", "fraudulent", "chargeback"].includes(p.payment_status)) {
      failedCount += 1;
    }
  }

  return (
    <div>
      <PageHeader
        title={customer.full_name ?? "Unnamed customer"}
        description={`Customer since ${formatDate(customer.first_seen_at)}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Projects" value={String(projects?.length ?? 0)} />
        <StatCard
          label="Total spent"
          value={
            spentByCurrency.size
              ? [...spentByCurrency.entries()].map(([c, a]) => formatMoney(a, c)).join(" · ")
              : formatMoney(0)
          }
        />
        <StatCard label="Successful payments" value={String(successfulCount)} />
        <StatCard label="Failed / excluded payments" value={String(failedCount)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-4 text-sm font-medium">Identity</p>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-fg-muted">Full name</dt>
              <dd>{customer.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Email</dt>
              <dd>{customer.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Phone</dt>
              <dd>{customer.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Company</dt>
              <dd>{customer.company ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Country</dt>
              <dd>{customer.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Source</dt>
              <dd className="capitalize">{customer.source}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Notes</dt>
              <dd>{customer.notes ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-0">
            <p className="p-5 pb-0 text-sm font-medium">Projects</p>
            {projects?.length ? (
              <div className="overflow-x-auto">
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                      <th className="px-5 py-3">Project ID</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Quoted</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-bg-raised">
                        <td className="px-5 py-3">
                          <Link href={`/projects/${p.id}`} className="tabular-nums font-medium text-accent">
                            {p.project_code}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-fg-muted">{p.project_type ?? "—"}</td>
                        <td className="px-5 py-3 capitalize">{p.status.replaceAll("_", " ")}</td>
                        <td className="tabular-nums px-5 py-3">
                          {p.quoted_price ? formatMoney(p.quoted_price, p.quoted_currency ?? "EUR") : "—"}
                        </td>
                        <td className="px-5 py-3 text-fg-muted">{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No projects yet.</EmptyState>
            )}
          </Card>

          <Card className="p-0">
            <p className="p-5 pb-0 text-sm font-medium">Payments</p>
            {payments?.length ? (
              <div className="overflow-x-auto">
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                      <th className="px-5 py-3">Project</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Received</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => {
                      const project = Array.isArray(p.projects) ? p.projects[0] : p.projects;
                      return (
                        <tr key={p.id}>
                          <td className="px-5 py-3">
                            <Link href={`/projects/${p.project_id}`} className="tabular-nums font-medium text-accent">
                              {project?.project_code}
                            </Link>
                          </td>
                          <td className="tabular-nums px-5 py-3">{formatMoney(p.amount, p.currency)}</td>
                          <td className="px-5 py-3 capitalize">{p.type}</td>
                          <td className="px-5 py-3 text-fg-muted">{formatDateTime(p.received_at)}</td>
                          <td className="px-5 py-3 capitalize">{p.payment_status.replaceAll("_", " ")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No payments yet.</EmptyState>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-medium">Activity timeline</p>
            <p className="text-sm text-fg-muted">
              Coming soon — this will show a chronological history of everything this customer has
              done (configurator activity, messages, file uploads) once product-activity tracking
              and messaging are wired up.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
