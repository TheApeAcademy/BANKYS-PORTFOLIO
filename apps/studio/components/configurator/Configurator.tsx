"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_TYPES } from "@/lib/catalogue/catalogue";
import { calculateProject, getVisibleSteps, getFlow, getProjectType } from "@/lib/catalogue/engine";
import type { Answers, PricedLine } from "@zebraish/lib/catalogue/types";
import { saveProjectConfiguration } from "@/lib/actions/configurator";
import { logActivityEvent } from "@/lib/actions/activity";
import { StepRenderer } from "./StepRenderer";
import { formatMoney } from "@zebraish/lib/format";
import { COUNTRY_CODES } from "@/lib/countries";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { translate, type Lang } from "@/lib/i18n/dictionary";

const WHATSAPP_NUMBER = "2348165320780";

type ContactMethod = "email" | "phone";

/** Best-effort split of a previously-saved contact string, so a resumed draft
 * doesn't lose what the client already entered. */
function parseContact(contact: string): { method: ContactMethod; email: string; dial: string; phoneNumber: string } {
  if (contact.includes("@")) {
    return { method: "email", email: contact, dial: "+234", phoneNumber: "" };
  }
  const match = COUNTRY_CODES.filter((c) => c.dial).find((c) => contact.startsWith(c.dial));
  if (match) {
    return { method: "phone", email: "", dial: match.dial, phoneNumber: contact.slice(match.dial.length).trim() };
  }
  return { method: "phone", email: "", dial: "+234", phoneNumber: contact };
}

/** Price-line labels stay English at the data layer (they're what gets stored
 * in project_price_snapshots and shown to admin) — this only translates them
 * for on-screen display to a Spanish-viewing client. */
function translateLineLabel(line: PricedLine, projectTypeId: string, answers: Answers, lang: Lang): string {
  if (lang !== "es") return line.label;

  if (line.stepId === "base") {
    const type = getProjectType(projectTypeId);
    if (type?.labelEs) return `Base: ${type.labelEs}`;
    return line.label;
  }

  const flow = getFlow(projectTypeId);
  const step = flow?.steps.find((s) => s.id === line.stepId);
  if (!step) return line.label;

  if (step.type === "number") {
    const qty = Number(answers[step.id]) || 0;
    return `${step.questionEs ?? step.question} (${qty})`;
  }

  const option = step.options?.find((o) => o.id === line.optionId);
  return option?.labelEs ?? line.label;
}

type Phase = "type" | "steps" | "details" | "done";

// Before a project exists server-side (i.e. before the details screen is
// submitted), progress only ever lived in React state — a browser back/
// refresh wiped it entirely. This mirrors it into localStorage so a resumed
// tab picks up where the visitor left off; cleared once a real project is
// saved (from then on the access_token in the URL is the resume mechanism).
const DRAFT_KEY = "zb_configurator_draft";

type Draft = {
  phase: Phase;
  projectType: string | null;
  answers: Answers;
  stepPos: number;
  clientName: string;
  clientContact: string;
};

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private browsing, quota) — draft just won't persist
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function Configurator({
  initial,
}: {
  initial?: {
    accessToken: string;
    projectCode: string;
    clientName: string;
    clientContact: string;
    projectType: string;
    answers: Answers;
  } | null;
}) {
  const router = useRouter();
  const { lang, t } = useLanguage();

  // Correlates this configurator session's funnel events (started → steps →
  // submitted → checkout initiated) before a project/access_token exists.
  // Not persisted across reloads — good enough for funnel analysis, not
  // meant to be a durable visitor identity.
  const [sessionId] = useState(() => crypto.randomUUID());

  // Read once, lazily, so a fresh (non-resumed) tab picks up a locally-saved
  // draft on its very first render instead of flashing back to "type" first —
  // a browser back/refresh before the final submit used to lose all progress
  // since nothing was persisted until the project actually saved server-side.
  const [draft] = useState<Draft | null>(() => (initial ? null : loadDraft()));

  const [phase, setPhase] = useState<Phase>(initial ? "details" : (draft?.phase ?? "type"));
  const [projectType, setProjectType] = useState<string | null>(initial?.projectType ?? draft?.projectType ?? null);
  const [answers, setAnswers] = useState<Answers>(initial?.answers ?? draft?.answers ?? {});
  const [stepPos, setStepPos] = useState(draft?.stepPos ?? 0);
  const [clientName, setClientName] = useState(initial?.clientName ?? draft?.clientName ?? "");
  const parsedInitialContact = useMemo(
    () => parseContact(initial?.clientContact ?? draft?.clientContact ?? ""),
    [initial, draft],
  );
  const [contactMethod, setContactMethod] = useState<ContactMethod>(parsedInitialContact.method);
  const [email, setEmail] = useState(parsedInitialContact.email);
  const [phoneDial, setPhoneDial] = useState(parsedInitialContact.dial);
  const [phoneNumber, setPhoneNumber] = useState(parsedInitialContact.phoneNumber);
  const clientContact =
    contactMethod === "email" ? email.trim() : phoneNumber.trim() ? `${phoneDial} ${phoneNumber.replace(/^0+/, "").trim()}` : "";
  const [accessToken, setAccessToken] = useState<string | null>(initial?.accessToken ?? null);
  const [projectCode, setProjectCode] = useState<string | null>(initial?.projectCode ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const trackLink = accessToken && typeof window !== "undefined" ? `${window.location.origin}/track?token=${accessToken}` : "";

  async function copyTrackLink() {
    if (!trackLink) return;
    try {
      await navigator.clipboard.writeText(trackLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — the link is still visible/selectable as text.
    }
  }

  const visibleSteps = useMemo(
    () => (projectType ? getVisibleSteps(projectType, answers) : []),
    [projectType, answers],
  );
  const currentStep = visibleSteps[stepPos];
  const quote = useMemo(
    () => (projectType ? calculateProject(projectType, answers) : null),
    [projectType, answers],
  );

  useEffect(() => {
    if (initial && projectCode && accessToken) {
      const url = new URL(window.location.href);
      url.searchParams.set("token", accessToken);
      window.history.replaceState({}, "", url.toString());
    }
  }, [initial, accessToken, projectCode]);

  // Mirror in-progress state to localStorage on every change, until a real
  // project exists server-side (from then on the URL token is the resume
  // path, and continuing to write here would just overwrite a resumed
  // project's draft with stale local data).
  useEffect(() => {
    if (initial || phase === "done") return;
    if (phase === "type" && !projectType) return;
    saveDraft({ phase, projectType, answers, stepPos, clientName, clientContact });
  }, [initial, phase, projectType, answers, stepPos, clientName, clientContact]);

  useEffect(() => {
    if (phase === "done") clearDraft();
  }, [phase]);

  function chooseType(id: string) {
    setProjectType(id);
    setAnswers({});
    setStepPos(0);
    setPhase("steps");
    void logActivityEvent("configurator_started", { sessionId, metadata: { project_type: id } });
  }

  function setAnswer(stepId: string, value: Answers[string]) {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }

  function next() {
    if (stepPos < visibleSteps.length - 1) {
      setStepPos((p) => p + 1);
      void logActivityEvent("configurator_step", {
        sessionId,
        metadata: { project_type: projectType, step_id: currentStep?.id, step_index: stepPos + 1 },
      });
    } else {
      setPhase("details");
      void logActivityEvent("configurator_details_reached", { sessionId, metadata: { project_type: projectType } });
    }
  }

  function back() {
    if (phase === "details") {
      setPhase("steps");
      return;
    }
    if (stepPos > 0) setStepPos((p) => p - 1);
    else setPhase("type");
  }

  const canAdvance =
    !currentStep ||
    currentStep.optional ||
    currentStep.type === "text" ||
    (currentStep.type === "number" && (answers[currentStep.id] as number) >= 0) ||
    (currentStep.type === "single" && !!answers[currentStep.id]) ||
    (currentStep.type === "multi" && Array.isArray(answers[currentStep.id]) && (answers[currentStep.id] as string[]).length > 0);

  async function handleSubmitDetails() {
    if (!projectType || !quote) return;
    if (!clientName.trim() || !clientContact.trim()) {
      setError(t("config.details.errorRequired"));
      return;
    }
    if (!agreedToTerms) {
      setError(t("legal.error.mustAgree"));
      return;
    }
    setSaving(true);
    setError(null);
    let result;
    try {
      result = await saveProjectConfiguration({
        accessToken,
        clientName,
        clientContact,
        projectType,
        answers,
        quotedPrice: quote.total,
        currency: "EUR",
        quote,
      });
    } catch (err) {
      setSaving(false);
      setError(t("config.details.errorNetwork", { message: err instanceof Error ? err.message : String(err) }));
      return;
    }
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAccessToken(result.accessToken);
    setProjectCode(result.projectCode);
    setPhase("done");
    void logActivityEvent("configurator_submitted", {
      sessionId,
      projectId: result.projectId,
      metadata: { project_type: projectType, quoted_price: quote.total },
    });

    const link = `${window.location.origin}/track?token=${result.accessToken}`;
    const summary = buildWhatsAppMessage(result.projectCode, projectType, quote.total, link, lang);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    window.open(waUrl, "_blank");
  }

  const projectTypeDef = PROJECT_TYPES.find((p) => p.id === projectType);
  const projectTypeLabel = (lang === "es" ? projectTypeDef?.labelEs : projectTypeDef?.label) ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex justify-end">
        <LanguageToggle />
      </div>

      {quote && phase !== "type" ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-bg-raised px-4 py-3">
          <span className="text-sm text-fg-muted">{projectTypeLabel}</span>
          <span className="tabular-nums text-lg font-semibold text-accent">{formatMoney(quote.total, "EUR")}</span>
        </div>
      ) : null}

      {phase === "type" ? (
        <div>
          <h2 className="mb-1 text-xl font-semibold">{t("config.type.title")}</h2>
          <p className="mb-6 text-sm text-fg-muted">{t("config.type.subtitle")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROJECT_TYPES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => chooseType(p.id)}
                className="flex flex-col items-start gap-1 rounded-xl border border-border bg-bg-card px-5 py-4 text-left transition hover:border-accent"
              >
                <span className="font-medium">{lang === "es" ? p.labelEs ?? p.label : p.label}</span>
                <span className="text-xs text-fg-muted">{lang === "es" ? p.helperEs ?? p.helper : p.helper}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "steps" && currentStep ? (
        <div>
          <div className="mb-5 flex gap-1.5">
            {visibleSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= stepPos ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
          <h2 className="mb-1 text-xl font-semibold">
            {lang === "es" ? currentStep.questionEs ?? currentStep.question : currentStep.question}
          </h2>
          {currentStep.helper ? (
            <p className="mb-6 text-sm text-fg-muted">
              {lang === "es" ? currentStep.helperEs ?? currentStep.helper : currentStep.helper}
            </p>
          ) : null}
          <StepRenderer
            step={currentStep}
            value={answers[currentStep.id] as string | string[] | number | undefined}
            onChange={(v) => setAnswer(currentStep.id, v)}
          />
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={back} className="text-sm text-fg-muted hover:text-fg">
              {t("config.steps.back")}
            </button>
            <button
              type="button"
              disabled={!canAdvance}
              onClick={next}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
            >
              {stepPos === visibleSteps.length - 1 ? t("config.steps.review") : t("config.steps.next")}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "details" && quote ? (
        <div>
          <h2 className="mb-1 text-xl font-semibold">{t("config.details.title")}</h2>
          <p className="mb-5 text-sm text-fg-muted">{t("config.details.subtitle")}</p>
          <div className="mb-6 flex flex-col divide-y divide-border rounded-xl border border-border bg-bg-card">
            {quote.lines.map((l) => (
              <div key={`${l.stepId}-${l.optionId}`} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">{translateLineLabel(l, projectType!, answers, lang)}</span>
                <span className="tabular-nums">{formatMoney(l.price, "EUR")}</span>
              </div>
            ))}
            {quote.complexityMultiplier !== 1 ? (
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">{t("config.details.complexityAdjustment")}</span>
                <span className="tabular-nums">×{quote.complexityMultiplier}</span>
              </div>
            ) : null}
            {quote.deliveryMultiplier !== 1 ? (
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">{t("config.details.deliveryAdjustment")}</span>
                <span className="tabular-nums">×{quote.deliveryMultiplier}</span>
              </div>
            ) : null}
            <div className="flex justify-between px-4 py-3 text-base font-semibold">
              <span>{t("config.details.total")}</span>
              <span className="tabular-nums text-accent">{formatMoney(quote.total, "EUR")}</span>
            </div>
          </div>

          {quote.requiresCustomQuote ? (
            <p className="mb-4 rounded-lg border border-pending/40 bg-pending/10 px-4 py-3 text-sm text-pending">
              {t("config.details.customQuoteNote")}
            </p>
          ) : null}

          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg-muted">{t("config.details.yourName")}</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg-muted">{t("config.details.howReach")}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactMethod("email")}
                  className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition ${
                    contactMethod === "email"
                      ? "border-accent bg-accent/10 text-fg"
                      : "border-border bg-bg-raised text-fg-muted hover:text-fg"
                  }`}
                >
                  {t("config.details.contactEmail")}
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("phone")}
                  className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition ${
                    contactMethod === "phone"
                      ? "border-accent bg-accent/10 text-fg"
                      : "border-border bg-bg-raised text-fg-muted hover:text-fg"
                  }`}
                >
                  {t("config.details.contactPhone")}
                </button>
              </div>

              {contactMethod === "email" ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
                />
              ) : (
                <div className="mt-1 flex gap-2">
                  <select
                    value={phoneDial}
                    onChange={(e) => setPhoneDial(e.target.value)}
                    className="w-36 rounded-lg border border-border bg-bg-raised px-2 py-2.5 text-fg outline-none focus:border-accent"
                  >
                    {COUNTRY_CODES.filter((c) => c.dial).map((c) => (
                      <option key={c.name} value={c.dial}>
                        {c.name} ({c.dial})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="8021234567"
                    className="flex-1 rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
                  />
                </div>
              )}
            </div>
          </div>

          <label className="mb-4 flex items-start gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5"
            />
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

          {error ? <p className="mb-4 text-sm text-excluded">{error}</p> : null}

          <div className="flex items-center justify-between">
            <button type="button" onClick={back} className="text-sm text-fg-muted hover:text-fg">
              {t("config.details.edit")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitDetails}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? t("config.details.saving") : t("config.details.continue")}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "done" && quote && projectCode ? (
        <div className="text-center">
          <h2 className="mb-1 text-xl font-semibold">{t("config.done.title", { name: clientName.split(" ")[0] })}</h2>
          <p className="mb-2 text-sm text-fg-muted">{t("config.done.reference")}</p>
          <p className="tabular-nums mb-6 rounded-lg border border-border bg-bg-raised px-4 py-3 text-2xl font-semibold tracking-wide text-accent">
            {projectCode}
          </p>

          <div className="mb-6 rounded-lg border border-border bg-bg-raised p-4 text-left">
            <p className="mb-2 text-sm font-medium">{t("config.done.saveLink.title")}</p>
            <p className="mb-3 text-xs text-fg-muted">{t("config.done.saveLink.body")}</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={trackLink}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 truncate rounded-md border border-border bg-bg px-3 py-2 text-xs text-fg-muted outline-none"
              />
              <button
                type="button"
                onClick={copyTrackLink}
                className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium text-fg transition hover:bg-bg-raised"
              >
                {linkCopied ? t("config.done.copied") : t("config.done.copy")}
              </button>
            </div>
          </div>

          <p className="mb-6 text-sm text-fg-muted">{t("config.done.whatsappNote")}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push(`/start/pay?token=${accessToken}`)}
              className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-hover sm:w-auto"
            >
              {t("config.done.payNow", { amount: formatMoney(quote.total, "EUR") })}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-lg border border-border px-6 py-3 font-medium text-fg transition hover:bg-bg-raised sm:w-auto"
            >
              {t("config.done.chatWhatsapp")}
            </a>
          </div>
          <p className="mt-6 text-xs text-fg-muted">{t("config.done.bookmark")}</p>
        </div>
      ) : null}
    </div>
  );
}

function buildWhatsAppMessage(
  projectCode: string,
  projectType: string,
  total: number,
  trackLink: string,
  lang: Lang,
): string {
  const type = PROJECT_TYPES.find((p) => p.id === projectType);
  const label = (lang === "es" ? type?.labelEs : type?.label) ?? type?.label ?? projectType;
  const lines: string[] = [
    translate(lang, "wa.greeting"),
    ``,
    `${translate(lang, "wa.reference")} ${projectCode}`,
    `${translate(lang, "wa.building")} ${label}`,
    `${translate(lang, "wa.total")} €${total.toFixed(2)}`,
    ``,
    `${translate(lang, "wa.trackingLink")} ${trackLink}`,
  ];
  return lines.join("\n");
}
