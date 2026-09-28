"use client";

// Collaborator pop-ups on Zebraish Home: "Apply to Collaborate" and "Enter Your
// Code", in glass. Same server actions as the /collaborate and /login pages.
import { useActionState, useCallback, useEffect, useState, type FormEvent } from "react";
import { submitCollaboratorApplication, type ApplyState } from "@/lib/actions/collaborate";
import { verifyAccessCode, type SignInState } from "@/lib/actions/collaborator-auth";
import { translate, type DictKey } from "@/lib/i18n/dictionary";

// Zebraish Home is English-first, so these read English regardless of the portal language cookie.
const t = (key: DictKey) => translate("en", key);
import { GlassModal, glass } from "./GlassModal";

type Mode = "apply" | "code" | null;
// Keep in sync with MAX_TOTAL_ATTACHMENT_BYTES in lib/actions/collaborate.ts.
const MAX_TOTAL_ATTACHMENT_BYTES = 3.5 * 1024 * 1024;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={glass.label}>{label}</span>
      {children}
    </label>
  );
}

function ApplyForm({ onCode }: { onCode: () => void }) {
  const [state, formAction, pending] = useActionState(submitCollaboratorApplication, { error: null, success: false } as ApplyState);
  const [clientError, setClientError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const files = new FormData(e.currentTarget).getAll("attachments").filter((f): f is File => f instanceof File);
    if (files.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_ATTACHMENT_BYTES) {
      e.preventDefault();
      setClientError(t("collab.error.fileTooLarge"));
      return;
    }
    setClientError(null);
  };

  if (state.success) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ ...glass.label, color: glass.accent }}>Application sent</div>
        <h3 style={glass.h3}>{t("collab.form.successTitle")}</h3>
        <p style={{ ...glass.sub, maxWidth: 460, margin: "0 auto" }}>{t("collab.form.successBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name="lang" value="en" />
      <div>
        <div style={glass.label}>Collaborate</div>
        <h3 style={glass.h3}>Bring us clients. Earn on every project.</h3>
        <p style={{ ...glass.sub, marginBottom: 0 }}>Tell us about yourself and we&apos;ll follow up.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: 14 }}>
        <Field label={t("collab.form.name")}><input name="name" required style={glass.input} /></Field>
        <Field label={t("collab.form.email")}><input name="email" type="email" style={glass.input} /></Field>
        <Field label={t("collab.form.phone")}><input name="phone" type="tel" style={glass.input} /></Field>
        <Field label={`${t("collab.form.portfolio")} ${t("collab.form.optional")}`}><input name="portfolio_url" type="url" placeholder="https://" style={glass.input} /></Field>
      </div>
      <Field label={t("collab.form.about")}><textarea name="experience" required rows={4} style={{ ...glass.input, resize: "vertical" }} /></Field>
      <Field label={t("collab.form.pitch")}><textarea name="pitch" required rows={3} style={{ ...glass.input, resize: "vertical" }} /></Field>
      <Field label={`${t("collab.form.attachments")} ${t("collab.form.attachmentsHelper")}`}>
        <input name="attachments" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ fontSize: 13, color: "rgba(245,245,247,.7)" }} />
      </Field>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "rgba(245,245,247,.65)" }}>
        <input type="checkbox" name="agree_terms" required style={{ marginTop: 3 }} />
        <span>
          {t("legal.agree.prefix")} <a href="/terms" target="_blank" style={{ color: glass.accent }}>{t("legal.agree.terms")}</a> {t("legal.agree.and")} <a href="/privacy" target="_blank" style={{ color: glass.accent }}>{t("legal.agree.privacy")}</a>
        </span>
      </label>
      {clientError ?? state.error ? <p style={{ ...glass.error, margin: 0 }}>{clientError ?? state.error}</p> : null}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" disabled={pending} style={{ ...glass.primary, opacity: pending ? .5 : 1 }}>{pending ? t("collab.form.sending") : `${t("collab.form.submit")} →`}</button>
        <button type="button" onClick={onCode} style={{ background: "none", border: "none", padding: 0, color: "rgba(245,245,247,.6)", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>Already a collaborator?</button>
      </div>
    </form>
  );
}

function CodeForm({ onApply }: { onApply: () => void }) {
  const [state, formAction, pending] = useActionState(verifyAccessCode, { error: null } as SignInState);
  return (
    <form action={formAction} style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name="lang" value="en" />
      <div>
        <div style={glass.label}>Collaborator access</div>
        <h3 style={glass.h3}>Enter your code.</h3>
        <p style={{ ...glass.sub, marginBottom: 0 }}>{t("login.subtitle")} Your commissions and payouts open next.</p>
      </div>
      <Field label={t("login.accessCode")}>
        <input name="code" required autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus style={{ ...glass.input, fontSize: 18, letterSpacing: ".12em" }} />
      </Field>
      {state.error ? <p style={{ ...glass.error, margin: 0 }}>{state.error}</p> : null}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" disabled={pending} style={{ ...glass.primary, opacity: pending ? .5 : 1 }}>{pending ? t("login.signingIn") : `${t("login.enter")} →`}</button>
        <button type="button" onClick={onApply} style={{ background: "none", border: "none", padding: 0, color: "rgba(245,245,247,.6)", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>New? Apply to collaborate</button>
      </div>
    </form>
  );
}

export default function CollaboratorPopups() {
  const [mode, setMode] = useState<Mode>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href='#collaborate-apply'],a[href='#collaborator-code'],a[href='/collaborate'],a[href='/login']");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      setMode(href === "#collaborator-code" || href === "/login" ? "code" : "apply");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  const close = useCallback(() => setMode(null), []);
  if (!mode) return null;
  return (
    <GlassModal title={mode === "apply" ? "Become a collaborator" : "Collaborator access"} onClose={close} width={mode === "apply" ? 760 : 520}>
      {mode === "apply" ? <ApplyForm onCode={() => setMode("code")} /> : <CodeForm onApply={() => setMode("apply")} />}
    </GlassModal>
  );
}
