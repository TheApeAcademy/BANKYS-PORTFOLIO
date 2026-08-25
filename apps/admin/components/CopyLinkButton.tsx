"use client";

import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (non-HTTPS, permissions) — the link text is
      // still selectable/visible next to this button as a fallback.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-fg-muted transition hover:bg-bg-raised hover:text-fg"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
