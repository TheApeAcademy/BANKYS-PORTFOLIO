"use client";

import { useActionState } from "react";
import { confirmBankTransfer, rejectBankTransfer, type ActionState } from "@/lib/actions/bank-transfers";
import { inputCls, buttonCls, buttonDangerCls } from "@/components/ui";

const initialState: ActionState = { error: null };

export function BankTransferReconcileActions({ paymentId, projectId }: { paymentId: string; projectId: string }) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmBankTransfer, initialState);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectBankTransfer, initialState);

  return (
    <details className="text-xs">
      <summary className="cursor-pointer select-none text-fg-muted hover:text-fg">Review</summary>
      <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-bg-raised p-3">
        <form action={confirmAction}>
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <button type="submit" disabled={confirmPending} className={`${buttonCls} w-full`}>
            {confirmPending ? "Confirming…" : "Confirm — money received"}
          </button>
          {confirmState.error ? <p className="mt-1 text-excluded">{confirmState.error}</p> : null}
        </form>

        <form action={rejectAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <input name="reason" placeholder="Reason (required, logged)" required className={inputCls} />
          <button type="submit" disabled={rejectPending} className={buttonDangerCls}>
            {rejectPending ? "Saving…" : "Reject — never arrived"}
          </button>
          {rejectState.error ? <p className="text-excluded">{rejectState.error}</p> : null}
        </form>
      </div>
    </details>
  );
}
