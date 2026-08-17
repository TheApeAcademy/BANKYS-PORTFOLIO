import { Logo } from "@/components/Logo";
import { Configurator } from "@/components/configurator/Configurator";
import { getProjectByToken } from "@/lib/actions/configurator";
import type { Answers } from "@/lib/catalogue/types";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const resumed = token ? await getProjectByToken(token) : null;

  if (resumed && !["draft", "awaiting_payment"].includes(resumed.status)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <Logo />
        <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-bg-card p-8">
          <h1 className="mb-2 text-lg font-semibold">{resumed.project_code}</h1>
          <p className="text-sm text-fg-muted">
            This project is already {resumed.status === "completed" ? "complete" : "in progress"} — reach out on
            WhatsApp if you need anything.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="mb-10">
        <Logo label="Start a Project" />
      </div>
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
