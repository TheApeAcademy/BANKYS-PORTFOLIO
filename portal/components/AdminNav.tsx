import Link from "next/link";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/collaborators", label: "Collaborators" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export function AdminNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Logo href="/admin" label="Admin" />
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
        <form action={signOut}>
          <button type="submit" className="text-sm text-fg-muted hover:text-fg">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
