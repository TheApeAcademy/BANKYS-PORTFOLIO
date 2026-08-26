"use client";

import { buttonCls } from "@/components/ui";
import { buildCollaboratorAccessEmailUrl } from "@/lib/gmail-compose";

export function SendCollaboratorEmailButton({
  name,
  email,
  accessCode,
}: {
  name: string;
  email: string | null;
  accessCode: string;
}) {
  if (!email) {
    return <p className="text-xs text-fg-muted">No email on file, share the code above directly.</p>;
  }

  return (
    <button
      type="button"
      onClick={() => window.open(buildCollaboratorAccessEmailUrl({ to: email, name, accessCode }), "_blank")}
      className={buttonCls}
    >
      Send access email
    </button>
  );
}
