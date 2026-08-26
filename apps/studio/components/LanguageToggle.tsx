"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      aria-label={t("lang.toggle.aria")}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-bg-raised p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`rounded-full px-2.5 py-1 transition ${
          lang === "es" ? "bg-accent text-white" : "text-fg-muted hover:text-fg"
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 transition ${
          lang === "en" ? "bg-accent text-white" : "text-fg-muted hover:text-fg"
        }`}
      >
        EN
      </button>
    </div>
  );
}
