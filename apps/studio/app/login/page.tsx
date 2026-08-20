import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-bg text-fg">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-7">
        <h1 className="mb-1 text-lg font-semibold">Collaborator access</h1>
        <p className="mb-6 text-sm text-fg-muted">Enter the access code Zebraish gave you.</p>
        <LoginForm />
      </div>
    </div>
  );
}
