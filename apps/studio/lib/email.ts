import { Resend } from "resend";
import { formatMoney } from "@zebraish/lib/format";
import { translate, DEFAULT_LANG } from "@/lib/i18n/dictionary";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/**
 * All of these no-op silently if RESEND_API_KEY / RESEND_FROM_EMAIL aren't set, or if the
 * client's contact info isn't an email address — WhatsApp already covers that case, and a
 * *.vercel.app address can't be verified with Resend, so this stays inactive until a real
 * domain is configured. Never throws — email failing shouldn't block a payment from recording.
 */

export async function sendClientPaymentConfirmation(params: {
  to: string;
  projectCode: string;
  clientName: string;
  amount: number;
  currency: string;
}) {
  if (!params.to.includes("@")) return;
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) return;

  // No reliable way to know the client's chosen language at webhook time (no
  // cookie context tied to their browser), so this defaults to the site's
  // default language rather than English.
  const amount = formatMoney(params.amount, params.currency);
  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject: translate(DEFAULT_LANG, "email.paymentConfirmation.subject", { projectCode: params.projectCode }),
      html: translate(DEFAULT_LANG, "email.paymentConfirmation.body", {
        clientName: params.clientName,
        amount,
        projectCode: params.projectCode,
      }),
    });
  } catch {
    // best-effort; don't let email failures affect payment recording
  }
}

export async function sendAdminPaymentNotification(params: {
  projectCode: string;
  clientName: string;
  amount: number;
  currency: string;
}) {
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend || !from || !adminEmail) return;

  try {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Payment received: ${params.projectCode}`,
      html: `<p><strong>${params.clientName}</strong> just paid <strong>${formatMoney(
        params.amount,
        params.currency,
      )}</strong> for project <strong>${params.projectCode}</strong>.</p>`,
    });
  } catch {
    // best-effort
  }
}

export async function sendAdminIntakeNotification(params: { projectCode: string; clientName: string }) {
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend || !from || !adminEmail) return;

  try {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `New project configured: ${params.projectCode}`,
      html: `<p><strong>${params.clientName}</strong> just configured a new project (<strong>${params.projectCode}</strong>) and hasn't paid yet.</p>`,
    });
  } catch {
    // best-effort
  }
}
