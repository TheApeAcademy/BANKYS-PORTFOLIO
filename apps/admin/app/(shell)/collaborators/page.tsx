import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState, buttonCls, buttonGhostCls } from "@/components/ui";
import { CreateCollaboratorForm } from "@/components/CreateCollaboratorForm";
import { ApplicationAttachments } from "@/components/ApplicationAttachments";
import { approveApplication, rejectApplication } from "@/lib/actions/collaborators";
import { formatMoney, formatDate } from "@zebraish/lib/format";

export default async function AdminCollaboratorsPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("collaborator_applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: collaborators } = await supabase
    .from("collaborators")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: entries } = await supabase
    .from("commission_entries")
    .select("collaborator_id, amount, currency, status");

  const totals = new Map<string, Map<string, number>>();
  for (const e of entries ?? []) {
    if (e.status === "EXCLUDED") continue;
    const byCurrency = totals.get(e.collaborator_id) ?? new Map<string, number>();
    byCurrency.set(e.currency, (byCurrency.get(e.currency) ?? 0) + Number(e.amount));
    totals.set(e.collaborator_id, byCurrency);
  }

  return (
    <div>
      <PageHeader title="Collaborators" description="Official Collaboration Partners, terms, and running totals." />

      {applications?.length ? (
        <Card className="mb-6">
          <p className="mb-4 text-sm font-medium">Pending applications ({applications.length})</p>
          <div className="flex flex-col gap-4">
            {applications.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-4 text-sm">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-fg-muted">{formatDate(a.created_at)}</p>
                </div>
                <p className="text-xs text-fg-muted">
                  {[a.email, a.phone].filter(Boolean).join(" · ") || "No contact info given"}
                </p>
                {a.portfolio_url ? (
                  <p className="mt-2 text-fg-muted">
                    <span className="text-fg">Portfolio:</span>{" "}
                    <a href={a.portfolio_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      {a.portfolio_url}
                    </a>
                  </p>
                ) : null}
                <p className="mt-3 whitespace-pre-wrap text-fg-muted">
                  <span className="text-fg">About:</span> {a.experience}
                </p>
                <p className="mt-2 text-fg-muted">
                  <span className="text-fg">Would bring:</span> {a.pitch}
                </p>
                <ApplicationAttachments attachments={a.attachments ?? []} />
                <div className="mt-4 flex gap-2">
                  <form action={approveApplication}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className={buttonCls}>
                      Approve
                    </button>
                  </form>
                  <form action={rejectApplication}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className={buttonGhostCls}>
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mb-6">
        <p className="mb-4 text-sm font-medium">Add a collaborator</p>
        <CreateCollaboratorForm />
      </Card>

      <Card className="p-0">
        {collaborators?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Term</th>
                  <th className="px-5 py-3">Rate</th>
                  <th className="px-5 py-3">Term-to-date</th>
                  <th className="px-5 py-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collaborators.map((c) => {
                  const t = totals.get(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-bg-raised">
                      <td className="px-5 py-3">
                        <Link href={`/collaborators/${c.id}`} className="font-medium text-accent">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-fg-muted">
                        {formatDate(c.term_start)} – {c.term_end ? formatDate(c.term_end) : "ongoing"}
                      </td>
                      <td className="tabular-nums px-5 py-3">{(c.commission_rate * 100).toFixed(2)}%</td>
                      <td className="tabular-nums px-5 py-3">
                        {t ? [...t.entries()].map(([cur, amt]) => formatMoney(amt, cur)).join(" · ") : formatMoney(0)}
                      </td>
                      <td className="px-5 py-3">{c.active ? "Yes" : "No"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No collaborators yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
