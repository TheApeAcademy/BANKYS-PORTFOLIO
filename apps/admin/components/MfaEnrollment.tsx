"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/client";
import { buttonCls, buttonDangerCls, buttonGhostCls, inputCls } from "@/components/ui";

type Factor = { id: string; friendly_name?: string | null; created_at: string };

type Stage =
  | { kind: "no-factor" }
  | { kind: "enrolling"; factorId: string; qr: string; secret: string }
  | { kind: "enrolled"; factor: Factor };

export function MfaEnrollment({ initialFactor }: { initialFactor: Factor | null }) {
  const [stage, setStage] = useState<Stage>(
    initialFactor ? { kind: "enrolled", factor: initialFactor } : { kind: "no-factor" },
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function refresh() {
    const supabase = createClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setError(listError.message);
      setStage({ kind: "no-factor" });
      return;
    }
    const verified = data.totp.find((f) => f.status === "verified");
    setStage(verified ? { kind: "enrolled", factor: verified } : { kind: "no-factor" });
  }

  async function startEnroll() {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setPending(false);
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start enrollment.");
      return;
    }
    setStage({ kind: "enrolling", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function cancelEnroll(factorId: string) {
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId });
    setCode("");
    setError(null);
    setStage({ kind: "no-factor" });
  }

  async function verifyEnroll(factorId: string) {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Could not create a challenge.");
      setPending(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    setPending(false);
    if (verifyError) {
      setError("Incorrect code — try again.");
      return;
    }
    setCode("");
    router.refresh();
    await refresh();
  }

  async function removeFactor(factorId: string) {
    setPending(true);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setPending(false);
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    router.refresh();
    await refresh();
  }

  if (stage.kind === "enrolled") {
    return (
      <div>
        <p className="text-sm">
          <span className="pill pill-paid">Enabled</span>
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          Two-factor authentication is active on this account. Verifying a new factor signs out every other
          session.
        </p>
        {error ? <p className="mt-2 text-sm text-excluded">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => removeFactor(stage.factor.id)}
          className={`mt-4 ${buttonDangerCls}`}
        >
          {pending ? "Removing…" : "Remove two-factor authentication"}
        </button>
      </div>
    );
  }

  if (stage.kind === "enrolling") {
    return (
      <div>
        <p className="mb-3 text-sm text-fg-muted">
          Scan this QR code with your authenticator app, or enter the secret manually.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stage.qr} alt="Authenticator QR code" className="mb-3 h-40 w-40 rounded-lg border border-border" />
        <p className="mb-4 break-all rounded-lg bg-bg-raised px-3 py-2 font-mono text-xs text-fg-muted">
          {stage.secret}
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          placeholder="6-digit code"
          inputMode="numeric"
          className={`${inputCls} mb-3`}
        />
        {error ? <p className="mb-3 text-sm text-excluded">{error}</p> : null}
        <div className="flex gap-2">
          <button type="button" disabled={pending} onClick={() => verifyEnroll(stage.factorId)} className={buttonCls}>
            {pending ? "Verifying…" : "Enable"}
          </button>
          <button type="button" onClick={() => cancelEnroll(stage.factorId)} className={buttonGhostCls}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-fg-muted">
        Two-factor authentication is not set up. Add an authenticator app (Google Authenticator, 1Password, Authy…)
        for a second layer of protection on the account with full write access to everything.
      </p>
      {error ? <p className="mt-2 text-sm text-excluded">{error}</p> : null}
      <button type="button" disabled={pending} onClick={startEnroll} className={`mt-4 ${buttonCls}`}>
        {pending ? "Starting…" : "Set up two-factor authentication"}
      </button>
    </div>
  );
}
