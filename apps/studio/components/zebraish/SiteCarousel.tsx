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

type Part = { s: CSSProperties; screen?: boolean; kind?: "bar" | "island" | "punch" | "crease" };

const METAL = "linear-gradient(160deg,#34343a,#141417 55%,#222227)";
const STAND = "linear-gradient(90deg,#1a1a1e,#3a3a41 50%,#1a1a1e)";

// Each device: outer aspect ratio (width / height) and its parts, positioned in % of the outer box.
const DEVICES: Record<DeviceKind, { ar: number; parts: Part[] }> = {
  imac: { ar: 1.2, parts: [
    { s: { left: 0, right: 0, top: 0, height: "80%", borderRadius: "2.2% / 2.6%", background: METAL } },
    { screen: true, s: { left: "2.4%", right: "2.4%", top: "2.8%", height: "64%", borderRadius: ".6%" } },
    { s: { left: "43%", width: "14%", top: "80%", height: "15%", background: STAND } },
    { s: { left: "33%", width: "34%", top: "94.5%", height: "5.5%", borderRadius: "6px", background: STAND } },
  ] },
  laptop: { ar: 1.62, parts: [
    { s: { left: "9%", right: "9%", top: 0, height: "88%", borderRadius: "2.5% / 4%", background: METAL } },
    { screen: true, s: { left: "10.8%", right: "10.8%", top: "3.2%", height: "81%", borderRadius: ".5%" } },
    { s: { left: 0, right: 0, top: "88%", height: "7%", borderRadius: "0 0 3% 3% / 0 0 70% 70%", background: "linear-gradient(#4a4a52,#1c1c20)" } },
    { s: { left: "42%", width: "16%", top: "88%", height: "2.6%", borderRadius: "0 0 8px 8px", background: "#15151a" } },
  ] },
  ipadL: { ar: 1.4, parts: [
    { s: { inset: 0, borderRadius: "5% / 7%", background: METAL } },
    { screen: true, s: { left: "4.2%", right: "4.2%", top: "5.8%", bottom: "5.8%", borderRadius: "2% / 2.8%" } },
  ] },
  ipadP: { ar: 0.72, parts: [
    { s: { inset: 0, borderRadius: "7% / 5%", background: METAL } },
    { screen: true, s: { left: "6%", right: "6%", top: "4.4%", bottom: "4.4%", borderRadius: "3% / 2.2%" } },
  ] },
  iphone: { ar: 0.49, parts: [
    { s: { inset: 0, borderRadius: "15% / 7.4%", background: METAL } },
    { screen: true, s: { left: "4.5%", right: "4.5%", top: "2.2%", bottom: "2.2%", borderRadius: "12% / 5.8%" } },
    { kind: "island", s: { left: "36%", width: "28%", top: "3.8%", height: "2.6%", borderRadius: "99px", background: "#000" } },
  ] },
  iphoneL: { ar: 2.05, parts: [
    { s: { inset: 0, borderRadius: "7.2% / 15%", background: METAL } },
    { screen: true, s: { left: "2.2%", right: "2.2%", top: "4.5%", bottom: "4.5%", borderRadius: "5.8% / 12%" } },
    { kind: "island", s: { left: "3.6%", width: "2.6%", top: "36%", height: "28%", borderRadius: "99px", background: "#000" } },
  ] },
  android: { ar: 0.47, parts: [
    { s: { inset: 0, borderRadius: "10% / 4.8%", background: METAL } },
    { screen: true, s: { left: "3.8%", right: "3.8%", top: "1.8%", bottom: "1.8%", borderRadius: "8% / 3.8%" } },
    { kind: "punch", s: { left: "46%", width: "8%", top: "3%", aspectRatio: "1", borderRadius: "50%", background: "#000" } },
  ] },
  fold: { ar: 0.92, parts: [
    { s: { inset: 0, borderRadius: "5%", background: METAL } },
    { screen: true, s: { inset: "3.5%", borderRadius: "3%" } },
    { kind: "crease", s: { left: "49.5%", width: "1%", top: "3.5%", bottom: "3.5%", background: "linear-gradient(90deg,transparent,rgba(0,0,0,.35),rgba(255,255,255,.08),transparent)" } },
  ] },
  tv: { ar: 1.62, parts: [
    { s: { left: 0, right: 0, top: 0, height: "92%", borderRadius: ".8% / 1.4%", background: "#0c0c0e", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" } },
    { screen: true, s: { left: "1%", right: "1%", top: "1.7%", height: "88.6%" } },
    { s: { left: "14%", width: "2.4%", top: "92%", height: "7%", background: STAND, transform: "skewX(14deg)" } },
    { s: { right: "14%", width: "2.4%", top: "92%", height: "7%", background: STAND, transform: "skewX(-14deg)" } },
  ] },
  monitor: { ar: 1.3, parts: [
    { s: { left: 0, right: 0, top: 0, height: "74%", borderRadius: "1.8% / 3%", background: METAL } },
    { screen: true, s: { left: "2%", right: "2%", top: "2.6%", height: "68.8%", borderRadius: ".4%" } },
    { s: { left: "45%", width: "10%", top: "74%", height: "20%", background: STAND } },
    { s: { left: "35%", width: "30%", top: "93%", height: "5%", borderRadius: "6px", background: STAND } },
  ] },
  ultrawide: { ar: 2.2, parts: [
    { s: { left: 0, right: 0, top: 0, height: "80%", borderRadius: "1.2% / 3%", background: METAL } },
    { screen: true, s: { left: "1.4%", right: "1.4%", top: "3%", height: "74%", borderRadius: ".4%" } },
    { s: { left: "46%", width: "8%", top: "80%", height: "14%", background: STAND } },
    { s: { left: "38%", width: "24%", top: "93%", height: "5%", borderRadius: "6px", background: STAND } },
  ] },
  browser: { ar: 1.5, parts: [
    { s: { inset: 0, borderRadius: "1.6% / 2.4%", background: "#1b1b1f", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" } },
    { kind: "bar", s: { left: 0, right: 0, top: 0, height: "7%" } },
    { screen: true, s: { left: "0.4%", right: "0.4%", top: "7%", bottom: "0.6%", borderRadius: "0 0 1.2% 1.2% / 0 0 2% 2%" } },
  ] },
};

function Screen({ site }: { site: Site }) {
  if (site.shot) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.shot} alt="" loading="lazy" decoding="async" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />;
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
        if (p.screen) inner = <Screen site={site} />;
        if (p.kind === "bar") inner = (
          <span style={{ display: "flex", alignItems: "center", gap: "1%", height: "100%", padding: "0 2.2%" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: "1.4%", aspectRatio: "1", borderRadius: "50%", background: c }} />)}
            <span style={{ margin: "0 auto", fontSize: "clamp(7px,1.3vw,11px)", color: "rgba(255,255,255,.5)", fontFamily: "ui-monospace,Menlo,monospace" }}>{site.host}</span>
          </span>
        );
        return (
          <div key={i} style={{ position: "absolute", overflow: p.screen ? "hidden" : undefined, background: p.screen ? "#000" : undefined, ...p.s }}>
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
  const st = useRef({ stride: 0, raf: 0, settle: 0 as unknown as ReturnType<typeof setTimeout>, drag: null as null | { x: number; left: number; moved: boolean }, snap: () => {} });

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
    track.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => { track.removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); cancelAnimationFrame(s.raf); clearTimeout(s.settle); };
  }, []);

  const go = (dir: number) => trackRef.current?.scrollBy({ left: dir * st.current.stride, behavior: "smooth" });

  // Mouse drag (touch and trackpads already scroll natively).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const t = trackRef.current!;
    st.current.drag = { x: e.clientX, left: t.scrollLeft, moved: false };
    t.style.scrollSnapType = "none";
    t.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = st.current.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    trackRef.current!.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => {
    const d = st.current.drag, t = trackRef.current!;
    if (!d) return;
    st.current.drag = null;
    // Glide to the nearest device, then hand back to snapping.
    st.current.snap();
    setTimeout(() => { t.style.scrollSnapType = ""; }, 450);
    if (d.moved) { const block = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); }; t.addEventListener("click", block, { capture: true, once: true }); setTimeout(() => t.removeEventListener("click", block, true), 0); }
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
              <div className="zbc-stage" onClick={(e) => { const el = e.currentTarget.parentElement!, t = trackRef.current!; const d = (el.offsetLeft + el.offsetWidth / 2 - t.scrollLeft - t.clientWidth / 2) / (st.current.stride || 1); if (Math.abs(d) > 0.5) go(Math.round(d)); }}>
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
.zbc-stage{height:var(--sh);display:flex;align-items:center;justify-content:center;container-type:size;will-change:transform,opacity;transform:scale(.84);opacity:.4;padding:0 4%}
.zbc-dev{position:relative;width:min(100cqw,calc(100cqh * var(--ar)));aspect-ratio:var(--ar);filter:drop-shadow(0 30px 50px rgba(0,0,0,.45))}
.zbc-cap{text-align:center;padding:26px 20px 0;opacity:0;visibility:hidden;transition:opacity .25s}
.zbc-visit{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:13px 22px;border-radius:100px;background:var(--invert-bg);color:var(--invert-fg);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.zbc-visit:hover{transform:translateY(-2px);color:var(--invert-fg)}
.zbc-arrow{position:absolute;top:calc(10px + var(--sh) / 2);transform:translateY(-50%);z-index:3;width:48px;height:48px;border-radius:50%;border:1px solid rgba(var(--tint-rgb),.2);background:rgba(var(--bg-rgb,6,6,8),.6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:var(--text);font-size:18px;cursor:pointer;transition:transform .3s cubic-bezier(.16,1,.3,1),background .3s}
.zbc-arrow:hover{transform:translateY(-50%) scale(1.08);background:rgba(var(--tint-rgb),.12)}
.zbc-dots{display:flex;justify-content:center;gap:6px;margin-top:26px}
.zbc-dots span{height:6px;border-radius:6px;background:var(--text);transition:width .4s cubic-bezier(.16,1,.3,1),opacity .4s}
@media (max-width:760px){.zbc{--sw:62vw;--sh:min(calc(var(--sw) * .95),50vh)}.zbc-cap{margin:0 -19vw}.zbc-arrow{display:none}}
@media (prefers-reduced-motion:reduce){.zbc-stage{transform:none !important}}
`;
