"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SITES, type DeviceKind, type Site } from "@/lib/zebraish/sites";
import { translateTree, tr, useZbLang } from "@/lib/zebraish/i18n";

// Selected work as an endless row of devices, one work per device. Native
// horizontal scrolling with snap points does the moving (smooth on phones, and
// trackpads swipe sideways for free); mouse users can also drag or use the
// arrows. Three copies of the list sit side by side and the view quietly jumps
// back to the middle copy whenever it settles in an outer one, so it loops.
// Screens show screenshots, never live pages, to keep the section light.

const N = SITES.length;
const COPIES = 3;

type Part = { s: CSSProperties; screen?: boolean; kind?: "bar" | "island" | "punch" | "crease" | "chin" };

// Materials. Space-grey and silver aluminium catch the light on their edges;
// bezels are black glass; screens get a glass reflection in Device().
const SG = "linear-gradient(150deg,#686b73 0%,#303238 22%,#1b1c20 50%,#35373d 78%,#70737b 100%)";
const SILVER = "linear-gradient(150deg,#f2f3f5 0%,#b4b7be 38%,#858890 68%,#d7d9de 100%)";
const STAND = "linear-gradient(90deg,#7d8087,#e6e8ec 42%,#c3c6cc 58%,#777a81)";
const RIM = "inset 0 0 0 1px rgba(255,255,255,.14), inset 0 1.5px 1px rgba(255,255,255,.3), inset 0 -2px 3px rgba(0,0,0,.55)";
const BEZEL = "#050506";
const TI = "linear-gradient(150deg,#8b8a86 0%,#4a4946 24%,#2c2b29 50%,#4d4c49 76%,#908f8a 100%)"; // titanium
const BTN: CSSProperties = { background: SG, borderRadius: 2, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)" };

// Each device: outer aspect ratio (width / height) and its parts, positioned in % of the outer box.
const DEVICES: Record<DeviceKind, { ar: number; parts: Part[] }> = {
  imac: { ar: 1.2, parts: [
    { s: { left: "41%", width: "18%", top: "79%", height: "16%", background: STAND } },
    { s: { left: "31%", width: "38%", top: "94.4%", height: "4.6%", borderRadius: "3px 3px 40% 40% / 3px 3px 100% 100%", background: SILVER, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" } },
    { s: { left: 0, right: 0, top: 0, height: "67.5%", borderRadius: "2.4% 2.4% 0 0 / 3.4% 3.4% 0 0", background: BEZEL, boxShadow: RIM } },
    { kind: "chin", s: { left: 0, right: 0, top: "67.5%", height: "12.5%", borderRadius: "0 0 2.4% 2.4% / 0 0 16% 16%" } },
    { screen: true, s: { left: "2.2%", right: "2.2%", top: "2.6%", height: "62.6%" } },
  ] },
  laptop: { ar: 1.62, parts: [
    { s: { left: "9%", right: "9%", top: 0, height: "88%", borderRadius: "3% 3% 0 0 / 4.6% 4.6% 0 0", background: SG, boxShadow: RIM } },
    { s: { left: "9.5%", right: "9.5%", top: ".7%", height: "87%", borderRadius: "2.6% 2.6% 0 0 / 4% 4% 0 0", background: BEZEL } },
    { screen: true, s: { left: "10.7%", right: "10.7%", top: "3%", height: "83%", borderRadius: ".4%" } },
    { kind: "island", s: { left: "46.5%", width: "7%", top: ".7%", height: "2.8%", borderRadius: "0 0 6px 6px", background: BEZEL } },
    { s: { left: 0, right: 0, top: "88%", height: "6%", borderRadius: "0 0 4% 4% / 0 0 80% 80%", background: "linear-gradient(#9a9da5,#4b4d54 50%,#1d1e22)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" } },
    { s: { left: "43%", width: "14%", top: "88%", height: "1.8%", borderRadius: "0 0 10px 10px", background: "rgba(0,0,0,.45)" } },
  ] },
  ipadL: { ar: 1.4, parts: [
    { s: { inset: 0, borderRadius: "5.2% / 7.3%", background: SG, boxShadow: RIM } },
    { s: { left: ".9%", right: ".9%", top: "1.2%", bottom: "1.2%", borderRadius: "4.6% / 6.5%", background: BEZEL } },
    { screen: true, s: { left: "4.4%", right: "4.4%", top: "6%", bottom: "6%", borderRadius: "1.6% / 2.3%" } },
    { kind: "punch", s: { left: "49.4%", width: "1.2%", top: "2.6%", aspectRatio: "1" } },
  ] },
  ipadP: { ar: 0.72, parts: [
    { s: { inset: 0, borderRadius: "7.5% / 5.4%", background: SG, boxShadow: RIM } },
    { s: { left: "1.6%", right: "1.6%", top: "1.1%", bottom: "1.1%", borderRadius: "6.6% / 4.8%", background: BEZEL } },
    { screen: true, s: { left: "6%", right: "6%", top: "4.4%", bottom: "4.4%", borderRadius: "3% / 2.2%" } },
    { kind: "punch", s: { left: "48.8%", width: "2.4%", top: "1.9%", aspectRatio: "1" } },
  ] },
  iphone: { ar: 0.49, parts: [
    { s: { ...BTN, left: "-1.3%", width: "1.6%", top: "15%", height: "4%" } },
    { s: { ...BTN, left: "-1.3%", width: "1.6%", top: "22%", height: "8%" } },
    { s: { ...BTN, left: "-1.3%", width: "1.6%", top: "32%", height: "8%" } },
    { s: { ...BTN, right: "-1.3%", width: "1.6%", top: "25%", height: "12%" } },
    { s: { inset: 0, borderRadius: "16% / 7.8%", background: SG, boxShadow: RIM } },
    { s: { left: "2.2%", right: "2.2%", top: "1.1%", bottom: "1.1%", borderRadius: "14.4% / 7.1%", background: BEZEL } },
    { screen: true, s: { left: "5%", right: "5%", top: "2.4%", bottom: "2.4%", borderRadius: "12% / 5.9%" } },
    { kind: "island", s: { left: "35%", width: "30%", top: "4%", height: "3%", borderRadius: "99px", background: "#000" } },
  ] },
  iphoneL: { ar: 2.05, parts: [
    { s: { ...BTN, top: "-1.3%", height: "1.6%", left: "15%", width: "4%" } },
    { s: { ...BTN, top: "-1.3%", height: "1.6%", left: "22%", width: "8%" } },
    { s: { ...BTN, top: "-1.3%", height: "1.6%", left: "32%", width: "8%" } },
    { s: { ...BTN, bottom: "-1.3%", height: "1.6%", left: "25%", width: "12%" } },
    { s: { inset: 0, borderRadius: "7.8% / 16%", background: SG, boxShadow: RIM } },
    { s: { left: "1.1%", right: "1.1%", top: "2.2%", bottom: "2.2%", borderRadius: "7.1% / 14.4%", background: BEZEL } },
    { screen: true, s: { left: "2.4%", right: "2.4%", top: "5%", bottom: "5%", borderRadius: "5.9% / 12%" } },
    { kind: "island", s: { left: "4%", width: "3%", top: "35%", height: "30%", borderRadius: "99px", background: "#000" } },
  ] },
  android: { ar: 0.47, parts: [
    { s: { ...BTN, right: "-1.3%", width: "1.6%", top: "20%", height: "11%" } },
    { s: { ...BTN, right: "-1.3%", width: "1.6%", top: "34%", height: "6%" } },
    { s: { inset: 0, borderRadius: "11% / 5.2%", background: SG, boxShadow: RIM } },
    { s: { left: "2%", right: "2%", top: "1%", bottom: "1%", borderRadius: "10% / 4.7%", background: BEZEL } },
    { screen: true, s: { left: "4%", right: "4%", top: "2%", bottom: "2%", borderRadius: "8% / 3.8%" } },
    { kind: "punch", s: { left: "46%", width: "8%", top: "3.4%", aspectRatio: "1" } },
  ] },
  fold: { ar: 0.92, parts: [
    { s: { ...BTN, right: "-1%", width: "1.2%", top: "18%", height: "10%" } },
    { s: { inset: 0, borderRadius: "6%", background: SG, boxShadow: RIM } },
    { s: { inset: "1.2%", borderRadius: "5.2%", background: BEZEL } },
    { screen: true, s: { inset: "3.6%", borderRadius: "3%" } },
    { kind: "crease", s: { left: "49.5%", width: "1%", top: "3.6%", bottom: "3.6%" } },
    { kind: "punch", s: { left: "85%", width: "2.6%", top: "5.4%", aspectRatio: "1" } },
  ] },
  tv: { ar: 1.62, parts: [
    { s: { left: "46%", width: "8%", top: "89%", height: "6.5%", background: "linear-gradient(90deg,#1b1c20,#4a4c53 50%,#1b1c20)" } },
    { s: { left: "33%", width: "34%", top: "95%", height: "3.4%", borderRadius: "4px 4px 40% 40% / 4px 4px 100% 100%", background: SG, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" } },
    { s: { left: 0, right: 0, top: 0, height: "90%", borderRadius: ".6% / 1%", background: "linear-gradient(#1c1d21,#070708)", boxShadow: RIM } },
    { screen: true, s: { left: ".8%", right: ".8%", top: "1.4%", height: "87.2%" } },
  ] },
  monitor: { ar: 1.3, parts: [
    { s: { left: "44%", width: "12%", top: "73%", height: "21%", background: STAND } },
    { s: { left: "33%", width: "34%", top: "93.4%", height: "4.8%", borderRadius: "4px 4px 40% 40% / 4px 4px 100% 100%", background: SILVER, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" } },
    { s: { left: 0, right: 0, top: 0, height: "74%", borderRadius: "1.6% / 2.8%", background: SILVER, boxShadow: RIM } },
    { s: { left: ".7%", right: ".7%", top: ".9%", height: "72.2%", borderRadius: "1.2% / 2.2%", background: BEZEL } },
    { screen: true, s: { left: "2%", right: "2%", top: "2.7%", height: "68.6%" } },
  ] },
  ultrawide: { ar: 1.8, parts: [
    { s: { left: "46%", width: "8%", top: "83%", height: "11%", background: "linear-gradient(90deg,#1b1c20,#4a4c53 50%,#1b1c20)" } },
    { s: { left: "36%", width: "28%", top: "93.4%", height: "4.8%", borderRadius: "4px 4px 40% 40% / 4px 4px 100% 100%", background: SG, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" } },
    { s: { left: 0, right: 0, top: 0, height: "84%", borderRadius: "1.2% / 2.6%", background: SG, boxShadow: RIM } },
    { s: { left: ".5%", right: ".5%", top: "1%", height: "82%", borderRadius: ".9% / 2%", background: BEZEL } },
    { screen: true, s: { left: "1.4%", right: "1.4%", top: "2.6%", height: "78.6%" } },
  ] },
  // Galaxy S24 Ultra: squared corners, titanium frame, thin even bezels, centred hole-punch.
  s24ultra: { ar: 0.487, parts: [
    { s: { ...BTN, background: TI, right: "-1.1%", width: "1.4%", top: "19%", height: "11%" } },
    { s: { ...BTN, background: TI, right: "-1.1%", width: "1.4%", top: "33%", height: "6%" } },
    { s: { inset: 0, borderRadius: "6.5% / 3.2%", background: TI, boxShadow: RIM } },
    { s: { left: "1.6%", right: "1.6%", top: ".8%", bottom: ".8%", borderRadius: "5.4% / 2.6%", background: BEZEL } },
    { screen: true, s: { left: "3.2%", right: "3.2%", top: "1.6%", bottom: "1.6%", borderRadius: "4% / 1.9%" } },
    { kind: "punch", s: { left: "46.8%", width: "6.4%", top: "2.6%", aspectRatio: "1" } },
  ] },
  ipadMini: { ar: 0.68, parts: [
    { s: { ...BTN, background: SILVER, top: "-1%", height: "1.2%", right: "14%", width: "12%" } },
    { s: { inset: 0, borderRadius: "7.4% / 5%", background: SILVER, boxShadow: RIM } },
    { s: { left: "1.6%", right: "1.6%", top: "1.1%", bottom: "1.1%", borderRadius: "6.4% / 4.4%", background: BEZEL } },
    { screen: true, s: { left: "5.4%", right: "5.4%", top: "3.8%", bottom: "3.8%", borderRadius: "3% / 2%" } },
    { kind: "punch", s: { left: "48.6%", width: "2.8%", top: "1.6%", aspectRatio: "1" } },
  ] },
  browser: { ar: 1.5, parts: [
    { s: { inset: 0, borderRadius: "1.6% / 2.4%", background: "#161619", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.2)" } },
    { kind: "bar", s: { left: 0, right: 0, top: 0, height: "7%", borderRadius: "1.6% 1.6% 0 0 / 34% 34% 0 0", background: "linear-gradient(#2c2c32,#1f1f24)" } },
    { screen: true, s: { left: "0.4%", right: "0.4%", top: "7%", bottom: "0.6%", borderRadius: "0 0 1.2% 1.2% / 0 0 2% 2%" } },
  ] },
};

function Screen({ site }: { site: Site }) {
  // A cover that fails to load (say the image host is down) falls back to the poster.
  const [failed, setFailed] = useState(false);
  if (site.shot && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.shot} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: site.fit ?? "cover", objectPosition: site.pos ?? (site.fit ? "center" : "top center"), display: "block", background: site.screenBg, padding: site.fit ? (site.pad ?? "3%") : undefined, boxSizing: "border-box" }} />;
  }
  return (
    <div style={{ position: "absolute", inset: 0, containerType: "size", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4cqmin", textAlign: "center", padding: "6cqmin",
      background: `radial-gradient(120% 80% at 50% 0%,${site.accent}70,transparent 70%),linear-gradient(160deg,${site.accent}38,#0c0c0e 65%)` }}>
      <span style={{ fontSize: "clamp(10px,13cqmin,64px)", fontWeight: 900, letterSpacing: ".06em", color: "#fff", lineHeight: 1 }}>{site.name}</span>
      <span style={{ fontSize: "clamp(6px,4cqmin,14px)", fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.72)" }}>{tr(site.tagline)}</span>
      <span style={{ marginTop: "2cqmin", fontSize: "clamp(6px,4cqmin,13px)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "2.4cqmin 5cqmin", borderRadius: 100, background: "#fff", color: "#000" }}>{tr(site.cta)}</span>
    </div>
  );
}

function Device({ site }: { site: Site }) {
  const d = DEVICES[site.device];
  return (
    <div className="zbc-dev" style={{ "--ar": d.ar } as CSSProperties}>
      {d.parts.map((p, i) => {
        let inner: ReactNode = null;
        const extra: CSSProperties = {};
        if (p.screen) inner = (
          <>
            <Screen site={site} />
            {/* glass reflection */}
            <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,.05) 26%,transparent 44%)" }} />
          </>
        );
        if (p.kind === "chin") { extra.background = `linear-gradient(180deg,rgba(255,255,255,.18),rgba(0,0,0,.35)),${site.accent}`; extra.boxShadow = "inset 0 1px 0 rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.35)"; }
        if (p.kind === "punch") { extra.borderRadius = "50%"; extra.background = "radial-gradient(circle at 35% 35%,#2a3a55,#07080a 60%)"; extra.boxShadow = "0 0 0 1px rgba(255,255,255,.06)"; }
        if (p.kind === "crease") extra.background = "linear-gradient(90deg,transparent,rgba(0,0,0,.35),rgba(255,255,255,.1),transparent)";
        if (p.kind === "bar") inner = (
          <span style={{ display: "flex", alignItems: "center", gap: "1%", height: "100%", padding: "0 2.2%" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: "1.4%", aspectRatio: "1", borderRadius: "50%", background: c }} />)}
            <span style={{ margin: "0 auto", fontSize: "clamp(7px,1.3vw,11px)", color: "rgba(255,255,255,.5)", fontFamily: "ui-monospace,Menlo,monospace", background: "rgba(255,255,255,.06)", padding: "2px 10px", borderRadius: 5 }}>{site.host}</span>
          </span>
        );
        return (
          <div key={i} style={{ position: "absolute", overflow: p.screen ? "hidden" : undefined, background: p.screen ? "#000" : undefined, ...p.s, ...extra }}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default function SiteCarousel() {
  const lang = useZbLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const st = useRef({ stride: 0, raf: 0, settle: 0 as unknown as ReturnType<typeof setTimeout>, drag: null as null | { x: number; left: number; moved: boolean }, snap: () => {}, mark: () => {} });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.querySelectorAll<HTMLElement>("[data-slide]")];
    const s = st.current;
    const measure = () => { s.stride = slides[1].offsetLeft - slides[0].offsetLeft; };
    const centerOn = (k: number) => { track.scrollLeft = slides[k].offsetLeft + slides[k].offsetWidth / 2 - track.clientWidth / 2; };
    const nearest = () => {
      const c = track.scrollLeft + track.clientWidth / 2;
      return Math.max(0, Math.min(slides.length - 1, Math.round((c - slides[0].offsetLeft - slides[0].offsetWidth / 2) / (s.stride || 1))));
    };
    // Tilt, scale and fade each device by its distance from the centre.
    let painted: number[] = [];
    const paint = () => {
      s.raf = 0;
      const c = track.scrollLeft + track.clientWidth / 2, k0 = nearest(), tilt = track.clientWidth <= 760 ? 18 : 30;
      const lo = Math.max(0, k0 - 3), hi = Math.min(slides.length - 1, k0 + 3);
      // Slides that just left the painted range go back to their resting look.
      for (const k of painted) if (k < lo || k > hi) { const el = slides[k], dev = el.firstElementChild as HTMLElement, cap = el.lastElementChild as HTMLElement; dev.style.transform = dev.style.opacity = cap.style.opacity = cap.style.visibility = ""; }
      painted = [];
      for (let k = lo; k <= hi; k++) {
        painted.push(k);
        const el = slides[k], d = (el.offsetLeft + el.offsetWidth / 2 - c) / (s.stride || 1), a = Math.abs(d);
        const dev = el.firstElementChild as HTMLElement, cap = el.lastElementChild as HTMLElement;
        dev.style.transform = `rotateY(${Math.max(-40, Math.min(40, -d * tilt)).toFixed(2)}deg) scale(${(1 - Math.min(a, 1.6) * 0.16).toFixed(3)})`;
        dev.style.opacity = String(Math.max(0.3, 1 - Math.min(a, 2) * 0.26));
        cap.style.opacity = String(Math.max(0, 1 - a * 1.8));
        cap.style.visibility = a > 0.6 ? "hidden" : "visible";
      }
      setActive(k0 % N);
    };
    // Once it settles in an outer copy, jump to the same place in the middle one.
    const settle = () => {
      if (s.drag) return;
      const k = nearest();
      if (k < N || k >= 2 * N) { track.scrollLeft += (k < N ? N : -N) * s.stride; paint(); }
    };
    const onScroll = () => {
      if (!s.raf) s.raf = requestAnimationFrame(paint);
      clearTimeout(s.settle); s.settle = setTimeout(settle, 160);
    };
    s.snap = () => { const k = nearest(); track.scrollTo({ left: slides[k].offsetLeft + slides[k].offsetWidth / 2 - track.clientWidth / 2, behavior: "smooth" }); };
    const onResize = () => { const k = N + (nearest() % N); measure(); centerOn(k); paint(); };
    measure(); centerOn(N); paint();

    // A one-time peek when the row first comes into view: glide part of the way
    // to the next device and back, then the previous one, so it's clear there
    // are more on both sides. Any touch, drag, wheel or key stops it for good.
    let used = false, nudging = false, nudgeRaf = 0, nudgeT = 0 as unknown as ReturnType<typeof setTimeout>;
    s.mark = () => {
      if (used) return;
      used = true; setTouched(true); cancelAnimationFrame(nudgeRaf); clearTimeout(nudgeT);
      if (nudging) { nudging = false; track.style.scrollSnapType = ""; }
    };
    const glide = (from: number, to: number, ms: number) => new Promise<boolean>((done) => {
      const t0 = performance.now();
      const f = (now: number) => {
        if (used) return done(false);
        const p = Math.min(1, (now - t0) / ms), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        track.scrollLeft = from + (to - from) * e;
        if (p < 1) nudgeRaf = requestAnimationFrame(f); else done(true);
      };
      nudgeRaf = requestAnimationFrame(f);
    });
    const pause = (ms: number) => new Promise<void>((done) => { nudgeT = setTimeout(done, ms); });
    const peek = async () => {
      if (used || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      nudging = true; track.style.scrollSnapType = "none";
      const base = track.scrollLeft, d = s.stride * 0.42;
      for (const dir of [1, -1]) {
        if (!(await glide(base, base + dir * d, 750))) return;
        await pause(420);
        if (!(await glide(base + dir * d, base, 650))) return;
        await pause(300);
      }
      nudging = false; track.style.scrollSnapType = "";
    };
    const seen = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { seen.disconnect(); nudgeT = setTimeout(peek, 700); }
    }, { threshold: 0.6 });
    seen.observe(track);
    const stop = () => s.mark();
    for (const ev of ["pointerdown", "wheel", "touchstart", "keydown"]) track.addEventListener(ev, stop, { passive: true });
    track.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => { seen.disconnect(); cancelAnimationFrame(nudgeRaf); clearTimeout(nudgeT); for (const ev of ["pointerdown", "wheel", "touchstart", "keydown"]) track.removeEventListener(ev, stop); track.removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); cancelAnimationFrame(s.raf); clearTimeout(s.settle); };
  }, []);

  const go = (dir: number) => { st.current.mark(); trackRef.current?.scrollBy({ left: dir * st.current.stride, behavior: "smooth" }); };

  // Mouse drag (touch and trackpads already scroll natively).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    // Links keep their own click; capturing here would retarget it to the track.
    if ((e.target as HTMLElement).closest("a")) return;
    const t = trackRef.current!;
    st.current.drag = { x: e.clientX, left: t.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = st.current.drag;
    if (!d) return;
    const dx = e.clientX - d.x, t = trackRef.current!;
    // Only take the pointer once it is a real drag, so plain clicks still land.
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; t.style.scrollSnapType = "none"; t.setPointerCapture(e.pointerId); }
    if (d.moved) t.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => {
    const d = st.current.drag, t = trackRef.current!;
    if (!d) return;
    st.current.drag = null;
    if (!d.moved) return;
    // Glide to the nearest device, then hand back to snapping.
    st.current.snap();
    setTimeout(() => { t.style.scrollSnapType = ""; }, 450);
    { const block = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); }; t.addEventListener("click", block, { capture: true, once: true }); setTimeout(() => t.removeEventListener("click", block, true), 0); }
  };

  const items = Array.from({ length: N * COPIES }, (_, k) => k);

  return translateTree(
    <div className="zbc" style={{ margin: "32px calc(50% - 50vw) 0", position: "relative" }}>
      <style>{CSS}</style>
      <div
        ref={trackRef}
        className="zbc-track"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Selected work"
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((k) => {
          const i = k % N, site = SITES[i], on = i === active;
          return (
            <div key={k} data-slide={k} className="zbc-slide" aria-hidden={k >= N && k < 2 * N ? undefined : true}>
              <div className="zbc-stage" onClick={(e) => { const el = e.currentTarget.parentElement!, t = trackRef.current!; const d = (el.offsetLeft + el.offsetWidth / 2 - t.scrollLeft - t.clientWidth / 2) / (st.current.stride || 1); if (Math.abs(d) > 0.5) go(Math.round(d)); else window.open(`https://${site.host}`, "_blank", "noopener"); }}>
                <Device site={site} />
              </div>
              <div className="zbc-cap">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                  {String(i + 1).padStart(2, "0")} / {N} · {tr(site.category, lang)}
                </div>
                <div style={{ fontSize: "clamp(30px,4.4vw,58px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, margin: "10px 0 12px" }}>{site.name}</div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", margin: "0 auto", maxWidth: 440 }}>{tr(site.blurb, lang)}</p>
                <a href={`https://${site.host}`} target="_blank" rel="noopener noreferrer" tabIndex={on ? 0 : -1} className="zbc-visit">
                  {tr("Visit site", lang)} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" className="zbc-arrow" style={{ left: "max(12px, calc(50% - var(--sw) / 2 - 28px))" }} aria-label="Previous work" onClick={() => go(-1)}>←</button>
      <button type="button" className="zbc-arrow" style={{ right: "max(12px, calc(50% - var(--sw) / 2 - 28px))" }} aria-label="Next work" onClick={() => go(1)}>→</button>
      <div className="zbc-dots" aria-hidden="true">
        {SITES.map((s, i) => <span key={s.host} style={{ width: i === active ? 22 : 6, opacity: i === active ? 1 : 0.35 }} />)}
      </div>
      <div className="zbc-hint" aria-hidden="true" style={{ opacity: touched ? 0 : 1 }}>
        <span className="zbc-hint-touch">← {tr("Swipe to explore", lang)} →</span>
        <span className="zbc-hint-mouse">← {tr("Drag or use the arrows", lang)} →</span>
      </div>
    </div>,
    lang,
  );
}

const CSS = `
.zbc{--sw:clamp(300px,50vw,800px);--sh:min(calc(var(--sw) * .6),52vh);font-family:Inter,-apple-system,sans-serif;color:var(--text)}
.zbc-track{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;cursor:grab;outline:none;padding:10px 0 8px}
.zbc-track::-webkit-scrollbar{display:none}
.zbc-track:active{cursor:grabbing}
.zbc-slide{flex:0 0 var(--sw);scroll-snap-align:center;perspective:1600px;user-select:none;-webkit-user-select:none}
.zbc-stage{cursor:pointer;height:var(--sh);display:flex;align-items:center;justify-content:center;container-type:size;will-change:transform,opacity;transform:scale(.84);opacity:.4;padding:0 4%}
.zbc-dev{position:relative;isolation:isolate;width:min(100cqw,calc(100cqh * var(--ar)));aspect-ratio:var(--ar)}
.zbc-dev::after{content:"";position:absolute;left:4%;right:4%;bottom:-6%;height:9%;z-index:-1;background:radial-gradient(closest-side,rgba(0,0,0,.7),rgba(0,0,0,.25) 60%,transparent);pointer-events:none}
.zbc-cap{text-align:center;padding:26px 20px 0;opacity:0;visibility:hidden;transition:opacity .25s}
.zbc-visit{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:13px 22px;border-radius:100px;background:var(--invert-bg);color:var(--invert-fg);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.zbc-visit:hover{transform:translateY(-2px);color:var(--invert-fg)}
.zbc-arrow{position:absolute;top:calc(10px + var(--sh) / 2);transform:translateY(-50%);z-index:3;width:48px;height:48px;border-radius:50%;border:1px solid rgba(var(--tint-rgb),.2);background:rgba(var(--bg-rgb,6,6,8),.6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:var(--text);font-size:18px;cursor:pointer;transition:transform .3s cubic-bezier(.16,1,.3,1),background .3s}
.zbc-arrow:hover{transform:translateY(-50%) scale(1.08);background:rgba(var(--tint-rgb),.12)}
.zbc-dots{display:flex;justify-content:center;gap:6px;margin-top:26px}
.zbc-hint{margin-top:14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint);transition:opacity .6s}
.zbc-hint-touch{display:none}
@media (pointer:coarse){.zbc-hint-touch{display:inline}.zbc-hint-mouse{display:none}}
.zbc-dots span{height:6px;border-radius:6px;background:var(--text);transition:width .4s cubic-bezier(.16,1,.3,1),opacity .4s}
@media (max-width:760px){.zbc{--sw:62vw;--sh:min(calc(var(--sw) * .95),50vh)}.zbc-cap{margin:0 -19vw}.zbc-arrow{display:none}}
@media (prefers-reduced-motion:reduce){.zbc-stage{transform:none !important}}
`;
