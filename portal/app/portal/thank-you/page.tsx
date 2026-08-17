import { Logo } from "@/components/Logo";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-8">
        <h1 className="mb-2 text-lg font-semibold">You&apos;re in.</h1>
        <p className="mb-5 text-sm text-fg-muted">
          Your Zebraish project reference is below. We&apos;ll be in touch shortly.
        </p>
        <p className="tabular-nums rounded-lg border border-border bg-bg-raised px-4 py-3 text-2xl font-semibold tracking-wide text-accent">
          {code ?? "—"}
        </p>
      </div>
    </div>
  );
}
