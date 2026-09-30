// @ts-nocheck
/* eslint-disable */
"use client";
// Zebraish World: ported from the Claude Design handoff (Zebraish World.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import { contactLinks } from "@zebraish/lib/contact";
import React from "react";
import { getZbLang, setSiteLang, tr } from "@/lib/zebraish/i18n";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";
import ZebraHead from "./ZebraHead";
import GlassNumbers from "./GlassNumbers";
import BuiltBy from "./BuiltBy";
import DeviceJourney from "./DeviceJourney";
import Ecosystem from "./Ecosystem";
import IdeaPrompt from "./IdeaPrompt";
import HenkoGenIntro from "./HenkoGenIntro";
import WordmarkFooter from "./WordmarkFooter";

class Component extends DCLogic {
  rootRef = React.createRef();
  state = { menu: false, drop: false, themeOverride: null, sound: false };
  q(s) { return this.rootRef.current && this.rootRef.current.querySelector(s); }
  componentDidMount() {
    const root = this.rootRef.current; if (!root) return;
    this._vw = () => { this.setState({ vw: innerWidth }); this.fitNav(); }; this._vw(); addEventListener('resize', this._vw);
    this._fitLang = () => { this._navNeed = 0; this.setState({ navCompact: false }, () => requestAnimationFrame(() => this.fitNav())); }; addEventListener('zb:lang', this._fitLang);
    requestAnimationFrame(() => this.fitNav()); document.fonts && document.fonts.ready.then(() => this.fitNav());
    this.runIntro(); this.startWorld(); this.bindSfx();
    this.onScroll = () => { if (this._sr) return; this._sr = requestAnimationFrame(() => { this._sr = 0; this.scrollFx(); }); };
    addEventListener('scroll', this.onScroll, { passive: true });
    this.scrollFx();
    this.bindReveals();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !window.__zbPerf?.lite) import('lenis').then(m => {
      if (window.__zbPerf?.lite) return; const L = m.default || m.Lenis; this.lenis = new L({ lerp: .09, wheelMultiplier: 1, smoothWheel: true }); window.__lenis = this.lenis;
      const f = t => { this.lenis.raf(t); this._ln = requestAnimationFrame(f); }; this._ln = requestAnimationFrame(f);
    }).catch(() => {});
    // Lite mode (a machine that can't keep the frame rate, see stripes.js):
    // hand scrolling back to the browser, which stays smooth under load.
    this._lite = () => { cancelAnimationFrame(this._ln); if (this.lenis) { if (window.__lenis === this.lenis) window.__lenis = undefined; this.lenis.destroy(); this.lenis = null; } };
    addEventListener('zb:lite', this._lite);
    this.initRadar();
  }
  runIntro() {
    const intro = this.q('[data-id="intro"]'); if (!intro) return;
    document.documentElement.style.overflow = 'hidden';
    const lines = [...intro.querySelectorAll('[data-line]')], st = this.q('[data-id="introStatus"]'), stmt = this.q('[data-id="introStatement"]'), bar = this.q('[data-id="introBar"]'), head = this.q('[data-id="introHead"]');
    lines.forEach((l, i) => { l.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1) ' + (120 + i * 90) + 'ms'; requestAnimationFrame(() => requestAnimationFrame(() => l.style.transform = 'scaleX(1)')); });
    bar.style.transition = 'width 7.4s linear'; requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '100%'));
    const T = (ms, f) => this._it.push(setTimeout(f, ms)); this._it = [];
    T(600, () => st.textContent = tr('Constructing the pattern…'));
    T(1600, () => st.textContent = tr('Establishing signal…'));
    T(2600, () => st.textContent = tr('Entering Zebraish…'));
    T(3300, () => { st.style.opacity = 0; stmt.style.opacity = 1; stmt.style.transform = 'none'; lines.forEach(l => { l.style.transition = 'transform 1.2s cubic-bezier(.7,0,.2,1), opacity 1.2s'; l.style.transform = 'scaleX(0)'; l.style.transformOrigin = 'right'; }); });
    T(4900, () => { stmt.style.opacity = 0; stmt.style.transform = 'translateY(-24px) scale(.96)'; head.style.opacity = 1; head.style.transform = 'scale(1)'; });
    T(6900, () => { head.style.transition = 'transform 1.35s cubic-bezier(.7,0,.2,1)'; head.style.transform = 'scale(38)'; this.sfx('whoosh'); });
    T(7700, () => { intro.style.transition = 'opacity .7s ease, background-color .7s ease'; intro.style.opacity = 0; intro.style.pointerEvents = 'none'; document.documentElement.style.overflow = ''; this.world && this.world.reveal(1); });
    T(8500, () => { intro.style.display = 'none'; });
  }
  async startWorld() {
    const cv = this.q('[data-id="world"]'); if (!cv) return;
    try {
      const m = await import('@/lib/zebraish/ribbon.js');
      this.world = m.mount(cv, {}); this.syncWorldTheme();
      let rv = 0; const up = () => { rv = Math.min(.35, rv + .006); this.world && this.world.reveal(rv); if (rv < .35) this._rv = requestAnimationFrame(up); }; up();
    } catch (e) { console.warn('World failed, using 2D fallback', e); cv.style.background = "#060608 repeating-linear-gradient(124deg,rgba(245,245,247,.06) 0 2px,transparent 2px 16px)"; }
  }
  syncWorldTheme() { if (!this.world) return; const light = (this.state.themeOverride ?? this.props.theme ?? 'dark') === 'light'; this.world.setTheme(light ? '#17171a' : '#f5f5f7', light ? '#faf9f7' : '#060608'); }
  componentDidUpdate() { this.syncWorldTheme(); }
  bindSfx() {
    this.aud = { click: new Audio('/zb/assets/sfx/click.mp3'), hover: new Audio('/zb/assets/sfx/hover.mp3'), whoosh: new Audio('/zb/assets/sfx/whoosh.mp3'), amb: new Audio('/zb/assets/sfx/ambient-enlivening.mp3') };
    this.aud.amb.loop = true; this.aud.amb.volume = .25; this.aud.hover.volume = .25; this.aud.click.volume = .5; this.aud.whoosh.volume = .4;
    const root = this.rootRef.current;
    this._ov = e => { const t = e.target.closest && e.target.closest('a,button'); if (t && t !== this._lastHov) { this._lastHov = t; this.sfx('hover'); } };
    this._cl = e => { if (e.target.closest && e.target.closest('a,button')) this.sfx('click'); };
    root.addEventListener('pointerover', this._ov); root.addEventListener('click', this._cl);
  }
  sfx(k) { if (!this.state.sound || !this.aud) return; const a = this.aud[k]; try { a.currentTime = 0; a.play(); } catch (e) {} }
  toggleSound() { const on = !this.state.sound; this.setState({ sound: on }); if (!this.aud) return; if (on) { this.aud.amb.play().catch(() => {}); } else this.aud.amb.pause(); }
  componentWillUnmount() { removeEventListener('zb:lite', this._lite); removeEventListener('resize', this._vw); removeEventListener('zb:lang', this._fitLang); (this._it || []).forEach(clearTimeout); cancelAnimationFrame(this._rv); this.world && this.world.destroy(); this.aud && this.aud.amb.pause(); document.documentElement.style.overflow = ''; cancelAnimationFrame(this._ln); if (this.lenis) { if (window.__lenis === this.lenis) window.__lenis = undefined; this.lenis.destroy(); } removeEventListener('scroll', this.onScroll); (this.ios || []).forEach(o => o.disconnect()); }
  scrollFx() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    const vel = Math.max(-1, Math.min(1, (y - (this._ly ?? y)) / 60)); this._ly = y;
    this._sk = (this._sk || 0) * .8 + vel * .2;
    if (!this._h2) this._h2 = [...this.rootRef.current.querySelectorAll('h2')];
    if (!window.__zbPerf?.lite) this._h2.forEach(el => { el.style.transform = `skewY(${(this._sk * -2.5).toFixed(2)}deg)`; el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)'; });
    clearTimeout(this._skT); this._skT = setTimeout(() => { this._sk = 0; this._h2.forEach(el => el.style.transform = 'none'); }, 120);
    const bar = this.q('[data-id="bar"]'); if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    const t = (s, v) => { const el = this.q(s); if (el) el.style.transform = v; };
    t('[data-id="bgname"]', `translate3d(0,${y * .35}px,0)`); t('[data-id="heroLeft"]', `translate3d(0,${y * .1}px,0)`);
    t('[data-id="hs1"]', `translate3d(0,${y * .18}px,0)`); t('[data-id="hs2"]', `translate3d(0,${y * .1}px,0) scaleX(-1)`);
  }
  bindReveals() {
    const root = this.rootRef.current; this.ios = [];
    const E = 'var(--ease)';
    const off = { '1': 'translateY(36px)', s: 'scale(.95)', l: 'translateX(-36px)', r: 'translateX(36px)' };
    const els = [...root.querySelectorAll('[data-hr]')];
    const io = new IntersectionObserver(es => es.forEach((e, i) => {
      const el = e.target;
      if (e.isIntersecting) { el.style.transition = `opacity .9s ${E} ${i * 70}ms,transform .9s ${E} ${i * 70}ms`; el.style.opacity = '1'; el.style.transform = 'none'; }
      else if (e.boundingClientRect.top > 0) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = off[el.dataset.hr] || off['1']; }
    }), { threshold: .06 });
    els.forEach(el => io.observe(el)); this.ios.push(io);
    const count = el => { const tg = parseFloat(el.dataset.count); if (isNaN(tg)) return; const suf = el.dataset.suffix || '', st = performance.now(); cancelAnimationFrame(el._r); const f = n => { const p = Math.min((n - st) / 1800, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * tg) + suf; if (p < 1) el._r = requestAnimationFrame(f); }; el._r = requestAnimationFrame(f); };
    const words = root.querySelectorAll('[data-word]');
    const mk = (sel, on, offFn, th) => { root.querySelectorAll(sel).forEach(n => { const o = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? on(e.target) : offFn(e.target)), { threshold: th }); o.observe(n); this.ios.push(o); }); };
    mk('[data-stmt]', () => words.forEach((w, i) => { w.style.transition = `opacity .8s ${E} ${i * 180}ms,transform .8s ${E} ${i * 180}ms`; w.style.opacity = '1'; w.style.transform = 'none'; }),
      () => words.forEach(w => { w.style.transition = 'none'; w.style.opacity = '0'; w.style.transform = 'translateY(60px)'; }), .3);
    mk('[data-bars]', n => n.querySelectorAll('[data-pct]').forEach((b, i) => setTimeout(() => { b.style.width = b.dataset.pct + '%'; }, 150 + i * 80)), n => n.querySelectorAll('[data-pct]').forEach(b => { b.style.transition = 'none'; b.style.width = '0%'; b.offsetWidth; b.style.transition = 'width 1.6s cubic-bezier(.4,0,.2,1)'; }), .2);
    mk('[data-count-group]', n => n.querySelectorAll('[data-count]').forEach(count), n => n.querySelectorAll('[data-count]').forEach(el => { if (el.dataset.count) el.textContent = '0' + (el.dataset.suffix || ''); }), .3);
    mk('[data-process]', n => { const f = n.querySelector('[data-id="pfill"]'); setTimeout(() => f.style.width = '100%', 300); n.querySelectorAll('[data-dot]').forEach((d, i) => setTimeout(() => { d.style.background = 'var(--invert-bg)'; d.style.borderColor = 'transparent'; d.style.boxShadow = '0 0 24px rgba(var(--tint-rgb),.35)'; d.style.color = 'var(--invert-fg)'; }, 400 + i * 350)); },
      n => { n.querySelector('[data-id="pfill"]').style.width = '0%'; n.querySelectorAll('[data-dot]').forEach(d => { d.style.background = ''; d.style.borderColor = ''; d.style.boxShadow = ''; d.style.color = ''; }); }, .3);
    mk('[data-id="radar"]', () => this.animRadar(), () => this.drawRadar && this.drawRadar(0), .3);
  }
  initRadar() {
    const canvas = this.q('[data-id="radar"]'); if (!canvas) return;
    const size = Math.min(canvas.parentElement.offsetWidth || 380, 380); canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const labels = ['Build', 'Brand', 'Automate', 'Intelligence', 'Speed', 'Delivery'], values = [.97, .94, .88, .60, .96, 1];
    const colors = ['#e0295f', '#e8a93c', '#17c98d', '#3d7ef0', '#17c98d', '#e8a93c'], n = 6, step = Math.PI * 2 / n;
    this.drawRadar = p => {
      const light = getComputedStyle(canvas).getPropertyValue('--tint-rgb').trim().startsWith('20');
      const tint = light ? '20,20,24' : '245,245,247';
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) * .36;
      ctx.clearRect(0, 0, W, H);
      for (let lv = 1; lv <= 5; lv++) { const r = lv / 5 * R; ctx.beginPath(); for (let i = 0; i < n; i++) { const a = i * step - Math.PI / 2; i ? ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } ctx.closePath(); ctx.strokeStyle = `rgba(${tint},${.03 + lv * .018})`; ctx.lineWidth = 1; ctx.stroke(); }
      for (let i = 0; i < n; i++) { const a = i * step - Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.strokeStyle = `rgba(${tint},.08)`; ctx.stroke(); ctx.fillStyle = `rgba(${tint},.45)`; ctx.font = '600 10px -apple-system,Inter,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labels[i].toUpperCase(), cx + (R + 22) * Math.cos(a), cy + (R + 22) * Math.sin(a)); }
      const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, 'rgba(224,41,95,.20)'); g.addColorStop(.5, `rgba(${tint},.10)`); g.addColorStop(1, 'rgba(61,126,240,.20)');
      ctx.beginPath(); for (let i = 0; i < n; i++) { const a = i * step - Math.PI / 2, r = values[i] * p * R; i ? ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `rgba(${tint},.7)`; ctx.lineWidth = 1.5; ctx.stroke();
      for (let i = 0; i < n; i++) { const a = i * step - Math.PI / 2, r = values[i] * p * R, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fillStyle = colors[i]; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fillStyle = colors[i] + '33'; ctx.fill(); }
    };
    this.drawRadar(1);
  }
  animRadar() { if (!this.drawRadar) return; const st = performance.now(); cancelAnimationFrame(this._rd); const f = now => { const p = Math.min((now - st) / 1600, 1); this.drawRadar(1 - Math.pow(1 - p, 3)); if (p < 1) this._rd = requestAnimationFrame(f); }; this._rd = requestAnimationFrame(f); }
  // The nav shows its links only while they fit beside the logo and the buttons
  // (Spanish labels run longer); otherwise the menu button takes over. The width
  // they needed is remembered so they come back once the window is wide enough.
  fitNav() {
    const nav = this.q('[data-nav]'), links = this.q('[data-navlinks]');
    if (!nav || !links) return;
    if (!this.state.navCompact) {
      if (getComputedStyle(links).display === 'none') return;
      const over = Math.max(nav.scrollWidth - nav.clientWidth, links.scrollWidth - links.clientWidth);
      if (over > 1) { this._navNeed = innerWidth + over + 24; this.setState({ navCompact: true }); }
    } else if (this._navNeed && innerWidth >= this._navNeed) {
      this._navNeed = 0; this.setState({ navCompact: false }, () => requestAnimationFrame(() => this.fitNav()));
    }
  }
  renderVals() {
    const theme = this.state.themeOverride ?? this.props.theme ?? 'dark';
    const stripes = this.props.stripes ?? 'hide';
    const W = (label, hi) => ({ label, w: hi ? 800 : 500, c: hi ? 'var(--text)' : 'var(--text-faint)' });
    const tk = [W('Build', 1), W('Intelligence'), W('Automate', 1), W('Brand'), W('Grow', 1), W('Idea → Product'), W('Zebraish Ecosystem', 1), W('Founder-Led')];
    const m1 = [['HTML5', '#ffffff'], ['CSS3', '#d4d4d8'], ['JavaScript', '#a8a8b0'], ['Canvas API', '#84848c'], ['WhatsApp', '#f0f0f2'], ['Vercel', '#c2c2c8'], ['Automation', '#ffffff'], ['Zebraish Ecosystem', '#a8a8b0']].map(([label, c]) => ({ label, c }));
    const m2 = [['Typography', '#f0f0f2'], ['Brand Systems', '#c2c2c8'], ['Dark Editorial', '#ffffff'], ['Motion Design', '#a8a8b0'], ['Mobile-First', '#84848c'], ['Custom Cursor', '#d4d4d8'], ['Glassmorphism', '#f0f0f2'], ['Founder-Led', '#ffffff']].map(([label, c]) => ({ label, c }));
    const U = id => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&auto=format`;
    const work = [
      ['PM PORTFOLIO', 'Product & Frontend Builder', U('photo-1551434678-e076c223a692'), 'PM Portfolio: Product & Frontend Builder', 'Personal product portfolio. PM thinking meets frontend execution: real products shipped to production, presented in a clean dark interface.', ['Product', 'Frontend', 'Portfolio'], 'Tech & Product', 'https://pm-portfolio-steel-rho.vercel.app/', 5, '300px'],
      ['MALAAK', 'Modest Luxury Abayas', '/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg', 'MALAAK: Modest Luxury Abayas', 'Minimal editorial fashion site. Split-hero layout, hover-reveal product grid, seamless WhatsApp order flow. Built for Snapchat-native buyers.', ['Fashion', 'Editorial', 'WhatsApp'], 'Modest Fashion', 'https://malaak-abaya.vercel.app/', 7, '300px'],
      ['DOBERMAN', 'Bold Brand Experience', '/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg', 'Doberman: Bold Brand Experience', 'High-impact brand site. Aggressive typography, dramatic dark palette, and a conversion-focused layout that commands attention and demands action.', ['Brand', 'Dark Bold', 'Interactive'], 'Brand & Identity', 'https://doberman-kappa.vercel.app/', 12, '360px'],
      ['CHRTT.PRIETO', 'Fashion & Lifestyle Creator', U('photo-1492707892479-7bc8d5a4ee93'), 'Christian Prieto: Digital Creator', 'Sleek creator portfolio built for a Barcelona-based fashion and lifestyle creator. Stats-forward layout, TikTok-native aesthetic, and a seamless brand collab flow, with 9.6M likes and counting.', ['Creator', 'Fashion', 'TikTok'], 'Creator Economy', 'https://christain-theapeacademys-projects.vercel.app/', 4, '200px'],
      ['APE ACADEMY', 'Academic Excellence', '/zb/assets/Screenshot_20260412-220250_Chrome.png', 'Ape Academy: Academic Excellence', 'Clean, bold educational platform. Strong brand identity, structured content layout, and a no-nonsense conversion flow built for serious learners.', ['Education', 'Dark Theme', 'Bold'], 'Education', 'https://deploy-1-p1ke.vercel.app/', 4, '200px'],
      ['AAURA', 'Arabian Luxury Perfumery', '/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg', 'AAURA: Arabian Luxury Perfumery', 'Animated gold particle field, arabesque typography, WhatsApp ordering. Every pixel drips with money.', ['Luxury', 'Canvas FX', 'Arabic'], 'Fragrance', 'https://aaura-perfume.vercel.app/', 4, '200px'],
      ['NOIR ATELIER', 'Luxury Ready-to-Wear', U('photo-1509631179647-0177331693ae'), 'NOIR ATELIER: Luxury Ready-to-Wear', 'Custom magnetic cursor, scrolling marquee, French-named product grid. Bold. Cold. Unforgettable.', ['High Fashion', 'B&W'], 'Apparel', 'https://noir-atelier-clothing.vercel.app/', 6, '240px'],
      ['EMBER & SALT', 'Wood-Fired Restaurant', U('photo-1414235077428-338989a2e8c0'), 'Ember & Salt: Wood-Fired Restaurant', 'CSS animated flame, warm ember palette, seasonal menu tabs, reservation CTA. You can almost smell the smoke.', ['Restaurant', 'Animation'], 'Food & Drink', 'https://ember-salt-restaurant.vercel.app/', 6, '240px'],
      ['REVERIE', 'Luxury Beauty Salon', '/zb/assets/4c7faa2cf965371c0d8c790e9d5f61a1.jpg', 'Reverie: Luxury Beauty Salon', 'Soft marble luxury aesthetic. Services grid, team showcase, WhatsApp booking integration.', ['Beauty', 'Marble'], 'Beauty', 'https://reverie-salon.vercel.app/', 12, '240px'],
    ].map((r, i) => ({ name: r[0], tag: r[1], img: r[2], title: r[3], desc: r[4], tags: r[5], industry: r[6], url: r[7], span: r[8], h: r[9], num: String(i + 1).padStart(2, '0'), wide: i === 2, descTop: i !== 2, bodyPad: i === 2 ? '28px 32px' : '20px 22px 22px', bodyDisplay: i === 2 ? 'grid' : 'block' }));
    return { isLight: theme === 'light',
      rootRef: this.rootRef, theme, stripes,
      soundLabel: this.state.sound ? 'Sound on' : 'Sound off', toggleSound: () => this.toggleSound(),
      introLines: Array.from({ length: 14 }, (_, i) => ({ h: [1, 2, 6, 1, 14, 2, 1, 4, 22, 1, 3, 9, 1, 2][i] + 'px', w: (60 + (i * 37) % 60) + '%', ml: ((i * 23) % 30) + '%', o: [.5, .8, 1, .4, 1, .6, .3, .9, 1, .5, .7, 1, .4, .8][i] })),
      numbers: this.props.numbers ?? 'c', head: this.props.head ?? 'a', footer: this.props.footer ?? 'a', ecosystem: this.props.ecosystem ?? 'b',
      heroVignette: stripes === 'current' ? 'var(--bg)' : 'rgba(var(--bg-rgb),.4)',
      navLinksDisplay: (this.state.vw && this.state.vw < 1160) || this.state.navCompact ? 'none' : 'flex', navCompact: !!this.state.navCompact,
      menuOpen: this.state.menu, toggleMenu: () => this.setState({ menu: !this.state.menu }), closeMenu: () => this.setState({ menu: false }),
      navLinks: [['#build', 'Build'], ['#work', 'Work'], ['#process', 'Process'], ['#ecosystem', 'Ecosystem'], ['#collaborate', 'Collaborate'], ['#partner', 'Partner']].map(([href, label]) => ({ href, label })),
      toggleTheme: () => this.setState({ themeOverride: theme === 'light' ? 'dark' : 'light' }, () => this.drawRadar && setTimeout(() => this.drawRadar(1), 50)),
      dropOpen: this.state.drop, toggleDrop: () => this.setState(s => ({ drop: !s.drop })),
      dropItems: contactLinks(),
      devTilt: e => { const d = this.q('[data-id="device"]'); if (!d) return; const r = d.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; d.style.transform = `perspective(900px) rotateX(${-(y / r.height) * 14}deg) rotateY(${(x / r.width) * 14}deg)`; },
      devReset: () => { const d = this.q('[data-id="device"]'); if (d) d.style.transform = ''; },
      tilt: e => { const el = e.currentTarget, r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; el.style.transition = 'box-shadow .3s ease'; el.style.transform = `perspective(1000px) rotateX(${-(y / r.height) * 6}deg) rotateY(${(x / r.width) * 6}deg) scale(1.01)`; el.style.boxShadow = `0 30px 80px rgba(0,0,0,.6),${(x / r.width) * -12}px ${(y / r.height) * -12}px 30px rgba(245,245,247,.12)`; },
      untilt: e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; },
      ticker: [...tk, ...tk], mq1: [...m1, ...m1], mq2: [...m2, ...m2],
      legend: [['var(--wine)', 'Build'], ['var(--gold)', 'Brand'], ['var(--emerald)', 'Automate'], ['var(--sapphire)', 'Intelligence'], ['var(--emerald)', 'Speed'], ['var(--gold)', 'Delivery']].map(([c, label]) => ({ c, label })),
      skills: [['Build', 97, 'var(--wine)', '224,41,95', 'Websites · Web Apps · Software'], ['Brand', 94, 'var(--gold)', '232,169,60', 'Identity · Typography · Design Systems'], ['Automate', 88, 'var(--emerald)', '23,201,141', 'Workflows · Integrations · CRM'], ['Intelligence', 60, 'var(--sapphire)', '61,126,240', 'AI & Analytics · Available on Request'], ['Grow', 82, 'var(--emerald)', '23,201,141', 'Launch Strategy · The Board (Coming)'], ['Live Deployment', 100, 'var(--gold)', '232,169,60', 'Vercel · Custom Domain · SSL']].map(([name, pct, c, rgb, tags]) => ({ name, pct, c, rgb, tags })),
      work,
      steps: [['01', "Tell Us What You're Building", 'Fill out the Start a Project flow or message directly. Tell us what your idea or business needs. Takes 5 minutes.'], ['02', 'We Shape a Direction', 'Within 48 hours you get a visual direction, structure, and a flat project price.'], ['03', 'We Build It', "The full product gets built and sent to you as a live preview link. You review, we refine until it's exactly right."], ['04', 'You Launch', "Once you're happy, it goes live. From there, the wider Zebraish ecosystem is there to help you keep growing."]].map(([n, t, d]) => ({ n, t, d })),
      values: [{ n: 10, suf: '+', v: '10+', l: 'Days Max' }, { n: '', suf: '', v: '100%', l: 'Custom Built' }, { n: '', suf: '', v: '∞', l: 'Revisions' }, { n: '', suf: '', v: '5★', l: 'Rating' }],
      afc: [['Clear Communication', "You'll always know exactly what's being worked on. No chasing, no going dark, no surprises."], ['Purpose-Built Design', 'Every font, colour, layout, and interaction serves one goal: making your idea look and work undeniable.'], ['You Own Everything', 'All code, all files, all assets are yours forever. No subscriptions, no lock-in.'], ['Worldwide Delivery', 'Founders and businesses in Nigeria, the Gulf, the UK, Europe. Wherever you are, we deliver.']].map(([t, d]) => ({ t, d })),
      contactLinks: contactLinks(),
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--surface:#0c0c10;--surface2:#111118;--bg-rgb:6,6,8;--surface-rgb:12,12,16;--surface2-rgb:17,17,24;--approach-bg-rgb:8,20,17;--about-bg-rgb:24,8,14;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.22);--gold:#e8a93c;--gold-rgb:232,169,60;--glass:rgba(245,245,247,.05);--glass-b:rgba(245,245,247,.09);--glass-bb:rgba(245,245,247,.20);--invert-bg:#fff;--invert-fg:#000;--logo-inv:0}\n[data-theme=\"light\"]{--bg:#faf9f7;--surface:#f3f1ed;--surface2:#f0efec;--bg-rgb:250,249,247;--surface-rgb:243,241,237;--surface2-rgb:240,239,236;--approach-bg-rgb:232,244,238;--about-bg-rgb:250,234,238;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--gold:#a8720f;--gold-rgb:168,114,15;--glass:rgba(20,20,24,.05);--glass-b:rgba(20,20,24,.09);--glass-bb:rgba(20,20,24,.20);--invert-bg:#141414;--invert-fg:#fff;--logo-inv:1}\n:root{--green:#30D158;--wine:#e0295f;--emerald:#17c98d;--violet:#8b5cf6;--sapphire:#3d7ef0;--ease:cubic-bezier(0.16,1,0.3,1);--t:.45s;--sec-a:.5}\n[data-stripes=\"current\"]{--sec-a:.93}\n*,*::before,*::after{box-sizing:border-box}\nhtml,body{margin:0;padding:0}\nbody{background:#060608;overflow-x:hidden}\na{color:inherit}\na:hover{color:inherit}\n@keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(48,209,88,.6)}50%{box-shadow:0 0 0 5px rgba(48,209,88,0)}}\n@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}\n@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}\n@keyframes mq-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}\n@keyframes mq-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}\n@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}\n\n.zbzw-0:hover{color:var(--text) !important}\n.zbzw-1:hover{transform:scale(1.04) !important;box-shadow:0 0 24px rgba(var(--tint-rgb),.35) !important}\n.zbzw-2:hover{transform:translateY(-3px) !important;box-shadow:0 12px 40px rgba(var(--tint-rgb),.3) !important}\n.zbzw-3:hover{background:var(--glass) !important;color:var(--text) !important}\n.zbzw-4:hover{border-color:var(--glass-bb) !important;color:var(--text) !important;background:rgba(var(--tint-rgb),.07) !important}\n.zbzw-5:hover{background:rgba(var(--tint-rgb),.09) !important;transform:translateX(4px) !important}\n.zbzw-6:hover{border-color:var(--glass-bb) !important;color:var(--text) !important;transform:translateY(-3px) !important;background:rgba(var(--tint-rgb),.08) !important}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div ref={v.rootRef} data-theme={v.theme} data-stripes={v.stripes} style={{"position":"relative","minHeight":"100vh","background":"var(--bg)","color":"var(--text)","fontFamily":"Inter,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif","lineHeight":"1.6","letterSpacing":".005em","overflowX":"clip"}}>
      {" "}
      <canvas data-id="world" aria-hidden="true" style={{"position":"fixed","inset":"0","width":"100vw","height":"100vh","zIndex":"0","display":"block","background":"var(--bg)"}} />
      {" "}
      <div data-id="intro" style={{"position":"fixed","inset":"0","zIndex":"20000","background":"#050506","display":"flex","alignItems":"center","justifyContent":"center","overflow":"hidden","transition":"opacity 1.1s cubic-bezier(.16,1,.3,1)"}}>
        {" "}
        <div data-id="introLines" style={{"position":"absolute","inset":"-20%","display":"flex","flexDirection":"column","justifyContent":"center","gap":"22px","transform":"rotate(-34deg)"}}>
          {" "}
          {each(v, v.introLines, "l", (v) => (
            <>
              <span data-line="1" style={css(`display:block;height:${v.l?.h ?? ""};margin-left:${v.l?.ml ?? ""};width:${v.l?.w ?? ""};background:#f5f5f7;opacity:${v.l?.o ?? ""};transform:scaleX(0);transform-origin:left`)} />
            </>
          ))}
          {" "}
        </div>
        {" "}
        <div style={{"position":"relative","display":"flex","flexDirection":"column","alignItems":"center","gap":"22px","textAlign":"center","padding":"0 24px"}}>
          {" "}
          <div data-id="introStatus" style={{"fontFamily":"ui-monospace,Menlo,monospace","fontSize":"12px","letterSpacing":".24em","textTransform":"uppercase","color":"rgba(245,245,247,.55)","minHeight":"16px"}} />
          {" "}
          <div data-id="introStatement" style={{"fontSize":"clamp(34px,5.4vw,84px)","fontWeight":"900","letterSpacing":"-.035em","lineHeight":".98","color":"#f5f5f7","opacity":"0","transform":"translateY(24px)","transition":"opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)"}}>
            {"Ideas have patterns."}
            <br />
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","color":"#f5f5f7"}}>{"We give them form."}</span>
          </div>
          {" "}
        </div>
        {" "}
        <div data-id="introHead" style={{"position":"absolute","left":"50%","top":"50%","width":"min(62vh,560px)","height":"min(62vh,560px)","margin":"calc(min(62vh,560px) / -2) 0 0 calc(min(62vh,560px) / -2)","opacity":"0","transform":"scale(.9)","transformOrigin":"56% 44%","transition":"opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)","pointerEvents":"none"}}>
          {" "}
          <ZebraHead variant="a" __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
          {" "}
        </div>
        {" "}
        <div data-id="introBar" style={{"position":"absolute","left":"0","bottom":"0","height":"2px","width":"0%","backgroundImage":"repeating-linear-gradient(90deg,#f5f5f7 0 6px,transparent 6px 10px)"}} />
        {" "}
      </div>
      {" "}
      <button type="button" onClick={v.toggleSound} aria-label="Toggle sound" style={{"position":"fixed","right":"22px","bottom":"22px","zIndex":"1200","display":"flex","alignItems":"center","gap":"8px","padding":"10px 14px","borderRadius":"100px","background":"rgba(var(--bg-rgb),.6)","backdropFilter":"blur(16px)","border":"1px solid var(--glass-b)","color":"var(--text)","fontFamily":"inherit","fontSize":"10px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","cursor":"pointer","whiteSpace":"nowrap"}}>
        <span style={{"display":"flex","alignItems":"flex-end","gap":"2px","height":"12px"}}>
          <span data-eq="1" style={{"width":"2px","height":"40%","background":"currentColor"}} />
          <span data-eq="1" style={{"width":"2px","height":"80%","background":"currentColor"}} />
          <span data-eq="1" style={{"width":"2px","height":"55%","background":"currentColor"}} />
        </span>
        {I(v.soundLabel)}
      </button>
      {" "}
      <div style={{"position":"relative","zIndex":"1"}}>
        {" "}
        {" "}
        <nav data-nav="1" style={{"position":"fixed","top":"0","left":"0","right":"0","zIndex":"1000","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"24px","padding":"16px clamp(20px,3.4vw,48px)","backdropFilter":"blur(24px) saturate(1.8)","WebkitBackdropFilter":"blur(24px) saturate(1.8)","background":"rgba(var(--bg-rgb),.55)","borderBottom":"1px solid var(--glass-b)"}}>
          {" "}
          <a href="#hero" style={{"fontSize":"19px","fontWeight":"800","letterSpacing":".06em","color":"var(--text)","textDecoration":"none","display":"flex","alignItems":"center","gap":"10px"}}>
            <img src="/zb/assets/zebraish-mark.png" alt="Zebraish" style={{"height":"30px","width":"auto","display":"block","filter":"invert(var(--logo-inv))"}} />
            {"ZEBRAISH"}
            <span style={{"fontSize":"9px","fontWeight":"700","letterSpacing":".16em","color":"var(--text-faint)","border":"1px solid var(--glass-b)","padding":"3px 7px","borderRadius":"5px","textTransform":"uppercase","marginLeft":"1px"}}>{"Studio"}</span>
          </a>
          {" "}
          <div data-navlinks="1" style={css(`display:${v.navLinksDisplay ?? ""};gap:clamp(16px,2.2vw,36px);min-width:0;white-space:nowrap`)}>
            {" "}
            {each(v, v.navLinks, "l", (v) => (
              <>
                {" "}
                <a href={v.l?.href} style={{"fontSize":"12px","fontWeight":"500","letterSpacing":".06em","textTransform":"uppercase","color":"var(--text-muted)","textDecoration":"none","transition":"color .25s"}} className="zbzw-0">{I(v.l?.label)}</a>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{"display":"flex","gap":"14px","alignItems":"center"}}>
            {" "}
            <button type="button" role="switch" aria-checked={!!v.isLight} aria-label="Light mode" onClick={v.toggleTheme} className="zb-theme-switch zb-bar-extra" style={{"position":"relative","display":"flex","alignItems":"center","justifyContent":"space-between","width":"58px","height":"30px","padding":"0 8px","border":"1px solid var(--glass-bb)","borderRadius":"100px","background":"var(--glass)","color":"var(--text-muted)","cursor":"pointer","flexShrink":"0","boxSizing":"border-box"}}>
              <span aria-hidden="true" style={{"position":"absolute","top":"3px","left":"3px","width":"22px","height":"22px","borderRadius":"50%","background":"var(--invert-bg)","boxShadow":"0 2px 8px rgba(0,0,0,.35)","transition":"transform .45s var(--ease)","transform":v.isLight ? "translateX(28px)" : "none"}} />
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{"position":"relative","width":"12px","height":"12px","display":"block","color":v.isLight ? "var(--text-muted)" : "var(--invert-fg)"}}><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{"position":"relative","width":"13px","height":"13px","display":"block","color":v.isLight ? "var(--invert-fg)" : "var(--text-muted)"}}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            </button>
            {" "}
            <div className="zb-bar-extra" style={{"display":"flex","alignItems":"center","gap":"5px","marginRight":"4px","fontSize":"11px","fontWeight":"700","letterSpacing":".04em"}}>
              <button type="button" onClick={() => setSiteLang("es")} aria-pressed={getZbLang() === "es"} aria-label="Cambiar a español" style={{"background":"none","border":"none","cursor":"pointer","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","letterSpacing":"inherit","padding":"4px 5px","color":getZbLang() === "es" ? "var(--text)" : "var(--text-muted)"}}>{"ES"}</button>
              <span style={{"color":"var(--text-faint)"}}>{"|"}</span>
              <button type="button" onClick={() => setSiteLang("en")} aria-pressed={getZbLang() === "en"} aria-label="Switch to English" style={{"background":"none","border":"none","cursor":"pointer","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","letterSpacing":"inherit","padding":"4px 5px","color":getZbLang() === "en" ? "var(--text)" : "var(--text-muted)"}}>{"EN"}</button>
            </div>
            {" "}
            <a href="#start-a-project" style={{"background":"var(--invert-bg)","color":"var(--invert-fg)","padding":"9px 20px","fontSize":"12px","fontWeight":"700","letterSpacing":".04em","textTransform":"uppercase","borderRadius":"20px","textDecoration":"none","whiteSpace":"nowrap","transition":"transform var(--t) var(--ease),box-shadow var(--t) var(--ease)"}} className="zbzw-1 zb-bar-extra">{"Start a Project"}</a>
            {" "}
            <button type="button" className={v.navCompact ? "zb-burger zb-burger-on" : "zb-burger"} onClick={v.toggleMenu} aria-label="Open menu" aria-expanded={!!v.menuOpen} style={{"alignItems":"center","justifyContent":"center","width":"38px","height":"38px","border":"1px solid var(--glass-b)","borderRadius":"50%","background":"none","color":"var(--text)","cursor":"pointer","padding":"0"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{"width":"16px","height":"16px","display":"block"}}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
          {" "}
        </nav>
        {v.menuOpen ? (
          <div data-lenis-prevent className="zb-menu" style={{"position":"fixed","inset":"0","zIndex":"1100","display":"flex","flexDirection":"column","padding":"18px 24px 96px","overflowY":"auto","background":"rgba(var(--bg-rgb),.96)","backdropFilter":"blur(24px)","WebkitBackdropFilter":"blur(24px)","color":"var(--text)"}}>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"28px"}}>
              <span style={{"display":"flex","alignItems":"center","gap":"10px","fontSize":"19px","fontWeight":"800","letterSpacing":".06em"}}>
                <img src="/zb/assets/zebraish-mark.png" alt="Zebraish" style={{"height":"30px","width":"auto","display":"block","filter":"invert(var(--logo-inv))"}} />
                {"ZEBRAISH"}
              </span>
              <button type="button" onClick={v.closeMenu} aria-label="Close" style={{"width":"38px","height":"38px","border":"1px solid var(--glass-b)","borderRadius":"50%","background":"none","color":"var(--text)","cursor":"pointer","fontSize":"20px","lineHeight":"1","padding":"0","fontFamily":"inherit"}}>{"×"}</button>
            </div>
            {each(v, v.navLinks, "l", (v) => (
              <a href={v.l?.href} onClick={v.closeMenu} style={{"fontSize":"30px","fontWeight":"900","letterSpacing":"-.02em","textTransform":"uppercase","color":"var(--text)","textDecoration":"none","padding":"12px 0","borderBottom":"1px solid var(--glass-b)"}}>{I(v.l?.label)}</a>
            ))}
            <a href="#start-a-project" onClick={v.closeMenu} style={{"marginTop":"28px","background":"var(--invert-bg)","color":"var(--invert-fg)","padding":"16px 24px","fontSize":"13px","fontWeight":"800","letterSpacing":".06em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none","textAlign":"center"}}>{"Start a Project →"}</a>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"24px","fontSize":"13px","fontWeight":"700","letterSpacing":".04em"}}>
              <div style={{"display":"flex","alignItems":"center","gap":"6px"}}>
                <button type="button" onClick={() => setSiteLang("es")} aria-pressed={getZbLang() === "es"} style={{"background":"none","border":"none","cursor":"pointer","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","padding":"6px 8px","color":getZbLang() === "es" ? "var(--text)" : "var(--text-muted)"}}>{"ES"}</button>
                <span style={{"color":"var(--text-faint)"}}>{"|"}</span>
                <button type="button" onClick={() => setSiteLang("en")} aria-pressed={getZbLang() === "en"} style={{"background":"none","border":"none","cursor":"pointer","fontFamily":"inherit","fontSize":"inherit","fontWeight":"inherit","padding":"6px 8px","color":getZbLang() === "en" ? "var(--text)" : "var(--text-muted)"}}>{"EN"}</button>
              </div>
              <button type="button" role="switch" aria-checked={!!v.isLight} aria-label="Light mode" onClick={v.toggleTheme} className="zb-theme-switch" style={{"position":"relative","display":"flex","alignItems":"center","justifyContent":"space-between","width":"58px","height":"30px","padding":"0 8px","border":"1px solid var(--glass-bb)","borderRadius":"100px","background":"var(--glass)","color":"var(--text-muted)","cursor":"pointer","flexShrink":"0","boxSizing":"border-box"}}>
              <span aria-hidden="true" style={{"position":"absolute","top":"3px","left":"3px","width":"22px","height":"22px","borderRadius":"50%","background":"var(--invert-bg)","boxShadow":"0 2px 8px rgba(0,0,0,.35)","transition":"transform .45s var(--ease)","transform":v.isLight ? "translateX(28px)" : "none"}} />
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{"position":"relative","width":"12px","height":"12px","display":"block","color":v.isLight ? "var(--text-muted)" : "var(--invert-fg)"}}><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{"position":"relative","width":"13px","height":"13px","display":"block","color":v.isLight ? "var(--invert-fg)" : "var(--text-muted)"}}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            </button>
            </div>
          </div>
        ) : null}
        {" "}
        {" "}
        <section id="hero" style={{"minHeight":"100vh","display":"flex","alignItems":"center","padding":"120px 48px 80px","position":"relative","overflow":"hidden","gap":"60px"}}>
          {" "}
          <div data-id="hs1" style={{"position":"absolute","pointerEvents":"none","width":"75%","height":"130%","top":"-14%","left":"-8%","opacity":".55","backgroundImage":"repeating-linear-gradient(124deg,rgba(var(--tint-rgb),.10) 0 2px,transparent 2px 16px),repeating-linear-gradient(124deg,rgba(var(--tint-rgb),.045) 0 5px,transparent 5px 42px)","WebkitMaskImage":"radial-gradient(ellipse 55% 55% at 28% 42%,#000 0%,transparent 78%)","maskImage":"radial-gradient(ellipse 55% 55% at 28% 42%,#000 0%,transparent 78%)"}} />
          {" "}
          <div data-id="hs2" style={{"position":"absolute","pointerEvents":"none","width":"60%","height":"110%","top":"-4%","right":"-10%","opacity":".35","transform":"scaleX(-1)","backgroundImage":"repeating-linear-gradient(124deg,rgba(var(--tint-rgb),.10) 0 2px,transparent 2px 16px),repeating-linear-gradient(124deg,rgba(var(--tint-rgb),.045) 0 5px,transparent 5px 42px)","WebkitMaskImage":"radial-gradient(ellipse 50% 60% at 60% 45%,#000 0%,transparent 78%)","maskImage":"radial-gradient(ellipse 50% 60% at 60% 45%,#000 0%,transparent 78%)"}} />
          {" "}
          <div data-id="bgname" style={{"position":"absolute","right":"-2%","bottom":"-8%","fontSize":"clamp(160px,26vw,460px)","fontWeight":"900","letterSpacing":"-.06em","color":"transparent","WebkitTextStroke":"1px rgba(var(--tint-rgb),.05)","pointerEvents":"none","zIndex":"1","lineHeight":"1","userSelect":"none"}}>{"STUDIO"}</div>
          {" "}
          <div style={{"position":"absolute","inset":"0","pointerEvents":"none","backgroundImage":"linear-gradient(var(--glass-b) 1px,transparent 1px),linear-gradient(90deg,var(--glass-b) 1px,transparent 1px)","backgroundSize":"80px 80px","opacity":".3"}} />
          {" "}
          <div style={css(`position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 70% at 25% 50%,transparent 40%,${v.heroVignette ?? ""} 100%)`)} />
          {" "}
          <div data-id="heroLeft" style={{"position":"relative","zIndex":"2","flex":"1","maxWidth":"680px","minWidth":"0","containerType":"inline-size"}}>
            {" "}
            <div style={{"display":"inline-flex","alignItems":"center","gap":"10px","background":"var(--glass)","border":"1px solid var(--glass-b)","padding":"7px 16px","borderRadius":"100px","fontSize":"11px","fontWeight":"500","letterSpacing":".06em","textTransform":"uppercase","color":"var(--text-muted)","marginBottom":"36px"}}>
              <span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"var(--green)","flexShrink":"0","animation":"pulse-g 2s ease infinite"}} />
              {"Zebraish Studio · Founder-Led · Building Now"}
            </div>
            {" "}
            <div style={{"marginBottom":"32px","lineHeight":"1"}}>
              {" "}
              <span style={{"display":"block","fontSize":"clamp(16px,2.2vw,30px)","fontWeight":"200","letterSpacing":".08em","color":"var(--text-muted)","marginBottom":"4px","textTransform":"uppercase"}}>{"you have the idea."}</span>
              {" "}
              <span data-hl="1" style={{"display":"block","fontSize":"min(clamp(48px,8.6vw,132px),11.2cqi)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":".92","color":"var(--text)"}}>
                {"WE BUILD "}
                <span style={{"position":"relative","display":"inline-block","marginTop":".12em"}}>{"WHAT'S NEXT"}</span>
              </span>
              {" "}
              <span style={{"display":"block","fontSize":"clamp(14px,1.8vw,24px)","fontWeight":"300","letterSpacing":".04em","color":"var(--text-muted)","marginTop":"16px"}}>
                {"Idea  ·  "}
                <span style={{"fontWeight":"900","color":"var(--text)"}}>{"Build"}</span>
                {"  ·  Launch"}
              </span>
              {" "}
            </div>
            {" "}
            <p style={{"fontSize":"16px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"460px","margin":"28px 0 40px","letterSpacing":".01em"}}>
              {"I'm the founder behind "}
              <em style={{"fontStyle":"normal","color":"var(--text)","fontWeight":"600"}}>{"Zebraish Studio"}</em>
              {", the build layer of the Zebraish ecosystem. I turn ideas into real, hand-built digital products. No templates. No agency bloat."}
            </p>
            {" "}
            <div style={{"display":"flex","gap":"14px","alignItems":"center","flexWrap":"wrap"}}>
              {" "}
              <a href="#start-a-project" style={{"background":"var(--invert-bg)","color":"var(--invert-fg)","padding":"14px 30px","fontSize":"13px","fontWeight":"700","letterSpacing":".03em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none","display":"inline-block","transition":"transform var(--t) var(--ease),box-shadow var(--t) var(--ease)"}} className="zbzw-2">{"Tell Us What You're Building →"}</a>
              {" "}
              <div style={{"position":"relative","display":"inline-block"}}>
                {" "}
                <button type="button" onClick={v.toggleDrop} style={{"display":"flex","alignItems":"center","gap":"8px","background":"var(--glass)","color":"var(--text-muted)","border":"1px solid var(--glass-b)","padding":"14px 28px","fontSize":"12px","fontWeight":"500","letterSpacing":".08em","textTransform":"uppercase","cursor":"pointer","borderRadius":"100px","fontFamily":"inherit"}}>
                  {"Message Directly "}
                  <span style={{"fontSize":"9px","display":"inline-block"}}>{"▾"}</span>
                </button>
                {" "}
                {v.dropOpen ? (
                  <>
                    {" "}
                    <div style={{"position":"absolute","top":"calc(100% + 8px)","left":"0","minWidth":"210px","background":"rgba(var(--surface2-rgb),.72)","backdropFilter":"blur(24px) saturate(1.4)","WebkitBackdropFilter":"blur(24px) saturate(1.4)","border":"1px solid rgba(var(--tint-rgb),.18)","zIndex":"500","display":"flex","flexDirection":"column","overflow":"hidden","borderRadius":"20px","boxShadow":"0 20px 60px rgba(0,0,0,.6)"}}>
                    {" "}
                    {each(v, v.dropItems, "d", (v) => (
                      <>
                        {" "}
                        <a href={v.d?.href} target="_blank" style={{"display":"flex","alignItems":"center","gap":"12px","padding":"13px 18px","fontSize":"12px","fontWeight":"500","letterSpacing":".08em","textTransform":"uppercase","color":"var(--text-muted)","textDecoration":"none","borderBottom":"1px solid var(--glass-b)"}} className="zbzw-3">{I(v.d?.label)}</a>
                        {" "}
                      </>
                    ))}
                    {" "}
                  </div>
                    {" "}
                  </>
                ) : null}
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div data-count-group="1" style={{"display":"flex","marginTop":"52px","paddingTop":"36px","borderTop":"1px solid var(--glass-b)"}}>
              {" "}
              <div style={{"flex":"1","textAlign":"center"}}>
                <span data-count="10" data-suffix="+" style={{"display":"block","fontSize":"clamp(26px,3vw,42px)","fontWeight":"800","letterSpacing":"-.02em","color":"var(--text)","marginBottom":"4px"}}>{"10+"}</span>
                <span style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)"}}>{"Sites Shipped"}</span>
              </div>
              {" "}
              <div style={{"width":"1px","background":"var(--glass-b)"}} />
              {" "}
              <div style={{"flex":"1","textAlign":"center"}}>
                <span data-count="5" style={{"display":"block","fontSize":"clamp(26px,3vw,42px)","fontWeight":"800","letterSpacing":"-.02em","color":"var(--text)","marginBottom":"4px"}}>{"5"}</span>
                <span style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)"}}>{"Industries"}</span>
              </div>
              {" "}
              <div style={{"width":"1px","background":"var(--glass-b)"}} />
              {" "}
              <div style={{"flex":"1","textAlign":"center"}}>
                <span style={{"display":"block","fontSize":"clamp(26px,3vw,42px)","fontWeight":"800","letterSpacing":"-.02em","color":"var(--text)","marginBottom":"4px"}}>{"5★"}</span>
                <span style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)"}}>{"Rating"}</span>
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div style={{"position":"relative","zIndex":"2","flexShrink":"0","alignSelf":"flex-start","marginTop":"40px"}} onMouseMove={v.devTilt} onMouseLeave={v.devReset}>
            {" "}
            <div data-id="device" style={{"width":"425px","height":"525px","position":"relative"}}>
              <ZebraHead variant={v.head} __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
            </div>
            {" "}
            <div style={{"position":"absolute","top":"-14px","right":"-18px","background":"rgba(12,12,16,.88)","backdropFilter":"blur(16px)","border":"1px solid var(--glass-bb)","borderRadius":"12px","padding":"10px 16px","display":"flex","alignItems":"center","gap":"10px","fontSize":"12px","fontWeight":"600","color":"#f5f5f7","whiteSpace":"nowrap","animation":"fl 4s ease-in-out infinite"}}>
              <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"var(--green)"}} />
              {"5–10 Day Delivery"}
            </div>
            {" "}
            <div style={{"position":"absolute","bottom":"22px","left":"-28px","background":"rgba(12,12,16,.88)","backdropFilter":"blur(16px)","border":"1px solid var(--glass-bb)","borderRadius":"12px","padding":"10px 16px","display":"flex","alignItems":"center","gap":"10px","fontSize":"12px","fontWeight":"600","color":"#f5f5f7","whiteSpace":"nowrap","animation":"fl 4s ease-in-out infinite","animationDelay":"-2s"}}>
              <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#fff"}} />
              {"100% Hand-Built"}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <div style={{"overflow":"hidden","borderTop":"1px solid var(--glass-b)","borderBottom":"1px solid var(--glass-b)","padding":"12px 0","background":"rgba(var(--surface-rgb),var(--sec-a))","position":"relative"}}>
          {" "}
          <div style={{"display":"flex","animation":"ticker 22s linear infinite","whiteSpace":"nowrap","width":"max-content"}}>
            {" "}
            {each(v, v.ticker, "t", (v) => (
              <>
                {" "}
                <span style={{"display":"flex","alignItems":"center"}}>
                  <span style={css(`font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:0 32px;font-weight:${v.t?.w ?? ""};color:${v.t?.c ?? ""}`)}>{I(v.t?.label)}</span>
                  <span style={{"color":"var(--text-faint)","fontSize":"8px","opacity":".7"}}>{"◆"}</span>
                </span>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {" "}
        <section data-stmt="1" style={{"minHeight":"78vh","display":"flex","alignItems":"center","justifyContent":"center","background":"rgba(var(--surface-rgb),calc(var(--sec-a) - .03))","padding":"100px 48px","overflow":"hidden","position":"relative"}}>
          {" "}
          <div style={{"position":"absolute","inset":"0","background":"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(var(--tint-rgb),.05) 0%,transparent 70%)"}} />
          {" "}
          <div style={{"position":"relative","zIndex":"2","textAlign":"center","maxWidth":"1000px","margin":"0 auto"}}>
            {" "}
            <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","marginBottom":"48px","display":"flex","alignItems":"center","justifyContent":"center","gap":"14px"}}>
              <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
              {"The Philosophy"}
              <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
            </div>
            {" "}
            <div style={{"overflow":"hidden"}}>
              <span data-word="0" style={{"display":"inline-block","fontSize":"clamp(18px,2.5vw,30px)","fontWeight":"200","letterSpacing":".12em","color":"var(--text-muted)","textTransform":"uppercase"}}>{"every idea deserves to become"}</span>
            </div>
            {" "}
            <div style={{"overflow":"hidden","margin":"8px 0"}}>
              <span data-word="1" style={{"display":"inline-block","fontSize":"clamp(64px,10vw,140px)","lineHeight":".9","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"var(--wine)"}}>{"SOMETHING"}</span>
            </div>
            {" "}
            <div style={{"overflow":"hidden"}}>
              <span data-word="2" style={{"display":"inline-block","fontSize":"clamp(64px,10vw,140px)","lineHeight":".9","fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"transparent","WebkitTextStroke":"2px var(--emerald)"}}>{"REAL."}</span>
            </div>
            {" "}
            <div style={{"height":"20px"}} />
            {" "}
            <div style={{"overflow":"hidden"}}>
              <span data-word="3" style={{"display":"inline-block","fontSize":"clamp(18px,2.5vw,30px)","fontWeight":"200","letterSpacing":".12em","color":"var(--text-muted)","textTransform":"uppercase"}}>{"no two businesses are the same,"}</span>
            </div>
            {" "}
            <div style={{"overflow":"hidden","marginTop":"8px"}}>
              <span data-word="4" style={{"display":"inline-block","fontSize":"clamp(64px,10vw,140px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":".9","color":"var(--text)"}}>{"NEITHER ARE WE."}</span>
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <section id="build" style={{"padding":"80px 48px","background":"linear-gradient(to bottom,rgba(var(--bg-rgb),var(--sec-a)) 0%,rgba(var(--surface-rgb),var(--sec-a)) 60%)"}}>
          {" "}
          <div data-hr="1" style={{"display":"flex","justifyContent":"center","marginBottom":"24px"}}>
            <div style={{"position":"relative","width":"240px","height":"240px"}}>
              <ZebraHead variant={v.head} __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
            </div>
          </div>
          {" "}
          <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
            <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
            {"01 · What We Build"}
          </div>
          {" "}
          <h2 data-hr="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>{"IDEAS BECOME INFRASTRUCTURE"}</h2>
          {" "}
          <p data-hr="1" style={{"fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"500px","margin":"0"}}>
            {"Website or full software system, Zebraish Studio figures out what your idea actually needs to become real."}
          </p>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(360px,1fr))","gap":"64px","alignItems":"center","marginTop":"44px"}}>
            {" "}
            <div data-hr="l" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"24px"}}>
              {" "}
              <canvas data-id="radar" style={{"width":"100%","maxWidth":"380px","aspectRatio":"1","display":"block"}} />
              {" "}
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"8px 24px"}}>
                {" "}
                {each(v, v.legend, "g", (v) => (
                  <>
                    {" "}
                    <div style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"11px","fontWeight":"500","color":"var(--text-muted)","letterSpacing":".04em"}}>
                      <span style={css(`width:8px;height:8px;border-radius:50%;background:${v.g?.c ?? ""}`)} />
                      {I(v.g?.label)}
                    </div>
                    {" "}
                  </>
                ))}
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div data-hr="r" data-bars="1" style={{"display":"flex","flexDirection":"column","gap":"28px"}}>
              {" "}
              {each(v, v.skills, "s", (v) => (
                <>
                  {" "}
                  <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                    {" "}
                    <div style={{"display":"flex","justifyContent":"space-between","alignItems":"baseline"}}>
                      <span style={{"fontSize":"15px","fontWeight":"700","letterSpacing":"-.01em"}}>{I(v.s?.name)}</span>
                      <span style={css(`font-size:22px;font-weight:900;letter-spacing:-.02em;color:${v.s?.c ?? ""}`)}>{I(v.s?.pct)}{"%"}</span>
                    </div>
                    {" "}
                    <div style={{"height":"4px","background":"rgba(var(--tint-rgb),.07)","borderRadius":"100px","overflow":"hidden"}}>
                      <div data-pct={v.s?.pct} style={css(`height:100%;border-radius:100px;width:0%;background:repeating-linear-gradient(90deg,${v.s?.c ?? ""} 0 6px,rgba(${v.s?.rgb ?? ""},.25) 6px 10px);transition:width 1.6s cubic-bezier(.4,0,.2,1)`)} />
                    </div>
                    {" "}
                    <div style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".08em","color":"var(--text-faint)","textTransform":"uppercase"}}>{I(v.s?.tags)}</div>
                    {" "}
                  </div>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <div style={{"padding":"48px 0","overflow":"hidden","background":"rgba(var(--bg-rgb),var(--sec-a))","borderTop":"1px solid var(--glass-b)","borderBottom":"1px solid var(--glass-b)"}}>
          {" "}
          <div style={{"display":"flex","padding":"8px 0","whiteSpace":"nowrap"}}>
            <div style={{"display":"flex","animation":"mq-left 25s linear infinite"}}>
              {" "}
              {each(v, v.mq1, "m", (v) => (
                <>
                  <span style={{"display":"inline-flex","alignItems":"center","gap":"8px","margin":"0 8px","padding":"8px 18px","border":"1px solid var(--glass-b)","borderRadius":"100px","fontSize":"11px","fontWeight":"600","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)","background":"var(--surface)","whiteSpace":"nowrap"}}>
                    <span style={css(`width:6px;height:6px;border-radius:50%;background:${v.m?.c ?? ""}`)} />
                    {I(v.m?.label)}
                  </span>
                </>
              ))}
              {" "}
            </div>
          </div>
          {" "}
          <div style={{"display":"flex","padding":"8px 0","whiteSpace":"nowrap","marginTop":"8px"}}>
            <div style={{"display":"flex","animation":"mq-right 20s linear infinite"}}>
              {" "}
              {each(v, v.mq2, "m", (v) => (
                <>
                  <span style={{"display":"inline-flex","alignItems":"center","gap":"8px","margin":"0 8px","padding":"8px 18px","border":"1px solid var(--glass-b)","borderRadius":"100px","fontSize":"11px","fontWeight":"600","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)","background":"var(--surface)","whiteSpace":"nowrap"}}>
                    <span style={css(`width:6px;height:6px;border-radius:50%;background:${v.m?.c ?? ""}`)} />
                    {I(v.m?.label)}
                  </span>
                </>
              ))}
              {" "}
            </div>
          </div>
          {" "}
        </div>
        {" "}
        {" "}
        <GlassNumbers variant={v.numbers} />
        {" "}
        <BuiltBy variant="b" />
        {" "}
        {" "}
        <section id="work" style={{"padding":"80px 48px","background":"rgba(var(--bg-rgb),var(--sec-a))"}}>
          {" "}
          <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
            <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
            {"02 · Selected Work"}
          </div>
          {" "}
          <h2 data-hr="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>{"REAL WORK. REAL PROOF."}</h2>
          {" "}
          <p data-hr="1" style={{"fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"500px","margin":"0"}}>
            {"Twelve live sites, twelve different worlds, built by the founder before and during the formation of Zebraish Studio. This is the capability the Studio is built on."}
          </p>
          {" "}
          <div data-bleed="1" style={{"margin":"24px -48px 0"}}><DeviceJourney  /></div>
          {" "}
          <p data-hr="1" style={{"margin":"20px 0 0","fontSize":"12px","color":"var(--text-faint)","letterSpacing":".02em","maxWidth":"560px"}}>
            {"These projects were built by the founder, some before Zebraish Studio existed as a name. They're shown here as honest proof of capability, not as claimed Zebraish Studio client work."}
          </p>
          {" "}
          <div data-hr="1" style={{"marginTop":"40px","display":"flex","justifyContent":"center"}}>
            <a href="#work" style={{"color":"var(--text-muted)","border":"1px solid var(--glass-b)","padding":"15px 44px","fontSize":"12px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none","display":"inline-flex","alignItems":"center","gap":"10px"}} className="zbzw-4">
              {"View All Work "}
              <span>{"→"}</span>
            </a>
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <section id="process" style={{"padding":"80px 48px","background":"rgba(var(--bg-rgb),var(--sec-a))","overflow":"hidden"}}>
          {" "}
          <div data-hr="1" style={{"display":"flex","justifyContent":"center","marginBottom":"24px"}}>
            <div style={{"position":"relative","width":"240px","height":"240px"}}>
              <ZebraHead variant={v.head} __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
            </div>
          </div>
          {" "}
          <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
            <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
            {"03 · How We Work"}
          </div>
          {" "}
          <h2 data-hr="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
            {"FROM IDEA"}
            <br />
            <span style={{"fontWeight":"200","letterSpacing":".02em"}}>{"TO LIVE."}</span>
          </h2>
          {" "}
          <p data-hr="1" style={{"fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"500px","margin":"0"}}>{"Four steps. No bloat, no bureaucracy, just a founder who ships."}</p>
          {" "}
          <div data-process="1" style={{"marginTop":"60px","position":"relative"}}>
            {" "}
            <div style={{"position":"absolute","top":"28px","left":"0","right":"0","height":"1px","background":"var(--glass-b)"}} />
            {" "}
            <div data-id="pfill" style={{"position":"absolute","top":"28px","left":"0","height":"2px","backgroundImage":"repeating-linear-gradient(90deg,var(--invert-bg) 0 6px,transparent 6px 12px)","width":"0%","transition":"width 1.5s var(--ease)"}} />
            {" "}
            <div style={{"display":"grid","gridTemplateColumns":"repeat(4,minmax(0,1fr))","gap":"2px","position":"relative","zIndex":"2"}}>
              {" "}
              {each(v, v.steps, "p", (v) => (
                <>
                  {" "}
                  <div data-step="1" style={{"padding":"0 24px 40px","textAlign":"center"}}>
                    {" "}
                    <div data-dot="1" style={{"width":"56px","height":"56px","borderRadius":"50%","background":"var(--surface2)","border":"1px solid var(--glass-b)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto 28px","transition":"background var(--t),border-color var(--t),box-shadow var(--t),color var(--t)","color":"var(--text-faint)"}}><span style={{"fontSize":"15px","fontWeight":"800"}}>{I(v.p?.n)}</span></div>
                    {" "}
                    <h4 style={{"fontSize":"16px","fontWeight":"700","margin":"0 0 10px","letterSpacing":"-.01em"}}>{I(v.p?.t)}</h4>
                    {" "}
                    <p style={{"fontSize":"12px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>{I(v.p?.d)}</p>
                    {" "}
                  </div>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <Ecosystem variant={v.ecosystem} />
        {" "}
        {" "}
        <IdeaPrompt variant="a" />
        {" "}
        {" "}
        <section id="collaborate" style={{"padding":"80px 48px"}}>
          {" "}
          <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
            <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
            {"06 · Collaborate"}
          </div>
          {" "}
          <h2 data-hr="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
            {"BRING US "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"var(--emerald)"}}>{"CLIENTS."}</span>
          </h2>
          {" "}
          <p data-hr="1" style={{"fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"500px","margin":"0"}}>
            {"Refer businesses to Zebraish Studio and earn a commission on every project you bring in."}
          </p>
          {" "}
          <div data-hr="s" style={{"maxWidth":"680px","margin":"64px auto 0","background":"rgba(var(--tint-rgb),.05)","backdropFilter":"blur(24px) saturate(1.3)","WebkitBackdropFilter":"blur(24px) saturate(1.3)","boxShadow":"inset 0 1px 0 rgba(var(--tint-rgb),.06),0 30px 80px rgba(0,0,0,.4)","border":"1px solid rgba(var(--tint-rgb),.15)","borderRadius":"32px","padding":"48px 40px"}}>
            {" "}
            <div style={{"display":"flex","gap":"32px","flexWrap":"wrap","justifyContent":"center","textAlign":"center"}}>
              {" "}
              <div style={{"flex":"1","minWidth":"240px"}}>
                {" "}
                <h3 style={{"fontSize":"15px","fontWeight":"700","letterSpacing":".03em","textTransform":"uppercase","margin":"0 0 10px"}}>{"New Collaborator?"}</h3>
                {" "}
                <p style={{"fontSize":"14px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"320px","margin":"0 auto 24px"}}>
                  {"Apply to become an official Zebraish collaborator. Tell us a bit about yourself and we'll follow up."}
                </p>
                {" "}
                <a href="#collaborate" style={{"background":"var(--invert-bg)","color":"var(--invert-fg)","padding":"14px 30px","fontSize":"13px","fontWeight":"700","letterSpacing":".03em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none","display":"inline-block"}}>{"Apply to Collaborate →"}</a>
                {" "}
              </div>
              {" "}
              <div style={{"flex":"1","minWidth":"240px"}}>
                {" "}
                <h3 style={{"fontSize":"15px","fontWeight":"700","letterSpacing":".03em","textTransform":"uppercase","margin":"0 0 10px"}}>{"Already a Collaborator?"}</h3>
                {" "}
                <p style={{"fontSize":"14px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"320px","margin":"0 auto 24px"}}>
                  {"Enter your access code to check your dashboard: commissions, payouts, everything."}
                </p>
                {" "}
                <a href="#collaborate" style={{"color":"var(--text-muted)","border":"1px solid var(--glass-b)","padding":"15px 44px","fontSize":"12px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none","display":"inline-flex","gap":"10px"}}>
                  {"Enter Your Code "}
                  <span>{"→"}</span>
                </a>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <section id="about" style={{"background":"rgba(var(--about-bg-rgb),calc(var(--sec-a) + .02))","position":"relative","overflow":"hidden","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(420px,1fr))"}}>
          {" "}
          <div style={{"position":"absolute","inset":"0","backgroundImage":"repeating-linear-gradient(124deg,rgba(224,41,95,.10) 0 2px,transparent 2px 16px),repeating-linear-gradient(124deg,rgba(224,41,95,.05) 0 5px,transparent 5px 42px)","pointerEvents":"none"}} />
          {" "}
          <div style={{"position":"relative","padding":"72px 56px","borderRight":"1px solid var(--glass-b)"}}>
            {" "}
            <div data-hr="1" style={{"display":"flex","justifyContent":"center","marginBottom":"24px"}}>
              <div style={{"position":"relative","width":"200px","height":"200px"}}>
                <ZebraHead variant={v.head} __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
              </div>
            </div>
            {" "}
            <div data-hr="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
              <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
              {"07 · About"}
            </div>
            {" "}
            <h2 data-hr="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
              {"ABOUT "}
              <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"var(--wine)"}}>{"ZEBRAISH STUDIO"}</span>
            </h2>
            {" "}
            <p data-hr="1" style={{"fontSize":"14px","lineHeight":"1.9","color":"var(--text-muted)","margin":"0 0 22px"}}>
              {"I'm the founder behind "}
              <em style={{"fontStyle":"normal","color":"var(--text)","fontWeight":"600"}}>{"Zebraish Studio"}</em>
              {", the build layer of the wider Zebraish ecosystem. Today, that means one person, hand-building real digital products for real businesses."}
            </p>
            {" "}
            <p data-hr="1" style={{"fontSize":"14px","lineHeight":"1.9","color":"var(--text-muted)","margin":"0 0 22px"}}>
              {"Most agencies are slow, overpriced, and generic. I started building because good ideas kept getting undersold online. Zebraish Studio is the opposite: "}
              <em style={{"fontStyle":"normal","color":"var(--text)","fontWeight":"600"}}>{"fast, direct, custom"}</em>
              {", and built around what a business actually needs to become real."}
            </p>
            {" "}
            <div data-hr="1" style={{"fontSize":"clamp(20px,2.5vw,32px)","fontWeight":"700","lineHeight":"1.3","letterSpacing":"-.02em","margin":"36px 0","borderLeft":"3px solid var(--text)","paddingLeft":"22px"}}>
              <span style={{"display":"block","fontWeight":"200","fontSize":".75em","color":"var(--text-muted)","letterSpacing":".02em"}}>{"the difference is simple:"}</span>
              {"\"I deliver in days,"}
              <br />
              {"not months.\""}
            </div>
            {" "}
            <p data-hr="1" style={{"fontSize":"14px","lineHeight":"1.9","color":"var(--text-muted)","margin":"0 0 22px"}}>
              {"Based in "}
              <em style={{"fontStyle":"normal","color":"var(--text)","fontWeight":"600"}}>{"Nigeria"}</em>
              {". Building for founders and businesses worldwide."}
            </p>
            {" "}
            <div data-hr="1" data-count-group="1" style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginTop":"40px"}}>
              {" "}
              {each(v, v.values, "vc", (v) => (
                <>
                  {" "}
                  <div style={{"padding":"24px 20px","background":"rgba(var(--tint-rgb),.045)","backdropFilter":"blur(18px) saturate(1.3)","WebkitBackdropFilter":"blur(18px) saturate(1.3)","boxShadow":"inset 0 1px 0 rgba(var(--tint-rgb),.05)","border":"1px solid rgba(var(--tint-rgb),.14)","borderRadius":"20px"}}>
                    <span data-count={v.vc?.n} data-suffix={v.vc?.suf} style={{"display":"block","fontSize":"clamp(32px,4vw,48px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1","marginBottom":"4px"}}>{I(v.vc?.v)}</span>
                    <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","color":"var(--text-faint)"}}>{I(v.vc?.l)}</div>
                  </div>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div style={{"position":"relative","padding":"72px 56px","display":"flex","flexDirection":"column","justifyContent":"center"}}>
            {" "}
            <div data-hr="1" style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
              {" "}
              {each(v, v.afc, "a", (v) => (
                <>
                  {" "}
                  <div style={{"padding":"24px 26px","background":"rgba(var(--tint-rgb),.045)","backdropFilter":"blur(18px) saturate(1.3)","WebkitBackdropFilter":"blur(18px) saturate(1.3)","boxShadow":"inset 0 1px 0 rgba(var(--tint-rgb),.05)","border":"1px solid rgba(var(--tint-rgb),.14)","borderRadius":"20px","transition":"transform var(--t) var(--ease),background var(--t)"}} className="zbzw-5">
                    <div style={{"fontSize":"15px","fontWeight":"700","marginBottom":"7px","letterSpacing":"-.01em"}}>{I(v.a?.t)}</div>
                    <p style={{"fontSize":"13px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>{I(v.a?.d)}</p>
                  </div>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <HenkoGenIntro variant="b" />
        {" "}
        {" "}
        <section id="contact" style={{"position":"relative","overflow":"hidden","padding":"120px 48px","textAlign":"center","background":"linear-gradient(to bottom,rgba(var(--bg-rgb),calc(var(--sec-a) - .03)) 40%,rgba(var(--surface-rgb),var(--sec-a)) 100%)"}}>
          {" "}
          {" "}
          <div style={{"position":"relative","zIndex":"2","maxWidth":"720px","margin":"0 auto"}}>
            {" "}
            <div data-hr="s" style={{"position":"relative","width":"min(520px,90%)","height":"440px","margin":"-40px auto 8px"}}>
              <ZebraHead variant={v.head} __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
              <div style={{"position":"absolute","left":"50%","bottom":"6px","transform":"translateX(-50%)","fontSize":"10px","fontWeight":"600","letterSpacing":".24em","textTransform":"uppercase","color":"var(--text-faint)","pointerEvents":"none"}}>{"Drag to turn"}</div>
            </div>
            {" "}
            <h2 data-hr="1" style={{"fontSize":"clamp(52px,8vw,110px)","fontWeight":"900","lineHeight":".9","letterSpacing":"-.04em","margin":"0 0 28px"}}>
              {"LET'S BUILD"}
              <br />
              <span style={{"fontWeight":"200"}}>{"SOMETHING REAL."}</span>
            </h2>
            {" "}
            <p data-hr="1" style={{"fontSize":"17px","lineHeight":"1.75","color":"var(--text-muted)","maxWidth":"520px","margin":"0 auto 48px"}}>
              {"Every idea deserves infrastructure that does it justice. Start the project flow above, or message directly. No commitment, no pressure."}
            </p>
            {" "}
            <div data-hr="1" style={{"display":"flex","justifyContent":"center","gap":"10px","flexWrap":"wrap","marginBottom":"40px"}}>
              {" "}
              {each(v, v.contactLinks, "c", (v) => (
                <>
                  {" "}
                  <a href={v.c?.href} target="_blank" style={{"display":"inline-flex","alignItems":"center","gap":"9px","padding":"12px 24px","background":"var(--glass)","border":"1px solid var(--glass-b)","color":"var(--text-muted)","fontSize":"12px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","textDecoration":"none","borderRadius":"100px","transition":"all var(--t) var(--ease)"}} className="zbzw-6">{I(v.c?.label)}</a>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
            <a data-hr="1" href="#start-a-project" style={{"display":"inline-block","padding":"16px 48px","background":"var(--invert-bg)","color":"var(--invert-fg)","fontSize":"13px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none","borderRadius":"100px"}}>{"Start a Project →"}</a>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
        {" "}
        <WordmarkFooter variant={v.footer} />
        {" "}
      </div>
    </div>
    </>
  );
}

export default dcComponent("Zebraish World", Component, template, {"theme":"dark","stripes":"hide","numbers":"c","ecosystem":"b","head":"a","footer":"a"});
