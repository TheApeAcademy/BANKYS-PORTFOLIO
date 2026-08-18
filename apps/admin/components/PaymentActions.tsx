"use client";

import { useActionState } from "react";
import { excludePayment, recordPartialRefund, openDispute, setPaymentFees, type ActionState } from "@/lib/actions/payments";
import { inputCls, buttonCls, buttonGhostCls, buttonDangerCls } from "@/components/ui";

const initialState: ActionState = { error: null };

export function PaymentActions({
  paymentId,
  projectId,
  paymentStatus,
}: {
  paymentId: string;
  projectId: string;
  paymentStatus: string;
}) {
  const [excludeState, excludeAction, excludePending] = useActionState(excludePayment, initialState);
  const [refundState, refundAction, refundPending] = useActionState(recordPartialRefund, initialState);
  const [disputeState, disputeAction, disputePending] = useActionState(openDispute, initialState);
  const [feesState, feesAction, feesPending] = useActionState(setPaymentFees, initialState);

  if (paymentStatus !== "successful" && paymentStatus !== "partially_refunded") {
    return <span className="text-xs text-fg-muted capitalize">{paymentStatus.replaceAll("_", " ")}</span>;
  }

  return (
    <details className="text-xs">
      <summary className="cursor-pointer select-none text-fg-muted hover:text-fg">Actions</summary>
      <div className="mt-3 flex flex-col gap-4 rounded-lg border border-border bg-bg-raised p-3">
        <form action={refundAction} className="flex flex-col gap-2">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <p className="font-medium text-fg">Partial / full refund</p>
          <input
            name="refund_amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Refund amount"
            required
            className={inputCls}
          />
          <input name="reason" placeholder="Reason" required className={inputCls} />
          <button type="submit" disabled={refundPending} className={buttonCls}>
            {refundPending ? "Saving…" : "Apply refund"}
          </button>
          {refundState.error ? <p className="text-excluded">{refundState.error}</p> : null}
        </form>

        <form action={excludeAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <p className="font-medium text-fg">Exclude from commission</p>
          <select name="new_status" required className={inputCls} defaultValue="">
            <option value="" disabled>
              Reason category
            </option>
            <option value="cancelled">Cancelled</option>
            <option value="fraudulent">Fraudulent / test transaction</option>
            <option value="chargeback">Chargeback</option>
          </select>
          <input name="reason" placeholder="Reason (required, logged)" required className={inputCls} />
          <button type="submit" disabled={excludePending} className={buttonDangerCls}>
            {excludePending ? "Saving…" : "Exclude payment"}
          </button>
          {excludeState.error ? <p className="text-excluded">{excludeState.error}</p> : null}
        </form>

        <form action={disputeAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <p className="font-medium text-fg">Open dispute</p>
          <input name="reason" placeholder="Reason (required, logged)" required className={inputCls} />
          <input name="gateway_dispute_id" placeholder="Gateway dispute ID (optional)" className={inputCls} />
          <button type="submit" disabled={disputePending} className={buttonDangerCls}>
            {disputePending ? "Saving…" : "Open dispute"}
          </button>
          {disputeState.error ? <p className="text-excluded">{disputeState.error}</p> : null}
        </form>

        <form action={feesAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="project_id" value={projectId} />
          <p className="font-medium text-fg">Fee / net breakdown</p>
          <input name="gross_amount" type="number" step="0.01" placeholder="Gross amount" className={inputCls} />
          <input name="gateway_fee" type="number" step="0.01" placeholder="Gateway fee" className={inputCls} />
          <input name="net_amount" type="number" step="0.01" placeholder="Net amount" className={inputCls} />
          <button type="submit" disabled={feesPending} className={buttonGhostCls}>
            {feesPending ? "Saving…" : "Save fees"}
          </button>
          {feesState.error ? <p className="text-excluded">{feesState.error}</p> : null}
        </form>
      </div>
    </details>
  );
}
