import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";
import ZebraHead from "@/components/zebraish/ZebraHead";
import { HideBackdrop } from "@/components/HideBackdrop";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-fg">
      <HideBackdrop />
      {/* The studio's 3D mark: drag to turn it. */}
      <div className="relative z-[1] mb-2 h-44 w-44" aria-hidden>
        <ZebraHead variant="a" __hostStyle={{ position: "absolute", inset: 0 }} />
      </div>
      <div className="relative z-[1] mb-8">
        <Logo label="Bureau of Statistics, Analysis & Critical Motion" />
      </div>
      <div className="glass relative z-[1] w-full max-w-sm rounded-[24px] p-7">
        <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-fg-muted">Administrator access only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
