"use client";

import { useState } from "react";
import { initiatePayment } from "@/lib/actions/pay";
import { buttonCls } from "@/components/ui";

export function PayButton({ accessToken, label }: { accessToken: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await initiatePayment(accessToken);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = result.link;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={handleClick} disabled={loading} className={buttonCls}>
        {loading ? "Redirecting to payment…" : label}
      </button>
      {error ? <p className="text-sm text-excluded">{error}</p> : null}
    </div>
  );
}
