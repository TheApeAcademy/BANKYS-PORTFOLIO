"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminNavMobile({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="rounded-md p-2 text-fg-muted transition hover:bg-bg-raised hover:text-fg"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 5.5h14M3 10h14M3 14.5h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open ? (
        <nav className="absolute left-0 top-full z-20 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-border bg-bg-card p-2 text-sm shadow-lg">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-fg-muted transition hover:bg-bg-raised hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
