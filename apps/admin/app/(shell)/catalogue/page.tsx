import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { createCatalogueVersion } from "@/lib/actions/catalogue";
import { Card, PageHeader, EmptyState, inputCls, buttonCls } from "@/components/ui";
import { formatDateTime } from "@zebraish/lib/format";

export default async function CataloguePage() {
  const supabase = await createClient();

  const { data: versions } = await supabase
    .from("catalogue_versions")
    .select("*")
    .order("version_number", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Pricing catalogue"
        description="Versioned mirror of the live /start configurator's pricing. Pricing itself still runs from the code — this is the editable, versioned source for the upcoming cutover."
      />

      <Card className="mb-6">
        <p className="mb-3 text-sm font-medium">Create a new draft</p>
        <p className="mb-3 text-sm text-fg-muted">
          Clones the currently active version&apos;s full content into an editable, unpublished draft.
        </p>
        <form action={createCatalogueVersion} className="flex flex-wrap gap-3">
          <input name="notes" placeholder="What's changing in this version? (optional)" className={`${inputCls} max-w-md`} />
          <button type="submit" className={buttonCls}>
            Create draft
          </button>
        </form>
      </Card>

      <Card className="p-0">
        {versions?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3">Created by</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {versions.map((v) => (
                  <tr key={v.id} className="hover:bg-bg-raised">
                    <td className="px-5 py-3">
                      <Link href={`/catalogue/${v.id}`} className="font-medium text-accent">
                        v{v.version_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {v.is_active ? (
                        <span className="rounded-full bg-paid/15 px-2.5 py-1 text-xs font-medium text-paid">Active</span>
                      ) : v.published_at ? (
                        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-fg-muted">
                          Published (inactive)
                        </span>
                      ) : (
                        <span className="rounded-full border border-accent/40 px-2.5 py-1 text-xs text-accent">Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-fg-muted">{v.notes ?? "—"}</td>
                    <td className="px-5 py-3 text-fg-muted">{v.created_by}</td>
                    <td className="px-5 py-3 text-fg-muted">{formatDateTime(v.created_at)}</td>
                    <td className="px-5 py-3 text-fg-muted">{v.published_at ? formatDateTime(v.published_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No catalogue versions yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
