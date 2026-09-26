import type { Metadata } from "next";

// The Zebraish design pages (Experience, Home, World, Start, Case Study) are
// ported from the Claude Design handoff and carry their own inline styles. No
// Tailwind here: its preflight reset would shift the designs.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/zb/assets/zebraish-mark.png" },
  openGraph: { images: ["/zb/assets/zebraish-lockup-white-on-black.png"] },
  twitter: { card: "summary_large_image" },
};

const BASE_CSS = "html,body{height:100%;margin:0;background:#040405}#dc-root,#dc-root>.sc-host{height:100%}";

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
      <div id="dc-root">{children}</div>
    </>
  );
}
