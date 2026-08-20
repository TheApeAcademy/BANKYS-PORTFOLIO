import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-bg text-fg">
      <div className="mb-8">
        <Logo label="Control Center" />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-7">
        <h1 className="mb-1 text-lg font-semibold">Set a new password</h1>
        <p className="mb-6 text-sm text-fg-muted">
          Opened from your reset email — choose a new password below.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
