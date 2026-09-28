"use client";

// Shared glass pop-up shell for Zebraish Home (tracker, collaborate, access code).
// Freezes the page and its smooth-scroll behind it, closes on Escape or a
// click outside the card.
import { useEffect } from "react";

export const glass = {
  label: { fontSize: 10, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(245,245,247,.5)" } as React.CSSProperties,
  input: { width: "100%", boxSizing: "border-box", background: "rgba(245,245,247,.05)", border: "1px solid rgba(245,245,247,.16)", borderRadius: 14, padding: "13px 15px", color: "#f5f5f7", fontFamily: "inherit", fontSize: 15, outline: "none" } as React.CSSProperties,
  primary: { fontFamily: "inherit", background: "#f5f5f7", color: "#040405", border: "none", padding: "14px 28px", borderRadius: 100, fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", display: "inline-block" } as React.CSSProperties,
  ghost: { fontFamily: "inherit", background: "none", border: "1px solid rgba(245,245,247,.2)", color: "#f5f5f7", padding: "13px 22px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", display: "inline-block" } as React.CSSProperties,
  h3: { fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-.03em", margin: "8px 0 6px" } as React.CSSProperties,
  sub: { margin: "0 0 20px", color: "rgba(245,245,247,.55)", fontSize: 14, lineHeight: 1.6 } as React.CSSProperties,
  error: { fontSize: 13, color: "#ff6b8b" } as React.CSSProperties,
  accent: "#17c98d",
};

export function GlassModal({
  title,
  kicker,
  onClose,
  width = 720,
  children,
}: {
  title: string;
  kicker?: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = prev; lenis?.start(); removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 30000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(4,4,5,.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontFamily: "Inter,-apple-system,sans-serif", color: "#f5f5f7", animation: "zbgm-fade .35s ease both" }}
    >
      <style>{"@keyframes zbgm-fade{from{opacity:0}to{opacity:1}}@keyframes zbgm-in{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}"}</style>
      <div
        style={{
          position: "relative", width: `min(${width}px,100%)`, maxHeight: "min(90vh,900px)", display: "flex", flexDirection: "column", borderRadius: 30, overflow: "hidden",
          background: "linear-gradient(145deg,rgba(245,245,247,.10),rgba(245,245,247,.03) 55%,rgba(23,201,141,.08))",
          backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          border: "1px solid rgba(245,245,247,.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.18),0 40px 120px rgba(0,0,0,.6)",
          animation: "zbgm-in .5s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid rgba(245,245,247,.08)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={glass.label}>{kicker ?? "Zebraish Studio"}</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em", marginTop: 4 }}>{title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(245,245,247,.2)", background: "rgba(245,245,247,.05)", color: "#f5f5f7", fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>×</button>
        </div>
        <div data-lenis-prevent style={{ padding: "24px 26px", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
