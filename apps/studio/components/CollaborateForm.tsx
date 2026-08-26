"use client";

import { useActionState } from "react";
import { submitCollaboratorApplication, type ApplyState } from "@/lib/actions/collaborate";
import { inputCls, buttonCls } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const initialState: ApplyState = { error: null, success: false };

export function CollaborateForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(submitCollaboratorApplication, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-paid bg-bg-raised p-4 text-sm">
        <p className="font-medium text-paid">{t("collab.form.successTitle")}</p>
        <p className="mt-2 text-fg-muted">{t("collab.form.successBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm text-fg-muted">
            {t("collab.form.name")}
          </label>
          <input id="name" name="name" required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-fg-muted">
            {t("collab.form.email")}
          </label>
          <input id="email" name="email" type="email" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="phone" className="text-sm text-fg-muted">
            {t("collab.form.phone")}
          </label>
          <input id="phone" name="phone" type="tel" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="portfolio_url" className="text-sm text-fg-muted">
            {t("collab.form.portfolio")} <span className="text-fg-muted/70">{t("collab.form.optional")}</span>
          </label>
          <input id="portfolio_url" name="portfolio_url" type="url" placeholder="https://…" className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="about" className="text-sm text-fg-muted">
          {t("collab.form.about")}
        </label>
        <textarea id="about" name="experience" required rows={6} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pitch" className="text-sm text-fg-muted">
          {t("collab.form.pitch")}
        </label>
        <textarea id="pitch" name="pitch" required rows={3} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="attachments" className="text-sm text-fg-muted">
          {t("collab.form.attachments")} <span className="text-fg-muted/70">{t("collab.form.attachmentsHelper")}</span>
        </label>
        <input
          id="attachments"
          name="attachments"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="text-sm text-fg-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-bg-raised file:px-3 file:py-1.5 file:text-sm file:text-fg file:transition hover:file:bg-bg-card"
        />
      </div>

      {state.error ? <p className="text-sm text-excluded">{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? t("collab.form.sending") : t("collab.form.submit")}
      </button>
    </form>
  );
}
