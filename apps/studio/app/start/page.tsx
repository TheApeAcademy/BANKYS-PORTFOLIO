import { Logo } from "@/components/Logo";
import { Configurator } from "@/components/configurator/Configurator";
import { getProjectByToken } from "@/lib/actions/configurator";
import type { Answers } from "@zebraish/lib/catalogue/types";
import { getServerT } from "@/lib/i18n/server";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; payment?: string }>;
}) {
  const { token, payment } = await searchParams;
  const resumed = token ? await getProjectByToken(token) : null;
  const t = await getServerT();

  if (resumed && !["draft", "awaiting_payment"].includes(resumed.status)) {
    const justPaid = payment === "success";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center bg-bg text-fg">
        <Logo />
        <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-bg-card p-8">
          <h1 className="mb-2 text-lg font-semibold">{resumed.project_code}</h1>
          {justPaid ? (
            <p className="text-sm text-paid">{t("start.paymentReceived")}</p>
          ) : (
            <p className="text-sm text-fg-muted">
              {t("start.alreadyStatus", {
                status: resumed.status === "completed" ? t("start.status.complete") : t("start.status.inProgress"),
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <div className="mb-10">
        <Logo label={t("start.logoLabel")} />
      </div>
      {payment === "failed" ? (
        <p className="mb-6 rounded-lg border border-excluded/40 bg-excluded/10 px-4 py-3 text-sm text-excluded">
          {t("start.paymentFailed")}
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
