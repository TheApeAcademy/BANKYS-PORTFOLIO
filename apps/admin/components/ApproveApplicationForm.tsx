"use client";

import { useState, type FormEvent } from "react";
import { approveApplication, type ApproveApplicationState } from "@/lib/actions/collaborators";
import { inputCls, buttonCls } from "@/components/ui";
import { buildGmailComposeUrl, collaboratorLoginLink, openGmailCompose } from "@/lib/gmail-compose";

const initialState: ApproveApplicationState = { error: null, success: null };

function buildApprovalEmailUrl(to: string, name: string, accessCode: string): string {
  const link = collaboratorLoginLink(accessCode);
  const body = [
    `Hi ${name},`,
    "",
    "Congratulations! Your application to become a Zebraish collaborator has been approved.",
    "",
    `Your private access code is: ${accessCode}`,
    "",
    `Sign in directly with this link: ${link}`,
    `(or go to /login and enter the code above)`,
    "",
    "No account or password needed, just this code/link, so keep it somewhere safe.",
  ].join("\n");
  return buildGmailComposeUrl(to, "You're approved as a Zebraish collaborator", body);
}

export function ApproveApplicationForm({ applicationId }: { applicationId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<{ accessCode: string; email: string | null } | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await approveApplication(initialState, formData);

    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }

    // Opened directly in this same click-triggered handler (not a later
    // effect) so browsers don't treat it as an unrequested popup — same
    // reasoning as the WhatsApp compose link in the studio configurator.
    if (result.success.email) {
      openGmailCompose(buildApprovalEmailUrl(result.success.email, result.success.name, result.success.accessCode));
    }
    setApproved({ accessCode: result.success.accessCode, email: result.success.email });
  }

  if (approved) {
    return (
      <div className="rounded-lg border border-paid bg-bg-raised p-3 text-sm">
        <p className="font-medium text-paid">Approved.</p>
        <p className="mt-1 text-fg-muted">
          Access code: <span className="tabular-nums text-fg">{approved.accessCode}</span>
        </p>
        {approved.email ? (
          <p className="mt-1 text-fg-muted">A Gmail compose window opened with the code filled in. Click send.</p>
        ) : (
          <p className="mt-1 text-fg-muted">No email on file, share this code with them directly.</p>
        )}
      </div>
    );
  }

  if (!expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)} className={buttonCls}>
        Approve
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 rounded-lg border border-border p-3">
      <input type="hidden" name="id" value={applicationId} />
      <p className="text-xs text-fg-muted">Set the collaborator&apos;s term and payout details before approving.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Term start</label>
          <input name="term_start" type="date" defaultValue={today} required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Term end (optional)</label>
          <input name="term_end" type="date" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Commission rate (%)</label>
          <input name="commission_rate" type="number" step="0.01" defaultValue="10" className={inputCls} />
        </div>
        <div />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Bank name</label>
          <input name="bank_name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Account name</label>
          <input name="account_name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs text-fg-muted">Account number</label>
          <input name="account_number" className={inputCls} />
        </div>
      </div>
      {error ? <p className="text-sm text-excluded">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Approving…" : "Confirm approval"}
        </button>
        <button type="button" onClick={() => setExpanded(false)} className="text-sm text-fg-muted hover:text-fg">
          Cancel
        </button>
      </div>
    </form>
  );
}
