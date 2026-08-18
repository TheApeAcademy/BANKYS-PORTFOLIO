import type { NextConfig } from "next";

// This app has no ported-static-site markup (unlike apps/studio) — every
// page is authored Tailwind/JSX, so scripts stay strict ('self' only).
// style-src still needs 'unsafe-inline' because next/image sets inline
// style attributes on its own <img>/wrapper elements (e.g. Logo.tsx) —
// not something app code controls without a nonce-based CSP.
const SUPABASE_URL = "https://rxyqoaucuwdgpbzgfjqp.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self'",
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
