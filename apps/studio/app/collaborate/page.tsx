import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { CollaborateForm } from "@/components/CollaborateForm";

export const metadata: Metadata = {
  title: "Become a Collaborator — Zebraish Studio",
  description: "Apply to become an official Zebraish Studio collaborator and earn commission on projects you bring in.",
};

export default function CollaboratePage() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <Logo />

      <div className="mt-8 w-full max-w-lg rounded-2xl border border-border bg-bg-card p-8">
        <h1 className="mb-1 text-lg font-semibold">Become a collaborator</h1>
        <p className="mb-6 text-sm text-fg-muted">
          Tell us a bit about yourself. If we approve your application, we&apos;ll send you a private access code —
          no account or email confirmation required.
        </p>
        <CollaborateForm />
      </div>

      <p className="mt-6 text-sm text-fg-muted">
        Already a collaborator?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Enter your code
        </Link>
      </p>
    </div>
  );
}
