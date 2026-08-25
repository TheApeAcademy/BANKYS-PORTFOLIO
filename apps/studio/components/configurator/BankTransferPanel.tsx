"use client";

import { useEffect, useState } from "react";
import {
  initiateBankTransfer,
  getBankTransferInstructions,
  type BankTransferIntent,
  type BankTransferInstructions,
} from "@/lib/actions/pay";

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd className={`tabular-nums text-right ${emphasize ? "font-semibold text-accent" : "text-fg"}`}>{value}</dd>
    </div>
  );
}

export function BankTransferPanel({ accessToken, onBack }: { accessToken: string; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<BankTransferIntent | null>(null);
  const [instructions, setInstructions] = useState<BankTransferInstructions>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await initiateBankTransfer(accessToken);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setIntent(result.intent);
      const instr = await getBankTransferInstructions(result.intent.currency);
      if (!cancelled) {
        setInstructions(instr);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function copyReference() {
    if (!intent) return;
    try {
      await navigator.clipboard.writeText(intent.projectCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — reference is still visible as text
    }
  }

  if (loading) {
    return <p className="text-sm text-fg-muted">Setting up your transfer…</p>;
  }

  if (error || !intent) {
    return (
      <div>
        <p className="text-sm text-excluded">{error ?? "Could not start a bank transfer."}</p>
        <button type="button" onClick={onBack} className="mt-3 text-sm text-fg-muted hover:text-fg">
          ← Choose a different method
        </button>
      </div>
    );
  }

  if (!instructions) {
    return (
      <div className="rounded-lg border border-pending/40 bg-pending/10 p-4 text-left text-sm text-pending">
        Bank transfer isn&apos;t set up for {intent.currency} yet — choose Card instead, or reach out on WhatsApp
        and we&apos;ll sort it out directly.
        <div>
          <button type="button" onClick={onBack} className="mt-3 text-sm underline">
            ← Choose a different method
          </button>
        </div>
      </div>
    );
  }

  const detailFields = Object.entries(instructions.details).filter(([, v]) => Boolean(v));

  return (
    <div className="rounded-lg border border-border bg-bg-raised p-4 text-left text-sm">
      <p className="mb-3 font-medium">Transfer instructions</p>
      <dl className="flex flex-col gap-2">
        <Row label="Beneficiary" value={instructions.beneficiaryName} />
        {detailFields.map(([key, value]) => (
          <Row key={key} label={formatLabel(key)} value={value} />
        ))}
        <Row label="Amount" value={`${intent.currency} ${intent.amount.toFixed(2)}`} />
        <div className="flex items-center justify-between gap-3">
          <dt className="text-fg-muted">Reference</dt>
          <dd className="flex items-center gap-2">
            <span className="tabular-nums font-semibold text-accent">{intent.projectCode}</span>
            <button
              type="button"
              onClick={copyReference}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-fg-muted transition hover:bg-bg-card hover:text-fg"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-fg-muted">
        Include the reference above in your transfer so we can match it. We&apos;ll confirm and update your project
        once we see it arrive — this can take longer for international transfers.
      </p>
      <button type="button" onClick={onBack} className="mt-4 text-sm text-fg-muted hover:text-fg">
        ← Choose a different method
      </button>
    </div>
  );
}
