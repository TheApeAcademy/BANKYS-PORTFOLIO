import { Resend } from "resend";
import { formatMoney } from "@zebraish/lib/format";
import { collaboratorApprovedEmail, priceConfirmedEmail, type Rendered } from "@zebraish/lib/email";
import { collaboratorLoginLink } from "./gmail-compose";

// Studio's public origin: email images and client links live there.
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://zebraish.com";

/**
 * No-ops silently if RESEND_API_KEY / RESEND_FROM_EMAIL aren't set, or if there's no email
 * address — same pattern as apps/studio's email.ts. Never throws: email failing shouldn't
 * block an approval or a price confirmation.
 */
async function send(to: string | null | undefined, email: Rendered) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from || !to || !to.includes("@")) return;
  try {
    await new Resend(key).emails.send({ from, to, replyTo: process.env.RESEND_REPLY_TO ?? undefined, subject: email.subject, html: email.html, text: email.text });
  } catch {
    // best-effort
  }
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export async function sendCollaboratorApprovalEmail(params: { to: string; name: string; accessCode: string }) {
  await send(
    params.to,
    collaboratorApprovedEmail(STUDIO_URL, { firstName: firstName(params.name), accessCode: params.accessCode, loginUrl: collaboratorLoginLink(params.accessCode) }),
  );
}

/** First email address in a free-form contact string ("WhatsApp: +234... · me@x.com"). */
function emailFrom(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    const m = v?.match(/[^\s<>·,;:]+@[^\s<>·,;:]+\.[a-z]{2,}/i);
    if (m) return m[0];
  }
  return null;
}

export async function sendPriceConfirmedEmail(project: {
  project_code: string;
  client_name: string;
  client_contact: string | null;
  quoted_price: number;
  quoted_currency: string | null;
  access_token: string;
  configuration: Record<string, unknown> | null;
}) {
  const cfg = project.configuration ?? {};
  const currency = project.quoted_currency ?? "EUR";
  const token = encodeURIComponent(project.access_token);
  await send(
    emailFrom(typeof cfg.email === "string" ? cfg.email : null, project.client_contact),
    priceConfirmedEmail(STUDIO_URL, {
      code: project.project_code,
      firstName: firstName(project.client_name),
      price: formatMoney(Number(project.quoted_price), currency),
      estimate: cfg.initial_estimate ? formatMoney(Number(cfg.initial_estimate), currency) : undefined,
      trackUrl: `${STUDIO_URL}/track?token=${token}`,
      payUrl: `${STUDIO_URL}/start/pay?token=${token}`,
    }),
  );
}
