"use client";

import { useState } from "react";
import { initiateBankPayment } from "@/lib/actions/pay";
import { buttonCls, inputCls } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function BankChargeButton({ accessToken, label }: { accessToken: string; label: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function handleClick(overrides?: { email?: string; phone?: string }) {
    setLoading(true);
    setError(null);
    const result = await initiateBankPayment(accessToken, overrides);
    if (!result.ok) {
      setError(result.error);
      setNeedsEmail(Boolean(result.needsEmail));
      setNeedsPhone(Boolean(result.needsPhone));
      setLoading(false);
      return;
    }
    window.location.href = result.link;
  }

  if (needsEmail || needsPhone) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleClick({ email, phone });
        }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm text-fg-muted">{t("pay.bankCharge.needsContact")}</p>
        {needsEmail ? (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("pay.bankCharge.emailPlaceholder")}
            className={inputCls}
          />
        ) : null}
        {needsPhone ? (
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("pay.bankCharge.phonePlaceholder")}
            className={inputCls}
          />
        ) : null}
        <button type="submit" disabled={loading} className={buttonCls}>
          {loading ? t("pay.bankCharge.redirecting") : label}
        </button>
        {error ? <p className="text-sm text-excluded">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={() => handleClick()} disabled={loading} className={buttonCls}>
        {loading ? t("pay.bankCharge.redirecting") : label}
      </button>
      {error ? <p className="text-sm text-excluded">{error}</p> : null}
    </div>
  );
}
