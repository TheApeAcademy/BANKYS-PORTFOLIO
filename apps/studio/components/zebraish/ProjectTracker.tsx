"use client";

// Project Tracker: the client's glass view of their project. Opened from the
// private link (/track?token=..., which lands here as ?track=...), from the
// builder's confirmation, or by project code + the contact they gave us.
// Shows grade, estimate or confirmed price (Pay once confirmed), selections,
// live progress and the message thread.
import { track } from "@/lib/track";
import { getZbLang, tr, translateTree, useZbLang } from "@/lib/zebraish/i18n";
import { gradeNameEs } from "@/lib/zebraish/es";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Answers } from "@zebraish/lib/catalogue/types";
import { getProjectType } from "@/lib/catalogue/engine";
import { describeSelections } from "@/lib/catalogue/describe";
import { loadTrackerView, findProjectAccess, sendTrackerMessage, type TrackerView } from "@/lib/actions/client-tracker";
import { GlassModal, glass } from "./GlassModal";

export const OPEN_TRACKER_EVENT = "zb:open-tracker";
const TOKEN_KEY = "zb-track-token";

/** Opens the tracker; with a token it goes straight to that project. */
export function openProjectTracker(token?: string) {
  window.dispatchEvent(new CustomEvent<{ token?: string }>(OPEN_TRACKER_EVENT, { detail: { token } }));
}

export function rememberProjectToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* per-device convenience only */ }
}
function recalledToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

const STATUS: Record<string, string> = {
  lead: "Brief received", configuration_started: "Brief in progress", checkout_initiated: "Awaiting payment", payment_pending: "Awaiting payment",
  awaiting_payment: "Awaiting payment", draft: "Brief in progress", payment_confirmed: "Paid · starting soon", awaiting_information: "Waiting on you",
  in_queue: "In the queue", in_progress: "In progress", internal_review: "Internal review", client_review: "Ready for your review",
  revision_requested: "Revision requested", revision_in_progress: "Revising", completed: "Completed", closed: "Closed", cancelled: "Cancelled", refunded: "Refunded",
};

const money = (n: number, cur = "EUR") => {
  const sym = ({ EUR: "€", GBP: "£", USD: "$", NGN: "₦" } as Record<string, string>)[cur] ?? cur;
  return getZbLang() === "es" ? `${Math.round(n).toLocaleString("es-ES")} ${sym}` : sym + Math.round(n).toLocaleString("en-US");
};

function useCountUp(target: number, ms = 900) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now(), a = from.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms), v = a + (target - a) * (1 - Math.pow(1 - t, 3));
      from.current = v; setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return shown;
}

function Lookup({ onFound, initialError }: { onFound: (token: string) => void; initialError?: string }) {
  useZbLang();
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const res = await findProjectAccess(code, contact).catch(() => ({ error: "Couldn't reach us. Try again." }));
    setBusy(false);
    if ("token" in res) { track("tracker_lookup_found"); onFound(res.token); } else { track("tracker_lookup_failed"); setError(res.error); }
  };
  return translateTree(
    <form onSubmit={submit}>
      <div style={glass.label}>Track a project</div>
      <h3 style={glass.h3}>Where&apos;s my project at?</h3>
      <p style={glass.sub}>Use the private link we sent you, or enter your project code with the phone number, email or handle you gave us.</p>
      <div style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={glass.label}>Project code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ZB-00012" autoCapitalize="characters" style={glass.input} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={glass.label}>Phone, email or handle you used</span>
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+234 802 123 4567" style={glass.input} />
        </label>
        {error ? <p style={{ ...glass.error, margin: 0 }}>{error}</p> : null}
        <div><button type="submit" disabled={busy} style={{ ...glass.primary, opacity: busy ? .5 : 1 }}>{busy ? "Looking..." : "Show my project →"}</button></div>
      </div>
    </form>
  );
}

function Tracker({ token, view, onRefresh, onSwitch }: { token: string; view: Extract<TrackerView, { ok: true }>; onRefresh: (v: TrackerView) => void; onSwitch: () => void }) {
  const lang = useZbLang();
  const { overview: o, tracker: t, messages } = view;
  const cfg = o.configuration as Answers & { grade?: string; grade_name?: string; idea?: string; initial_estimate?: number };
  const price = useCountUp(Number(o.price ?? 0));
  const pct = Math.round(Number(t?.percent_complete ?? 0));
  const typeLabel = (o.project_type && getProjectType(o.project_type)?.label) || "Project";
  const selections = o.project_type ? describeSelections(o.project_type, cfg, lang) : [];
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState("");

  const send = async () => {
    if (sending) return;
    setSending(true); setMsgError("");
    const res = await sendTrackerMessage(token, msg).catch(() => ({ error: "Couldn't send. Try again.", messages: undefined }));
    setSending(false);
    if (res.error) return setMsgError(res.error);
    track("tracker_message_sent");
    setMsg("");
    if (res.messages) onRefresh({ ...view, messages: res.messages });
  };

  const card: React.CSSProperties = { borderRadius: 20, border: "1px solid rgba(245,245,247,.1)", background: "rgba(245,245,247,.035)", padding: "18px 20px" };
  return translateTree(
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={glass.label}>{o.project_code} · {typeLabel}</div>
          <h3 style={{ ...glass.h3, marginBottom: 0 }}>{o.first_name ? `Hey ${o.first_name}.` : "Your project."}</h3>
        </div>
        <span style={{ padding: "7px 14px", borderRadius: 100, border: `1px solid ${glass.accent}`, background: "rgba(23,201,141,.12)", fontSize: 12, fontWeight: 700 }}>{STATUS[o.status] ?? o.status}</span>
      </div>

      {/* Price + grade */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={glass.label}>{o.price_confirmed ? "Final price" : "Initial estimate"}</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-.02em", color: glass.accent, fontVariantNumeric: "tabular-nums" }}>{o.price ? money(price, o.currency) : "Pending"}</div>
          <div style={{ fontSize: 13, color: "rgba(245,245,247,.55)", marginTop: 2 }}>
            {o.price_confirmed
              ? cfg.initial_estimate && Number(cfg.initial_estimate) !== Number(o.price) ? `Confirmed after review (estimate was ${money(Number(cfg.initial_estimate), o.currency)}).` : "Confirmed after review."
              : "We're reviewing your brief. We'll text you the final price, usually within 48 hours."}
          </div>
        </div>
        {cfg.grade ? (
          <div style={{ padding: "10px 14px", borderRadius: 16, border: "1px solid rgba(245,245,247,.2)", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{cfg.grade}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,245,247,.6)" }}>{lang === "es" && cfg.grade_name ? gradeNameEs(String(cfg.grade_name)) : cfg.grade_name}</div>
          </div>
        ) : null}
        {o.payable ? <a href={`/start/pay?token=${encodeURIComponent(token)}`} style={glass.primary}>Pay {o.price ? money(Number(o.price), o.currency) : ""} →</a> : null}
      </div>

      {/* Progress */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <span style={glass.label}>Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{t?.stages?.length ? `${pct}%${t.current_stage_label ? ` · ${tr(t.current_stage_label)}` : ""}` : "Starting soon"}</span>
        </div>
        <div style={{ height: 6, borderRadius: 100, background: "rgba(245,245,247,.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 100, background: glass.accent, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />
        </div>
        {t?.hold_state ? <p style={{ margin: "12px 0 0", fontSize: 13, color: "#e8a93c" }}>{t.hold_state === "awaiting_client" ? "We're waiting on something from you. Check your messages below." : "This project is paused for now. We'll message you here."}</p> : null}
        {t?.stages?.length ? (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {t.stages.map((s) => (
              <div key={s.stage_order} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: s.status === "not_started" ? "rgba(245,245,247,.45)" : "#f5f5f7" }}>
                <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#040405", border: `1px solid ${s.status === "not_started" ? "rgba(245,245,247,.25)" : glass.accent}`, background: s.status === "complete" ? glass.accent : s.status === "in_progress" ? "rgba(23,201,141,.25)" : "transparent" }}>{s.status === "complete" ? "✓" : ""}</span>
                {s.stage_label}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Brief */}
      {cfg.idea || selections.length ? (
        <details style={card}>
          <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Your brief</summary>
          {cfg.idea ? <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(245,245,247,.8)", lineHeight: 1.6 }}>{String(cfg.idea)}</p> : null}
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, display: "grid", gap: 5, fontSize: 13, color: "rgba(245,245,247,.65)" }}>
            {selections.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </details>
      ) : null}

      {/* Messages */}
      <div style={card}>
        <div style={{ ...glass.label, marginBottom: 12 }}>Messages</div>
        <div style={{ display: "grid", gap: 8, maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
          {messages.length ? messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.sender_type === "client" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 16, fontSize: 14, lineHeight: 1.5, background: m.sender_type === "client" ? "#f5f5f7" : "rgba(245,245,247,.06)", color: m.sender_type === "client" ? "#040405" : "#f5f5f7", border: "1px solid rgba(245,245,247,.1)" }}>
                {m.sender_type !== "client" ? <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6, marginBottom: 3 }}>{m.sender_label || "Zebraish"}</div> : null}
                {m.body}
              </div>
            </div>
          )) : <p style={{ margin: 0, fontSize: 13, color: "rgba(245,245,247,.5)" }}>No messages yet. Ask us anything here.</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void send(); }} placeholder="Write a message..." style={glass.input} />
          <button type="button" onClick={() => void send()} disabled={sending} style={{ ...glass.primary, padding: "12px 20px", opacity: sending ? .5 : 1 }}>{sending ? "..." : "Send"}</button>
        </div>
        {msgError ? <p style={{ ...glass.error, margin: "8px 0 0" }}>{msgError}</p> : null}
      </div>

      <button type="button" onClick={onSwitch} style={{ justifySelf: "start", background: "none", border: "none", padding: 0, color: "rgba(245,245,247,.5)", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>Track a different project</button>
    </div>
  );
}

export default function ProjectTracker() {
  useZbLang();
  // Home renders client-only, so the link's ?track= token can be read up front.
  const [token, setToken] = useState<string | null>(() => {
    if (typeof location === "undefined") return null;
    const q = new URLSearchParams(location.search).get("track");
    return q && q !== "1" ? q : null;
  });
  const [open, setOpen] = useState(() => typeof location !== "undefined" && new URLSearchParams(location.search).has("track"));
  const [view, setView] = useState<TrackerView | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (tk: string) => {
    setLoading(true);
    const v = await loadTrackerView(tk).catch((): TrackerView => ({ ok: false, error: "Couldn't reach us. Try again in a moment." }));
    setLoading(false);
    setView(v);
    if (v.ok) rememberProjectToken(tk);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const tk = (e as CustomEvent<{ token?: string }>).detail?.token ?? recalledToken();
      setView(null);
      setToken(tk ?? null);
      setOpen(true);
      track("tracker_opened", { with_link: !!tk });
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest?.("a[href='#track'],a[href='/track'],[data-open-tracker]")) return;
      e.preventDefault();
      onOpen(new CustomEvent(OPEN_TRACKER_EVENT, { detail: {} }));
    };
    window.addEventListener(OPEN_TRACKER_EVENT, onOpen);
    document.addEventListener("click", onClick, true);
    const qs = new URLSearchParams(location.search);
    if (qs.has("track")) {
      qs.delete("track");
      history.replaceState(null, "", location.pathname + (qs.toString() ? `?${qs}` : "") + location.hash);
    }
    return () => { window.removeEventListener(OPEN_TRACKER_EVENT, onOpen); document.removeEventListener("click", onClick, true); };
  }, []);

  useEffect(() => {
    if (!open || !token || view) return;
    let live = true;
    void (async () => { if (live) await load(token); })();
    return () => { live = false; };
  }, [open, token, view, load]);

  const close = useCallback(() => setOpen(false), []);
  if (!open) return null;

  return translateTree(
    <GlassModal title="Your project" kicker="Zebraish Studio · Tracker" onClose={close} width={760}>
      {token && (loading || !view) ? (
        <p style={{ color: "rgba(245,245,247,.6)", fontSize: 14 }}>Loading your project...</p>
      ) : token && view?.ok ? (
        <Tracker token={token} view={view} onRefresh={setView} onSwitch={() => { setToken(null); setView(null); }} />
      ) : (
        <Lookup initialError={view && !view.ok ? view.error : undefined} onFound={(tk) => { setView(null); setToken(tk); }} />
      )}
    </GlassModal>
  );
}
