/* eslint-disable */
// Scroll ribbon: one zebra-striped ribbon that flows down the page with scroll.
// It draws itself as you scroll, bends away from the cursor, and ripples with scroll speed.
// Same API as world.js: mount(canvas) -> { reveal, setTheme, destroy }.
export function mount(canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, raf = 0, t = 0, last = performance.now();
  let ink = '#f5f5f7', bg = '#060608', reveal = 0, vel = 0, lastS = scrollY, mx = -9999, my = -9999, smx = -9999, smy = -9999;
  const N = 140, pts = Array.from({ length: N }, () => ({ ox: 0, oy: 0, vx: 0, vy: 0 }));
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  const onMove = e => { mx = e.clientX; my = e.clientY; };
  const onLeave = () => { mx = my = -9999; };
  // the ribbon path in page space: a slow meander from the top of the page to the bottom
  function base(u, docH, sy) {
    const y = u * docH - sy;
    const x = W * (.5 + .34 * Math.sin(u * 9.5 + .6) * Math.cos(u * 3.1) + .08 * Math.sin(u * 23 + t * .25));
    return [x, y];
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
    const sy = scrollY, docH = Math.max(H, document.documentElement.scrollHeight), prog = Math.min(1, (sy + H * .85) / docH);
    vel += (Math.min(1, Math.abs(sy - lastS) / 40) - vel) * .1; lastS = sy;
    smx += (mx - smx) * .15; smy += (my - smy) * .15;
    ctx.clearRect(0, 0, W, H);
    const u0 = Math.max(0, (sy - H * .2) / docH), u1 = prog;
    const P = [];
    for (let i = 0; i < N; i++) {
      const u = u0 + (u1 - u0) * i / (N - 1); let [x, y] = base(u, docH, sy);
      x += Math.sin(u * 60 - t * 3) * 14 * vel;
      const p = pts[i], dx = x + p.ox - smx, dy = y + p.oy - smy, d2 = dx * dx + dy * dy, R = 150;
      if (d2 < R * R && !reduce) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5; p.vx += dx / d * f; p.vy += dy / d * f; }
      p.vx += -p.ox * .06; p.vy += -p.oy * .06; p.vx *= .82; p.vy *= .82; p.ox += p.vx; p.oy += p.vy;
      P.push([x + p.ox, y + p.oy]);
    }
    if (P.length < 2 || reveal <= 0) return;
    const path = () => { ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) { const mxp = (P[i][0] + P[i + 1][0]) / 2, myp = (P[i][1] + P[i + 1][1]) / 2; ctx.quadraticCurveTo(P[i][0], P[i][1], mxp, myp); } ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = .06 * reveal; ctx.strokeStyle = ink; ctx.lineWidth = 34; path(); ctx.stroke();
    ctx.globalAlpha = .9 * reveal; ctx.lineWidth = 12; ctx.strokeStyle = bg; path(); ctx.stroke();
    ctx.strokeStyle = ink; ctx.lineWidth = 12;
    ctx.setLineDash([22, 9, 5, 12, 40, 8, 3, 14, 16, 10]); ctx.lineDashOffset = -sy * .6 - t * 12; path(); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = .5 * reveal; ctx.lineWidth = 1; path(); ctx.stroke();
    const e = P[P.length - 1]; ctx.globalAlpha = reveal; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(e[0], e[1], 4 + vel * 3, 0, 7); ctx.fill();
    ctx.globalAlpha = .18 * reveal; ctx.beginPath(); ctx.arc(e[0], e[1], 14 + Math.sin(t * 3) * 3, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  resize(); addEventListener('resize', resize); addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('pointerleave', onLeave);
  raf = requestAnimationFrame(tick);
  return {
    reveal(v) { reveal = v; },
    setTheme(i, b) { ink = i; bg = b; canvas.style.background = b; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); },
  };
}
