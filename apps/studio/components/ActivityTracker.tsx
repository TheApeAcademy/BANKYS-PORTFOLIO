"use client";

// Sends studio activity to the Bureau: a page view on every route, and the
// clicks that matter (contact, intro skip, socials) from anywhere on the page.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { track } from "@/lib/track";

function clickEvent(a: HTMLAnchorElement): [string, Record<string, unknown>] | null {
  const href = a.getAttribute("href") || "";
  if (href.startsWith("https://wa.me/")) return ["contact_whatsapp", {}];
  if (href.startsWith("mailto:")) return ["contact_email", {}];
  if (href.startsWith("tel:")) return ["contact_call", {}];
  if (href.includes("instagram.com/")) return ["contact_instagram", {}];
  if (href.includes("tiktok.com/")) return ["contact_tiktok", {}];
  if (a.hasAttribute("data-skip")) return ["intro_skipped", {}];
  if (/^https?:\/\//.test(href) && !href.includes(location.host)) {
    try {
      return ["outbound_click", { host: new URL(href).host }];
    } catch {
      return null;
    }
  }
  return null;
}

export function ActivityTracker() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(() => {
    let referrer: string | null = null;
    try {
      const r = document.referrer ? new URL(document.referrer).host : "";
      referrer = r && r !== location.host ? r : null;
    } catch {
      /* unreadable referrer: leave it out */
    }
    track("page_view", {
      lang,
      device: matchMedia("(pointer: coarse)").matches || innerWidth < 760 ? "mobile" : "desktop",
      ...(referrer ? { referrer } : {}),
    });
    // Language is read at the time of the view; switching it is tracked on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const ev = clickEvent(a as HTMLAnchorElement);
      if (ev) track(ev[0], ev[1]);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
