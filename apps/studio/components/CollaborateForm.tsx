"use client";

import { useActionState } from "react";
import { submitCollaboratorApplication, type ApplyState } from "@/lib/actions/collaborate";
import { inputCls, buttonCls } from "@/components/ui";

const initialState: ApplyState = { error: null, success: false };

export function CollaborateForm() {
  const [state, formAction, pending] = useActionState(submitCollaboratorApplication, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-paid bg-bg-raised p-4 text-sm">
        <p className="font-medium text-paid">Application sent.</p>
        <p className="mt-2 text-fg-muted">
          We&apos;ll review it and follow up. If you&apos;re approved, you&apos;ll get a private access code to sign
          in to the collaborator dashboard — no account needed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm text-fg-muted">
            Name
          </label>
          <input id="name" name="name" required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-fg-muted">
            Email
          </label>
          <input id="email" name="email" type="email" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="phone" className="text-sm text-fg-muted">
            Phone / WhatsApp
          </label>
          <input id="phone" name="phone" type="tel" className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pitch" className="text-sm text-fg-muted">
          What kind of clients or projects would you bring us?
        </label>
        <textarea id="pitch" name="pitch" required rows={3} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="experience" className="text-sm text-fg-muted">
          Why do you want to collaborate with Zebraish, and what relevant experience or network do you have?
        </label>
        <textarea id="experience" name="experience" required rows={3} className={inputCls} />
      </div>

      {state.error ? <p className="text-sm text-excluded">{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
