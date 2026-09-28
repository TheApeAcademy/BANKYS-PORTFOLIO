"use client";

// Project Builder: the glass pop-up brief. It walks the full pricing catalogue
// (lib/catalogue), counts the initial estimate up live as options are picked,
// grades the project Z1-Z5, saves it, and hands the client a pre-filled
// message for whichever channel they want us to reply on. The estimate is a
// starting point: the final price is confirmed by hand after review.
import { CONTACT } from "@zebraish/lib/contact";
import { getZbLang, tr, translateTree, useZbLang } from "@/lib/zebraish/i18n";
import { gradeNameEs } from "@/lib/zebraish/es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Answers, CatalogueStep } from "@zebraish/lib/catalogue/types";
import { PROJECT_TYPES } from "@/lib/catalogue/catalogue";
import { calculateProject, getProjectType, getVisibleSteps } from "@/lib/catalogue/engine";
import { gradeProject } from "@/lib/catalogue/grade";
import { describeSelections } from "@/lib/catalogue/describe";
import { saveProjectConfiguration } from "@/lib/actions/configurator";
import { logActivityEvent } from "@/lib/actions/activity";
import { openProjectTracker, rememberProjectToken } from "./ProjectTracker";

export const OPEN_BUILDER_EVENT = "zb:open-builder";
export type OpenBuilderDetail = { projectType?: string; idea?: string };

/** Opens the builder from anywhere on the page (nav, hero, idea prompt). */
export function openProjectBuilder(detail: OpenBuilderDetail = {}) {
  window.dispatchEvent(new CustomEvent<OpenBuilderDetail>(OPEN_BUILDER_EVENT, { detail }));
}

const PHONE = CONTACT.whatsapp;
const EMAIL = CONTACT.email;
const SNAP = CONTACT.snapchat;
const ACCENT = "#17c98d";

type Channel = "whatsapp" | "email" | "imessage" | "telegram" | "snapchat";
const CHANNELS: { id: Channel; label: string; handle: string; ph: string }[] = [
  { id: "whatsapp", label: "WhatsApp", handle: "Your WhatsApp number", ph: "+234 802 123 4567" },
  { id: "email", label: "Email", handle: "Your email", ph: "you@brand.com" },
  { id: "imessage", label: "iMessage", handle: "Your iMessage number or Apple ID", ph: "+44 7700 900123" },
  { id: "telegram", label: "Telegram", handle: "Your Telegram username", ph: "@yourname" },
  { id: "snapchat", label: "Snapchat", handle: "Your Snapchat username", ph: "yourname" },
];

type Phase = "type" | "steps" | "contact" | "done";

const money = (n: number) =>
  getZbLang() === "es" ? `${Math.round(n).toLocaleString("es-ES")} €` : "€" + Math.round(n).toLocaleString("en-US");

/** Counts the shown number toward `target` instead of jumping to it. */
function useCountUp(target: number, ms = 750) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = target;
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - t, 3);
      const v = a + (b - a) * e;
      from.current = v;
      setShown(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return shown;
}

function optionPriceTag(price?: number, included?: boolean) {
  if (included) return "Included";
  return price ? `+${money(price)}` : "";
}

function StepOptions({ step, value, onChange }: { step: CatalogueStep; value: Answers[string]; onChange: (v: Answers[string]) => void }) {
  useZbLang();
  if (step.type === "number") {
    const qty = typeof value === "number" ? value : 0;
    const btn: React.CSSProperties = { width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(245,245,247,.2)", background: "rgba(245,245,247,.05)", color: "#f5f5f7", fontSize: 20, cursor: "pointer", fontFamily: "inherit" };
    return translateTree(
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button type="button" style={btn} onClick={() => onChange(Math.max(step.min ?? 0, qty - 1))} aria-label="Less">-</button>
        <span style={{ fontSize: 30, fontWeight: 800, minWidth: 48, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{qty}</span>
        <button type="button" style={btn} onClick={() => onChange(Math.min(step.max ?? 999, qty + 1))} aria-label="More">+</button>
        {step.pricePerUnit ? <span style={{ fontSize: 13, color: "rgba(245,245,247,.55)" }}>{money(step.pricePerUnit)} each</span> : null}
      </div>
    );
  }
  if (step.type === "text") {
    return translateTree(
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Anything we should know: links, references, special features..."
        style={{ width: "100%", boxSizing: "border-box", background: "rgba(245,245,247,.05)", border: "1px solid rgba(245,245,247,.16)", borderRadius: 16, padding: "14px 16px", color: "#f5f5f7", fontFamily: "inherit", fontSize: 15, resize: "vertical", outline: "none" }}
      />
    );
  }
  const multi = step.type === "multi";
  const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === "string" ? [value] : [];
  const pick = (id: string) => {
    if (!multi) return onChange(id);
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };
  return translateTree(
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 10 }}>
      {step.options?.map((o) => {
        const on = selected.includes(o.id);
        const tag = optionPriceTag(o.price, o.included);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => pick(o.id)}
            className="zbpb-opt"
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, textAlign: "left", padding: "14px 16px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit",
              background: on ? "rgba(23,201,141,.16)" : "rgba(245,245,247,.04)", border: `1px solid ${on ? ACCENT : "rgba(245,245,247,.14)"}`, color: "#f5f5f7",
              transition: "background .25s, border-color .25s, transform .25s",
            }}
          >
            <span style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 700 }}>
              <span>{o.label}</span>
              {multi ? <span style={{ width: 16, height: 16, flexShrink: 0, borderRadius: 5, border: `1px solid ${on ? ACCENT : "rgba(245,245,247,.3)"}`, background: on ? ACCENT : "transparent" }} /> : null}
            </span>
            {o.description ? <span style={{ fontSize: 12, color: "rgba(245,245,247,.5)" }}>{o.description}</span> : null}
            {tag ? <span style={{ fontSize: 12, fontWeight: 700, color: o.included ? "rgba(245,245,247,.5)" : ACCENT, fontVariantNumeric: "tabular-nums" }}>{tag}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export default function ProjectBuilder() {
  const lang = useZbLang();
  // Home renders client-only, so ?build=1 (from the Experience and /start) can be read up front.
  const [open, setOpen] = useState(() => typeof location !== "undefined" && new URLSearchParams(location.search).get("build") === "1");
  const [phase, setPhase] = useState<Phase>("type");
  const [projectType, setProjectType] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [stepPos, setStepPos] = useState(0);
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ code: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionId] = useState(() => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())));
  const bodyRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setPhase("type"); setProjectType(null); setAnswers({}); setStepPos(0); setError(""); setSaved(null);
  }, []);

  const choose = useCallback((id: string) => {
    setProjectType(id); setAnswers({}); setStepPos(0); setPhase("steps"); setError("");
    void logActivityEvent("configurator_started", { sessionId, metadata: { project_type: id, source: "builder" } });
  }, [sessionId]);

  // Open on the custom event, on any link to #build / #start-a-project, or on ?build=1.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenBuilderDetail>).detail || {};
      if (saved) reset();
      if (d.idea) setIdea(d.idea);
      if (d.projectType && getProjectType(d.projectType)) choose(d.projectType);
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href='#build'],a[href='#start-a-project'],[data-open-builder]");
      if (!a) return;
      e.preventDefault();
      onOpen(new CustomEvent(OPEN_BUILDER_EVENT, { detail: {} }));
    };
    window.addEventListener(OPEN_BUILDER_EVENT, onOpen);
    document.addEventListener("click", onClick, true);
    const qs = new URLSearchParams(location.search);
    if (qs.get("build") === "1") {
      qs.delete("build");
      history.replaceState(null, "", location.pathname + (qs.toString() ? `?${qs}` : "") + location.hash);
    }
    return () => { window.removeEventListener(OPEN_BUILDER_EVENT, onOpen); document.removeEventListener("click", onClick, true); };
  }, [choose, reset, saved]);

  // Freeze the page (and its smooth-scroll) behind the modal.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = prev; lenis?.start(); removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [phase, stepPos]);

  const steps = useMemo(() => (projectType ? getVisibleSteps(projectType, answers) : []), [projectType, answers]);
  const step = steps[stepPos];
  const quote = useMemo(() => (projectType ? calculateProject(projectType, answers) : null), [projectType, answers]);
  const grade = useMemo(() => (quote ? gradeProject(quote, answers) : null), [quote, answers]);
  const shown = useCountUp(quote?.total ?? 0);
  const typeDef = projectType ? getProjectType(projectType) : null;

  const canNext = !step || step.optional || step.type === "text" || step.type === "number" ||
    (step.type === "single" && !!answers[step.id]) ||
    (step.type === "multi" && Array.isArray(answers[step.id]) && (answers[step.id] as string[]).length > 0);

  const next = () => {
    if (!canNext) return setError("Pick an option to continue.");
    setError("");
    if (stepPos < steps.length - 1) {
      setStepPos(stepPos + 1);
      void logActivityEvent("configurator_step", { sessionId, metadata: { project_type: projectType, step_id: step?.id, step_index: stepPos + 1, source: "builder" } });
    } else {
      setPhase("contact");
      void logActivityEvent("configurator_details_reached", { sessionId, metadata: { project_type: projectType, source: "builder" } });
    }
  };
  const back = () => {
    setError("");
    if (phase === "contact") return setPhase("steps");
    if (stepPos > 0) return setStepPos(stepPos - 1);
    setPhase("type");
  };

  // Every selection, in words, for the message we receive.
  const selectionLines = useMemo(() => (projectType ? describeSelections(projectType, answers) : []), [projectType, answers]);
  const selectionLinesShown = useMemo(() => (projectType ? describeSelections(projectType, answers, lang) : []), [projectType, answers, lang]);

  const channelDef = CHANNELS.find((c) => c.id === channel)!;
  const contactLine = `${channelDef.label}: ${handle.trim()}${channel !== "email" && email.trim() ? ` · ${email.trim()}` : ""}`;

  const message = useMemo(() => {
    if (!quote || !grade || !typeDef) return "";
    const track = saved ? `${location.origin}/track?token=${saved.token}` : "";
    // The client sends this themselves, so it reads in their language.
    const es = lang === "es";
    return [
      es ? `Nuevo proyecto Zebraish${saved ? ` ${saved.code}` : ""}` : `New Zebraish project${saved ? ` ${saved.code}` : ""}`,
      `${es ? "Nombre" : "Name"}: ${name.trim()}`,
      `${es ? "Proyecto" : "Building"}: ${es ? typeDef.labelEs ?? typeDef.label : typeDef.label}`,
      `${es ? "Grado" : "Grade"}: ${grade.code} ${es ? gradeNameEs(grade.name) : grade.name}`,
      `${es ? "Estimación inicial" : "Initial estimate"}: ${money(quote.total)}`,
      `${es ? "Podéis responderme por" : "Reply to me on"} ${contactLine}`,
      idea.trim() ? `\n${es ? "Idea" : "Idea"}: ${idea.trim()}` : "",
      `\n${es ? "Selección" : "Selections"}:\n${selectionLinesShown.map((l) => `- ${l}`).join("\n")}`,
      track ? `\n${es ? "Seguimiento" : "Track"}: ${track}` : "",
    ].filter(Boolean).join("\n");
  }, [quote, grade, typeDef, saved, name, contactLine, idea, selectionLinesShown, lang]);

  const submit = async () => {
    if (!projectType || !quote || !grade || saving) return;
    const h = handle.trim();
    if (!name.trim()) return setError("Add your name.");
    if (!h) { const what = tr(channelDef.handle); return setError(`${getZbLang() === "es" ? "Añade" : "Add"} ${what.charAt(0).toLowerCase()}${what.slice(1)}.`); }
    if (channel === "email" && !/^\S+@\S+\.\S+$/.test(h)) return setError("Add a valid email.");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("That email doesn't look right.");
    setSaving(true); setError("");
    let res: Awaited<ReturnType<typeof saveProjectConfiguration>>;
    try {
      res = await saveProjectConfiguration({
        accessToken: null,
        clientName: name.trim(),
        clientContact: contactLine,
        projectType,
        answers: {
          ...answers,
          source: "builder",
          idea: idea.trim() || undefined,
          grade: grade.code,
          grade_name: grade.name,
          contact_channel: channel,
          contact_handle: h,
          email: channel === "email" ? h : email.trim() || undefined,
          price_status: "initial_estimate",
          initial_estimate: quote.total,
        },
        quotedPrice: quote.total,
        currency: "EUR",
        quote,
        notifyDetails: [
          `Building: ${typeDef?.label ?? projectType}`,
          `Grade: ${grade.code} ${grade.name}`,
          `Initial estimate: ${money(quote.total)}`,
          `Reply on ${contactLine}`,
          ...(idea.trim() ? [`Idea: ${idea.trim()}`] : []),
          ...selectionLines,
        ],
      });
    } catch {
      res = { ok: false, error: "network" };
    }
    setSaving(false);
    if (!res.ok) return setError("We couldn't save your brief. Try again, or send it straight to us on WhatsApp.");
    setSaved({ code: res.projectCode, token: res.accessToken });
    rememberProjectToken(res.accessToken);
    setPhase("done");
    void logActivityEvent("configurator_submitted", { sessionId, projectId: res.projectId, metadata: { project_type: projectType, quoted_price: quote.total, grade: grade.code, source: "builder" } });
  };

  const sendLinks = useMemo(() => {
    const t = encodeURIComponent(message);
    const subject = encodeURIComponent(`${lang === "es" ? "Nuevo proyecto" : "New project"}${saved ? ` ${saved.code}` : ""} (${grade?.code ?? ""})`);
    return {
      whatsapp: `https://wa.me/${PHONE}?text=${t}`,
      email: `mailto:${EMAIL}?subject=${subject}&body=${t}`,
      imessage: `sms:+${PHONE}&body=${t}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(saved ? `${location.origin}/track?token=${saved.token}` : location.origin)}&text=${t}`,
      snapchat: `https://www.snapchat.com/add/${SNAP}`,
    } as Record<Channel, string>;
  }, [message, saved, grade, lang]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked: message stays visible */ }
  };

  if (!open) return null;

  const gradeLabel = grade ? (getZbLang() === "es" ? gradeNameEs(grade.name) : grade.name) : "";

  const progress = phase === "type" ? 0 : phase === "steps" ? (stepPos + 1) / (steps.length + 1) : 1;
  const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(245,245,247,.5)" };
  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "rgba(245,245,247,.05)", border: "1px solid rgba(245,245,247,.16)", borderRadius: 14, padding: "13px 15px", color: "#f5f5f7", fontFamily: "inherit", fontSize: 15, outline: "none" };
  const primary: React.CSSProperties = { fontFamily: "inherit", background: "#f5f5f7", color: "#040405", border: "none", padding: "14px 28px", borderRadius: 100, fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" };
  const ghost: React.CSSProperties = { fontFamily: "inherit", background: "none", border: "1px solid rgba(245,245,247,.2)", color: "#f5f5f7", padding: "13px 22px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", display: "inline-block" };

  return translateTree(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Build your project"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{ position: "fixed", inset: 0, zIndex: 30000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(4,4,5,.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontFamily: "Inter,-apple-system,sans-serif", color: "#f5f5f7", animation: "zbpb-fade .35s ease both" }}
    >
      <style>{"@keyframes zbpb-fade{from{opacity:0}to{opacity:1}}@keyframes zbpb-in{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}@keyframes zbpb-step{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}.zbpb-opt:hover{transform:translateY(-2px);border-color:rgba(245,245,247,.45)!important}"}</style>
      <div
        style={{
          position: "relative", width: "min(820px,100%)", maxHeight: "min(90vh,900px)", display: "flex", flexDirection: "column", borderRadius: 30, overflow: "hidden",
          background: "linear-gradient(145deg,rgba(245,245,247,.10),rgba(245,245,247,.03) 55%,rgba(23,201,141,.08))",
          backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          border: "1px solid rgba(245,245,247,.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.18),0 40px 120px rgba(0,0,0,.6)",
          animation: "zbpb-in .5s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        {/* Header: title, live estimate and grade */}
        <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid rgba(245,245,247,.08)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <div style={label}>Zebraish Studio</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em", marginTop: 4 }}>{typeDef ? typeDef.label : "Build your project"}</div>
          </div>
          {quote && grade && phase !== "type" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={label}>Initial estimate</div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums", color: ACCENT }}>{money(shown)}</div>
              </div>
              <div title={grade.blurb} style={{ padding: "8px 12px", borderRadius: 14, border: `1px solid ${grade.color}`, background: `${grade.color}22`, textAlign: "center", minWidth: 58, transition: "all .4s" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: grade.color }}>{grade.code}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,247,.7)" }}>{gradeLabel}</div>
              </div>
            </div>
          ) : null}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(245,245,247,.2)", background: "rgba(245,245,247,.05)", color: "#f5f5f7", fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>×</button>
          <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: `${progress * 100}%`, background: ACCENT, transition: "width .5s cubic-bezier(.16,1,.3,1)" }} />
        </div>

        {/* Body */}
        <div ref={bodyRef} data-lenis-prevent style={{ padding: "24px 26px", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", flex: 1 }}>
          <div key={`${phase}-${stepPos}`} style={{ animation: "zbpb-step .45s cubic-bezier(.16,1,.3,1) both" }}>
            {phase === "type" ? (
              <>
                <div style={label}>01 · What are we creating?</div>
                <h3 style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 900, letterSpacing: "-.03em", margin: "8px 0 6px" }}>Pick what you&apos;re building.</h3>
                <p style={{ margin: "0 0 20px", color: "rgba(245,245,247,.55)", fontSize: 14 }}>Every choice after this updates your estimate live.</p>
                {idea ? (
                  <div style={{ marginBottom: 18, padding: "12px 14px", borderRadius: 14, background: "rgba(245,245,247,.04)", border: "1px dashed rgba(245,245,247,.18)", fontSize: 14, color: "rgba(245,245,247,.75)" }}>
                    <span style={{ ...label, display: "block", marginBottom: 4 }}>Your idea</span>{idea}
                  </div>
                ) : null}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
                  {PROJECT_TYPES.map((p) => (
                    <button key={p.id} type="button" className="zbpb-opt" onClick={() => choose(p.id)} style={{ textAlign: "left", padding: "16px 18px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", color: "#f5f5f7", background: projectType === p.id ? "rgba(23,201,141,.16)" : "rgba(245,245,247,.04)", border: `1px solid ${projectType === p.id ? ACCENT : "rgba(245,245,247,.14)"}`, transition: "transform .25s, border-color .25s" }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(245,245,247,.5)", marginTop: 3 }}>{p.helper}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {phase === "steps" && step ? (
              <>
                <div style={label}>{String(stepPos + 2).padStart(2, "0")} · Step {stepPos + 1} of {steps.length}</div>
                <h3 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.03em", margin: "8px 0 6px" }}>{step.question}</h3>
                <p style={{ margin: "0 0 20px", color: "rgba(245,245,247,.55)", fontSize: 14 }}>{step.helper ?? (step.type === "multi" ? "Pick everything that applies." : step.optional ? "Optional. Skip if it doesn't apply." : "Pick one.")}</p>
                <StepOptions step={step} value={answers[step.id]} onChange={(v) => { setError(""); setAnswers((a) => ({ ...a, [step.id]: v })); }} />
              </>
            ) : null}

            {phase === "contact" && quote && grade ? (
              <>
                <div style={label}>Last step · Where do we reply?</div>
                <h3 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.03em", margin: "8px 0 6px" }}>Your brief is graded {grade.code} {gradeLabel}.</h3>
                <p style={{ margin: "0 0 20px", color: "rgba(245,245,247,.55)", fontSize: 14, lineHeight: 1.6 }}>
                  {grade.blurb} Your initial estimate is <strong style={{ color: "#f5f5f7" }}>{money(quote.total)}</strong>. We review every brief personally and text you the final price, usually within 48 hours.
                </p>
                <div style={{ display: "grid", gap: 14 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={label}>Describe it in a sentence or two</span>
                    <textarea rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A booking site for my salon with WhatsApp reminders..." style={{ ...input, resize: "vertical" }} />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={label}>Your name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={getZbLang() === "es" ? "Lucía" : "Banks"} style={input} />
                  </label>
                  <div style={{ display: "grid", gap: 8 }}>
                    <span style={label}>Text me back on</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {CHANNELS.map((c) => (
                        <button key={c.id} type="button" onClick={() => { setChannel(c.id); setHandle(""); setError(""); }} style={{ fontFamily: "inherit", padding: "9px 16px", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 700, background: channel === c.id ? "#f5f5f7" : "rgba(245,245,247,.05)", color: channel === c.id ? "#040405" : "#f5f5f7", border: `1px solid ${channel === c.id ? "#f5f5f7" : "rgba(245,245,247,.16)"}` }}>{c.label}</button>
                      ))}
                    </div>
                  </div>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={label}>{channelDef.handle}</span>
                    <input value={handle} type={channel === "email" ? "email" : "text"} onChange={(e) => setHandle(e.target.value)} placeholder={channelDef.ph} style={input} />
                  </label>
                  {channel !== "email" ? (
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={label}>Email (optional, for the written proposal)</span>
                      <input value={email} type="email" onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" style={input} />
                    </label>
                  ) : null}
                  <details style={{ borderRadius: 14, border: "1px solid rgba(245,245,247,.1)", padding: "12px 14px", background: "rgba(245,245,247,.03)" }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700 }}>How the estimate adds up</summary>
                    <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 13 }}>
                      {quote.lines.map((l) => (
                        <div key={`${l.stepId}-${l.optionId}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "rgba(245,245,247,.7)" }}>
                          <span>{l.label}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{money(l.price)}</span>
                        </div>
                      ))}
                      {quote.complexityMultiplier !== 1 ? <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(245,245,247,.7)" }}><span>Complexity</span><span>×{quote.complexityMultiplier}</span></div> : null}
                      {quote.deliveryMultiplier !== 1 ? <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(245,245,247,.7)" }}><span>Delivery speed</span><span>×{quote.deliveryMultiplier}</span></div> : null}
                    </div>
                  </details>
                </div>
              </>
            ) : null}

            {phase === "done" && saved && quote && grade ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={label}>Brief received · {saved.code}</div>
                <div style={{ margin: "18px auto 10px", width: 96, height: 96, borderRadius: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${grade.color}`, background: `${grade.color}22` }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: grade.color }}>{grade.code}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>{gradeLabel}</div>
                </div>
                <h3 style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 900, letterSpacing: "-.03em", margin: "8px 0 6px" }}>Initial estimate {money(shown)}</h3>
                <p style={{ margin: "0 auto 22px", maxWidth: 500, color: "rgba(245,245,247,.6)", fontSize: 14, lineHeight: 1.65 }}>
                  We&apos;ve got your brief. We review it personally and text you the final price on {channelDef.label}. Send it to us now to skip the queue.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  <a href={sendLinks[channel]} target="_blank" rel="noreferrer" onClick={channel === "snapchat" ? copy : undefined} style={{ ...primary, textDecoration: "none", display: "inline-block" }}>
                    {channel === "snapchat" ? "Copy brief + open Snapchat" : `Send on ${channelDef.label} →`}
                  </a>
                  {CHANNELS.filter((c) => c.id !== channel).map((c) => (
                    <a key={c.id} href={sendLinks[c.id]} target="_blank" rel="noreferrer" onClick={c.id === "snapchat" ? copy : undefined} style={ghost}>{c.label}</a>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 20, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  <button type="button" onClick={copy} style={{ background: "none", border: "none", color: "rgba(245,245,247,.6)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>{copied ? "Copied" : "Copy brief"}</button>
                  <button type="button" onClick={() => { setOpen(false); openProjectTracker(saved.token); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT }}>Track your project →</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer controls */}
        {phase !== "done" ? (
          <div style={{ padding: "14px 26px 18px", borderTop: "1px solid rgba(245,245,247,.08)", display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={phase === "type" ? () => setOpen(false) : back} style={{ fontFamily: "inherit", background: "none", border: "none", color: "rgba(245,245,247,.6)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
              {phase === "type" ? "Close" : "← Back"}
            </button>
            <span style={{ flex: 1, fontSize: 13, color: "#ff6b8b", textAlign: "center" }}>{error}</span>
            {phase === "steps" ? (
              <button type="button" onClick={next} style={{ ...primary, opacity: canNext ? 1 : .45 }}>{stepPos === steps.length - 1 ? "Review →" : step?.optional && answers[step.id] === undefined ? "Skip →" : "Continue →"}</button>
            ) : null}
            {phase === "contact" ? (
              <button type="button" onClick={submit} disabled={saving} style={{ ...primary, opacity: saving ? .5 : 1 }}>{saving ? "Sending..." : "Send my brief →"}</button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
