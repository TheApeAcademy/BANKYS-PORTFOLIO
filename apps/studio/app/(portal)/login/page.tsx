import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "@/components/LoginForm";
import { getServerT } from "@/lib/i18n/server";
import { signInWithCode } from "@/lib/actions/collaborator-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const t = await getServerT();

  // Magic-link sign-in (?code=...) — same access code the manual form takes,
  // just applied automatically so an emailed link works like the client
  // /track?token= links instead of requiring the collaborator to retype it.
  let magicLinkError: string | null = null;
  if (code) {
    const result = await signInWithCode(code);
    if (!result.error) redirect("/dashboard");
    magicLinkError = result.error;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-bg text-fg">
      <div className="mb-8 flex w-full max-w-sm items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-7">
        <h1 className="mb-1 text-lg font-semibold">{t("login.title")}</h1>
        <p className="mb-6 text-sm text-fg-muted">{t("login.subtitle")}</p>
        <LoginForm initialError={magicLinkError} />
      </div>
    </div>
  );
}
