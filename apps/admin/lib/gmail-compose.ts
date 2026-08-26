// Same fallback pattern as apps/admin/lib/email.ts. NEXT_PUBLIC_ vars are
// inlined into the client bundle at build time, so this works in client
// components too.
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://bankys-portfolio.vercel.app";

export function collaboratorLoginLink(accessCode: string): string {
  return `${STUDIO_URL}/login?code=${encodeURIComponent(accessCode)}`;
}

export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildCollaboratorAccessEmailUrl(params: { to: string; name: string; accessCode: string }): string {
  const link = collaboratorLoginLink(params.accessCode);
  const body = [
    `Hi ${params.name},`,
    "",
    "Here's your Zebraish collaborator access.",
    "",
    `Your private access code is: ${params.accessCode}`,
    "",
    `Sign in directly with this link: ${link}`,
    `(or go to ${STUDIO_URL}/login and enter the code above)`,
    "",
    "No account or password needed, just this code/link, so keep it somewhere safe.",
  ].join("\n");
  return buildGmailComposeUrl(params.to, "Your Zebraish collaborator access", body);
}
