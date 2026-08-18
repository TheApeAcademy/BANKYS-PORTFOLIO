"use client";

import { useActionState } from "react";
import { setRevenueGoal, type GoalActionState } from "@/lib/actions/analytics";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: GoalActionState = { error: null };

export function SetGoalForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [state, action, pending] = useActionState(setRevenueGoal, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Target amount</label>
        <input name="target_amount" type="number" min="1" step="1" required className={`${inputCls} w-36`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-fg-muted">Currency</label>
        <input name="currency" defaultValue={defaultCurrency} className={`${inputCls} w-20`} />
      </div>
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Saving…" : "Set goal"}
      </button>
      {state.error ? <p className="w-full text-excluded">{state.error}</p> : null}
    </form>
  );
}
