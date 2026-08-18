import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { CreateCollaboratorForm } from "@/components/CreateCollaboratorForm";
import { formatMoney, formatDate } from "@zebraish/lib/format";

export default async function AdminCollaboratorsPage() {
  const supabase = await createClient();

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
