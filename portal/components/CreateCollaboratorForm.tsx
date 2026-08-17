"use client";

import { useActionState } from "react";
import { createCollaborator, type CreateCollaboratorState } from "@/lib/actions/collaborators";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: CreateCollaboratorState = { error: null, success: null };

export function CreateCollaboratorForm() {
  const [state, formAction, pending] = useActionState(createCollaborator, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-paid bg-bg-raised p-4 text-sm">
        <p className="font-medium text-paid">Collaborator + login created.</p>
        <p className="mt-2 text-fg-muted">
          Email: <span className="text-fg">{state.success.email}</span>
        </p>
        <p className="text-fg-muted">
          Temporary password: <span className="tabular-nums text-fg">{state.success.tempPassword}</span>
        </p>
        <p className="mt-2 text-fg-muted">
          Share this with them securely — it won&apos;t be shown again. They&apos;ll need to confirm
          their email (check their inbox for a Supabase confirmation link, or confirm manually
          from the Supabase dashboard → Authentication → Users) before they can sign in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Name</label>
        <input name="name" required className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Login email (optional)</label>
        <input name="email" type="email" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Term start</label>
        <input name="term_start" type="date" required className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Term end (optional)</label>
        <input name="term_end" type="date" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Commission rate (%)</label>
        <input name="commission_rate" type="number" step="0.01" defaultValue="10" className={inputCls} />
      </div>
      <div />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Bank name</label>
        <input name="bank_name" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-fg-muted">Account name</label>
        <input name="account_name" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-sm text-fg-muted">Account number</label>
        <input name="account_number" className={inputCls} />
      </div>
      {state.error ? <p className="text-sm text-excluded sm:col-span-2">{state.error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Saving…" : "Add collaborator"}
        </button>
      </div>
    </form>
  );
}
