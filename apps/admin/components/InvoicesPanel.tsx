"use client";

import { useActionState, useState } from "react";
import { createInvoice, getInvoicePdfUrl, type ActionState } from "@/lib/actions/invoices";
import { inputCls, buttonCls, buttonGhostCls } from "@/components/ui";
import { formatMoney, formatDate } from "@zebraish/lib/format";

const initialState: ActionState = { error: null };

type InvoiceRow = {
  id: string;
  invoice_number: string;
  total: number;
  currency: string;
  issued_at: string;
  pdf_storage_path: string | null;
};

export function InvoicesPanel({
  projectId,
  paymentOptions,
  invoices,
}: {
  projectId: string;
  paymentOptions: { id: string; label: string }[];
  invoices: InvoiceRow[];
}) {
  const [state, action, pending] = useActionState(createInvoice, initialState);
  const [lines, setLines] = useState([{ label: "", price: "" }]);

  async function handleDownload(storagePath: string) {
    const url = await getInvoicePdfUrl(storagePath);
    if (url) window.open(url, "_blank");
  }

  return (
    <div>
      <form
        action={(formData) => {
          formData.set(
            "line_items",
            JSON.stringify(lines.filter((l) => l.label.trim() && l.price !== "").map((l) => ({ label: l.label, price: Number(l.price) }))),
          );
          return action(formData);
        }}
        className="mb-5 flex flex-col gap-3 border-b border-border pb-5"
      >
        <input type="hidden" name="project_id" value={projectId} />
        <div className="flex flex-wrap gap-2">
          <select name="payment_id" className={`${inputCls} max-w-xs`} defaultValue="">
            <option value="">No linked payment</option>
            {paymentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select name="currency" className={`${inputCls} max-w-[8rem]`} defaultValue="EUR">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="NGN">NGN</option>
          </select>
        </div>

        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="Line item"
              value={line.label}
              onChange={(e) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))}
              className={inputCls}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={line.price}
              onChange={(e) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, price: e.target.value } : l)))}
              className={`${inputCls} max-w-[8rem]`}
            />
            {lines.length > 1 ? (
              <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className={buttonGhostCls}>
                Remove
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, { label: "", price: "" }])} className={buttonGhostCls}>
          + Add line
        </button>

        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Creating…" : "Create invoice"}
        </button>
        {state.error ? <p className="text-xs text-excluded">{state.error}</p> : null}
      </form>

      {invoices.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <p className="font-medium">{inv.invoice_number}</p>
                <p className="text-xs text-fg-muted">{formatDate(inv.issued_at)}</p>
              </div>
              <span className="tabular-nums">{formatMoney(inv.total, inv.currency)}</span>
              {inv.pdf_storage_path ? (
                <button type="button" onClick={() => handleDownload(inv.pdf_storage_path!)} className={buttonGhostCls}>
                  Download PDF
                </button>
              ) : (
                <span className="text-xs text-fg-muted">PDF not generated</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">No invoices yet.</p>
      )}
    </div>
  );
}
