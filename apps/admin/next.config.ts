import type { NextConfig } from "next";

// script-src needs 'unsafe-inline' too: Next.js's own inline hydration
// bootstrap script requires it, with no nonce set up here (same trade-off
// already accepted below for style-src, and the same bug already found and
// fixed once on apps/studio — see "Fix CSP blocking Next.js hydration on
// the studio homepage"). Without it, no client-side JS executes at all —
// only Server Action forms (which have a no-JS fallback) still function;
// plain React state/onClick components (this app has several) go dead.
const SUPABASE_URL = "https://rxyqoaucuwdgpbzgfjqp.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_URL}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // This app is never meant to be indexed — it isn't linked from anywhere
  // public, but belt-and-suspenders costs nothing.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
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
