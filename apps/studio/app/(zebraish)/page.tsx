import type { Metadata } from "next";
import { getServerLang } from "@/lib/i18n/server";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export async function generateMetadata(): Promise<Metadata> {
  const es = (await getServerLang()) === "es";
  return {
    title: es ? "Zebraish Studio · Construye lo que aún no existe" : "Zebraish Studio · Build what doesn't exist yet",
    description: es
      ? "Zebraish Studio convierte ideas en webs, apps, IA y marcas. Entra en el mundo Zebraish."
      : "Zebraish Studio turns ideas into websites, apps, AI and brands. Enter the Zebraish world.",
    openGraph: {
      title: "Zebraish Studio",
      description: es
        ? "El patrón se vuelve señal. La señal se vuelve forma. Entra en el mundo Zebraish."
        : "Pattern becomes signal. Signal becomes form. Enter the Zebraish world.",
      images: ["/zb/assets/zebraish-lockup-white-on-black.png"],
    },
  };
}

export default function ExperiencePage() {
  return <ZebraishPage page="experience" />;
}
