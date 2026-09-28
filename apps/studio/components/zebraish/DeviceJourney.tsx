// @ts-nocheck
/* eslint-disable */
"use client";
// Device Journey: ported from the Claude Design handoff (Device Journey.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { tr } from "@/lib/zebraish/i18n";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  rootRef = React.createRef();
  SITES = [
    ['MALAAK', 'Modest Luxury Abayas', 'Modest Fashion', 'malaak-abaya.vercel.app', '/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg', 'Shop now'],
    ['DOBERMAN', 'Bold Brand Experience', 'Brand', 'doberman-kappa.vercel.app', '/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg', 'Enter'],
    ['CHRTT.PRIETO', 'Fashion & Lifestyle Creator', 'Creator', 'christain-theapeacademys-projects.vercel.app', '', 'Collab'],
    ['AAURA', 'Arabian Luxury Perfumery', 'Fragrance', 'aaura-perfume.vercel.app', '/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg', 'Order'],
    ['HOT CHEF', 'Culinary Excellence', 'Food & Drink', 'hot-chef.vercel.app', '', 'Menu'],
    ['APE ACADEMY', 'Academic Excellence', 'Education', 'deploy-1-p1ke.vercel.app', '/zb/assets/Screenshot_20260412-220250_Chrome.png', 'Enrol'],
    ['REVERIE', 'Luxury Beauty Salon', 'Beauty', 'reverie-salon.vercel.app', '/zb/assets/4c7faa2cf965371c0d8c790e9d5f61a1.jpg', 'Book'],
    ['NOIR ATELIER', 'Luxury Ready-to-Wear', 'Apparel', 'noir-atelier-clothing.vercel.app', '', 'Shop'],
    ['EMBER & SALT', 'Wood-Fired Restaurant', 'Food & Drink', 'ember-salt-restaurant.vercel.app', '', 'Reserve'],
    ['PADI', 'Stories That Talk Back', 'Entertainment', 'padi-three.vercel.app', '', 'Play'],
    ['SHADOWZ', 'Urban Art Intelligence', 'Urban Tech', 'shadow-rho-three.vercel.app', '', 'Explore'],
    ['PM PORTFOLIO', 'Product & Frontend Builder', 'Tech', 'pm-portfolio-steel-rho.vercel.app', '', 'View'],
  ];
  // Sites that refuse to load in an iframe (X-Frame-Options: DENY); their screenshot fills the screen instead.
  NO_FRAME = new Set(['doberman-kappa.vercel.app']);
  // w,h as fraction of viewport min-dim-aware; x offset (fraction of W); r radius; b bezel; chin; rz, ry; list alpha; site index; cursor path; stand
  keys(W, H) {
    const m = Math.min(W, H);
    return [
      { p: 0, x: .14 * W, w: Math.min(.56 * W, 1.45 * H * .62), ar: .64, r: 18, b: 14, chin: 30, rz: 0, ry: 0, list: 1, site: 0, name: 'iMac', sub: 'Every site, on every screen', stand: 1, stop: 0 },
      { p: .1, x: .14 * W, w: Math.min(.56 * W, 1.45 * H * .62), ar: .64, r: 18, b: 14, chin: 30, rz: 0, ry: 0, list: 1, site: 0, name: 'iMac', sub: 'Every site, on every screen', stand: 1, stop: 0 },
      { p: .2, x: 0, w: W * 1.02, ar: H * 1.02 / (W * 1.02), r: 0, b: 0, chin: 0, rz: 0, ry: 0, list: 0, site: 0, name: 'Full screen', sub: 'Scroll inside the site', stand: 0, stop: 1 },
      { p: .3, x: 0, w: .6 * W > 1.1 * H ? 1.1 * H : .6 * W, ar: .72, r: 30, b: 18, chin: 0, rz: 0, ry: 0, list: 0, site: 4, name: 'iPad', sub: 'Landscape', stand: 0, stop: 2 },
      { p: .4, x: 0, w: .6 * W > 1.1 * H ? 1.1 * H * .8 : .48 * W, ar: .72, r: 30, b: 18, chin: 0, rz: 90, ry: 0, list: 0, site: 4, name: 'iPad', sub: 'Rolls to portrait', stand: 0, stop: 3 },
      { p: .52, x: 0, w: .72 * m, ar: .46, r: 44, b: 10, chin: 0, rz: 90, ry: 360, list: 0, site: 3, name: 'iPhone', sub: 'Flips front to back', stand: 0, stop: 4 },
      { p: .64, x: 0, w: .95 * m, ar: .46, r: 50, b: 10, chin: 0, rz: 0, ry: 360, list: 0, site: 3, name: 'iPhone', sub: 'Landscape', stand: 0, stop: 5 },
      { p: .8, x: 0, w: Math.min(W * .94, H * .86 / .5625), ar: .5625, r: 6, b: 6, chin: 0, rz: 0, ry: 360, list: 0, site: 6, name: '100" TV', sub: 'Living-room scale', stand: 2, stop: 6 },
      { p: .92, x: 0, w: Math.min(W * .94, H * .86 / .5625), ar: .5625, r: 6, b: 6, chin: 0, rz: 0, ry: 360, list: 0, site: 5, name: '100" TV', sub: 'Living-room scale', stand: 2, stop: 7 },
      { p: 1, x: .14 * W, w: Math.min(.56 * W, 1.45 * H * .62), ar: .64, r: 18, b: 14, chin: 30, rz: 0, ry: 360, list: 1, site: 0, name: 'Back to the list', sub: 'Pick any site', stand: 1, stop: 7 },
    ];
  }
  componentDidMount() {
    const root = this.rootRef.current;
    if (!root || !root.querySelector('[data-live]') || !root.querySelector('[data-stop]')) { this._retry = setTimeout(() => this.componentDidMount(), 120); return; }
    const q = s => root.querySelector(s);
    this.el = { dev: q('[data-dev]'), screen: q('[data-screen]'), content: q('[data-content]'), page: q('[data-page]'), cursor: q('[data-cursor]'), ripple: q('[data-ripple]'), list: q('[data-list]'), stand: q('[data-stand]'), cam: q('[data-cam]'), bar: q('[data-bar]'), host: q('[data-host]'), sname: q('[data-sname]'), stag: q('[data-stag]'), btn: q('[data-btn]'), dname: q('[data-dname]'), dsub: q('[data-dsub]'), shade: q('[data-shade]'), back: q('[data-back]'), pin: q('[data-sticky]'), grid: q('[data-grid]'), live: q('[data-live]'), front: q('[data-front]') };
    this.rows = [...root.querySelectorAll('[data-row]')]; this.stops = [...root.querySelectorAll('[data-stop]')];
    this.cur = { p: 0 }; this.lastSite = -1; this.lastClick = -1;
    const loop = () => { this.raf = requestAnimationFrame(loop); try { this.frame(); } catch (err) { window.__djErr = String(err && err.stack || err); } };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { clearTimeout(this._retry); clearTimeout(this._lt); cancelAnimationFrame(this.raf); }
  frame() {
    const root = this.rootRef.current; if (!root) return;
    const r = root.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    if (r.bottom < -50 || r.top > H + 50) return;
    const target = Math.max(0, Math.min(1, -r.top / (r.height - H)));
    this.el.pin.style.transform = `translate3d(0,${Math.max(0, Math.min(r.height - H, -r.top))}px,0)`;
    this.cur.p += (target - this.cur.p) * .12;
    const p = this.cur.p, K = this.keys(W, H);
    let i = 0; while (i < K.length - 2 && p > K[i + 1].p) i++;
    const A = K[i], B = K[i + 1], lt = Math.max(0, Math.min(1, (p - A.p) / (B.p - A.p || 1)));
    const e = lt < .5 ? 4 * lt * lt * lt : 1 - Math.pow(-2 * lt + 2, 3) / 2;
    const L = k => A[k] + (B[k] - A[k]) * e;
    const w = L('w'), h = w * (A.ar + (B.ar - A.ar) * e), rz = L('rz'), ry = L('ry'), bz = L('b'), chin = L('chin'), rad = L('r'), x = L('x');
    const E = this.el, near = e < .5 ? A : B;
    const showBack = Math.cos(ry * Math.PI / 180) < 0; E.back.style.display = showBack ? 'flex' : 'none'; E.front.style.visibility = showBack ? 'hidden' : 'visible';
    E.dev.style.width = w + 'px'; E.dev.style.height = h + 'px'; E.dev.style.borderRadius = rad + 'px';
    E.dev.style.transform = `translate(calc(-50% + ${x}px),-50%) rotateZ(${rz}deg) rotateY(${ry}deg) rotateX(${Math.sin(ry * Math.PI / 180) * 6}deg)`;
    E.screen.style.left = bz + 'px'; E.screen.style.right = bz + 'px'; E.screen.style.top = bz + 'px'; E.screen.style.bottom = (bz + chin) + 'px'; E.screen.style.borderRadius = Math.max(0, rad - bz * .6) + 'px';
    const sw = w - 2 * bz, sh = h - 2 * bz - chin, turned = Math.abs(Math.round(rz / 90)) % 2 === 1 && Math.abs(rz % 90) < 1;
    const cw = Math.abs(Math.cos(rz * Math.PI / 180)) > .5 ? sw : sh, ch = cw === sw ? sh : sw;
    E.content.style.width = cw + 'px'; E.content.style.height = ch + 'px'; E.content.style.transform = `translate(-50%,-50%) rotate(${-rz}deg)`;
    E.bar.style.opacity = /iMac|Full|Back/.test(near.name) ? 1 : 0;
    E.cam.style.left = '50%'; E.cam.style.top = Math.max(2, bz / 2 - 3) + 'px'; E.cam.style.opacity = bz > 8 ? 1 : 0;
    E.list.style.opacity = L('list'); E.list.style.transform = `translate(${(1 - L('list')) * -60}px,-50%)`;
    const st = L('stand');
    E.stand.style.width = (st > 1 ? w * .28 : w * .22 * Math.min(1, st)) + 'px'; E.stand.style.height = (st > 1 ? 10 : 60 * Math.min(1, st)) + 'px'; E.stand.style.opacity = Math.min(1, st);
    E.stand.style.borderRadius = st > 1 ? '0 0 4px 4px' : '0 0 14px 14px';
    const seg = (p - A.p) / (B.p - A.p || 1);
    const siteIdx = near.site, S = this.SITES[siteIdx];
    if (siteIdx !== this.lastSite) {
      this.lastSite = siteIdx; E.host.textContent = S[3]; E.sname.textContent = S[0]; E.stag.textContent = tr(S[1]); E.btn.textContent = tr(S[5]);
      E.grid.style.display = S[4] ? 'none' : 'grid';
      E.live.style.opacity = 0; E.live.onload = () => { if (E.live.src !== 'about:blank') E.live.style.opacity = 1; }; clearTimeout(this._lt);
      const framed = !this.NO_FRAME.has(S[3]); E.live.style.display = framed ? 'block' : 'none'; E.shade.style.display = E.sname.parentElement.style.display = framed || !S[4] ? '' : 'none';
      this._lt = setTimeout(() => { E.live.src = framed ? 'https://' + S[3] : 'about:blank'; }, 250);
      E.page.style.backgroundImage = S[4] ? `url('${S[4]}')` : 'repeating-linear-gradient(124deg,rgba(255,255,255,.05) 0 2px,transparent 2px 16px)';
      this.rows.forEach((row, k) => { row.style.background = k === siteIdx ? 'rgba(var(--tint-rgb),.07)' : 'transparent'; row.style.color = k === siteIdx ? 'var(--text)' : 'var(--text-muted)'; });
    }
    const lw = /iPhone/.test(near.name) && Math.abs(Math.cos(rz * Math.PI / 180)) < .5 ? 390 : /iPhone/.test(near.name) ? 844 : /iPad/.test(near.name) ? (cw > ch ? 1180 : 820) : 1440;
    const barH = /iMac|Full|Back/.test(near.name) ? 24 : 0, ph = Math.max(1, ch - barH), sc = cw / lw;
    E.page.style.top = barH + 'px'; E.page.style.height = ph + 'px';
    if (this._lw !== lw || Math.abs((this._sc || 0) - sc) > .002 || Math.abs((this._ph || 0) - ph) > 1) { this._lw = lw; this._sc = sc; this._ph = ph; E.live.style.width = lw + 'px'; E.live.style.height = (ph / sc) + 'px'; E.live.style.transform = 'scale(' + sc + ')'; }
    const cx = .3 + .4 * Math.sin(p * 17), cy = .25 + .45 * (.5 + .5 * Math.sin(p * 11 + 1));
    E.cursor.style.left = (cx * cw) + 'px'; E.cursor.style.top = (cy * ch) + 'px';
    const clickSlot = Math.floor(p * 14);
    if (clickSlot !== this.lastClick) { this.lastClick = clickSlot; E.ripple.style.animation = 'none'; E.ripple.offsetWidth; E.ripple.style.animation = 'djclick .6s ease-out'; E.btn.style.transform = 'scale(.94)'; setTimeout(() => { if (E.btn) E.btn.style.transform = ''; }, 160); }
    E.dname.textContent = tr(near.name); E.dsub.textContent = tr(near.sub);
    this.stops.forEach((s, k) => { const on = k === near.stop; s.style.background = on ? 'var(--invert-bg)' : 'transparent'; s.style.color = on ? 'var(--invert-fg)' : 'var(--text-faint)'; });
  }
  renderVals() {
    return {
      rootRef: this.rootRef,
      sites: this.SITES.map((s, i) => ({ i, num: String(i + 1).padStart(2, '0'), name: s[0], ind: s[2] })),
      stops: ['iMac', 'Full', 'iPad', 'Portrait', 'Flip', 'Phone', '100" TV', 'End'].map((label, i) => ({ i, label })),
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.3);--invert-bg:#fff;--invert-fg:#000}\n[data-theme=\"light\"]{--bg:#faf9f7;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--invert-bg:#141414;--invert-fg:#fff}\n@keyframes djclick{from{transform:translate(-50%,-50%) scale(.2);opacity:.9}to{transform:translate(-50%,-50%) scale(2.4);opacity:0}}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section ref={v.rootRef} style={{"position":"relative","height":"720vh","background":"var(--bg)","fontFamily":"Inter,-apple-system,sans-serif","color":"var(--text)"}}>
      {" "}
      <div data-sticky="1" style={{"position":"absolute","left":"0","right":"0","top":"0","height":"100vh","willChange":"transform","overflow":"hidden","perspective":"2200px"}}>
        {" "}
        <div data-list="1" style={{"position":"absolute","left":"48px","top":"50%","transform":"translateY(-50%)","width":"300px","display":"flex","flexDirection":"column","gap":"2px","zIndex":"2"}}>
          {" "}
          <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","marginBottom":"14px"}}>{"Live on screen · 12 sites"}</div>
          {" "}
          {each(v, v.sites, "s", (v) => (
            <>
              {" "}
              <div data-row={v.s?.i} style={{"display":"grid","gridTemplateColumns":"28px 1fr auto","alignItems":"center","gap":"10px","padding":"8px 12px","borderRadius":"12px","transition":"background .3s,color .3s","color":"var(--text-muted)"}}>
                {" "}
                <span style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".14em","color":"var(--text-faint)"}}>{I(v.s?.num)}</span>
                {" "}
                <span style={{"fontSize":"14px","fontWeight":"700","letterSpacing":".06em"}}>{I(v.s?.name)}</span>
                {" "}
                <span style={{"fontSize":"9px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","color":"var(--text-faint)"}}>{I(v.s?.ind)}</span>
                {" "}
              </div>
              {" "}
            </>
          ))}
          {" "}
        </div>
        {" "}
        <div data-dev="1" style={{"position":"absolute","left":"50%","top":"50%","transformStyle":"preserve-3d","willChange":"transform,width,height"}}>
          {" "}
          <div data-front="1" style={{"position":"absolute","inset":"0","borderRadius":"inherit","background":"linear-gradient(#2c2c32,#121216)","boxShadow":"0 60px 120px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.1)","backfaceVisibility":"hidden","WebkitBackfaceVisibility":"hidden"}}>
            {" "}
            <div data-screen="1" style={{"position":"absolute","overflow":"hidden","background":"#000"}}>
              {" "}
              <div data-content="1" style={{"position":"absolute","left":"50%","top":"50%"}}>
                {" "}
                <div data-bar="1" style={{"position":"absolute","top":"0","left":"0","right":"0","height":"24px","background":"#1b1b1f","display":"flex","alignItems":"center","gap":"6px","padding":"0 10px","zIndex":"3"}}>
                  <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#ff5f57"}} />
                  <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#febc2e"}} />
                  <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#28c840"}} />
                  <span data-host="1" style={{"margin":"0 auto","fontSize":"10px","color":"rgba(255,255,255,.55)","fontFamily":"ui-monospace,Menlo,monospace","background":"rgba(255,255,255,.06)","padding":"2px 12px","borderRadius":"5px"}}>{"malaak-abaya.vercel.app"}</span>
                </div>
                {" "}
                <div data-page="1" style={{"position":"absolute","left":"0","right":"0","top":"24px","height":"100%","overflow":"hidden","backgroundSize":"cover","backgroundPosition":"top center","backgroundImage":"repeating-linear-gradient(124deg,rgba(255,255,255,.05) 0 2px,transparent 2px 16px)"}}>
                  {" "}
                  <iframe data-live="1" title="Live site" loading="lazy" tabIndex="-1" scrolling="no" style={{"position":"absolute","left":"0","top":"0","border":"0","transformOrigin":"0 0","pointerEvents":"none","background":"transparent","opacity":"0","transition":"opacity .6s","zIndex":"2"}} />
                  {" "}
                  <div data-shade="1" style={{"position":"absolute","inset":"0","background":"linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.6))"}} />
                  {" "}
                  <div style={{"position":"absolute","top":"14%","left":"0","right":"0","display":"flex","flexDirection":"column","alignItems":"center","gap":"8px","textAlign":"center","padding":"0 16px"}}>
                    {" "}
                    <span data-sname="1" style={{"fontSize":"clamp(22px,4vw,56px)","fontWeight":"900","letterSpacing":".08em","color":"#fff"}}>{"MALAAK"}</span>
                    {" "}
                    <span data-stag="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".2em","textTransform":"uppercase","color":"rgba(255,255,255,.7)"}}>{"Modest Luxury Abayas"}</span>
                    {" "}
                    <span data-btn="1" style={{"marginTop":"14px","fontSize":"11px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","padding":"9px 18px","borderRadius":"100px","background":"#fff","color":"#000","transition":"transform .2s"}}>{"Shop now"}</span>
                    {" "}
                  </div>
                  {" "}
                  <div data-grid="1" style={{"position":"absolute","top":"44%","left":"6%","right":"6%","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"8px"}}>
                    {" "}
                    <span style={{"aspectRatio":"3/4","borderRadius":"8px","background":"rgba(255,255,255,.08)"}} />
                    <span style={{"aspectRatio":"3/4","borderRadius":"8px","background":"rgba(255,255,255,.08)"}} />
                    <span style={{"aspectRatio":"3/4","borderRadius":"8px","background":"rgba(255,255,255,.08)"}} />
                    {" "}
                  </div>
                  {" "}
                </div>
                {" "}
                <div data-cursor="1" style={{"position":"absolute","left":"0","top":"0","width":"18px","height":"18px","zIndex":"5","pointerEvents":"none","transform":"translate(-2px,-2px)"}}>
                  {" "}
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M3 2l17 9-7 2-3 7z" fill="#fff" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  {" "}
                  <span data-ripple="1" style={{"position":"absolute","left":"3px","top":"3px","width":"26px","height":"26px","borderRadius":"50%","border":"2px solid #fff","opacity":"0"}} />
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div data-cam="1" style={{"position":"absolute","width":"6px","height":"6px","borderRadius":"50%","background":"#0a0a0c","boxShadow":"inset 0 0 0 1px rgba(255,255,255,.12)"}} />
            {" "}
          </div>
          {" "}
          <div data-back="1" style={{"display":"flex","position":"absolute","inset":"0","borderRadius":"inherit","background":"linear-gradient(135deg,#3a3a40,#16161a 60%,#2a2a2f)","transform":"rotateY(180deg)","backfaceVisibility":"hidden","WebkitBackfaceVisibility":"hidden","alignItems":"center","justifyContent":"center","boxShadow":"inset 0 0 0 1px rgba(255,255,255,.1)"}}>
            {" "}
            <img src="/zb/assets/zebraish-mark.png" alt="" style={{"width":"22%","maxWidth":"120px","opacity":".85"}} />
            {" "}
          </div>
          {" "}
          <div data-stand="1" style={{"position":"absolute","left":"50%","top":"100%","transform":"translateX(-50%)","background":"linear-gradient(#3a3a40,#1a1a1e)","transformOrigin":"top"}} />
          {" "}
        </div>
        {" "}
        <div style={{"position":"absolute","left":"48px","right":"48px","bottom":"32px","display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"24px","zIndex":"3","pointerEvents":"none"}}>
          {" "}
          <div>
            <div data-dname="1" style={{"fontSize":"clamp(28px,3vw,44px)","fontWeight":"900","letterSpacing":"-.02em","lineHeight":"1"}}>{"iMac"}</div>
            <div data-dsub="1" style={{"fontSize":"12px","fontWeight":"600","letterSpacing":".16em","textTransform":"uppercase","color":"var(--text-muted)","marginTop":"6px"}}>{"Every site, on every screen"}</div>
          </div>
          {" "}
          <div style={{"display":"flex","gap":"6px"}}>
            {" "}
            {each(v, v.stops, "t", (v) => (
              <>
                <span data-stop={v.t?.i} style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".12em","textTransform":"uppercase","padding":"6px 10px","borderRadius":"100px","border":"1px solid rgba(var(--tint-rgb),.16)","color":"var(--text-faint)","transition":"all .3s"}}>{I(v.t?.label)}</span>
              </>
            ))}
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
    </section>
    </>
  );
}

export default dcComponent("Device Journey", Component, template, {});
