import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Track your project · Zebraish Studio",
};

// Private tracking links (/track?token=...) open the glass tracker over Zebraish Home.
export default async function TrackPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  redirect(`/studio?track=${token ? encodeURIComponent(token) : "1"}`);
}
