import type { Metadata } from "next";
import { ZebraishPage } from "@/components/zebraish/ZebraishPage";

export const metadata: Metadata = {
  title: "Zebraish Studio · Build Layer of the Zebraish Ecosystem",
  description:
    "Zebraish Studio helps founders and businesses turn ideas into real, hand-built digital products: websites, software, brand, automation.",
};

export default function StudioPage() {
  return <ZebraishPage page="home" />;
}
