"use client";

import { SITES } from "@/lib/zebraish/sites";
import { translateTree, useZbLang } from "@/lib/zebraish/i18n";

/** Phone version of the Device Journey: the same sites as a plain list, each
 * opening the live site. No pinned scroll, 3D device or embedded page, which
 * were too heavy for phones. */
export default function SiteList() {
  const lang = useZbLang();
  return translateTree(
    <div style={{ margin: "28px 0 0", fontFamily: "Inter,-apple-system,sans-serif", color: "var(--text)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>
        {"Live on screen · 12 sites"}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {SITES.map(([name, sub, ind, host], i) => (
          <li key={host}>
            <a
              href={`https://${host}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid", gridTemplateColumns: "26px minmax(0,1fr) auto", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 16, textDecoration: "none", color: "inherit",
                background: "rgba(var(--tint-rgb),.045)", border: "1px solid rgba(var(--tint-rgb),.1)",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--text-faint)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 800, letterSpacing: ".05em" }}>{name}</span>
                <span style={{ display: "block", marginTop: 3, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                {ind}
                <span aria-hidden style={{ fontSize: 14, color: "var(--text-muted)" }}>↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>,
    lang,
  );
}
