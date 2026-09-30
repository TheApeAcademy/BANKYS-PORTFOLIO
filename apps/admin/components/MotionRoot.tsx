"use client";

// Marks glass cards and [data-reveal] blocks with data-in while they are on
// screen and clears it when they leave, so reveals, chart drawing and bar
// growth (globals.css) replay every time you scroll back to them. Watches for
// new content, so it keeps working across page changes. Reduced-motion
// visitors get everything shown at once.
import { useEffect, useRef } from "react";

const SEL = ".glass, [data-reveal]";

export function MotionRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.setAttribute("data-motion", "");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.setAttribute("data-in", "");
          else e.target.removeAttribute("data-in");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      root.querySelectorAll(SEL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.removeAttribute("data-motion");
    };
  }, []);

  return (
    <main ref={ref} className="relative z-[1] mx-auto max-w-6xl px-6 py-10">
      {children}
    </main>
  );
}
