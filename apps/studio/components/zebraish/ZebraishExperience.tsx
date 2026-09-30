// @ts-nocheck
/* eslint-disable */
"use client";
// Zebraish Experience: ported from the Claude Design handoff (Zebraish Experience.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import { mailtoUrl, whatsappUrl } from "@zebraish/lib/contact";
import React from "react";
import { getZbLang, setSiteLang, tr } from "@/lib/zebraish/i18n";
import { track } from "@/lib/track";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  rootRef = React.createRef();
  state = { power: true, sound: false, act: -1, pj: null, eco: null, home: false };
  PROJECTS = [
    { id: 'malaak', name: 'MALAAK', cat: 'Modest Fashion', img: '/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg', url: 'https://malaak-abaya.vercel.app/', desc: 'Minimal editorial fashion site with a hover-reveal product grid and WhatsApp ordering, built for Snapchat-native buyers.' },
    { id: 'doberman', name: 'DOBERMAN', cat: 'Brand', img: '/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg', url: 'https://doberman-kappa.vercel.app/', desc: 'High-impact brand site. Aggressive typography, a dramatic dark palette and a conversion-focused layout.' },
    { id: 'thisorthat', name: 'THIS OR THAT', cat: 'Product', img: '/zb/assets/thisorthat-icon.png', logo: true, bg: '#f1f0ec', url: 'https://this-or-that-fawn-rho.vercel.app/', desc: 'A quick-fire decision product: two options, one tap, and you see what everyone else picked.' },
    { id: 'aaura', name: 'AAURA', cat: 'Fragrance', img: '/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg', url: 'https://aaura-perfume.vercel.app/', desc: 'Arabian luxury perfumery. Animated gold particle field, arabesque typography and WhatsApp ordering.' },
    { id: 'prieto', name: 'Christian Prieto', cat: 'Creator', serif: true, url: 'https://christain-theapeacademys-projects.vercel.app/', desc: 'Creator portfolio for a Barcelona-based fashion and lifestyle creator. Stats-forward, TikTok-native, with a brand collab flow.' },
    { id: 'mfm', name: 'MFM', cat: 'Children’s Ministry', img: '/zb/assets/mfm-logo.png', logo: true, bg: '#ffffff', url: 'https://cct-rho.vercel.app/', desc: 'Website for the MFM children’s ministry.' },
    { id: 'ape', name: 'APE ACADEMY', cat: 'Education', img: '/zb/assets/Screenshot_20260412-220250_Chrome.png', url: 'https://deploy-1-p1ke.vercel.app/', desc: 'Bold educational platform with a strong identity, structured content and a no-nonsense conversion flow.' },
    { id: 'hotchef', name: 'HOT CHEF', cat: 'Food & Drink', url: 'https://hot-chef.vercel.app/', desc: 'A Nigerian kitchen where customers browse the menu and order food online.' },
    { id: 'reverie', name: 'REVERIE', cat: 'Beauty', img: '/zb/assets/4c7faa2cf965371c0d8c790e9d5f61a1.jpg', url: 'https://reverie-salon.vercel.app/', desc: 'Soft marble luxury salon site. Services grid, team showcase and WhatsApp booking.' },
  ];
  ECO = [
    { id: 'studio', name: 'Studio', verb: 'BUILD', fn: 'The build layer: websites, software, brand and automation. Live today.' },
    { id: 'board', name: 'The Board', verb: 'LAUNCH', fn: 'Where businesses built with Studio launch, gather feedback and get discovered.' },
    { id: 'marketing', name: 'Marketing', verb: 'DISTRIBUTE', fn: 'Getting what we build in front of the right people.' },
    { id: 'creators', name: 'Creator Network', verb: 'CONNECT', fn: 'Creators and brands, connected.' },
    { id: 'business', name: 'Businesses', verb: 'COLLABORATE', fn: 'Businesses working together across the ecosystem.' },
    { id: 'zelm', name: 'ZELM', verb: 'EXPERIENCE', fn: 'Zebraish El Mundo, “Zebraish, the World”: fashion, culture and lifestyle.' },
    { id: 'ideas', name: 'New ideas', verb: 'RETURN TO BUILD', fn: 'Every outcome feeds the next build.' },
  ];
  SERVICES = [['Digital Products', 'Interfaces'], ['Websites', 'Browser worlds'], ['Apps', 'Mobile'], ['AI', 'Agents · Systems'], ['Automation', 'Flows'], ['Brand', 'Identity'], ['Creative Technology', 'Hover me']];
  ACTS = [['Pattern', 0], ['Signal', .125], ['Forge', .3], ['Form', .415], ['Living', .6], ['Systems', .72], ['World', .815], ['Zebra', .9]];
  componentDidMount() {
    const root = this.rootRef.current; if (!root) return;
    this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = (parseInt(localStorage.getItem('zb-pattern') || '0', 10) || 0) + 1; try { localStorage.setItem('zb-pattern', String(n)); } catch (e) {}
    this.patternNo = (1000 + ((n * 7919) % 9000)); this.seed = (n * .6180339) % 1;
    this.setState({ sound: (localStorage.getItem('zb-sound') ?? 'on') === 'on' }); // the power-on tap starts the music, on phones too
    scrollTo(0, 0); document.documentElement.style.overflow = 'hidden';
    this.els = [...root.querySelectorAll('[data-r]')].map(el => { const [a, b] = el.dataset.r.split(',').map(Number); return { el, a, b, fx: el.dataset.fx || 'rise', gate: el.dataset.gate, wds: [...el.querySelectorAll('[data-wd]')], cis: [...el.querySelectorAll('[data-ci]')], trk: [...el.querySelectorAll('[data-track]')], kids: [...el.children].filter(c => getComputedStyle(c).position !== 'absolute'), v: -1 }; });
    this.frags = [...root.querySelectorAll('[data-frag]')].map(el => ({ el, at: parseFloat(el.dataset.frag), on: 0 }));
    if (this.mobile) { const stm = root.querySelector('[data-gate="stmt"]'); if (stm) { stm.style.right = '6%'; stm.style.left = '6%'; stm.style.top = '70%'; stm.querySelectorAll('div').forEach(d => { d.style.whiteSpace = 'normal'; }); } }
    this.lb = {}; root.querySelectorAll('[data-lb]').forEach(el => this.lb[el.dataset.lb] = el);
    this.$ = s => root.querySelector(`[data-id="${s}"]`);
    this.cur = { x: -100, y: -100, tx: -100, ty: -100 };
    this._pm = e => { this.cur.tx = e.clientX; this.cur.ty = e.clientY; };
    addEventListener('pointermove', this._pm, { passive: true });
    this._key = e => { if (e.key === 'Escape') { this.closePj(); this.setState({ eco: null }); } };
    addEventListener('keydown', this._key);
    this.aud = { amb: new Audio('/zb/assets/sfx/ambient-castle.mp3'), hover: new Audio('/zb/assets/sfx/hover.mp3'), click: new Audio('/zb/assets/sfx/click.mp3'), whoosh: new Audio('/zb/assets/sfx/whoosh.mp3') };
    this.aud.amb.loop = true; this.aud.amb.volume = 0;
    this.stmt = 0; this.introT = -1; this.p = 0; this.vel = 0;
    this._userScroll = e => { if (e.type !== 'keydown' || /^(Arrow|Page|Home|End| )/.test(e.key)) this._apPause = performance.now() + 4000; };
    ['wheel', 'touchmove', 'keydown'].forEach(ev => addEventListener(ev, this._userScroll, { passive: true }));
    this.boot();
  }
  async boot() {
    const [L] = await Promise.all([import('lenis').catch(() => null)]);
    if (L && !this.reduce) { const Lenis = L.default || L.Lenis; this.lenis = new Lenis({ lerp: .085, wheelMultiplier: .9, smoothWheel: true, autoRaf: false }); this.lenis.stop(); window.__lenis = this.lenis; }
    try {
      const m = await import('@/lib/zebraish/experience.js');
      this.world = await m.mount(this.$('gl'), { mobile: this.mobile, reduce: this.reduce, seed: this.seed, projects: this.PROJECTS, eco: this.ECO,
        frame: (dt, now) => this.frame(dt, now), onLabels: L2 => this.labels(L2), onCursor: k => this.setCursor(k), onClick: (k, id) => this.click3d(k, id), onLoad: f => { this.loadF = f; } });
    } catch (e) {
      console.warn('3D unavailable, running the 2D pattern', e);
      this.$('gl').style.background = '#040405 repeating-linear-gradient(124deg,rgba(245,245,247,.07) 0 2px,transparent 2px 16px)';
      const loop = now => { this._fb = requestAnimationFrame(loop); this.frame(.016, now); }; this._fb = requestAnimationFrame(loop);
    }
  }
  componentWillUnmount() { ['wheel', 'touchmove', 'keydown'].forEach(ev => removeEventListener(ev, this._userScroll)); removeEventListener('pointermove', this._pm); removeEventListener('keydown', this._key); cancelAnimationFrame(this._fb); this.world && this.world.destroy(); this.lenis && this.lenis.destroy(); Object.values(this.aud || {}).forEach(a => a.pause()); document.documentElement.style.overflow = ''; }
  play(k, v) { if (!this.state.sound) return; const a = this.aud[k]; try { a.currentTime = 0; a.volume = v ?? .5; a.play()?.catch(() => {}); } catch (e) {} }
  fadeAmb(to, ms) { const a = this.aud.amb, from = a.volume, st = performance.now(); cancelAnimationFrame(this._af); const f = n => { const t = Math.min(1, (n - st) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * t)); if (t < 1) this._af = requestAnimationFrame(f); }; this._af = requestAnimationFrame(f); }
  start() {
    if (this.introT >= 0) return;
    this.introT = performance.now(); this.play('click', .6); track('intro_started', { sound: !!this.state.sound });
    if (this.state.sound) { const tm = parseFloat(localStorage.getItem('zb-music-t') || '0'); if (tm) this.aud.amb.currentTime = tm; this._mt = setInterval(() => { if (!this.aud.amb.paused) try { localStorage.setItem('zb-music-t', String(this.aud.amb.currentTime)); } catch (x) {} }, 1000); this.aud.amb.play().then(() => this.fadeAmb(.32, 4000)).catch(() => this.armAudio()); }
    const pw = this.$('power'); if (pw) pw.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease', fill: 'forwards' });
    setTimeout(() => this.setState({ power: false }), 950);
  }
  // Autoplay blocks audio without a gesture, so start the music on the first one.
  armAudio() {
    if (this._armed) return; this._armed = true;
    const go = () => { ['pointerdown', 'keydown', 'touchstart'].forEach(ev => removeEventListener(ev, go)); if (this.state.sound) this.aud.amb.play().then(() => this.fadeAmb(.32, 2500)).catch(() => {}); };
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, go, { passive: true }));
  }
  introStep(now) {
    if (this.introT < 0 || this.introDone) return;
    const k = this.reduce ? 3 : 1, t = window.__zbT != null ? window.__zbT : (now - this.introT) / 1000 * k, ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const w = this.world && this.world.intro, lin = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a)));
    let count;
    if (t < 5.3) count = ss(.25, .8, t) + ss(1.05, 1.4, t) + ss(1.65, 1.95, t) + Math.pow(lin(2.1, 4.5, t), 1.8) * 72;
    else count = 1 + 74 * (1 - ss(5.3, 6.8, t));
    const flash = this.$('flash');
    if (w) {
      if (t < 7.35) { w.count = count; w.solo = Math.max(0, Math.min(1, (t - 6.3) / 1.05)); w.zoom = ss(5.5, 7.35, t) > 0 ? Math.min(1, (t - 5.5) / 1.85) : 0; w.hero = -1; }
      else { w.count = 80; w.solo = 0; w.zoom = 0; w.heroOn = true; w.hero = lin(7.45, 9.7, t); }
      w.dim = ss(8.4, 9.6, t);
    }
    if (flash) { const fo = t < 7.35 ? ss(7.12, 7.35, t) : 1; const hole = t < 7.4 ? 0 : Math.pow(lin(7.4, 8.5, t), 1.6) * 150; flash.style.opacity = String(fo * (1 - ss(8.3, 8.6, t))); flash.style.webkitMaskImage = flash.style.maskImage = hole > 0 ? `radial-gradient(circle at 50% 50%, transparent ${hole}%, #000 ${hole + 6}%)` : 'none'; }
    if (t > 7.3 && !this._wh) { this._wh = 1; this.play('whoosh', .45); }
    const st = this.$('status'); const msg = tr(t < 1.9 ? 'Constructing the pattern…' : t < 3.6 ? 'Establishing signal…' : 'Entering Zebraish…');
    if (st.textContent !== msg) { st.textContent = msg; st.animate([{ opacity: 0, letterSpacing: '.42em' }, { opacity: 1, letterSpacing: '.28em' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }); }
    if (t > 5.4 && !this._stOut) { this._stOut = 1; st.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }); }
    this.stmt = ss(8.9, 10, t);
    if (t > 10.4) {
      this.introDone = true; document.documentElement.style.overflow = ''; this.lenis && this.lenis.start();
      this.$('chrome').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: 'forwards' });
      { const hn = this.$('hint'); hn.style.transition = 'opacity 1s ease'; this._hintOn = performance.now(); }
      this._apPause = performance.now() + 1800; // let the hint be read before the story starts moving
    }
  }
  frame(dt, now) {
    if (this.lenis) this.lenis.raf(now);
    this.introStep(now);
    this.autoplay(now);
    const sp = this.$('spacer'), max = Math.max(1, (sp ? sp.offsetHeight : document.documentElement.scrollHeight) - innerHeight);
    const p = window.__zbP != null ? window.__zbP : this.introDone ? Math.max(0, Math.min(1, scrollY / max)) : 0;
    const zn = this.$('zone'), zH = zn ? zn.offsetHeight : innerHeight, xq = window.__zbX != null ? window.__zbX : Math.max(0, Math.min(1, (scrollY - max) / Math.max(1, zH - 4)));
    this.xq = xq; this.xStep(xq);

    const rawV = this.lenis ? this.lenis.velocity : 0; this.vel += (Math.min(1, Math.abs(rawV) / 45) - this.vel) * .12; this.p = p;
    this.choreo(p, this.lenis ? Math.sign(rawV) * this.vel : 0);
    const hc = this.$('hcta'); if (hc) { const off = p > .9; if (hc._off !== off) { hc._off = off; hc.style.opacity = off ? '0' : '1'; hc.style.pointerEvents = off ? 'none' : 'auto'; } }
    const hint = this.$('hint'); if (this.introDone && hint) { const fadeIn = Math.min(1, (now - (this._hintOn || now)) / 1000); hint.style.transition = 'none'; hint.style.opacity = String(fadeIn * (1 - Math.min(1, p / .01))); }
    let ai = 0; this.ACTS.forEach((a, i) => { if (p >= a[1]) ai = i; });
    if (ai !== this.state.act && this.introDone) { if (this.state.act >= 0) this.play('whoosh', .22); this.setState({ act: ai }); }
    const c = this.cur; c.x += (c.tx - c.x) * .22; c.y += (c.ty - c.y) * .22; const ce = this.$('cursor'); if (ce) ce.style.transform = `translate3d(${c.x}px,${c.y}px,0)`;
    if (this.aud && this.state.sound && this.introDone) { const q = p > .9 && p < .97 ? .12 : .32; if (Math.abs(this.aud.amb.volume - q) > .02 && !this._af2) { this._af2 = 1; this.fadeAmb(q, 1500); setTimeout(() => this._af2 = 0, 1500); } }
    return { p, vel: this.vel, sv: this.lenis ? Math.sign(rawV) * this.vel : 0, xq: this.xq || 0 };
  }
  // Plays the story on its own, about half a screen a second (~45s to the studio).
  // Not for reduced-motion visitors, and paused while a project is open.
  autoplay(now) {
    const last = this._apLast ?? now; this._apLast = now;
    if (!this.introDone || !this.lenis || this.reduce || this._nav || this.state.pj || this.state.eco || document.hidden) return;
    if (now < (this._apPause || 0)) return;
    const dt = Math.min(.25, (now - last) / 1000); // slow frames on weak phones still keep pace
    this.lenis.scrollTo(this.lenis.scroll + innerHeight * .5 * dt, { immediate: true, force: true });
  }
  choreo(p, sv) {
    const ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    for (const o of this.els) {
      const L = (p - o.a) / (o.b - o.a);
      const gate = o.gate === 'stmt' ? this.stmt : 1;
      if ((L < -.02 || L > 1.02 || gate <= 0) && !(o.gate === 'stmt' && gate > 0)) { if (o.v !== 0) { o.v = 0; o.el.style.opacity = '0'; o.el.style.visibility = 'hidden'; } continue; }
      if (o.v !== 1) { o.v = 1; o.el.style.visibility = 'visible'; }
      const inn = o.gate === 'stmt' ? 1 : ss(0, .2, L), out = 1 - ss(.8, 1, L), vis = inn * out;
      const base = o.el.style.transform.includes('translateY(-50%)') || o.el.dataset.center ? 'translateY(-50%) ' : '';
      if (!o._base) o._base = o.el.style.transform || ''; const bt = o._base;
      if (o.fx === 'fade') { o.el.style.opacity = String(out); continue; }
      if (o.fx === 'split') {
        o.el.style.opacity = String(out);
        o.wds.forEach((w, i) => { const nw = o.wds.length, ci = o.gate === 'stmt' ? ss(i / nw * .55, i / nw * .55 + .45, gate) : ss(i * .035, .16 + i * .035, L); w.style.transform = `translate3d(0,${(1 - ci) * 110}%,0)`; w.style.opacity = String(ci); });
        continue;
      }
      const y = -(1 - out) * 46;
      o.el.style.opacity = String(out);
      o.el.style.transform = `${bt} translate3d(0,${y}px,0) skewY(${(-sv * 2.2 * vis).toFixed(2)}deg)`;
      o.kids.forEach((k, i) => { const ci = ss(i * .045, .2 + i * .045, L); k.style.opacity = String(ci); k.style.transform = `translate3d(0,${((1 - ci) * 34).toFixed(1)}px,0)`; k.style.clipPath = `inset(0 0 ${((1 - ci) * 100).toFixed(1)}% 0)`; });
      o.trk.forEach(t => { t.style.transform = `scaleX(${(1 + (1 - inn) * .18 + (1 - out) * .12 + Math.abs(sv) * .04).toFixed(3)})`; t.style.letterSpacing = ''; });
      if (o.fx === 'chain') { const lt = ss(.725, .805, p), st = lt < .14 ? 0 : lt < .3 ? 1 : lt < .45 ? 2 : lt < .62 ? 3 : lt < .78 ? 4 : 5; o.cis.forEach((c, i) => { const on = i === st, past = i < st; c.style.color = on ? '#f5f5f7' : past ? 'rgba(245,245,247,.45)' : 'rgba(245,245,247,.16)'; c.style.transform = on ? 'translateX(14px)' : 'none'; c.style.transition = 'color .4s, transform .6s cubic-bezier(.16,1,.3,1)'; }); }
    }
  }
  xStep(q) {
    const ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const fl = this.$('xflash'), ov = this.$('overlay');
    if (Math.abs(q - (this._lq ?? -1)) < 1e-4) return; this._lq = q;
    ov.style.opacity = String(1 - ss(0, .22, q)); ov.style.visibility = q > .3 ? 'hidden' : 'visible';
    const fade = ss(.4, .88, q); fl.style.visibility = fade > 0 ? 'visible' : 'hidden'; fl.style.opacity = String(fade);
    if (q > .15 && !this._pf) { this._pf = 1; const l = document.createElement('link'); l.rel = 'prefetch'; l.href = '/studio'; document.head.appendChild(l); }
    if (q > .3 && !this._xw) { this._xw = 1; this.play('whoosh', .4); } if (q < .2) this._xw = 0;
    if (q >= .93 && !this._nav) { this._nav = 1; track('intro_completed'); try { sessionStorage.setItem('zb-from-zebra', '1'); } catch (e) {} setTimeout(() => { location.href = '/studio#from-zebra'; }, 60); }
  }
  setLang(l) { setSiteLang(l); }
  labels(list) { for (const l of list) { const el = this.lb[l.id]; if (!el) continue; const o = l.o > .02 ? l.o : 0; if (o === 0) { if (el._o !== 0) { el._o = 0; el.style.opacity = '0'; } continue; } el._o = o; el.style.opacity = o.toFixed(3); el.style.transform = `translate3d(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px,0)`; } }
  setCursor(k) { const lab = this.$('clabel'), ring = this.$('cring'); if (!lab) return; lab.textContent = tr(k); const big = k !== 'Explore'; ring.style.width = ring.style.height = big ? '46px' : '26px'; ring.style.margin = big ? '-23px 0 0 -23px' : '-13px 0 0 -13px'; ring.style.background = big ? 'rgba(245,245,247,.12)' : 'transparent'; if (big) this.play('hover', .22); }
  click3d(kind, id) {
    this.world && this.world.nudgeSeed(.07); this.play('click', .5);
    if (kind === 'project') { this.world.focus(id); this.lenis && this.lenis.stop(); this.setState({ pj: id, eco: null }); }
    if (kind === 'eco') this.setState({ eco: id });
  }
  closePj() { if (!this.state.pj) return; this.world && this.world.unfocus(); this.lenis && this.lenis.start(); this.setState({ pj: null }); }
  renderVals() {
    const pj0 = this.PROJECTS.find(x => x.id === this.state.pj) || {}, pj = Object.assign({}, pj0, { caseHref: '/work/' + (pj0.id || '') }), eco = this.ECO.find(x => x.id === this.state.eco) || {};
    const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    return {
      rootRef: this.rootRef, homeOn: this.state.home, langLabel: getZbLang() === 'es' ? 'ES · en' : 'EN · es', toggleLang: () => this.setLang(getZbLang() === 'es' ? 'en' : 'es'),
      powerOn: this.state.power, start: () => this.start(),
      powerLabel: touch ? 'Tap to power on' : 'Click to power on', powerSub: 'Best with sound',
      soundLabel: this.state.sound ? 'Sound on' : 'Sound off',
      toggleSound: () => { const s = !this.state.sound; this.setState({ sound: s }); try { localStorage.setItem('zb-sound', s ? 'on' : 'off'); } catch (x) {} if (s) { this.aud.amb.play().catch(() => {}); this.fadeAmb(.32, 1200); } else this.fadeAmb(0, 600); },
      chain: ['STRIPES', 'LINES', 'NODES', 'SYSTEMS', 'PRODUCTS', 'BUSINESSES'].map((label, i) => ({ label: (i ? '↓ ' : '') + label, i })),
      svcLabels: this.SERVICES.map((s, i) => ({ id: 'svc' + i, name: s[0], sub: s[1] })),
      pjLabels: this.PROJECTS.map(p => ({ id: 'pj-' + p.id, cat: p.cat })),
      ecoLabels: this.ECO.map(e => ({ id: 'eco-' + e.id, name: e.name, verb: e.verb })),
      pjOpen: !!this.state.pj, pj, closePj: () => this.closePj(),
      ecoOpen: !!this.state.eco, eco, closeEco: () => this.setState({ eco: null }),
      rail: this.ACTS.map((a, i) => ({ label: a[0], color: i === this.state.act ? '#f5f5f7' : 'rgba(245,245,247,.3)', w: i === this.state.act ? '28px' : '12px', labelOp: i === this.state.act ? 1 : 0 })),
      railDisplay: touch || this.state.act === 3 || this.state.act === 4 ? 'none' : 'flex',
      patternId: this.patternNo ? `Pattern No. ${this.patternNo} · generated for this visit` : '',
      cursorDisplay: touch ? 'none' : 'flex', cursorCss: touch ? 'auto' : 'none',
    };
  }
}

const STYLE = "html,body{margin:0;padding:0;background:#040405}\nbody{overflow-x:hidden}\na{color:#f5f5f7}\na:hover{color:#ffffff}\n\n.zbze-0:hover{border-color:rgba(245,245,247,.85) !important;box-shadow:0 0 44px rgba(245,245,247,.2) !important;transform:scale(1.04) !important}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div ref={v.rootRef} style={css(`position:relative;background:#040405;color:#f5f5f7;font-family:Inter,-apple-system,sans-serif;cursor:${v.cursorCss ?? ""}`)}>
      {" "}
      <canvas data-id="gl" aria-hidden="true" style={{"position":"fixed","inset":"0","width":"100vw","height":"100vh","display":"block","zIndex":"0","background":"#040405"}} />
      {" "}
      <div data-id="shield" style={{"position":"fixed","inset":"0","zIndex":"1","pointerEvents":"none","background":"#040405","opacity":"0"}} />
      {" "}
      <div data-id="spacer" style={{"position":"relative","height":"2200vh","pointerEvents":"none"}} />
      {" "}
      <div data-id="zone" style={{"position":"relative","height":"140vh","pointerEvents":"none"}} />
      {" "}
      <div data-id="xflash" style={{"position":"fixed","inset":"0","zIndex":"7","pointerEvents":"none","background":"#060608","opacity":"0","visibility":"hidden"}} />
      {" "}
      <div data-id="overlay" style={{"position":"fixed","inset":"0","zIndex":"2","pointerEvents":"none","overflow":"hidden"}}>
        {" "}
        <div data-id="flash" style={{"position":"absolute","inset":"0","background":"#f2f2f2","opacity":"0","pointerEvents":"none","zIndex":"5"}} />
        {" "}
        <div data-r="-.05,.055" data-gate="stmt" data-fx="split" style={{"position":"absolute","left":"7%","right":"40%","top":"50%","transform":"translateY(-50%)","display":"flex","flexDirection":"column","alignItems":"flex-start","textAlign":"left"}}>
          {" "}
          <div style={{"position":"absolute","left":"-18%","top":"50%","width":"150%","height":"560px","transform":"translateY(-50%)","background":"radial-gradient(closest-side,rgba(4,4,5,.92),rgba(4,4,5,.6) 55%,transparent)","pointerEvents":"none","zIndex":"-1"}} />
          {" "}
          <div style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".3em","textTransform":"uppercase","color":"rgba(245,245,247,.6)","marginBottom":"18px","overflow":"hidden"}}><span data-wd="1" style={{"display":"block"}}>{"Zebraish Studio"}</span></div>
          {" "}
          <div style={{"display":"flex","gap":".26em","flexWrap":"wrap","justifyContent":"flex-start","fontSize":"clamp(34px,4.5vw,76px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":"1.02","whiteSpace":"nowrap"}}>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".08em"}}>
              <span data-wd="1" style={{"display":"block"}} data-es="Las ideas">{"Ideas"}</span>
            </span>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".08em"}}><span data-wd="1" style={{"display":"block"}} data-es="tienen">{"have"}</span></span>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".08em"}}>
              <span data-wd="1" style={{"display":"block"}} data-es="patrones.">{"patterns."}</span>
            </span>
            {" "}
          </div>
          {" "}
          <div style={{"display":"flex","gap":".24em","flexWrap":"wrap","justifyContent":"flex-start","whiteSpace":"nowrap","fontSize":"clamp(34px,4.5vw,76px)","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","lineHeight":"1.02"}}>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}><span data-wd="1" style={{"display":"block"}} data-es="Nosotros">{"We"}</span></span>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}>
              <span data-wd="1" style={{"display":"block"}} data-es="les damos">{"give"}</span>
            </span>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}><span data-wd="1" style={{"display":"block"}} data-es="">{"them"}</span></span>
            {" "}
            <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}><span data-wd="1" style={{"display":"block"}} data-es="forma.">{"form."}</span></span>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div data-r=".055,.125" style={{"position":"absolute","left":"7%","bottom":"14%","maxWidth":"560px","display":"flex","flexDirection":"column","gap":"14px","padding":"26px 30px","margin":"-26px -30px","borderRadius":"24px","background":"rgba(4,4,5,.66)","backdropFilter":"blur(10px)","WebkitBackdropFilter":"blur(10px)"}}>
          {" "}
          {" "}
          <span data-track="1" style={{"fontSize":"clamp(34px,4.4vw,64px)","fontWeight":"900","letterSpacing":"-.035em","lineHeight":"1","transformOrigin":"left"}} data-es="No hay dos caminos iguales.">{"No two paths are exactly the same."}</span>
          {" "}
          <span style={{"fontSize":"16px","lineHeight":"1.6","color":"rgba(245,245,247,.7)"}} data-es="Mueve el ratón y el patrón se curva. Desliza y las rayas aceleran. Para y se calman. Individualidad dentro de un sistema.">
            {"Move your mouse, the pattern bends. Scroll, the stripes accelerate. Stop, they settle. Individuality inside a system."}
          </span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".135,.185" style={{"position":"absolute","left":"0","right":"0","top":"50%","transform":"translateY(-50%)","textAlign":"center","padding":"0 24px"}}>
          {" "}
          {" "}
          <div data-track="1" style={{"fontSize":"clamp(38px,5.6vw,88px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":"1"}} data-es="Toda idea empieza en algún lugar.">{"Every idea begins somewhere."}</div>
          {" "}
        </div>
        {" "}
        <div data-r=".19,.24" data-fx="split" style={{"position":"absolute","left":"0","right":"0","top":"50%","transform":"translateY(-50%)","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"6px"}}>
          {" "}
          <span style={{"overflow":"hidden","display":"block"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(34px,4.6vw,72px)","fontWeight":"300","letterSpacing":"-.02em"}} data-es="Un pensamiento.">{"A thought."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(34px,4.6vw,72px)","fontWeight":"600","letterSpacing":"-.02em"}} data-es="Un problema.">{"A problem."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(34px,4.6vw,72px)","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900"}} data-es="Una posibilidad.">{"A possibility."}</span>
          </span>
          {" "}
        </div>
        {" "}
        <div data-r=".245,.3" style={{"position":"absolute","left":"0","right":"0","top":"50%","transform":"translateY(-50%)","textAlign":"center","padding":"0 24px"}}>
          {" "}
          <div data-track="1" style={{"fontSize":"clamp(40px,6.4vw,104px)","fontWeight":"900","letterSpacing":"-.045em","lineHeight":".96"}}>
            {"We build what"}
            <br />
            {"comes next."}
          </div>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".315,.415" style={{"position":"absolute","left":"7%","bottom":"12%","maxWidth":"460px","display":"flex","flexDirection":"column","gap":"12px"}}>
          {" "}
          {" "}
          <span style={{"fontSize":"clamp(30px,3.4vw,52px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1"}}>
            {"At the centre, the "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic"}}>{"Zebraish Core."}</span>
          </span>
          {" "}
          <span style={{"fontSize":"15px","lineHeight":"1.6","color":"rgba(245,245,247,.7)"}}>
            {"Its stripes are not a texture. They are generated across the geometry, and it evolves as you scroll."}
          </span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".42,.47" style={{"position":"absolute","left":"7%","top":"16%","maxWidth":"620px","display":"flex","flexDirection":"column","gap":"12px"}}>
          {" "}
          {" "}
          <span data-track="1" style={{"fontSize":"clamp(34px,4.4vw,68px)","fontWeight":"900","letterSpacing":"-.035em","lineHeight":"1","transformOrigin":"left"}} data-es="No empezamos con la tecnología.">{"We don't start with technology."}</span>
          {" "}
        </div>
        {" "}
        <div data-r=".47,.525" style={{"position":"absolute","left":"7%","top":"16%","maxWidth":"620px"}}>
          {" "}
          <span data-track="1" style={{"display":"block","fontSize":"clamp(34px,4.4vw,68px)","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","lineHeight":"1.02","transformOrigin":"left"}} data-es="Empezamos con la posibilidad.">{"We start with possibility."}</span>
          {" "}
        </div>
        {" "}
        <div data-r=".525,.61" style={{"position":"absolute","left":"0","right":"0","top":"11%","textAlign":"center"}}>
          {" "}
          <span data-track="1" style={{"display":"inline-block","fontSize":"clamp(44px,6.4vw,104px)","fontWeight":"900","letterSpacing":"-.05em","lineHeight":".9"}} data-es="CONSTRUIMOS">{"WE BUILD"}</span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".605,.67" style={{"position":"absolute","left":"0","right":"0","top":"9%","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"10px","padding":"0 24px"}}>
          {" "}
          {" "}
          <span style={{"fontSize":"clamp(28px,3.4vw,54px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1.05"}}>
            {"A digital product shouldn't just exist."}
            <br />
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic"}}>{"It should behave."}</span>
          </span>
          {" "}
          <span style={{"fontSize":"13px","fontWeight":"600","letterSpacing":".16em","textTransform":"uppercase","color":"rgba(245,245,247,.6)","marginTop":"6px"}} data-es="Arrastra · Pasa · Haz clic">{"Drag · Hover · Click"}</span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".665,.726" style={{"position":"absolute","left":"0","right":"0","top":"8%","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"10px","padding":"0 24px"}}>
          {" "}
          <span style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".3em","textTransform":"uppercase","color":"rgba(245,245,247,.55)"}} data-es="El trabajo">{"The Work"}</span>
          {" "}
          <span style={{"fontSize":"clamp(28px,3.4vw,54px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1.05"}} data-es="Proyectos dentro del mundo.">{"Projects inside the world."}</span>
          {" "}
          <span style={{"fontSize":"13px","fontWeight":"600","letterSpacing":".16em","textTransform":"uppercase","color":"rgba(245,245,247,.6)"}} data-es="12 webs activas · 11 sectores · Haz clic para entrar">{"12 sites live · 11 industries · Click one to enter"}</span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".726,.83" data-fx="chain" style={{"position":"absolute","left":"6%","top":"50%","transform":"translateY(-50%)","display":"flex","flexDirection":"column","gap":"6px"}}>
          {" "}
          {" "}
          {each(v, v.chain, "c", (v) => (
            <>
              {" "}
              <span data-ci={v.c?.i} style={{"fontSize":"clamp(20px,2.2vw,34px)","fontWeight":"900","letterSpacing":".04em","color":"rgba(245,245,247,.2)","transition":"color .4s"}}>{I(v.c?.label)}</span>
              {" "}
            </>
          ))}
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".83,.905" style={{"position":"absolute","left":"0","right":"0","top":"8%","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"10px"}}>
          {" "}
          {" "}
          <span data-track="1" style={{"fontSize":"clamp(36px,5vw,80px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":"1"}}>
            {"One pattern. "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic"}}>{"Infinite directions."}</span>
          </span>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".93,.968" style={{"position":"absolute","left":"0","right":"0","bottom":"8%","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"14px","padding":"0 24px"}}>
          {" "}
          <span data-track="1" style={{"fontSize":"clamp(64px,11vw,180px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":".86"}}>{"ZEBRAISH"}</span>
          {" "}
          <span style={{"fontSize":"clamp(18px,2vw,28px)","fontWeight":"300","letterSpacing":".02em"}} data-es="Construye lo que aún no existe.">{"Build what doesn't exist yet."}</span>
          {" "}
          <a href="/studio?build=1" data-ui="1" style={{"pointerEvents":"auto","marginTop":"8px","padding":"15px 34px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"13px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}} data-es="Empieza un proyecto →">{"Start a project →"}</a>
          {" "}
        </div>
        {" "}
        {" "}
        <div data-r=".958,1.06" data-fx="split" style={{"position":"absolute","left":"0","right":"0","top":"50%","transform":"translateY(-50%)","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"4px","padding":"0 24px"}}>
          {" "}
          <div style={{"position":"absolute","left":"50%","top":"50%","width":"min(1200px,120vw)","height":"680px","transform":"translate(-50%,-50%)","background":"radial-gradient(closest-side,rgba(4,4,5,.94),rgba(4,4,5,.72) 60%,transparent)","pointerEvents":"none","zIndex":"-1"}} />
          {" "}
          <span style={{"overflow":"hidden","display":"block"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(26px,3.2vw,50px)","fontWeight":"300","letterSpacing":"-.02em"}} data-es="El patrón se vuelve señal.">{"Pattern becomes signal."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(26px,3.2vw,50px)","fontWeight":"400","letterSpacing":"-.02em"}} data-es="La señal se vuelve forma.">{"Signal becomes form."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(26px,3.2vw,50px)","fontWeight":"600","letterSpacing":"-.02em"}} data-es="La forma se vuelve tecnología.">{"Form becomes technology."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block","paddingBottom":".1em"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(26px,3.2vw,50px)","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900"}} data-es="La tecnología se vuelve posibilidad.">{"Technology becomes possibility."}</span>
          </span>
          {" "}
          <span style={{"overflow":"hidden","display":"block","marginTop":"26px"}}>
            <span data-wd="1" style={{"display":"block","fontSize":"clamp(16px,1.6vw,22px)","fontWeight":"700","letterSpacing":".14em","textTransform":"uppercase"}} data-es="Zebraish construye lo que viene.">{"Zebraish builds what comes next."}</span>
          </span>
          {" "}
          <span style={{"display":"block","marginTop":"22px","padding":"4px"}}>
            <span data-wd="1" style={{"display":"flex","gap":"10px","flexWrap":"wrap","justifyContent":"center"}}>
              {" "}
              <a href="/studio?build=1" data-ui="1" style={{"pointerEvents":"auto","padding":"14px 30px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"12px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}} data-es="Empieza un proyecto →">{"Start a project →"}</a>
              {" "}
              <a href={whatsappUrl()} target="_blank" data-ui="1" style={{"pointerEvents":"auto","padding":"14px 26px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.25)","fontSize":"12px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","textDecoration":"none"}}>{"WhatsApp"}</a>
              {" "}
              <a href={mailtoUrl} data-ui="1" style={{"pointerEvents":"auto","padding":"14px 26px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.25)","fontSize":"12px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","textDecoration":"none"}}>{"Email"}</a>
              {" "}
            </span>
          </span>
          {" "}
        </div>
        {" "}
        {" "}
        {each(v, v.svcLabels, "l", (v) => (
          <>
            {" "}
            <div data-lb={v.l?.id} style={{"position":"absolute","left":"0","top":"0","opacity":"0","transform":"translate3d(-999px,0,0)","display":"flex","flexDirection":"column","alignItems":"center","gap":"3px","whiteSpace":"nowrap","willChange":"transform"}}>
              <span style={{"fontSize":"13px","fontWeight":"800","letterSpacing":".14em","textTransform":"uppercase","transform":"translateX(-50%)"}}>{I(v.l?.name)}</span>
              <span style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".16em","textTransform":"uppercase","color":"rgba(245,245,247,.5)","transform":"translateX(-50%)"}}>{I(v.l?.sub)}</span>
            </div>
            {" "}
          </>
        ))}
        {" "}
        {each(v, v.pjLabels, "l", (v) => (
          <>
            {" "}
            <div data-lb={v.l?.id} style={{"position":"absolute","left":"0","top":"0","opacity":"0","transform":"translate3d(-999px,0,0)","whiteSpace":"nowrap","willChange":"transform"}}>
              <span style={{"display":"block","transform":"translateX(-50%)","fontSize":"10px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","color":"rgba(245,245,247,.6)"}}>{I(v.l?.cat)}</span>
            </div>
            {" "}
          </>
        ))}
        {" "}
        {each(v, v.ecoLabels, "l", (v) => (
          <>
            {" "}
            <div data-lb={v.l?.id} style={{"position":"absolute","left":"0","top":"0","opacity":"0","transform":"translate3d(-999px,0,0)","whiteSpace":"nowrap","willChange":"transform"}}>
              <span style={{"display":"flex","flexDirection":"column","alignItems":"center","transform":"translateX(-50%)","gap":"2px"}}>
                <span style={{"fontSize":"14px","fontWeight":"800","letterSpacing":".06em"}}>{I(v.l?.name)}</span>
                <span style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".22em","color":"rgba(245,245,247,.55)"}}>{I(v.l?.verb)}</span>
              </span>
            </div>
            {" "}
          </>
        ))}
        {" "}
        {" "}
        {v.ecoOpen ? (
          <>
            {" "}
            <div data-ui="1" style={{"position":"absolute","right":"28px","bottom":"84px","width":"320px","pointerEvents":"auto","padding":"22px 24px","borderRadius":"20px","background":"rgba(12,12,14,.72)","backdropFilter":"blur(20px)","WebkitBackdropFilter":"blur(20px)","border":"1px solid rgba(245,245,247,.16)","display":"flex","flexDirection":"column","gap":"8px"}}>
            {" "}
            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center"}}>
              <span style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".24em","color":"rgba(245,245,247,.55)"}}>{I(v.eco?.verb)}</span>
              <button type="button" onClick={v.closeEco} style={{"background":"none","border":"none","color":"#f5f5f7","fontSize":"18px","cursor":"pointer","padding":"0"}}>{"×"}</button>
            </div>
            {" "}
            <span style={{"fontSize":"24px","fontWeight":"900","letterSpacing":"-.02em"}}>{I(v.eco?.name)}</span>
            {" "}
            <span style={{"fontSize":"14px","lineHeight":"1.6","color":"rgba(245,245,247,.72)"}}>{I(v.eco?.fn)}</span>
            {" "}
          </div>
            {" "}
          </>
        ) : null}
        {" "}
        {" "}
        {v.pjOpen ? (
          <>
            {" "}
            <div data-ui="1" style={{"position":"absolute","left":"5%","bottom":"8%","width":"min(420px,88vw)","pointerEvents":"auto","padding":"28px 28px 24px","borderRadius":"24px","background":"rgba(12,12,14,.74)","backdropFilter":"blur(22px)","WebkitBackdropFilter":"blur(22px)","border":"1px solid rgba(245,245,247,.16)","display":"flex","flexDirection":"column","gap":"12px"}}>
            {" "}
            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center"}}>
              <span style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".24em","textTransform":"uppercase","color":"rgba(245,245,247,.55)"}}>{I(v.pj?.cat)}</span>
              <button type="button" onClick={v.closePj} style={{"display":"flex","alignItems":"center","gap":"6px","background":"none","border":"1px solid rgba(245,245,247,.2)","color":"#f5f5f7","fontFamily":"inherit","fontSize":"10px","fontWeight":"700","letterSpacing":".16em","textTransform":"uppercase","padding":"6px 12px","borderRadius":"100px","cursor":"pointer"}}>{"Back · Esc"}</button>
            </div>
            {" "}
            <span style={{"fontSize":"clamp(30px,3vw,44px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1"}}>{I(v.pj?.name)}</span>
            {" "}
            <span style={{"fontSize":"14px","lineHeight":"1.65","color":"rgba(245,245,247,.72)"}}>{I(v.pj?.desc)}</span>
            {" "}
            <div style={{"display":"flex","gap":"8px","flexWrap":"wrap","marginTop":"6px"}}>
              <a href={v.pj?.caseHref} style={{"display":"flex","alignItems":"center","gap":"8px","padding":"12px 22px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.3)","fontSize":"12px","fontWeight":"700","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}} data-es="Caso de estudio">{"Case study"}</a>
              <a href={v.pj?.url} target="_blank" style={{"display":"flex","alignItems":"center","gap":"8px","padding":"12px 22px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"12px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}} data-es="Ver web en vivo →">{"Visit live site →"}</a>
            </div>
            {" "}
          </div>
            {" "}
          </>
        ) : null}
        {" "}
        {" "}
        <div data-id="status" role="status" aria-live="polite" style={{"position":"absolute","left":"0","right":"0","bottom":"11%","textAlign":"center","fontFamily":"ui-monospace,Menlo,monospace","fontSize":"12px","letterSpacing":".28em","textTransform":"uppercase","color":"rgba(245,245,247,.62)","opacity":"0"}} />
        {" "}
        {!v.powerOn ? (
          <a href="/studio" data-ui="1" data-skip="1" style={{"position":"absolute","right":"20px","bottom":"22px","zIndex":"5","pointerEvents":"auto","padding":"9px 16px","borderRadius":"100px","background":"rgba(10,10,12,.55)","backdropFilter":"blur(14px)","WebkitBackdropFilter":"blur(14px)","border":"1px solid rgba(245,245,247,.2)","color":"#f5f5f7","fontSize":"10px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","textDecoration":"none"}}>{"Skip intro →"}</a>
        ) : null}
        <div data-id="hint" style={{"position":"absolute","left":"50%","bottom":"28px","transform":"translateX(-50%)","display":"flex","flexDirection":"column","alignItems":"center","gap":"10px","opacity":"0","fontSize":"10px","fontWeight":"700","letterSpacing":".3em","textTransform":"uppercase","color":"rgba(245,245,247,.6)"}}>
          <span data-es="Relájate o desliza para ir más rápido">{"Sit back, or scroll to go faster"}</span>
          <span style={{"width":"1px","height":"38px","background":"linear-gradient(#f5f5f7,transparent)"}} />
        </div>
        {" "}
        {" "}
        <div data-id="chrome" style={{"position":"absolute","inset":"0","opacity":"0"}}>
          {" "}
          <div data-topbar="1" style={{"position":"absolute","left":"28px","right":"28px","top":"22px","display":"flex","justifyContent":"space-between","alignItems":"center"}}>
            {" "}
            <a href="#top" data-ui="1" data-brand="1" style={{"pointerEvents":"auto","display":"flex","alignItems":"center","gap":"10px","textDecoration":"none","fontSize":"16px","fontWeight":"800","letterSpacing":".1em"}}>
              <img src="/zb/assets/zebraish-mark.png" alt="" style={{"height":"26px","width":"auto"}} />
              {"ZEBRAISH"}
            </a>
            {" "}
            <div style={{"display":"flex","gap":"10px","alignItems":"center"}}>
              {" "}
              <button type="button" data-ui="1" data-soundbtn="1" aria-label={v.soundLabel} onClick={v.toggleSound} style={{"pointerEvents":"auto","display":"flex","alignItems":"center","gap":"8px","padding":"9px 14px","borderRadius":"100px","background":"rgba(245,245,247,.06)","border":"1px solid rgba(245,245,247,.16)","color":"#f5f5f7","fontFamily":"inherit","fontSize":"10px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","cursor":"pointer","whiteSpace":"nowrap"}}>{I(v.soundLabel)}</button>
              {" "}
              <button type="button" data-ui="1" onClick={v.toggleLang} style={{"pointerEvents":"auto","padding":"9px 12px","borderRadius":"100px","background":"none","border":"1px solid rgba(245,245,247,.16)","color":"#f5f5f7","fontFamily":"inherit","fontSize":"10px","fontWeight":"700","letterSpacing":".14em","cursor":"pointer"}}>{I(v.langLabel)}</button>
              {" "}
              <a href="/studio?build=1" data-ui="1" data-id="hcta" style={{"transition":"opacity .5s ease","pointerEvents":"auto","padding":"10px 20px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"11px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none","whiteSpace":"nowrap"}} data-es="Empieza un proyecto">{"Start a project"}</a>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div style={css(`position:absolute;right:28px;top:50%;transform:translateY(-50%);display:${v.railDisplay ?? ""};flex-direction:column;gap:10px;align-items:flex-end`)}>
            {" "}
            {each(v, v.rail, "r", (v) => (
              <>
                {" "}
                <span style={css(`display:flex;align-items:center;gap:10px;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${v.r?.color ?? ""};transition:color .4s`)}>
                  <span style={css(`opacity:${v.r?.labelOp ?? ""};transition:opacity .4s`)}>{I(v.r?.label)}</span>
                  <span style={css(`width:${v.r?.w ?? ""};height:2px;background:currentColor;transition:width .5s cubic-bezier(.16,1,.3,1)`)} />
                </span>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{"position":"absolute","left":"28px","bottom":"24px","fontFamily":"ui-monospace,Menlo,monospace","fontSize":"10px","letterSpacing":".18em","textTransform":"uppercase","color":"rgba(245,245,247,.45)"}}>{I(v.patternId)}</div>
          {" "}
        </div>
        {" "}
        {" "}
        {v.powerOn ? (
          <>
            {" "}
            <div data-id="power" data-ui="1" style={{"position":"absolute","inset":"0","display":"flex","alignItems":"center","justifyContent":"center","background":"#040405","pointerEvents":"auto"}}>
            {" "}
            <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"26px"}}>
              {" "}
              <button type="button" onClick={v.start} aria-label="Power on" style={{"position":"relative","width":"108px","height":"108px","borderRadius":"50%","border":"1.5px solid rgba(245,245,247,.35)","background":"radial-gradient(circle at 50% 40%,rgba(245,245,247,.08),transparent 70%)","color":"#f5f5f7","cursor":"pointer","display":"flex","alignItems":"center","justifyContent":"center","padding":"0","transition":"border-color .4s,box-shadow .4s,transform .4s"}} className="zbze-0">
                {" "}
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 3v8" />
                  <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
                </svg>
                {" "}
              </button>
              {" "}
              <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"8px","textAlign":"center"}}>
                {" "}
                <span style={{"fontSize":"13px","fontWeight":"700","letterSpacing":".28em","textTransform":"uppercase"}}>{I(v.powerLabel)}</span>
                {" "}
                <span style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".16em","textTransform":"uppercase","color":"rgba(245,245,247,.45)"}}>{I(v.powerSub)}</span>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
            {" "}
          </>
        ) : null}
        {" "}
        {" "}
        <div data-id="cursor" style={css(`position:absolute;left:0;top:0;display:${v.cursorDisplay ?? ""};align-items:center;gap:10px;transform:translate3d(-100px,-100px,0);will-change:transform`)}>
          {" "}
          <span data-id="cring" style={{"width":"26px","height":"26px","margin":"-13px 0 0 -13px","borderRadius":"50%","border":"1.5px solid #f5f5f7","mixBlendMode":"difference","transition":"width .3s,height .3s,margin .3s,background .3s"}} />
          {" "}
          <span data-id="clabel" style={{"fontSize":"10px","fontWeight":"800","letterSpacing":".22em","textTransform":"uppercase","marginTop":"-13px","mixBlendMode":"difference","transition":"opacity .3s"}}>{"Explore"}</span>
          {" "}
        </div>
        {" "}
      </div>
    </div>
    </>
  );
}

export default dcComponent("Zebraish Experience", Component, template, {});
