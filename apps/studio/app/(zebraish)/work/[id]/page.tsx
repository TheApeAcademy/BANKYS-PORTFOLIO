import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";
import { ZB_PROJECTS } from "@/lib/zebraish/projects.js";

type Project = { id: string; name: string; desc: string; img?: string; logo?: boolean };
const PROJECTS = ZB_PROJECTS as Project[];

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/work/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return {};
  return {
    title: `${p.name} · Case study · Zebraish Studio`,
    description: p.desc,
    openGraph: { title: `${p.name} · Zebraish Studio`, description: p.desc, images: p.img ? [p.img] : undefined },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[id]">) {
  const { id } = await params;
  if (!PROJECTS.some((p) => p.id === id)) notFound();
  return <ZebraishPage page="case" id={id} />;
}
