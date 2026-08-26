import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CollaborateForm } from "@/components/CollaborateForm";
import { getServerT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Become a Collaborator — Zebraish Studio",
  description: "Apply to become an official Zebraish Studio collaborator and earn commission on projects you bring in.",
};

export default async function CollaboratePage() {
  const t = await getServerT();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <div className="flex w-full max-w-lg items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="mt-8 w-full max-w-lg rounded-2xl border border-border bg-bg-card p-8">
        <h1 className="mb-1 text-lg font-semibold">{t("collab.apply.title")}</h1>
        <p className="mb-6 text-sm text-fg-muted">{t("collab.apply.subtitle")}</p>
        <CollaborateForm />
      </div>

      <p className="mt-6 text-sm text-fg-muted">
        {t("collab.apply.alreadyCollaborator")}{" "}
        <Link href="/login" className="text-accent hover:underline">
          {t("collab.apply.enterCode")}
        </Link>
      </p>
    </div>
  );
}
