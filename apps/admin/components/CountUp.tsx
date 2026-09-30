"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@zebraish/lib/format";

type CountUpProps =
  | { value: number; format: "money"; currency?: string }
  | { value: number; format: "integer" | "percent" };

/** Counts from 0 up to `value` each time the number scrolls into view (and
 * again when the value changes). `format` is a plain kind, not a function: a
 * Server Component can't pass a closure across the client boundary. */
export function CountUp(props: CountUpProps) {
  const { value } = props;
  const [display, setDisplay] = useState(0);
  const el = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);
  const visible = useRef(false);

  const format = (n: number) =>
    props.format === "money" ? formatMoney(n, props.currency) : props.format === "percent" ? `${Math.round(n)}%` : String(Math.round(n));

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      if (reduce) return setDisplay(value);
      const start = performance.now();
      const duration = 1100;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setDisplay(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible.current) {
        visible.current = true;
        run();
      } else if (!e.isIntersecting && visible.current) {
        visible.current = false;
        if (!reduce) setDisplay(0); // ready to count again next time
      }
    });
    io.observe(node);
    if (visible.current) run(); // value changed while on screen
    return () => {
      io.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <span ref={el}>{format(display)}</span>;
}
