import { Logo } from "@/components/Logo";
import { MfaChallengeForm } from "@/components/MfaChallengeForm";

export default function MfaChallengePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-bg text-fg">
      <div className="mb-8">
        <Logo label="Control Center" />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-7">
        <h1 className="mb-1 text-lg font-semibold">Two-factor verification</h1>
        <p className="mb-6 text-sm text-fg-muted">Enter the code from your authenticator app to continue.</p>
        <MfaChallengeForm />
      </div>
    </div>
  );
}
