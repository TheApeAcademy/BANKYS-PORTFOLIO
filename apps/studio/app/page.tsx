import type { Metadata } from "next";
import Script from "next/script";
import { SITE_BODY_HTML } from "./_site-body";

export const metadata: Metadata = {
  title: "ZEBRAISH STUDIO — Build Layer of the Zebraish Ecosystem",
  description:
    "Zebraish Studio helps founders and businesses turn ideas into real, hand-built digital products — websites, software, brand, automation. The build layer of the Zebraish ecosystem.",
};

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="/site.css" />
      <div dangerouslySetInnerHTML={{ __html: SITE_BODY_HTML }} />
      <Script src="/site.js" strategy="afterInteractive" />
    </>
  );
}
