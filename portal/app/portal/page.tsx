import { Logo } from "@/components/Logo";
import { IntakeForm } from "@/components/IntakeForm";

export default function PortalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-8">
        <Logo label="Project & Payment Portal" />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-7">
        <h1 className="mb-1 text-lg font-semibold">Start a project with Zebraish</h1>
        <p className="mb-6 text-sm text-fg-muted">
          Tell us a little about you and we&apos;ll follow up with next steps and payment
          details.
        </p>
        <IntakeForm />
      </div>
    </div>
  );
}
