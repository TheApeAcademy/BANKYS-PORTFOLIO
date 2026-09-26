import type { Metadata } from "next";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export const metadata: Metadata = {
  title: "Zebraish World · Zebraish Studio",
  description: "Zebraish Studio, drawn by a zebra ribbon that follows your scroll.",
};

export default function WorldPage() {
  return <ZebraishPage page="world" />;
}
