"use client";

// The studio's liquid (ZebraishHome initLiquid, behind "Let's build"): silver
// metaballs rising and merging. Drawn smaller and at ~30fps here since it runs
// behind every Bureau page, and paused while the tab is hidden.
import { useEffect, useRef } from "react";

const W = 600;
const H = 340;

export function LiquidCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = Math.sin, C = Math.cos;
    const k = W / 900; // blob sizes were drawn for a 900px canvas
    let t = 0, raf = 0, last = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden || now - last < 33) return;
      last = now;
      const cx = W * 0.5, cy = H * 0.62;
      const bl: [number, number, number][] = [
        [cx, cy + 70 * k, 100], [cx - 55 * k + S(t * 0.3) * 8, cy + 48 * k, 72], [cx + 65 * k + C(t * 0.25) * 6, cy + 52 * k, 68],
        [cx - 80 * k + S(t * 0.35) * 10, cy - 18 * k + C(t * 0.4) * 8, 58], [cx - 100 * k + S(t * 0.3) * 12, cy - 90 * k + C(t * 0.35) * 6, 46],
        [cx - 70 * k + S(t * 0.25) * 8, cy - 155 * k + C(t * 0.3) * 5, 35], [cx + 90 * k + C(t * 0.28) * 10, cy - 44 * k + S(t * 0.35) * 6, 52],
        [cx + 110 * k + C(t * 0.25) * 8, cy - 128 * k + S(t * 0.3) * 5, 38], [cx + 85 * k + C(t * 0.3) * 6, cy - 195 * k + S(t * 0.25) * 6, 28],
        [cx - 25 * k + S(t * 0.6) * 8, cy - 230 * k + C(t * 0.5) * 10, 24], [cx + 18 * k + C(t * 0.55) * 6, cy - 250 * k + S(t * 0.45) * 8, 18],
        [cx - 55 * k + S(t * 0.5) * 5, cy - 265 * k + C(t * 0.4) * 6, 13], [cx + 50 * k + C(t * 0.45) * 5, cy - 255 * k + S(t * 0.4) * 5, 11],
      ].map(([x, y, r]) => [x, y, r * k] as [number, number, number]);
      const img = ctx.createImageData(W, H), d = img.data, st = 2;
      for (let py = 0; py < H; py += st)
        for (let px = 0; px < W; px += st) {
          let sum = 0;
          for (const b of bl) {
            const dx = px - b[0], dy = py - b[1];
            sum += (b[2] * b[2]) / (dx * dx + dy * dy + 0.01);
          }
          if (sum <= 1) continue;
          const ang = Math.atan2(py - cy, px - cx);
          const kL = (C(ang - 0.8 + t * 0.4) + 1) / 2, fL = (C(ang + 2.1 - t * 0.2) + 1) / 2;
          const sp = Math.pow(Math.max(0, C(ang - 0.7 + t * 0.5)), 7);
          const v = Math.min(255, Math.floor((kL * 0.72 + fL * 0.28) * 180 + 40) + Math.floor(sp * 220));
          const a = Math.floor(Math.min(1, (sum - 1) * 4) * 220);
          for (let sy = 0; sy < st && py + sy < H; sy++)
            for (let sx = 0; sx < st && px + sx < W; sx++) {
              const i = ((py + sy) * W + px + sx) * 4;
              d[i] = d[i + 1] = d[i + 2] = v;
              d[i + 3] = a;
            }
        }
      ctx.putImageData(img, 0, 0);
      t += 0.022;
      if (reduce) cancelAnimationFrame(raf); // one still frame
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={W} height={H} className={className} aria-hidden />;
}
