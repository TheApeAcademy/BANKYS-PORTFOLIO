"use client";

import type { CatalogueStep } from "@/lib/catalogue/types";
import { formatMoney } from "@/lib/format";

type Value = string | string[] | number | undefined;

export function StepRenderer({
  step,
  value,
  onChange,
}: {
  step: CatalogueStep;
  value: Value;
  onChange: (value: Value) => void;
}) {
  if (step.type === "single") {
    const selected = typeof value === "string" ? value : undefined;
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {step.options?.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3.5 text-left transition ${
              selected === o.id
                ? "border-accent bg-accent/10 text-fg"
                : "border-border bg-bg-raised text-fg-muted hover:border-accent/50 hover:text-fg"
            }`}
          >
            <span className="font-medium">{o.label}</span>
            {o.description ? <span className="text-xs text-fg-muted">{o.description}</span> : null}
            {o.included ? (
              <span className="text-xs text-paid">Included</span>
            ) : o.price ? (
              <span className="tabular-nums text-xs text-accent">+{formatMoney(o.price, "EUR")}</span>
            ) : null}
          </button>
        ))}
      </div>
    );
  }

  if (step.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (id: string) => {
      onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    };
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {step.options?.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
              selected.includes(o.id)
                ? "border-accent bg-accent/10 text-fg"
                : "border-border bg-bg-raised text-fg-muted hover:border-accent/50 hover:text-fg"
            }`}
          >
            <span className="font-medium">{o.label}</span>
            {o.included ? (
              <span className="shrink-0 text-xs text-paid">Included</span>
            ) : o.price ? (
              <span className="tabular-nums shrink-0 text-xs text-accent">+{formatMoney(o.price, "EUR")}</span>
            ) : null}
          </button>
        ))}
      </div>
    );
  }

  if (step.type === "number") {
    const qty = typeof value === "number" ? value : 0;
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(step.min ?? 0, qty - 1))}
          className="h-11 w-11 rounded-full border border-border text-lg text-fg-muted hover:border-accent hover:text-fg"
        >
          −
        </button>
        <span className="tabular-nums w-12 text-center text-xl font-semibold">{qty}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(step.max ?? 999, qty + 1))}
          className="h-11 w-11 rounded-full border border-border text-lg text-fg-muted hover:border-accent hover:text-fg"
        >
          +
        </button>
        {step.pricePerUnit ? (
          <span className="text-sm text-fg-muted">{formatMoney(step.pricePerUnit, "EUR")} each</span>
        ) : null}
      </div>
    );
  }

  // text
  const text = typeof value === "string" ? value : "";
  return (
    <textarea
      value={text}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
      placeholder="Type here..."
    />
  );
}
