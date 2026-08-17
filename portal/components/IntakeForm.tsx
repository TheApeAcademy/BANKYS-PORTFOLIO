"use client";

import { useActionState } from "react";
import { submitIntake, type IntakeState } from "@/lib/actions/projects";

const initialState: IntakeState = { error: null };

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(submitIntake, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="client_name" className="text-sm text-fg-muted">
          Your name
        </label>
        <input
          id="client_name"
          name="client_name"
          required
          className="rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="client_contact" className="text-sm text-fg-muted">
          Email or phone
        </label>
        <input
          id="client_contact"
          name="client_contact"
          required
          className="rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
        />
      </div>
      {state.error ? <p className="text-sm text-excluded">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Start my project"}
      </button>
    </form>
  );
}
