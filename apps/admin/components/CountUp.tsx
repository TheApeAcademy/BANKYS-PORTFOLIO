"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@zebraish/lib/format";

type CountUpProps =
  | { value: number; format: "money"; currency?: string }
  | { value: number; format: "integer" };

/** Animates from 0 to `value` over ~600ms on mount/change. No animation
 * library needed — requestAnimationFrame is enough for a count-up effect.
 * `format` is a plain string/kind, not a function — a Server Component
 * can't pass a closure across the client boundary, so formatting happens
 * here instead of being handed in from the caller. */
export function CountUp(props: CountUpProps) {
  const { value } = props;
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);
  const format = (n: number) => (props.format === "money" ? formatMoney(n, props.currency) : String(Math.round(n)));

  useEffect(() => {
    const start = performance.now();
    const duration = 600;
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <>{format(display)}</>;
}
