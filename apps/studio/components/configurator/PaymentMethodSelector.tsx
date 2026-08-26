"use client";

import { useState } from "react";
import { PayButton } from "./PayButton";
import { BankTransferPanel } from "./BankTransferPanel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { DictKey } from "@/lib/i18n/dictionary";

type Method = "card" | "bank_transfer";

// "bank" (Flutterwave's automated "Pay With Bank" for UK/EU) is built in
// lib/actions/pay.ts (initiatePayment's method="bank" branch, using
// payment_options=banktransfer on Standard Checkout) but pulled from
// checkout — a live test still landed on the plain card-entry screen
// instead of a bank flow. That's the second distinct integration attempt
// to fail (the first used the Charge API directly and errored outright);
// two different technical paths both not working points to this not
// actually being enabled on the Flutterwave merchant account for EUR yet,
// regardless of what the dashboard toggle shows. Needs Flutterwave support
// to confirm enablement before trying a third approach. PayButton's
// method="bank" prop stays in place for whenever that's confirmed.
const METHODS: { id: Method; icon: string; labelKey: DictKey; helperKey: DictKey }[] = [
  { id: "card", icon: "💳", labelKey: "pay.method.card", helperKey: "pay.method.cardHelper" },
  { id: "bank_transfer", icon: "🏦", labelKey: "pay.method.bankTransfer", helperKey: "pay.method.bankTransferHelper" },
];

export function PaymentMethodSelector({ accessToken }: { accessToken: string }) {
  const [method, setMethod] = useState<Method | null>(null);
  const { t } = useLanguage();

  if (method === "card") {
    return <PayButton accessToken={accessToken} label={`${t("pay.method.card")} →`} />;
  }
  if (method === "bank_transfer") {
    return <BankTransferPanel accessToken={accessToken} onBack={() => setMethod(null)} />;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {METHODS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setMethod(m.id)}
          className="flex items-center gap-3 rounded-lg border border-border bg-bg-raised px-4 py-3 text-left transition hover:border-accent"
        >
          <span className="text-xl" aria-hidden>
            {m.icon}
          </span>
          <span>
            <span className="block font-medium text-fg">{t(m.labelKey)}</span>
            <span className="block text-xs text-fg-muted">{t(m.helperKey)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
