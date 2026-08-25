"use client";

import { useState } from "react";
import { initiatePayment } from "@/lib/actions/pay";
import { buttonCls, inputCls } from "@/components/ui";

export function PayButton({ accessToken, label }: { accessToken: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState("");

  async function handleClick(overrideEmail?: string) {
    setLoading(true);
    setError(null);
    const result = await initiatePayment(accessToken, overrideEmail);
    if (!result.ok) {
      setError(result.error);
      setNeedsEmail(Boolean(result.needsEmail));
      setLoading(false);
      return;
    }
    window.location.href = result.link;
  }

  if (needsEmail) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleClick(email);
        }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm text-fg-muted">Card payment needs an email for your receipt.</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputCls}
        />
        <button type="submit" disabled={loading} className={buttonCls}>
          {loading ? "Redirecting to payment…" : label}
        </button>
        {error && !needsEmail ? <p className="text-sm text-excluded">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={() => handleClick()} disabled={loading} className={buttonCls}>
        {loading ? "Redirecting to payment…" : label}
      </button>
      {error ? <p className="text-sm text-excluded">{error}</p> : null}
    </div>
  );
}
