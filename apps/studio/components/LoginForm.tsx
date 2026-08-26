"use client";

import { useActionState } from "react";
import { verifyAccessCode, type SignInState } from "@/lib/actions/collaborator-auth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const initialState: SignInState = { error: null };

export function LoginForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(verifyAccessCode, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm text-fg-muted">
          {t("login.accessCode")}
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
        />
      </div>
      {state.error ? <p className="text-sm text-excluded">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? t("login.signingIn") : t("login.enter")}
      </button>
    </form>
  );
}
