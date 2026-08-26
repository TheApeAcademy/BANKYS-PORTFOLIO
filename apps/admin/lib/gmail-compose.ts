// Same fallback pattern as apps/admin/lib/email.ts. NEXT_PUBLIC_ vars are
// inlined into the client bundle at build time, so this works in client
// components too.
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://bankys-portfolio.vercel.app";

// The company's Gmail account. authuser pins the compose window to this
// account instead of whichever Google account happens to be signed in on
// the admin's browser/device.
const COMPANY_GMAIL = "zebraishteam@gmail.com";

export function collaboratorLoginLink(accessCode: string): string {
  return `${STUDIO_URL}/login?code=${encodeURIComponent(accessCode)}`;
}

export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ authuser: COMPANY_GMAIL, view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Opens a Gmail compose URL via a real, in-DOM anchor click rather than
 * window.open(). Some mobile browsers resolve script-triggered window.open
 * navigations through the OS's default mail-handler association instead of
 * just opening the web page, which was launching the device's native Mail
 * app instead of Gmail; a genuine anchor click is treated as a normal link
 * navigation and reliably opens the Gmail web compose UI.
 */
export function openGmailCompose(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
