import Link from "next/link";
import { Logo } from "./Logo";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "This week" },
  { href: "/dashboard/payouts", label: "Payout history" },
];

export function CollaboratorNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
        <Logo href="/dashboard" label="Collaborator" />
        <nav className="flex flex-1 gap-1 text-sm">
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
