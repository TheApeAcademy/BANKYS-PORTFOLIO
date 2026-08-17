import { Logo } from "@/components/Logo";
import { Configurator } from "@/components/configurator/Configurator";
import { getProjectByToken } from "@/lib/actions/configurator";
import type { Answers } from "@zebraish/lib/catalogue/types";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; payment?: string }>;
}) {
  const { token, payment } = await searchParams;
  const resumed = token ? await getProjectByToken(token) : null;

  if (resumed && !["draft", "awaiting_payment"].includes(resumed.status)) {
    const justPaid = payment === "success";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-bg text-fg">
        <Logo />
        <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-bg-card p-8">
          <h1 className="mb-2 text-lg font-semibold">{resumed.project_code}</h1>
          {justPaid ? (
            <p className="text-sm text-paid">
              Payment received — thank you! We&apos;ll be in touch shortly to kick things off.
            </p>
          ) : (
            <p className="text-sm text-fg-muted">
              This project is already {resumed.status === "completed" ? "complete" : "in progress"} — reach out on
              WhatsApp if you need anything.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <div className="mb-10">
        <Logo label="Start a Project" />
      </div>
      {payment === "failed" ? (
        <p className="mb-6 rounded-lg border border-excluded/40 bg-excluded/10 px-4 py-3 text-sm text-excluded">
          That payment didn&apos;t go through — you can try again below.
        </p>
      ) : null}
      <Configurator
        initial={
          resumed
            ? {
                accessToken: token!,
                projectCode: resumed.project_code,
                clientName: resumed.client_name,
                clientContact: resumed.client_contact ?? "",
                projectType: resumed.project_type ?? "website",
                answers: (resumed.configuration ?? {}) as Answers,
              }
            : null
        }
      />
    </div>
  );
}
