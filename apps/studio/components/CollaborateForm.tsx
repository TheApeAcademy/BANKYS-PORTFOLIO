"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { submitCollaboratorApplication, type ApplyState } from "@/lib/actions/collaborate";
import { inputCls, buttonCls } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const initialState: ApplyState = { error: null, success: false };

// Keep in sync with MAX_TOTAL_ATTACHMENT_BYTES in lib/actions/collaborate.ts.
// Checking this client-side before submit matters: sending an oversized
// multipart body lets the platform's request size limit abort the upload
// mid-stream, which the browser shows as a raw connection failure instead
// of the form's normal in-page error message.
const MAX_TOTAL_ATTACHMENT_BYTES = 3.5 * 1024 * 1024;

export function CollaborateForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(submitCollaboratorApplication, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const files = new FormData(event.currentTarget).getAll("attachments").filter((f): f is File => f instanceof File);
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      event.preventDefault();
      setClientError(t("collab.error.fileTooLarge"));
      return;
    }
    setClientError(null);
  }

  if (state.success) {
    return (
      <div className="rounded-lg border border-paid bg-bg-raised p-4 text-sm">
        <p className="font-medium text-paid">{t("collab.form.successTitle")}</p>
        <p className="mt-2 text-fg-muted">{t("collab.form.successBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <label className="flex items-start gap-2 text-sm text-fg-muted">
        <input type="checkbox" name="agree_terms" required className="mt-0.5" />
        <span>
          {t("legal.agree.prefix")}{" "}
          <Link href="/terms" target="_blank" className="text-accent hover:underline">
            {t("legal.agree.terms")}
          </Link>{" "}
          {t("legal.agree.and")}{" "}
          <Link href="/privacy" target="_blank" className="text-accent hover:underline">
            {t("legal.agree.privacy")}
          </Link>
        </span>
      </label>

      {clientError ?? state.error ? <p className="text-sm text-excluded">{clientError ?? state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? t("collab.form.sending") : t("collab.form.submit")}
      </button>
    </form>
  );
}
