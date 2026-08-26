"use client";

import { useState } from "react";
import { initiatePayment } from "@/lib/actions/pay";
import { buttonCls, inputCls } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function PayButton({
  accessToken,
  label,
  method = "card",
}: {
  accessToken: string;
  label: string;
  method?: "card" | "bank";
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState("");

  async function handleClick(overrideEmail?: string) {
    setLoading(true);
    setError(null);
    const result = await initiatePayment(accessToken, overrideEmail, method);
    if (!result.ok) {
      setError(result.error);
      setNeedsEmail(Boolean(result.needsEmail));
      setLoading(false);
      return;
    }
    window.location.href = result.link;
  }

  if (needsEmail) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleClick(email);
        }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm text-fg-muted">{t(method === "bank" ? "pay.bankCharge.needsEmail" : "pay.card.needsEmail")}</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("pay.card.emailPlaceholder")}
          className={inputCls}
        />
        <button type="submit" disabled={loading} className={buttonCls}>
          {loading ? t(method === "bank" ? "pay.bankCharge.redirecting" : "pay.card.redirecting") : label}
        </button>
        {error && !needsEmail ? <p className="text-sm text-excluded">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={() => handleClick()} disabled={loading} className={buttonCls}>
        {loading ? t(method === "bank" ? "pay.bankCharge.redirecting" : "pay.card.redirecting") : label}
      </button>
      {error ? <p className="text-sm text-excluded">{error}</p> : null}
    </div>
  );
}
