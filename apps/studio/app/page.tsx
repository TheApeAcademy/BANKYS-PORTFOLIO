import type { Metadata } from "next";
import Script from "next/script";
import { getSiteBodyHtml } from "./_site-body";
import { getServerLang } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  return lang === "es"
    ? {
        title: "ZEBRAISH STUDIO — Capa de Construcción del Ecosistema Zebraish",
        description:
          "Zebraish Studio ayuda a fundadores y negocios a convertir ideas en productos digitales reales, hechos a mano — sitios web, software, marca, automatización. La capa de construcción del ecosistema Zebraish.",
      }
    : {
        title: "ZEBRAISH STUDIO — Build Layer of the Zebraish Ecosystem",
        description:
          "Zebraish Studio helps founders and businesses turn ideas into real, hand-built digital products — websites, software, brand, automation. The build layer of the Zebraish ecosystem.",
      };
}

export default async function Home() {
  const lang = await getServerLang();
  return (
    <>
      <link rel="stylesheet" href="/site.css" />
      <div dangerouslySetInnerHTML={{ __html: getSiteBodyHtml(lang) }} />
      <Script src="/site.js" strategy="afterInteractive" />
    </>
  );
}
