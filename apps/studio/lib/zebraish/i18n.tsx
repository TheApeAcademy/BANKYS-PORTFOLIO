"use client";

// Spanish for the Zebraish design pages (Experience, Home, World, Case Study)
// and their pop-ups. Those pages are written in English inline, so instead of
// threading keys through every template, each rendered tree is passed through
// translateTree(): any text (and placeholder / aria-label / title / alt) that
// matches an English entry in ES is swapped for its Spanish. An element with a
// data-es attribute uses that value directly.
//
// The language itself is the site-wide one (zb_lang cookie, LanguageProvider);
// ZebraishPage mirrors it here so class-based logic can read it synchronously.
import { cloneElement, isValidElement, useSyncExternalStore } from "react";
import { ES, ES_PATTERNS } from "./es";
import type { Lang } from "@/lib/i18n/dictionary";

let current: Lang = "es";
let setter: ((l: Lang) => void) | null = null;
const subs = new Set<() => void>();

export function getZbLang(): Lang {
  return current;
}

/** Called by ZebraishPage while rendering, so the tree below reads the new language. */
export function syncZbLang(l: Lang, set: (l: Lang) => void) {
  current = l;
  setter = set;
  // Plain-JS widgets (the ambient sound button) read this and listen for "zb:lang".
  if (typeof window !== "undefined") (window as unknown as { __zbLang?: Lang }).__zbLang = l;
}

/** Tells mounted Zebraish components the language changed (after commit). */
export function notifyZbLang() {
  subs.forEach((f) => f());
  window.dispatchEvent(new Event("zb:lang"));
}

export function subscribeZbLang(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

/** Switches the whole site's language (cookie + every page). */
export function setSiteLang(l: Lang) {
  if (setter) setter(l);
}

/** Re-renders a function component when the language changes. */
export function useZbLang(): Lang {
  return useSyncExternalStore(subscribeZbLang, getZbLang, () => current);
}

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

// Same entries keyed with runs of whitespace collapsed, for text whose spacing differs.
const ES_LOOSE = new Map(Object.entries(ES).map(([k, v]) => [k.replace(/\s+/g, " "), v]));

/** English text to Spanish when the site is in Spanish; anything unknown is returned as is. */
export function tr(s: string, lang: Lang = current): string {
  if (lang !== "es" || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
  const core = m ? m[2] : s;
  if (!core) return s;
  let hit: string | undefined = ES[core] ?? ES_LOOSE.get(core.replace(/\s+/g, " "));
  if (hit === undefined) {
    for (const [re, rep] of ES_PATTERNS) {
      const g = re.exec(core);
      if (g) {
        // $1 keeps a captured part as is; $T1 translates it too.
        hit = rep.replace(/\$(T?)(\d)/g, (_, t: string, i: string) => (t ? tr(g[+i] ?? "", lang) : g[+i] ?? ""));
        break;
      }
    }
  }
  return hit === undefined ? s : (m ? m[1] : "") + hit + (m ? m[3] : "");
}

function walkChildren(c: unknown): unknown {
  if (Array.isArray(c)) {
    let changed = false;
    const out = c.map((x) => {
      const y = walk(x);
      if (y !== x) changed = true;
      return y;
    });
    return changed ? out : c;
  }
  return walk(c);
}

function walk(n: unknown): unknown {
  if (typeof n === "string") return tr(n);
  if (Array.isArray(n)) return walkChildren(n);
  if (!isValidElement(n)) return n;
  if (n.type === "style" || n.type === "script") return n;
  const p = n.props as Record<string, unknown>;
  let patch: Record<string, unknown> | null = null;
  for (const a of ATTRS) {
    const v = p[a];
    if (typeof v === "string") {
      const t = tr(v);
      if (t !== v) (patch ??= {})[a] = t;
    }
  }
  let kids: unknown = p.children;
  if (typeof p["data-es"] === "string" && (typeof kids === "string" || typeof kids === "number")) {
    kids = p["data-es"];
  } else if (kids !== undefined && !p.dangerouslySetInnerHTML) {
    kids = walkChildren(kids);
  }
  if (kids === p.children && !patch) return n;
  // Children go back as arguments, as JSX passes them, so React does not ask for keys.
  if (kids !== p.children && Array.isArray(kids)) return cloneElement(n, patch ?? {}, ...kids);
  if (kids !== p.children) return cloneElement(n, patch ?? {}, kids as React.ReactNode);
  return cloneElement(n, patch ?? {});
}

/** Translates a rendered tree into the current language (no-op in English). */
export function translateTree<T>(node: T, lang: Lang = current): T {
  return lang === "es" ? (walk(node) as T) : node;
}
