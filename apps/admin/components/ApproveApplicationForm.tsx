"use client";

import { useState } from "react";
import { useActionState } from "react";
import { approveApplication, type ApproveApplicationState } from "@/lib/actions/collaborators";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: ApproveApplicationState = { error: null, success: false };

export function ApproveApplicationForm({ applicationId }: { applicationId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(approveApplication, initialState);
  const today = new Date().toISOString().slice(0, 10);

  if (!expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)} className={buttonCls}>
        Approve
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 rounded-lg border border-border p-3">
      <input type="hidden" name="id" value={applicationId} />
      <p className="text-xs text-fg-muted">Set the collaborator&apos;s term and payout details before approving.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Term start</label>
          <input name="term_start" type="date" defaultValue={today} required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Term end (optional)</label>
          <input name="term_end" type="date" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Commission rate (%)</label>
          <input name="commission_rate" type="number" step="0.01" defaultValue="10" className={inputCls} />
        </div>
        <div />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Bank name</label>
          <input name="bank_name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Account name</label>
          <input name="account_name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs text-fg-muted">Account number</label>
          <input name="account_number" className={inputCls} />
        </div>
      </div>
      {state.error ? <p className="text-sm text-excluded">{state.error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Approving…" : "Confirm approval"}
        </button>
        <button type="button" onClick={() => setExpanded(false)} className="text-sm text-fg-muted hover:text-fg">
          Cancel
        </button>
      </div>
    </form>
  );
}
