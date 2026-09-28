// Zebraish branded email: one table-based, inline-styled layout (what email
// clients actually render) shared by studio and admin, plus a template per
// message. Images are served from the studio domain (public/zb/email/, built
// by scripts/build-email-assets.mjs), so pass that origin as `site`.

export type EmailRow = { label: string; value: string };
export type EmailContent = {
  /** Inbox preview text. */
  preheader: string;
  kicker: string;
  title: string;
  /** Paragraphs of plain text (escaped). */
  body: string[];
  /** Big highlighted figure, e.g. a price or access code. */
  highlight?: { label: string; value: string; note?: string };
  rows?: EmailRow[];
  cta?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Small print under the button. */
  footnote?: string;
};

export type Rendered = { subject: string; html: string; text: string };

const C = { bg: "#060608", card: "#0e0e12", line: "#22222a", text: "#f5f5f7", muted: "#a1a1aa", faint: "#6b6b75", accent: "#17c98d" };
const FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
export const STUDIO_EMAIL = "hello@zebraish.com";
const WHATSAPP = "https://wa.me/2348165320780";

export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderEmail(site: string, subject: string, c: EmailContent): Rendered {
  const base = site.replace(/\/$/, "");
  const p = (t: string) => `<p style="margin:0 0 16px;font:400 15px/1.7 ${FONT};color:${C.muted}">${esc(t)}</p>`;
  const highlight = c.highlight
    ? `<tr><td style="padding:8px 0 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:18px;background:#121217">
        <tr><td style="padding:22px 24px">
          <div style="font:700 10px/1 ${FONT};letter-spacing:3px;text-transform:uppercase;color:${C.faint}">${esc(c.highlight.label)}</div>
          <div style="margin-top:10px;font:900 34px/1.1 ${FONT};letter-spacing:-1px;color:${C.accent}">${esc(c.highlight.value)}</div>
          ${c.highlight.note ? `<div style="margin-top:8px;font:400 13px/1.6 ${FONT};color:${C.muted}">${esc(c.highlight.note)}</div>` : ""}
        </td></tr></table></td></tr>`
    : "";
  const rows = c.rows?.length
    ? `<tr><td style="padding:0 0 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${c.rows
        .map(
          (r, i) => `<tr><td style="padding:11px 0;border-top:${i ? `1px solid ${C.line}` : "0"};font:600 11px/1.5 ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${C.faint};width:38%;vertical-align:top">${esc(r.label)}</td>
          <td style="padding:11px 0;border-top:${i ? `1px solid ${C.line}` : "0"};font:500 14px/1.5 ${FONT};color:${C.text};vertical-align:top">${esc(r.value)}</td></tr>`,
        )
        .join("")}</table></td></tr>`
    : "";
  const cta = c.cta
    ? `<tr><td style="padding:4px 0 8px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="border-radius:100px;background:${C.text}"><a href="${esc(c.cta.href)}" style="display:inline-block;padding:15px 30px;font:800 12px/1 ${FONT};letter-spacing:1.6px;text-transform:uppercase;color:#040405;text-decoration:none;border-radius:100px">${esc(c.cta.label)} &rarr;</a></td>
        ${c.secondary ? `<td style="width:12px"></td><td style="border-radius:100px;border:1px solid #3a3a44"><a href="${esc(c.secondary.href)}" style="display:inline-block;padding:14px 24px;font:700 12px/1 ${FONT};letter-spacing:1.6px;text-transform:uppercase;color:${C.text};text-decoration:none">${esc(c.secondary.label)}</a></td>` : ""}
      </tr></table></td></tr>`
    : "";
  const footnote = c.footnote ? `<tr><td style="padding:14px 0 0;font:400 12px/1.6 ${FONT};color:${C.faint}">${esc(c.footnote)}</td></tr>` : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>@media (max-width:620px){.zb-pad{padding-left:22px!important;padding-right:22px!important}.zb-title{font-size:28px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${esc(c.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:28px;overflow:hidden">
    <tr><td><a href="${base}/studio"><img src="${base}/zb/email/header.jpg" width="600" alt="Zebraish" style="display:block;width:100%;height:auto;border:0"></a></td></tr>
    <tr><td height="3" style="height:3px;line-height:3px;font-size:0;background:${C.accent}">&nbsp;</td></tr>
    <tr><td class="zb-pad" style="padding:36px 44px 40px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font:700 10px/1 ${FONT};letter-spacing:3px;text-transform:uppercase;color:${C.accent};padding-bottom:14px">${esc(c.kicker)}</td></tr>
        <tr><td class="zb-title" style="font:900 34px/1.1 ${FONT};letter-spacing:-1px;color:${C.text};padding-bottom:18px">${esc(c.title)}</td></tr>
        <tr><td>${c.body.map(p).join("")}</td></tr>
        ${highlight}${rows}${cta}${footnote}
      </table>
    </td></tr>
    <tr><td class="zb-pad" style="padding:0 44px"><div style="height:1px;background:${C.line}"></div></td></tr>
    <tr><td class="zb-pad" style="padding:26px 44px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;width:44px"><img src="${base}/zb/email/mark.png" width="28" alt="" style="display:block;border:0;height:auto"></td>
        <td style="vertical-align:middle;font:600 12px/1.6 ${FONT};color:${C.muted}">Zebraish Studio<br><span style="font-weight:400;color:${C.faint}">Build what doesn&#39;t exist yet.</span></td>
        <td align="right" style="vertical-align:middle;font:600 12px/1.8 ${FONT}">
          <a href="${WHATSAPP}" style="color:${C.text};text-decoration:none">WhatsApp</a><span style="color:${C.faint}">&nbsp;&middot;&nbsp;</span><a href="mailto:${STUDIO_EMAIL}" style="color:${C.text};text-decoration:none">Email</a><span style="color:${C.faint}">&nbsp;&middot;&nbsp;</span><a href="${base}/studio" style="color:${C.text};text-decoration:none">Site</a>
        </td>
      </tr></table>
    </td></tr>
  </table>
  <div style="max-width:600px;padding:18px 12px 0;font:400 11px/1.6 ${FONT};color:${C.faint}">You're getting this because you started a project or applied to collaborate with Zebraish Studio.</div>
</td></tr></table>
</body></html>`;

  const text = [
    c.title,
    "",
    ...c.body,
    c.highlight ? `\n${c.highlight.label}: ${c.highlight.value}${c.highlight.note ? `\n${c.highlight.note}` : ""}` : "",
    ...(c.rows ?? []).map((r) => `${r.label}: ${r.value}`),
    c.cta ? `\n${c.cta.label}: ${c.cta.href}` : "",
    c.footnote ? `\n${c.footnote}` : "",
    `\nZebraish Studio · ${STUDIO_EMAIL}`,
  ].filter((l) => l !== "").join("\n");

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

type Brief = { code: string; firstName: string; projectType: string; grade?: string; estimate?: string; channel?: string; trackUrl: string };

export function briefReceivedEmail(site: string, b: Brief): Rendered {
  return renderEmail(site, `We've got your brief · ${b.code}`, {
    preheader: `Your ${b.projectType} brief is in. Final price within 48 hours.`,
    kicker: `Brief received · ${b.code}`,
    title: `Thanks, ${b.firstName}. Your brief is in.`,
    body: [
      "We review every brief personally. You'll get your final price, usually within 48 hours" + (b.channel ? `, on ${b.channel}.` : "."),
      "You can check progress, message us and pay from your private project page anytime.",
    ],
    highlight: b.estimate ? { label: "Initial estimate", value: b.estimate, note: "A starting point. The final price is confirmed after review." } : undefined,
    rows: [{ label: "Project", value: b.projectType }, ...(b.grade ? [{ label: "Grade", value: b.grade }] : []), { label: "Reference", value: b.code }],
    cta: { label: "Track your project", href: b.trackUrl },
    footnote: "Keep this email. Your project link is private to you.",
  });
}

export function priceConfirmedEmail(site: string, p: { code: string; firstName: string; price: string; estimate?: string; trackUrl: string; payUrl: string }): Rendered {
  return renderEmail(site, `Your final price is ready · ${p.code}`, {
    preheader: `Final price ${p.price}. Pay when you're ready and we start.`,
    kicker: `Final price · ${p.code}`,
    title: `${p.firstName}, your price is confirmed.`,
    body: ["We've reviewed your brief. Here's your final, fixed price. Pay when you're ready and we get building."],
    highlight: { label: "Final price", value: p.price, note: p.estimate && p.estimate !== p.price ? `Your initial estimate was ${p.estimate}.` : undefined },
    cta: { label: "Pay and start", href: p.payUrl },
    secondary: { label: "View project", href: p.trackUrl },
    footnote: "Questions about the price? Reply on WhatsApp or message us from your project page.",
  });
}

export function paymentReceivedEmail(site: string, p: { code: string; firstName: string; amount: string; trackUrl: string }): Rendered {
  return renderEmail(site, `Payment received · ${p.code}`, {
    preheader: `We've received ${p.amount}. Your project is in the queue.`,
    kicker: `Payment received · ${p.code}`,
    title: `We're building, ${p.firstName}.`,
    body: ["Your payment is in and your project is in our queue. You'll see every stage move on your project page as we go."],
    highlight: { label: "Amount paid", value: p.amount },
    cta: { label: "Follow progress", href: p.trackUrl },
  });
}

export function collaboratorApprovedEmail(site: string, c: { firstName: string; accessCode: string; loginUrl: string }): Rendered {
  return renderEmail(site, "You're a Zebraish collaborator", {
    preheader: "Your application is approved. Here's your private access code.",
    kicker: "Collaborator access",
    title: `Welcome in, ${c.firstName}.`,
    body: [
      "Your application is approved. Bring clients to Zebraish Studio and earn a commission on every project they pay for.",
      "Your code opens your dashboard: commissions, payouts, everything. No password needed, so keep it private.",
    ],
    highlight: { label: "Your access code", value: c.accessCode },
    cta: { label: "Open my dashboard", href: c.loginUrl },
  });
}

export function adminNoticeEmail(site: string, n: { subject: string; kicker: string; title: string; lines: string[]; rows?: EmailRow[]; ctaLabel?: string; ctaHref?: string }): Rendered {
  return renderEmail(site, n.subject, {
    preheader: n.title,
    kicker: n.kicker,
    title: n.title,
    body: n.lines,
    rows: n.rows,
    cta: n.ctaHref ? { label: n.ctaLabel ?? "Open", href: n.ctaHref } : undefined,
  });
}
