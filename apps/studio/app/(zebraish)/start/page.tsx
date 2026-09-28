import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Start a project · Zebraish Studio",
  description: "Build your project brief with Zebraish Studio: live estimate, complexity grade, and a final price after review.",
};

export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const { token, payment } = await searchParams;
  // Saved projects (and the Flutterwave callback) resume in the Configurator.
  if (typeof token === "string") {
    const qs = new URLSearchParams({ token, ...(typeof payment === "string" ? { payment } : {}) });
    redirect(`/start/resume?${qs}`);
  }
  // New briefs are built in the glass Project Builder, opened over Zebraish Home.
  redirect("/studio?build=1");
}
