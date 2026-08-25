"use client";

import { useState } from "react";
import { PayButton } from "./PayButton";
import { BankTransferPanel } from "./BankTransferPanel";

type Method = "card" | "bank_transfer";

const METHODS: { id: Method; icon: string; label: string; helper: string }[] = [
  { id: "card", icon: "💳", label: "Card", helper: "Pay securely with your card" },
  { id: "bank_transfer", icon: "🏦", label: "Bank Transfer", helper: "Transfer directly using your bank's app" },
];

export function PaymentMethodSelector({ accessToken }: { accessToken: string }) {
  const [method, setMethod] = useState<Method | null>(null);

  if (method === "card") {
    return <PayButton accessToken={accessToken} label="Pay with card →" />;
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
            <span className="block font-medium text-fg">{m.label}</span>
            <span className="block text-xs text-fg-muted">{m.helper}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
