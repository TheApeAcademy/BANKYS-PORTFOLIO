import type { NextConfig } from "next";

// The marketing homepage (`app/page.tsx` + `app/_site-body.ts`) is ported
// verbatim from the original static site and relies on inline `style=`
// attributes, so `style-src` keeps 'unsafe-inline' — tightening that would
// require rewriting the ported HTML, which the homepage is deliberately
// exempt from (see README: "kept pixel-for-pixel unchanged"). No inline
// `<script>`/`on*=` handlers exist anywhere in that markup, so `script-src`
// stays strict.
const SUPABASE_URL = "https://rxyqoaucuwdgpbzgfjqp.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self'",
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
