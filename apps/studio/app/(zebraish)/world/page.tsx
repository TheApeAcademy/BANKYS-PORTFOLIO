import type { Metadata } from "next";
import { getServerLang } from "@/lib/i18n/server";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export async function generateMetadata(): Promise<Metadata> {
  const es = (await getServerLang()) === "es";
  return {
    title: "Zebraish World · Zebraish Studio",
    description: es
      ? "Zebraish Studio, dibujado por una cinta de cebra que sigue tu scroll."
      : "Zebraish Studio, drawn by a zebra ribbon that follows your scroll.",
  };
}

export default function WorldPage() {
  return <ZebraishPage page="world" />;
}
