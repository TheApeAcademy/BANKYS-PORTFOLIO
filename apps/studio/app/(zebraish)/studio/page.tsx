import type { Metadata } from "next";
import { getServerLang } from "@/lib/i18n/server";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export async function generateMetadata(): Promise<Metadata> {
  const es = (await getServerLang()) === "es";
  return {
    title: es ? "Zebraish Studio · La capa de construcción del ecosistema Zebraish" : "Zebraish Studio · Build Layer of the Zebraish Ecosystem",
    description: es
      ? "Zebraish Studio ayuda a fundadores y empresas a convertir ideas en productos digitales reales, hechos a mano: webs, software, marca y automatización."
      : "Zebraish Studio helps founders and businesses turn ideas into real, hand-built digital products: websites, software, brand, automation.",
  };
}

export default function StudioPage() {
  return <ZebraishPage page="home" />;
}
