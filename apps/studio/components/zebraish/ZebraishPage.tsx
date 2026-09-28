"use client";

import dynamic from "next/dynamic";

// The ported pages read window, localStorage and WebGL while constructing, so
// they render on the client only (as the prototypes did).
const PAGES = {
  experience: dynamic(() => import("./ZebraishExperience"), { ssr: false }),
  home: dynamic(() => import("./ZebraishHome"), { ssr: false }),
  world: dynamic(() => import("./ZebraishWorld"), { ssr: false }),
  case: dynamic(() => import("./CaseStudy"), { ssr: false }),
};

export function ZebraishPage({ page, ...props }: { page: keyof typeof PAGES } & Record<string, unknown>) {
  const Page = PAGES[page] as React.ComponentType<Record<string, unknown>>;
  return <Page {...props} />;
}
