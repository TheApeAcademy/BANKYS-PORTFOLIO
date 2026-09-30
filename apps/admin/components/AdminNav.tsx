import Link from "next/link";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";
import { getUnreadNotificationCount } from "@/lib/actions/notifications";
import { GlobalSearch } from "./GlobalSearch";
import { AdminNavMobile } from "./AdminNavMobile";
import { AdminNavLinks, type NavLink } from "./AdminNavLinks";

const links: NavLink[] = [
  { href: "/", label: "Overview" },
  { href: "/customers", label: "Customers" },
  { href: "/projects", label: "Projects" },
  { href: "/payments", label: "Payments" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/payouts", label: "Payouts" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/analytics", label: "Analytics" },
  { href: "/audit-log", label: "Audit log" },
  { href: "/settings/security", label: "Security" },
];

function SignOut() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm text-fg-muted transition hover:text-fg">
        Sign out
      </button>
    </form>
  );
}

/** Desktop sidebar: brand, sections, sign out. Hidden below lg (the top bar's menu takes over). */
export function AdminSidebar() {
  return (
    <aside className="glass-rail sticky top-0 z-[2] hidden h-screen flex-col border-r px-4 py-7 lg:flex">
      <Link href="/" className="block px-2">
        <span className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zebraish-mark.png" alt="" width={30} height={30} className="shrink-0" />
          <span className="text-[17px] font-extrabold tracking-[.08em]">ZEBRAISH</span>
        </span>
        <span className="mt-3 block text-[10px] font-bold uppercase leading-[1.6] tracking-[.22em] text-fg-muted">
          Bureau of Statistics, Analysis &amp; Critical Motion
        </span>
      </Link>
      <div className="mt-8 flex-1 overflow-y-auto">
        <AdminNavLinks links={links} />
      </div>
      <div className="border-t border-border px-2 pt-4">
        <SignOut />
      </div>
    </aside>
  );
}

/** Top bar: search and notifications everywhere; brand, menu and sign out on small screens. */
export async function AdminTopBar() {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-10 border-b border-[rgba(245,245,247,.08)] bg-[rgba(5,5,6,.55)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        <AdminNavMobile links={links} footer={<SignOut />} />
        <div className="shrink-0 lg:hidden">
          <Logo href="/" name="" />
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2 lg:ml-0 lg:flex-1">
          <GlobalSearch />
          <Link
            href="/notifications"
            className="relative ml-auto rounded-md px-3 py-1.5 text-fg-muted transition hover:bg-bg-raised hover:text-fg"
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          >
            <span aria-hidden>🔔</span>
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
