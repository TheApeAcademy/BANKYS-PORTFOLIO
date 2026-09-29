"use client";

// One-time notice that the site only stores technical/preference data (no
// consent needed under LSSI art. 22.2), linking to the cookie policy. Inline
// styles because it sits on both the Tailwind portal and the design pages.
import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const KEY = "zb-cookie-notice";

function seenBefore(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return true; // storage blocked: skip the notice rather than nag every visit
  }
}

const onResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
const noop = () => () => {};

export function CookieNotice() {
  const { lang } = useLanguage();
  // Hidden on the server and until the browser says it hasn't been seen.
  const seen = useSyncExternalStore(noop, seenBefore, () => true);
  // On phones the floating sound button sits bottom-right, so sit above it.
  const narrow = useSyncExternalStore(onResize, () => innerWidth < 640, () => false);
  const [dismissed, setDismissed] = useState(false);
  const show = !seen && !dismissed;

  if (!show) return null;
  const es = lang === "es";
  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked: just hide it for this visit */
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label={es ? "Aviso de cookies" : "Cookie notice"}
      style={{
        position: "fixed", left: 16, bottom: narrow ? 72 : 16, zIndex: 9000, maxWidth: "min(420px, calc(100vw - 32px))", boxSizing: "border-box",
        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18,
        background: "rgba(12,12,16,.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(245,245,247,.16)", color: "#f5f5f7",
        fontFamily: "Inter,-apple-system,sans-serif", fontSize: 12.5, lineHeight: 1.5,
      }}
    >
      <span style={{ flex: 1 }}>
        {es
          ? "Solo usamos cookies técnicas para que la web funcione y recuerde tus preferencias. Sin publicidad ni rastreo. "
          : "We only use technical cookies so the site works and remembers your preferences. No ads, no tracking. "}
        <a href="/cookies" style={{ color: "#17c98d", textDecoration: "underline" }}>
          {es ? "Más información" : "Learn more"}
        </a>
      </span>
      <button
        type="button"
        onClick={dismiss}
        style={{ flexShrink: 0, background: "#f5f5f7", color: "#040405", border: "none", borderRadius: 100, padding: "8px 14px", fontFamily: "inherit", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}
      >
        {es ? "Entendido" : "Got it"}
      </button>
    </div>
  );
}
