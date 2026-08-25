"use client";

import { useActionState, useState } from "react";
import { upsertBankTransferAccount, type ActionState } from "@/lib/actions/bank-transfers";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: ActionState = { error: null };

type ExistingAccount = {
  beneficiary_name: string;
  details: Record<string, string>;
  active: boolean;
  updated_at: string;
} | null;

export function BankTransferAccountForm({ currency, existing }: { currency: string; existing: ExistingAccount }) {
  const [state, formAction, pending] = useActionState(upsertBankTransferAccount, initialState);
  const existingRows = existing ? Object.entries(existing.details) : [];
  const [rows, setRows] = useState<{ label: string; value: string }[]>(
    existingRows.length
      ? existingRows.map(([label, value]) => ({ label, value }))
      : [{ label: "", value: "" }],
  );

  return (
    <details className="rounded-lg border border-border p-4" open={Boolean(existing)}>
      <summary className="flex cursor-pointer select-none items-center justify-between text-sm font-medium">
        <span>
          {currency} {existing?.active ? <span className="text-xs text-paid">· configured</span> : <span className="text-xs text-fg-muted">· not set up</span>}
        </span>
      </summary>

      <form action={formAction} className="mt-4 flex flex-col gap-3 text-sm">
        <input type="hidden" name="currency" value={currency} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-fg-muted">Beneficiary name</label>
          <input
            name="beneficiary_name"
            defaultValue={existing?.beneficiary_name ?? ""}
            required
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-fg-muted">
            Receiving details — exactly what Payoneer shows you (IBAN, SWIFT/BIC, account number, sort code,
            routing number, bank name, address — whichever apply for {currency})
          </label>
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="detail_label"
                defaultValue={row.label}
                placeholder="Label, e.g. IBAN"
                className={`${inputCls} w-40`}
              />
              <input
                name="detail_value"
                defaultValue={row.value}
                placeholder="Value"
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { label: "", value: "" }])}
            className="self-start text-xs text-accent hover:underline"
          >
            + Add another field
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-fg-muted">
          <input type="checkbox" name="active" defaultChecked={existing?.active ?? false} />
          Show this to clients paying in {currency}
        </label>

        {state.error ? <p className="text-xs text-excluded">{state.error}</p> : null}

        <button type="submit" disabled={pending} className={`${buttonCls} self-start`}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
    </details>
  );
}
