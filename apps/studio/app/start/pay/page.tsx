import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PayButton } from "@/components/configurator/PayButton";
import { getProjectByToken } from "@/lib/actions/configurator";
import { formatMoney } from "@zebraish/lib/format";
import { checkRateLimit } from "@zebraish/lib/rate-limit";

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // access_token is a UUID (already unguessable), but this still bounds
  // repeated token-guessing attempts against this lookup per source IP.
  if (token && !(await checkRateLimit("pay-token", 30, 300))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-bg text-fg">
        <Logo />
        <p className="mt-8 text-sm text-fg-muted">Too many attempts — wait a few minutes and try again.</p>
      </div>
    );
  }

  const project = token ? await getProjectByToken(token) : null;
  if (!project) notFound();

  const alreadyPaid = !["draft", "awaiting_payment"].includes(project.status);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-bg text-fg">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-bg-card p-8">
        <h1 className="mb-1 text-lg font-semibold">{project.project_code}</h1>
        <p className="mb-6 text-sm text-fg-muted">{project.client_name}</p>
        <p className="tabular-nums mb-6 text-3xl font-semibold text-accent">
          {formatMoney(Number(project.quoted_price ?? 0), project.quoted_currency ?? "EUR")}
        </p>
        {alreadyPaid ? (
          <p className="text-sm text-paid">This project has already been paid — thank you.</p>
        ) : (
          <PayButton accessToken={token!} label="Proceed to payment →" />
        )}
      </div>
    </div>
  );
}
