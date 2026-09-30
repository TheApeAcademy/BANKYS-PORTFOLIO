"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string };

/** Sidebar links; the page you're on is highlighted. */
export function AdminNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav className="flex flex-col gap-0.5 text-sm">
      {links.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 transition ${
              active ? "glass font-medium text-fg" : "border border-transparent text-fg-muted hover:bg-bg-raised hover:text-fg"
            }`}
          >
            <span className="flex items-center gap-2">
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" aria-hidden /> : null}
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
