"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_TYPES } from "@/lib/catalogue/catalogue";
import { calculateProject, getVisibleSteps } from "@/lib/catalogue/engine";
import type { Answers } from "@zebraish/lib/catalogue/types";
import { saveProjectConfiguration } from "@/lib/actions/configurator";
import { StepRenderer } from "./StepRenderer";
import { formatMoney } from "@zebraish/lib/format";
import { COUNTRY_CODES } from "@/lib/countries";

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

type Phase = "type" | "steps" | "details" | "done";

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

  const [phase, setPhase] = useState<Phase>(initial ? "details" : "type");
  const [projectType, setProjectType] = useState<string | null>(initial?.projectType ?? null);
  const [answers, setAnswers] = useState<Answers>(initial?.answers ?? {});
  const [stepPos, setStepPos] = useState(0);
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const parsedInitialContact = useMemo(() => parseContact(initial?.clientContact ?? ""), [initial]);
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

  function chooseType(id: string) {
    setProjectType(id);
    setAnswers({});
    setStepPos(0);
    setPhase("steps");
  }

  function setAnswer(stepId: string, value: Answers[string]) {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }

  function next() {
    if (stepPos < visibleSteps.length - 1) {
      setStepPos((p) => p + 1);
    } else {
      setPhase("details");
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
      setError("Please enter your name and a way to reach you.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveProjectConfiguration({
      accessToken,
      clientName,
      clientContact,
      projectType,
      answers,
      quotedPrice: quote.total,
      currency: "EUR",
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAccessToken(result.accessToken);
    setProjectCode(result.projectCode);
    setPhase("done");

    const summary = buildWhatsAppMessage(result.projectCode, projectType, answers, quote.total);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    window.open(waUrl, "_blank");
  }

  const projectTypeLabel = PROJECT_TYPES.find((p) => p.id === projectType)?.label ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {quote && phase !== "type" ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-bg-raised px-4 py-3">
          <span className="text-sm text-fg-muted">{projectTypeLabel}</span>
          <span className="tabular-nums text-lg font-semibold text-accent">{formatMoney(quote.total, "EUR")}</span>
        </div>
      ) : null}

      {phase === "type" ? (
        <div>
          <h2 className="mb-1 text-xl font-semibold">What are you building?</h2>
          <p className="mb-6 text-sm text-fg-muted">Pick one to see the questions that actually matter.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROJECT_TYPES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => chooseType(p.id)}
                className="flex flex-col items-start gap-1 rounded-xl border border-border bg-bg-card px-5 py-4 text-left transition hover:border-accent"
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-xs text-fg-muted">{p.helper}</span>
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
          <h2 className="mb-1 text-xl font-semibold">{currentStep.question}</h2>
          {currentStep.helper ? <p className="mb-6 text-sm text-fg-muted">{currentStep.helper}</p> : null}
          <StepRenderer
            step={currentStep}
            value={answers[currentStep.id] as string | string[] | number | undefined}
            onChange={(v) => setAnswer(currentStep.id, v)}
          />
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={back} className="text-sm text-fg-muted hover:text-fg">
              ← Back
            </button>
            <button
              type="button"
              disabled={!canAdvance}
              onClick={next}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
            >
              {stepPos === visibleSteps.length - 1 ? "Review →" : "Next →"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "details" && quote ? (
        <div>
          <h2 className="mb-1 text-xl font-semibold">Your project</h2>
          <p className="mb-5 text-sm text-fg-muted">Here&apos;s everything you selected.</p>
          <div className="mb-6 flex flex-col divide-y divide-border rounded-xl border border-border bg-bg-card">
            {quote.lines.map((l) => (
              <div key={`${l.stepId}-${l.optionId}`} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">{l.label}</span>
                <span className="tabular-nums">{formatMoney(l.price, "EUR")}</span>
              </div>
            ))}
            {quote.complexityMultiplier !== 1 ? (
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">Complexity adjustment</span>
                <span className="tabular-nums">×{quote.complexityMultiplier}</span>
              </div>
            ) : null}
            {quote.deliveryMultiplier !== 1 ? (
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-fg-muted">Delivery speed adjustment</span>
                <span className="tabular-nums">×{quote.deliveryMultiplier}</span>
              </div>
            ) : null}
            <div className="flex justify-between px-4 py-3 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-accent">{formatMoney(quote.total, "EUR")}</span>
            </div>
          </div>

          {quote.requiresCustomQuote ? (
            <p className="mb-4 rounded-lg border border-pending/40 bg-pending/10 px-4 py-3 text-sm text-pending">
              You added a note we&apos;ll need to review manually — we&apos;ll follow up with a final quote before anything&apos;s charged.
            </p>
          ) : null}

          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg-muted">Your name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-fg outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg-muted">How should we reach you?</label>
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
                  Email
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
                  Phone
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

          {error ? <p className="mb-4 text-sm text-excluded">{error}</p> : null}

          <div className="flex items-center justify-between">
            <button type="button" onClick={back} className="text-sm text-fg-muted hover:text-fg">
              ← Edit
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitDetails}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue →"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "done" && quote && projectCode ? (
        <div className="text-center">
          <h2 className="mb-1 text-xl font-semibold">You&apos;re set, {clientName.split(" ")[0]}.</h2>
          <p className="mb-2 text-sm text-fg-muted">Your project reference:</p>
          <p className="tabular-nums mb-6 rounded-lg border border-border bg-bg-raised px-4 py-3 text-2xl font-semibold tracking-wide text-accent">
            {projectCode}
          </p>
          <p className="mb-6 text-sm text-fg-muted">
            WhatsApp should have opened with your project details — send it across and we&apos;ll pick up the
            conversation. Ready to lock it in?
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push(`/start/pay?token=${accessToken}`)}
              className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-hover sm:w-auto"
            >
              Pay now — {formatMoney(quote.total, "EUR")}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-lg border border-border px-6 py-3 font-medium text-fg transition hover:bg-bg-raised sm:w-auto"
            >
              Chat on WhatsApp →
            </a>
          </div>
          <p className="mt-6 text-xs text-fg-muted">
            Bookmark this page — you can come back anytime to review, edit, or pay later.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function buildWhatsAppMessage(projectCode: string, projectType: string, answers: Answers, total: number): string {
  const label = PROJECT_TYPES.find((p) => p.id === projectType)?.label ?? projectType;
  const lines: string[] = [
    `Hi Zebraish! I just configured a project.`,
    ``,
    `*Reference:* ${projectCode}`,
    `*Building:* ${label}`,
    `*Total:* €${total.toFixed(2)}`,
  ];
  return lines.join("\n");
}
