"use client";

import { useEffect, useState } from "react";
import {
  initiateBankTransfer,
  getBankTransferInstructions,
  type BankTransferIntent,
  type BankTransferInstructions,
} from "@/lib/actions/pay";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  const { t } = useLanguage();
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
    return <p className="text-sm text-fg-muted">{t("pay.bank.settingUp")}</p>;
  }

  if (error || !intent) {
    return (
      <div>
        <p className="text-sm text-excluded">{error ?? t("pay.bank.genericError")}</p>
        <button type="button" onClick={onBack} className="mt-3 text-sm text-fg-muted hover:text-fg">
          {t("pay.method.changeMethod")}
        </button>
      </div>
    );
  }

  if (!instructions) {
    return (
      <div className="rounded-lg border border-pending/40 bg-pending/10 p-4 text-left text-sm text-pending">
        {t("pay.bank.notSetUp", { currency: intent.currency })}
        <div>
          <button type="button" onClick={onBack} className="mt-3 text-sm underline">
            {t("pay.method.changeMethod")}
          </button>
        </div>
      </div>
    );
  }

  const detailFields = Object.entries(instructions.details).filter(([, v]) => Boolean(v));

  return (
    <div className="rounded-lg border border-border bg-bg-raised p-4 text-left text-sm">
      <p className="mb-3 font-medium">{t("pay.bank.instructionsTitle")}</p>
      <dl className="flex flex-col gap-2">
        <Row label={t("pay.bank.beneficiary")} value={instructions.beneficiaryName} />
        {detailFields.map(([key, value]) => (
          <Row key={key} label={formatLabel(key)} value={value} />
        ))}
        <Row label={t("pay.bank.amount")} value={`${intent.currency} ${intent.amount.toFixed(2)}`} />
        <div className="flex items-center justify-between gap-3">
          <dt className="text-fg-muted">{t("pay.bank.reference")}</dt>
          <dd className="flex items-center gap-2">
            <span className="tabular-nums font-semibold text-accent">{intent.projectCode}</span>
            <button
              type="button"
              onClick={copyReference}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-fg-muted transition hover:bg-bg-card hover:text-fg"
            >
              {copied ? t("config.done.copied") : t("config.done.copy")}
            </button>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-fg-muted">{t("pay.bank.footnote")}</p>
      <button type="button" onClick={onBack} className="mt-4 text-sm text-fg-muted hover:text-fg">
        {t("pay.method.changeMethod")}
      </button>
    </div>
  );
}
