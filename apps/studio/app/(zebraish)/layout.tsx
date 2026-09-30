import type { Metadata } from "next";

// The Zebraish design pages (Experience, Home, World, Start, Case Study) are
// ported from the Claude Design handoff and carry their own inline styles. No
// Tailwind here: its preflight reset would shift the designs.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { images: ["/zb/assets/zebraish-lockup-white-on-black.png"] },
  twitter: { card: "summary_large_image" },
};

// The pages' own styles set body{overflow-x:hidden}; with the 100% height above
// that turns <body> into its own scroll box, so the window never scrolls and
// everything reading window scroll (the Experience story, Lenis, parallax,
// the progress bar) stalls. clip hides sideways overflow without doing that.
const BASE_CSS = "html,body{height:100%;margin:0;background:#040405}body{overflow-x:clip!important}#dc-root,#dc-root>.sc-host{height:100%}";

// Lite mode (html[data-lite], set by the stripe field when a machine can't
// keep the frame rate): the glass panels blur less, which is far cheaper to
// redraw over the moving background.
const LITE_CSS = 'html[data-lite] #dc-root [style*="backdrop-filter"][style*="blur("]{backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important}';

// Phone layout. The designs were drawn for desktop with inline styles, so these
// overrides (hence !important) narrow the side padding, stack the hero, and
// drop wide grid minimums to one column below tablet width.
const MOBILE_CSS = `
.zb-burger { display: none; }
@media (max-width: 1159px) { .zb-burger { display: flex !important; } }
.zb-burger-on { display: flex !important; }
@media (max-width: 640px) { .zb-bar-extra { display: none !important; } }
@media (max-width: 760px) {
  #dc-root section, #dc-root footer { padding-left: 20px !important; padding-right: 20px !important; }
  #dc-root [style*="minmax(3"], #dc-root [style*="minmax(4"], #dc-root [style*="minmax(5"] { grid-template-columns: 1fr !important; }
  #hero { flex-direction: column !important; align-items: stretch !important; min-height: auto !important; padding-top: 104px !important; gap: 12px !important; }
  #hero [data-id="heroLeft"] { max-width: 100% !important; min-width: 0 !important; }
  #hero div:has(> [data-id="device"]) { align-self: center !important; margin-top: 0 !important; zoom: .78; }
  #dc-root h1, #dc-root h2 { overflow-wrap: anywhere; }
  #dc-root [data-bleed] { margin-left: -20px !important; margin-right: -20px !important; }
  #dc-root [data-stops] { flex-wrap: wrap !important; }
  /* "From idea to live" steps: a vertical timeline instead of four squeezed columns. */
  #dc-root [data-process] > div:nth-of-type(1), #dc-root [data-process] > div:nth-of-type(2) { display: none !important; }
  #dc-root [data-process] > div:nth-of-type(3) { grid-template-columns: 1fr !important; gap: 0 !important; }
  #dc-root [data-step] { position: relative; display: grid !important; grid-template-columns: 56px minmax(0,1fr); column-gap: 18px; text-align: left !important; padding: 0 0 30px !important; }
  #dc-root [data-step] > [data-dot] { grid-row: 1 / span 2; margin: 0 !important; }
  #dc-root [data-step] > h4 { margin: 4px 0 6px !important; font-size: 18px !important; }
  #dc-root [data-step] > p { font-size: 14px !important; }
  #dc-root [data-step]:not(:last-child)::before { content: ""; position: absolute; left: 27.5px; top: 60px; bottom: 4px; width: 1px; background: repeating-linear-gradient(var(--glass-bb) 0 6px, transparent 6px 12px); }
}
@media (max-width: 560px) {
  [data-topbar] { left: 16px !important; right: 16px !important; }
  [data-topbar] [data-brand] { font-size: 0 !important; gap: 0 !important; }
  [data-topbar] [data-soundbtn] { font-size: 0 !important; gap: 0 !important; padding: 9px 11px !important; }
}
@media (max-width: 400px) {
  #hero div:has(> [data-id="device"]) { zoom: .68; }
}`;

export default function ZebraishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,900;1,600;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
      />
      <style>{BASE_CSS}</style>
      <style>{MOBILE_CSS}</style>
      <style>{LITE_CSS}</style>
      <div id="dc-root">{children}</div>
    </>
  );
}
