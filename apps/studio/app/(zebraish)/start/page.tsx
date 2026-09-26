import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export const metadata: Metadata = {
  title: "Start a project · Zebraish Studio",
  description: "Tell Zebraish Studio what you're creating. Four quick questions, then a tailored proposal.",
};

export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const { token, payment } = await searchParams;
  // Saved projects (and the Flutterwave callback) resume in the Configurator.
  if (typeof token === "string") {
    const qs = new URLSearchParams({ token, ...(typeof payment === "string" ? { payment } : {}) });
    redirect(`/start/resume?${qs}`);
  }
  return <ZebraishPage page="start" />;
}
