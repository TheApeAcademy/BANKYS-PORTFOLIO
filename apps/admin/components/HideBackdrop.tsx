"use client";

import StripeField from "@/components/zebraish/StripeField";
import { LiquidCanvas } from "@/components/LiquidCanvas";

/** The studio's living zebra hide and its liquid behind every Bureau page,
 * under a dark veil so figures stay readable. Fixed, so it sits still while
 * the page scrolls over it. */
export function HideBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <StripeField mode="hide" __hostStyle={{ position: "absolute", inset: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,5,6,.35),rgba(5,5,6,.78)_60%,rgba(5,5,6,.9))]" />
      <LiquidCanvas className="absolute bottom-[-2vh] left-1/2 w-[min(820px,110vw)] -translate-x-1/2 opacity-[.2] mix-blend-screen blur-[.6px]" />
    </div>
  );
}
