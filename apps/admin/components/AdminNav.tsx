import Link from "next/link";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";

const links = [
  { href: "/", label: "Overview" },
  { href: "/customers", label: "Customers" },
  { href: "/projects", label: "Projects" },
  { href: "/payments", label: "Payments" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/payouts", label: "Payouts" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/audit-log", label: "Audit log" },
];

export async function AdminNav() {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Logo href="/" label="Admin" />
        <nav className="flex flex-1 flex-wrap gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-fg-muted transition hover:bg-bg-raised hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/notifications"
          className="relative rounded-md px-3 py-1.5 text-fg-muted transition hover:bg-bg-raised hover:text-fg"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <span aria-hidden>🔔</span>
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-sm text-fg-muted hover:text-fg">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
