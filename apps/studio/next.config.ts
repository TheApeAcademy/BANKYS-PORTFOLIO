import type { NextConfig } from "next";

// The marketing homepage (`app/page.tsx` + `app/_site-body.ts`) is ported
// verbatim from the original static site and relies on inline `style=`
// attributes, so `style-src` keeps 'unsafe-inline' — tightening that would
// require rewriting the ported HTML, which the homepage is deliberately
// exempt from (see README: "kept pixel-for-pixel unchanged").
//
// `script-src` also needs 'unsafe-inline': without it, Next.js's own
// required inline hydration bootstrap scripts get blocked by the browser
// (this isn't about the ported markup — Next.js injects these on every
// page regardless), which silently breaks client-side hydration entirely.
// Concretely, that meant `site.js` (loaded via `next/script` with
// `strategy="afterInteractive"`, which only runs post-hydration) never
// executed, so every `.reveal`/`.stmt-word` element in site.css — which
// start at opacity:0 until JS toggles a visibility class on scroll —
// stayed invisible forever. A nonce-based CSP (no 'unsafe-inline' at all)
// is the stricter long-term option, but needs real middleware work
// (per-request nonce generation + injection in proxy.ts) that doesn't
// exist yet — worth doing later, not a blocker for restoring the site now.
const SUPABASE_URL = "https://rxyqoaucuwdgpbzgfjqp.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_URL} https://api.flutterwave.com`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, which the /collaborate application form's file
      // attachments blow past instantly, aborting the upload mid-stream
      // with a 413 that Safari renders as a raw connection failure rather
      // than a page. Vercel serverless functions hard-cap request bodies
      // around 4.5MB regardless of this setting, so this stays under that
      // ceiling (see MAX_TOTAL_ATTACHMENT_BYTES in lib/actions/collaborate.ts).
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
