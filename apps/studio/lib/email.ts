import { Resend } from "resend";
import { formatMoney } from "@zebraish/lib/format";
import { adminNoticeEmail, briefReceivedEmail, paymentReceivedEmail, type Rendered } from "@zebraish/lib/email";

/**
 * All of these no-op silently if RESEND_API_KEY / RESEND_FROM_EMAIL aren't set, or if there's
 * no client email address — WhatsApp covers that case. Resend needs a verified domain you own
 * (a *.vercel.app address can't be verified), so email stays inactive until one is attached.
 * Never throws — email failing shouldn't block a save or a payment.
 */

// Public origin the email images and links point at.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://zebraish.com");

export const trackUrl = (token: string) => `${SITE_URL}/track?token=${encodeURIComponent(token)}`;

/** First email address in a free-form contact string ("WhatsApp: +234... · me@x.com"). */
export function emailFrom(...values: (string | null | undefined)[]): string | null {
  for (const v of values) {
    const m = v?.match(/[^\s<>·,;:]+@[^\s<>·,;:]+\.[a-z]{2,}/i);
    if (m) return m[0];
  }
  return null;
}

async function send(to: string | null | undefined, email: Rendered) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from || !to || !to.includes("@")) return;
  try {
    await new Resend(key).emails.send({
      from,
      to,
      replyTo: process.env.RESEND_REPLY_TO ?? undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch {
    // best-effort
  }
}

const adminTo = () => process.env.ADMIN_NOTIFICATION_EMAIL;
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export async function sendClientBriefReceived(params: {
  to: string | null;
  projectCode: string;
  clientName: string;
  projectType: string;
  grade?: string;
  estimate?: number;
  channel?: string;
  accessToken: string;
}) {
  await send(
    params.to,
    briefReceivedEmail(SITE_URL, {
      code: params.projectCode,
      firstName: firstName(params.clientName),
      projectType: params.projectType,
      grade: params.grade,
      estimate: params.estimate ? formatMoney(params.estimate, "EUR") : undefined,
      channel: params.channel,
      trackUrl: trackUrl(params.accessToken),
    }),
  );
}

export async function sendClientPaymentConfirmation(params: {
  to: string | null;
  projectCode: string;
  clientName: string;
  amount: number;
  currency: string;
  accessToken?: string;
}) {
  await send(
    params.to,
    paymentReceivedEmail(SITE_URL, {
      code: params.projectCode,
      firstName: firstName(params.clientName),
      amount: formatMoney(params.amount, params.currency),
      trackUrl: params.accessToken ? trackUrl(params.accessToken) : `${SITE_URL}/studio`,
    }),
  );
}

export async function sendAdminPaymentNotification(params: {
  projectCode: string;
  clientName: string;
  amount: number;
  currency: string;
}) {
  const amount = formatMoney(params.amount, params.currency);
  await send(
    adminTo(),
    adminNoticeEmail(SITE_URL, {
      subject: `Payment received: ${params.projectCode} (${amount})`,
      kicker: `Payment · ${params.projectCode}`,
      title: `${params.clientName} paid ${amount}.`,
      lines: ["Time to move it into the queue."],
      rows: [
        { label: "Project", value: params.projectCode },
        { label: "Amount", value: amount },
      ],
    }),
  );
}

export async function sendAdminIntakeNotification(params: {
  projectCode: string;
  clientName: string;
  /** Optional brief details ("Label: value" lines) from the project builder. */
  details?: string[];
}) {
  const rows = (params.details ?? []).map((d) => {
    const i = d.indexOf(": ");
    return i > 0 ? { label: d.slice(0, i), value: d.slice(i + 2) } : { label: "Note", value: d };
  });
  await send(
    adminTo(),
    adminNoticeEmail(SITE_URL, {
      subject: `New brief: ${params.projectCode} from ${params.clientName}`,
      kicker: `New brief · ${params.projectCode}`,
      title: `${params.clientName} sent a brief.`,
      lines: ["Review it, then confirm the final price in admin so they can pay."],
      rows: [{ label: "Reference", value: params.projectCode }, ...rows],
    }),
  );
}
