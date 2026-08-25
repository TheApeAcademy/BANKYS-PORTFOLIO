import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, EmptyState, buttonGhostCls } from "@/components/ui";
import { formatDateTime } from "@zebraish/lib/format";
import { markNotificationRead, archiveNotification } from "@/lib/actions/notifications";

function entityHref(entityType: string | null, entityId: string | null): string | null {
  if (!entityId) return null;
  if (entityType === "project") return `/projects/${entityId}`;
  if (entityType === "collaborator") return `/collaborators/${entityId}`;
  if (entityType === "payment") return "/payments";
  if (entityType === "collaborator_application") return "/collaborators";
  return null;
}

const TYPE_LABELS: Record<string, string> = {
  payment: "Payment",
  project: "Project",
  message: "Message",
  revision: "Revision",
  overdue: "Overdue",
  refund: "Refund",
  chargeback: "Chargeback",
  commission_due: "Commission due",
  system_error: "System error",
  collaborator_application: "New collaborator",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const showArchived = show === "archived";

  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("id, type, entity_type, entity_id, title, body, read_at, archived_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  query = showArchived ? query.not("archived_at", "is", null) : query.is("archived_at", null);

  const { data: notifications } = await query;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Payment, project, and system events that need your attention — plus scheduled overdue/commission-due checks."
        action={
          <div className="flex gap-1 text-sm">
            <Link href="/notifications" className={showArchived ? buttonGhostCls : "rounded-lg bg-accent px-4 py-2.5 font-medium text-white"}>
              Active
            </Link>
            <Link href="/notifications?show=archived" className={showArchived ? "rounded-lg bg-accent px-4 py-2.5 font-medium text-white" : buttonGhostCls}>
              Archived
            </Link>
          </div>
        }
      />

      <Card className="p-0">
        {notifications?.length ? (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const href = entityHref(n.entity_type, n.entity_id);
              const unread = !n.read_at;
              return (
                <li key={n.id} className={`flex items-start justify-between gap-4 px-5 py-4 ${unread ? "bg-bg-raised/40" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {unread ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> : null}
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-fg-muted">
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                      <span className="text-xs text-fg-muted">{formatDateTime(n.created_at)}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">
                      {href ? (
                        <Link href={href} className="hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </p>
                    {n.body ? <p className="mt-0.5 text-sm text-fg-muted">{n.body}</p> : null}
                  </div>

                  {!showArchived ? (
                    <div className="flex shrink-0 gap-2 text-xs">
                      {unread ? (
                        <form action={markNotificationRead.bind(null, n.id)}>
                          <button type="submit" className={buttonGhostCls}>
                            Mark read
                          </button>
                        </form>
                      ) : null}
                      <form action={archiveNotification.bind(null, n.id)}>
                        <button type="submit" className={buttonGhostCls}>
                          Archive
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>{showArchived ? "No archived notifications." : "You're all caught up."}</EmptyState>
        )}
      </Card>
    </div>
  );
}
