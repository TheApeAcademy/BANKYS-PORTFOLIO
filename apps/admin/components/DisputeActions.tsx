"use client";

import { useActionState } from "react";
import { resolveDispute, type ActionState } from "@/lib/actions/payments";
import { inputCls, buttonCls, buttonDangerCls } from "@/components/ui";

const initialState: ActionState = { error: null };

export function DisputeActions({ disputeId }: { disputeId: string }) {
  const [state, action, pending] = useActionState(resolveDispute, initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 text-xs">
      <input type="hidden" name="dispute_id" value={disputeId} />
      <input name="resolution" placeholder="Resolution notes" className={`${inputCls} max-w-xs`} />
      <button type="submit" name="outcome" value="won" disabled={pending} className={buttonCls}>
        {pending ? "Saving…" : "Won"}
      </button>
      <button type="submit" name="outcome" value="lost" disabled={pending} className={buttonDangerCls}>
        {pending ? "Saving…" : "Lost"}
      </button>
      {state.error ? <p className="w-full text-excluded">{state.error}</p> : null}
    </form>
  );
}
