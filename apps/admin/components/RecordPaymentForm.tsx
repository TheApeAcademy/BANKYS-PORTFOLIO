"use client";

import { useActionState } from "react";
import { recordPayment, type ActionState } from "@/lib/actions/payments";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: ActionState = { error: null };

export function RecordPaymentForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(recordPayment, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 text-sm">
      <input type="hidden" name="project_id" value={projectId} />
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Amount</label>
        <input name="amount" type="number" step="0.01" min="0.01" required className={`${inputCls} w-32`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Currency</label>
        <select name="currency" defaultValue="EUR" className={inputCls}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="NGN">NGN</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Type</label>
        <select name="type" defaultValue="full" className={inputCls}>
          <option value="full">Full</option>
          <option value="installment">Installment</option>
          <option value="partial">Partial</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Method</label>
        <input name="method" placeholder="e.g. bank transfer" className={`${inputCls} w-40`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Received</label>
        <input name="received_at" type="date" defaultValue={today} required className={inputCls} />
      </div>
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Recording…" : "Record payment"}
      </button>
      {state.error ? <p className="w-full text-sm text-excluded">{state.error}</p> : null}
    </form>
  );
}
