"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { globalSearch, type SearchResult } from "@/lib/actions/dashboard";

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  project: "Project",
  collaborator: "Collaborator",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const timeout = setTimeout(
      () => {
        if (trimmed.length < 2) {
          setResults([]);
          setOpen(false);
          return;
        }
        globalSearch(trimmed).then((r) => {
          setResults(r);
          setOpen(true);
        });
      },
      trimmed.length < 2 ? 0 : 250,
    );
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search customers, projects…"
        className="w-full rounded-lg border border-border bg-bg-raised px-3.5 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />
      {open && results.length > 0 ? (
        <div className="absolute right-0 z-20 mt-1.5 w-80 overflow-hidden rounded-lg border border-border bg-bg-card shadow-lg">
          <ul className="max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li key={`${r.entity_type}-${r.id}`}>
                <Link
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-bg-raised"
                >
                  <span>
                    <span className="font-medium">{r.title}</span>
                    {r.subtitle ? <span className="text-fg-muted"> — {r.subtitle}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-fg-muted">
                    {TYPE_LABELS[r.entity_type] ?? r.entity_type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
