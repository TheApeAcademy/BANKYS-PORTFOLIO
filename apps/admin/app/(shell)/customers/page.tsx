import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState, inputCls } from "@/components/ui";
import { formatMoney, formatDate } from "@zebraish/lib/format";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customer_overview")
    .select("*")
    .order("last_activity_at", { ascending: false });

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data: customers } = await query;

  return (
    <div>
      <PageHeader title="Customers" description="Every customer, deduplicated by email across all their projects." />

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-fg-muted">Search</label>
            <input name="q" defaultValue={q} placeholder="Name or email" className={`${inputCls} w-64`} />
          </div>
        </form>
      </Card>

      <Card className="p-0">
        {customers?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Projects</th>
                  <th className="px-5 py-3">Total spent</th>
                  <th className="px-5 py-3">Last activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-bg-raised">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${c.customer_id}`} className="font-medium text-accent">
                        {c.full_name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-fg-muted">{c.email ?? "—"}</td>
                    <td className="px-5 py-3 text-fg-muted">{c.country ?? "—"}</td>
                    <td className="tabular-nums px-5 py-3">{c.project_count}</td>
                    <td className="tabular-nums px-5 py-3">
                      {Object.keys(c.spent_by_currency ?? {}).length
                        ? Object.entries(c.spent_by_currency as Record<string, number>)
                            .map(([cur, amt]) => formatMoney(amt, cur))
                            .join(" · ")
                        : formatMoney(0)}
                    </td>
                    <td className="px-5 py-3 text-fg-muted">{formatDate(c.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No customers match this search.</EmptyState>
        )}
      </Card>
    </div>
  );
}
