import { Resend } from "resend";
import { collaboratorLoginLink } from "./gmail-compose";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/**
 * No-ops silently if RESEND_API_KEY / RESEND_FROM_EMAIL aren't set, or if the
 * applicant didn't give an email address — same pattern as apps/studio's
 * email.ts. Never throws — email failing shouldn't block an approval.
 */
export async function sendCollaboratorApprovalEmail(params: { to: string; name: string; accessCode: string }) {
  if (!params.to.includes("@")) return;
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) return;

  try {
    const link = collaboratorLoginLink(params.accessCode);
    await resend.emails.send({
      from,
      to: params.to,
      subject: "You're approved as a Zebraish collaborator",
      html: `<p>Hi ${params.name},</p>
<p>Your application to become a Zebraish collaborator has been approved.</p>
<p>Your private access code is: <strong>${params.accessCode}</strong></p>
<p>Sign in directly with this link: <a href="${link}">${link}</a> (or enter the code above at /login). No account or password needed, just this code/link, so keep it somewhere safe.</p>`,
    });
  } catch {
    // best-effort; don't let email failures affect the approval itself
  }
}
