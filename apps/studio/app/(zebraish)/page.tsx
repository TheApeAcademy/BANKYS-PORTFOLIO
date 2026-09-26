import type { Metadata } from "next";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export const metadata: Metadata = {
  title: "Zebraish Studio · Build what doesn't exist yet",
  description: "Zebraish Studio turns ideas into websites, apps, AI and brands. Enter the Zebraish world.",
  openGraph: {
    title: "Zebraish Studio",
    description: "Pattern becomes signal. Signal becomes form. Enter the Zebraish world.",
    images: ["/zb/assets/zebraish-lockup-white-on-black.png"],
  },
};

export default function ExperiencePage() {
  return <ZebraishPage page="experience" />;
}
