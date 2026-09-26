import type { NextConfig } from "next";

// The Zebraish design pages (app/(zebraish), ported from the Claude Design
// handoff) render with inline styles, so `style-src` keeps 'unsafe-inline'.
//
// `script-src` also needs 'unsafe-inline': without it, Next.js's own
// required inline hydration bootstrap scripts get blocked by the browser,
// which silently breaks client-side hydration entirely. A nonce-based CSP
// is the stricter long-term option, but needs per-request nonce generation
// in proxy.ts that doesn't exist yet.
//
// Zebraish pages also need: Google Fonts (Inter, Fraunces), blob: images
// (three.js GLTFLoader decodes the zebra head's textures from blob URLs, which
// its ImageBitmapLoader also fetches, hence connect-src blob:) and
// https: frames (case studies play each client's live site in a browser frame).
const SUPABASE_URL = "https://rxyqoaucuwdgpbzgfjqp.supabase.co";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self'",
  "frame-src https:",
  `connect-src 'self' blob: ${SUPABASE_URL} https://api.flutterwave.com`,
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
