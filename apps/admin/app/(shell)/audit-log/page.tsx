import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState, inputCls, buttonCls } from "@/components/ui";
import { formatDateTime } from "@zebraish/lib/format";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entity_type?: string; action?: string }>;
}) {
  const { entity_type, action } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(300);

  if (entity_type) query = query.eq("entity_type", entity_type);
  if (action) query = query.ilike("action", `%${action}%`);

  const { data: rows } = await query;

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Append-only record of every commission-affecting action. Corrections reference the original entry rather than editing history."
      />

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Entity type</label>
            <select name="entity_type" defaultValue={entity_type ?? ""} className={inputCls}>
              <option value="">All</option>
              <option value="project">Project</option>
              <option value="payment">Payment</option>
              <option value="commission_entry">Commission entry</option>
              <option value="payout">Payout</option>
              <option value="collaborator">Collaborator</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Action contains</label>
            <input name="action" defaultValue={action} className={inputCls} />
          </div>
          <button type="submit" className={buttonCls}>
            Filter
          </button>
        </form>
      </Card>

      <Card className="p-0">
        {rows?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{formatDateTime(r.occurred_at)}</td>
                    <td className="px-5 py-3">{r.actor}</td>
                    <td className="px-5 py-3 font-medium">{r.action}</td>
                    <td className="px-5 py-3 text-fg-muted">{r.entity_type}</td>
                    <td className="px-5 py-3 text-fg-muted">{r.reason ?? "—"}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-xs text-fg-muted" title={JSON.stringify(r.details)}>
                      {JSON.stringify(r.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No audit log entries match these filters.</EmptyState>
        )}
      </Card>
    </div>
  );
}
