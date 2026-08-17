import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProjectByAdmin } from "@/lib/actions/projects";
import { PageHeader, Card, EmptyState, inputCls, buttonCls } from "@/components/ui";
import { formatDate } from "@/lib/format";

const STATUSES = ["new", "in_progress", "completed", "cancelled"];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; collaborator?: string; from?: string; to?: string; q?: string }>;
}) {
  const { status, collaborator, from, to, q } = await searchParams;
  const supabase = await createClient();

  const { data: collaborators } = await supabase
    .from("collaborators")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("projects")
    .select("id, project_code, client_name, client_contact, status, introduced_by, created_at")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (collaborator) query = query.eq("introduced_by", collaborator);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);
  if (q) query = query.or(`client_name.ilike.%${q}%,project_code.ilike.%${q}%`);

  const { data: projects } = await query;
  const collaboratorNames = new Map((collaborators ?? []).map((c) => [c.id, c.name]));

  return (
    <div>
      <PageHeader title="Projects" description="Every client project, searchable and filterable." />

      <Card className="mb-6">
        <p className="mb-3 text-sm font-medium">Add a project manually</p>
        <form action={createProjectByAdmin} className="flex flex-wrap gap-3">
          <input name="client_name" placeholder="Client name" required className={`${inputCls} max-w-xs`} />
          <input name="client_contact" placeholder="Email or phone" className={`${inputCls} max-w-xs`} />
          <button type="submit" className={buttonCls}>
            Add project
          </button>
        </form>
      </Card>

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Search</label>
            <input name="q" defaultValue={q} placeholder="Name or ZB-xxxxx" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Status</label>
            <select name="status" defaultValue={status ?? ""} className={inputCls}>
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Collaborator</label>
            <select name="collaborator" defaultValue={collaborator ?? ""} className={inputCls}>
              <option value="">All</option>
              {(collaborators ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">From</label>
            <input type="date" name="from" defaultValue={from} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">To</label>
            <input type="date" name="to" defaultValue={to} className={inputCls} />
          </div>
          <button type="submit" className={buttonCls}>
            Filter
          </button>
        </form>
      </Card>

      <Card className="p-0">
        {projects?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Project ID</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Introduced by</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-raised">
                    <td className="px-5 py-3">
                      <Link href={`/admin/projects/${p.id}`} className="tabular-nums font-medium text-accent">
                        {p.project_code}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{p.client_name}</td>
                    <td className="px-5 py-3 text-fg-muted">{p.client_contact ?? "—"}</td>
                    <td className="px-5 py-3 text-fg-muted">
                      {p.introduced_by ? collaboratorNames.get(p.introduced_by) ?? "—" : "—"}
                    </td>
                    <td className="px-5 py-3 capitalize">{p.status.replace("_", " ")}</td>
                    <td className="px-5 py-3 text-fg-muted">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No projects match these filters.</EmptyState>
        )}
      </Card>
    </div>
  );
}
