// @ts-nocheck
/* eslint-disable */
"use client";
// Start a Project: ported from the Claude Design handoff (Start a Project.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";
import { saveProjectConfiguration } from "@/lib/actions/configurator";
import { logActivityEvent } from "@/lib/actions/activity";

import StripeField from "./StripeField";
import "@/lib/zebraish/no-wet.js";
import "@/lib/zebraish/zb-ambient.js";
class Component extends DCLogic {
  rootRef = React.createRef();
  state = { step: 0, type: null, goal: null, needs: [], level: null, name: '', email: '', phone: '', brand: '', msg: '', error: '', lang: 'en', saving: false, code: '', token: '' };
  // Discovery answers are saved as a project with no quoted price (pricing: inquire),
  // and logged on the same funnel events as the Configurator.
  sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  // Catalogue project type ids (lib/catalogue); 'software' is custom_software there.
  CATALOGUE_TYPE = { software: 'custom_software' };
  T = {
    en: { k: ['01 · What are we creating?', '02 · What is it for?', '03 · What does it need to do?', '04 · How ambitious?', '05 · Where do we reach you?', 'Project profile generated'],
      t: ['What are we creating?', 'What is it for?', 'What does it need to do?', 'How ambitious is it?', 'Where do we send the proposal?', 'Tailored proposal coming.'],
      s: ['Pick the closest one. We shape the details together.', 'The goal behind it, so we build the right thing.', 'Pick everything that applies.', 'Every project is priced to its scope. Pricing: inquire.', 'We reply within 48 hours with a direction and a flat project price.', 'Send your profile and we reply within 48 hours with a visual direction, structure and a flat price.'],
      next: 'Continue', gen: 'Generate profile', back: 'Back', pickOne: 'Pick one to continue.', pickSome: 'Pick at least one.', badContact: 'Add your name and a valid email.',
      f: ['Your name', 'Email', 'WhatsApp (optional)', 'Brand or idea name'], ph: ['Banks', 'you@brand.com', '+234 …', 'Zebraish'], msgL: 'Anything else?', msgPh: 'Links, references, deadlines…',
      wa: 'Message us on WhatsApp', track: 'Track your project', sending: 'Sending', saveFail: 'We could not send your profile. Try again, or message us on WhatsApp.', note: 'Nothing is charged. You get a proposal first.', footL: 'Zebraish Studio · Build what doesn’t exist yet', footR: 'Pricing: inquire',
      sum: ['Creating', 'For', 'Needs', 'Ambition', 'Contact'] },
    es: { k: ['01 · ¿Qué vamos a crear?', '02 · ¿Para qué es?', '03 · ¿Qué tiene que hacer?', '04 · ¿Qué tan ambicioso?', '05 · ¿Dónde te contactamos?', 'Perfil del proyecto generado'],
      t: ['¿Qué vamos a crear?', '¿Para qué es?', '¿Qué tiene que hacer?', '¿Qué tan ambicioso es?', '¿A dónde enviamos la propuesta?', 'Propuesta a medida en camino.'],
      s: ['Elige lo más cercano. Los detalles los definimos juntos.', 'El objetivo detrás, para construir lo correcto.', 'Elige todo lo que aplique.', 'Cada proyecto se cotiza según su alcance. Precio: consultar.', 'Respondemos en 48 horas con una dirección y un precio cerrado.', 'Envía tu perfil y respondemos en 48 horas con dirección visual, estructura y precio cerrado.'],
      next: 'Continuar', gen: 'Generar perfil', back: 'Atrás', pickOne: 'Elige una opción para continuar.', pickSome: 'Elige al menos una.', badContact: 'Añade tu nombre y un email válido.',
      f: ['Tu nombre', 'Email', 'WhatsApp (opcional)', 'Nombre de marca o idea'], ph: ['Banks', 'tu@marca.com', '+34 …', 'Zebraish'], msgL: '¿Algo más?', msgPh: 'Enlaces, referencias, plazos…',
      wa: 'Escríbenos por WhatsApp', track: 'Sigue tu proyecto', sending: 'Enviando', saveFail: 'No pudimos enviar tu perfil. Inténtalo de nuevo o escríbenos por WhatsApp.', note: 'No se cobra nada. Primero recibes una propuesta.', footL: 'Zebraish Studio · Construye lo que aún no existe', footR: 'Precio: consultar',
      sum: ['Creamos', 'Para', 'Necesita', 'Ambición', 'Contacto'] },
  };
  TYPES = [['website', 'Website', 'Sitio web', 'Brand, portfolio or business site'], ['ecommerce', 'Online store', 'Tienda online', 'Sell products online'], ['mobile_app', 'Mobile app', 'App móvil', 'iOS, Android or both'], ['software', 'Software', 'Software', 'Platforms, dashboards, internal tools'], ['ai_application', 'AI product', 'Producto de IA', 'Chat, search, generation'], ['ai_agent', 'AI agent', 'Agente de IA', 'Sales, support, social'], ['automation', 'Automation', 'Automatización', 'Workflows that run themselves'], ['api_backend', 'API / backend', 'API / backend', 'The engine behind a product'], ['branding', 'Brand identity', 'Identidad de marca', 'Logo, type, visual system'], ['marketing', 'Marketing', 'Marketing', 'Launch and growth assets']];
  GOALS = [['Launch a new business', 'Lanzar un negocio nuevo'], ['Grow an existing business', 'Hacer crecer un negocio'], ['Sell online', 'Vender online'], ['Save time', 'Ahorrar tiempo'], ['Build my personal brand', 'Construir mi marca personal'], ['Pitch or raise', 'Presentar o levantar capital']];
  NEEDS = { website: ['Showcase work', 'Take bookings', 'WhatsApp ordering', 'Blog / content', 'Multilingual', 'CMS to edit myself'], ecommerce: ['Product catalogue', 'Payments', 'Inventory', 'Delivery options', 'Discount codes', 'WhatsApp orders'], mobile_app: ['User accounts', 'Payments', 'Push notifications', 'Maps / location', 'Chat', 'Offline mode'], software: ['User roles', 'Dashboards', 'Payments', 'Integrations', 'Reports / exports', 'Admin panel'], ai_application: ['Chat with users', 'Search my documents', 'Generate content', 'Analyse data', 'Voice', 'Remember users'], ai_agent: ['Answer customers', 'Qualify leads', 'Post on social', 'Book meetings', 'Work on WhatsApp', 'Act on its own'], automation: ['Leads and CRM', 'Invoices', 'Notifications', 'Reports', 'Social posting', 'Data sync'], api_backend: ['Database', 'Auth', 'Payments', 'Third-party APIs', 'Webhooks', 'Admin tools'], branding: ['Logo', 'Typography', 'Colour system', 'Brand guidelines', 'Social templates', 'Packaging'], marketing: ['Launch campaign', 'Social content', 'Ads creative', 'Email', 'Landing pages', 'Video'] };
  LEVELS = [['Essential', 'Esencial', 'Clean, fast and custom. Everything you need to launch.', 'Limpio, rápido y a medida. Todo para lanzar.'], ['Advanced', 'Avanzado', 'Richer features, integrations and motion.', 'Más funciones, integraciones y movimiento.'], ['Immersive', 'Inmersivo', 'World-class: 3D, interaction and a story people remember.', 'De primer nivel: 3D, interacción y una historia memorable.']];
  componentDidMount() { this._k = e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') this.next(); if (/^[1-9]$/.test(e.key) && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { const o = this.opts()[+e.key - 1]; o && o.pick(); } }; addEventListener('keydown', this._k); this.anim(); }
  componentWillUnmount() { removeEventListener('keydown', this._k); }
  componentDidUpdate(pp, ps) { if (ps.step !== this.state.step) this.anim(); }
  anim() { const el = this.rootRef.current && this.rootRef.current.querySelector('[data-anim]'); if (!el) return; [...el.children].forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: i * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })); }
  opts() {
    const s = this.state, es = s.lang === 'es', set = o => this.setState(Object.assign({ error: '' }, o));
    const card = (label, on, pick, note, key) => ({ label, on: on ? 'true' : 'false', pick, note: note || '', hasNote: !!note, key, bg: on ? '#f5f5f7' : 'rgba(245,245,247,.045)', fg: on ? '#040405' : '#f5f5f7', bd: on ? '#f5f5f7' : 'rgba(245,245,247,.14)' });
    if (s.step === 0) return this.TYPES.map((t, i) => card(es ? t[2] : t[1], s.type === t[0], () => { set({ type: t[0], needs: [] }); void logActivityEvent('configurator_started', { sessionId: this.sessionId, metadata: { project_type: this.projectType(t[0]), source: 'discovery' } }); setTimeout(() => this.next(), 260); }, t[3], String(i + 1).padStart(2, '0')));
    if (s.step === 1) return this.GOALS.map((g, i) => card(es ? g[1] : g[0], s.goal === g[0], () => { set({ goal: g[0] }); setTimeout(() => this.next(), 260); }, '', String(i + 1).padStart(2, '0')));
    if (s.step === 2) return (this.NEEDS[s.type] || []).map((n, i) => card(n, s.needs.includes(n), () => set({ needs: s.needs.includes(n) ? s.needs.filter(x => x !== n) : [...s.needs, n] }), '', String(i + 1).padStart(2, '0')));
    if (s.step === 3) return this.LEVELS.map((l, i) => card(es ? l[1] : l[0], s.level === l[0], () => { set({ level: l[0] }); setTimeout(() => this.next(), 260); }, es ? l[3] : l[2], String(i + 1).padStart(2, '0')));
    return [];
  }
  next() {
    const s = this.state, t = this.T[s.lang];
    if (s.step === 0 && !s.type) return this.setState({ error: t.pickOne });
    if (s.step === 1 && !s.goal) return this.setState({ error: t.pickOne });
    if (s.step === 2 && !s.needs.length) return this.setState({ error: t.pickSome });
    if (s.step === 3 && !s.level) return this.setState({ error: t.pickOne });
    if (s.step === 4 && (!s.name.trim() || !/^\S+@\S+\.\S+$/.test(s.email))) return this.setState({ error: t.badContact });
    if (s.step === 4) return this.submit();
    if (s.step >= 1 && s.step <= 3) void logActivityEvent(s.step === 3 ? 'configurator_details_reached' : 'configurator_step', { sessionId: this.sessionId, metadata: { project_type: this.projectType(s.type), step_index: s.step, source: 'discovery' } });
    if (s.step < 5) this.setState({ step: s.step + 1, error: '' });
  }
  projectType(id) { return this.CATALOGUE_TYPE[id] || id; }
  async submit() {
    const s = this.state, t = this.T[s.lang];
    if (s.saving) return;
    this.setState({ saving: true, error: '' });
    const projectType = this.projectType(s.type);
    let res;
    try {
      res = await saveProjectConfiguration({
        accessToken: null, clientName: s.name.trim(), clientContact: [s.email.trim(), s.phone.trim()].filter(Boolean).join(' · '), projectType,
        answers: { source: 'discovery', goal: s.goal, needs: s.needs, level: s.level, brand: s.brand.trim() || undefined, message: s.msg.trim() || undefined, email: s.email.trim(), phone: s.phone.trim() || undefined, lang: s.lang },
        quotedPrice: 0, currency: 'EUR',
        quote: { lines: [], subtotal: 0, complexityMultiplier: 1, deliveryMultiplier: 1, total: 0, requiresCustomQuote: true },
      });
    } catch (e) { res = { ok: false }; }
    if (!res.ok) return this.setState({ saving: false, error: t.saveFail });
    void logActivityEvent('configurator_submitted', { sessionId: this.sessionId, projectId: res.projectId, metadata: { project_type: projectType, level: s.level, source: 'discovery' } });
    this.setState({ saving: false, step: 5, error: '', code: res.projectCode, token: res.accessToken });
  }
  renderVals() {
    const s = this.state, t = this.T[s.lang], es = s.lang === 'es', st = s.step;
    const typeName = (this.TYPES.find(x => x[0] === s.type) || [])[es ? 2 : 1] || '';
    const summary = [[t.sum[0], typeName], [t.sum[1], s.goal || ''], [t.sum[2], s.needs.join(', ')], [t.sum[3], s.level || ''], [t.sum[4], [s.name, s.email, s.phone].filter(Boolean).join(' · ')]].map(([k, v]) => ({ k, v }));
    const body = `New project profile\n${summary.map(x => `${x.k}: ${x.v}`).join('\n')}${s.brand ? `\nBrand: ${s.brand}` : ''}${s.msg ? `\nNotes: ${s.msg}` : ''}`;
    const fk = ['name', 'email', 'phone', 'brand'], types = ['text', 'email', 'tel', 'text'];
    return {
      rootRef: this.rootRef, step: String(st), progress: (Math.min(5, st) / 5 * 100) + '%', stepLabel: st < 5 ? `${st + 1} / 5` : '✓',
      kicker: t.k[st], title: t.t[st], sub: t.s[st],
      showOptions: st <= 3, showForm: st === 4, showDone: st === 5,
      options: this.opts(), optMin: st === 3 ? '280px' : '220px', optPad: st === 3 ? '28px 26px' : '20px 20px', optSize: st === 3 ? '26px' : '18px',
      fields: fk.map((k, i) => ({ label: t.f[i], ph: t.ph[i], type: types[i], value: s[k], change: e => this.setState({ [k]: e.target.value, error: '' }), bad: s.error && ((k === 'name' && !s.name.trim()) || (k === 'email' && !/^\S+@\S+\.\S+$/.test(s.email))) ? 'true' : 'false', bd: s.error && ((k === 'name' && !s.name.trim()) || (k === 'email' && !/^\S+@\S+\.\S+$/.test(s.email))) ? 'rgba(245,245,247,.8)' : 'rgba(245,245,247,.16)' })),
      msgLabel: t.msgL, msgPh: t.msgPh, msg: s.msg, msgChange: e => this.setState({ msg: e.target.value }),
      summary, profileId: `PROFILE · ${s.code}`,
      trackHref: '/track?token=' + encodeURIComponent(s.token), waHref: 'https://wa.me/2348165320780?text=' + encodeURIComponent(`${s.code}\n${body}`),
      sendTrack: t.track, sendWa: t.wa, doneNote: t.note,
      back: () => this.setState({ step: Math.max(0, st - 1), error: '' }), backVis: st > 0 && st < 5 ? 'visible' : 'hidden', backLabel: t.back,
      next: () => this.next(), nextDisplay: st === 5 ? 'none' : 'inline-block', nextLabel: s.saving ? t.sending : st === 4 ? t.gen : t.next, nextOp: s.saving ? .5 : 1, error: s.error,
      setEs: () => this.setState({ lang: 'es' }), setEn: () => this.setState({ lang: 'en' }), esColor: es ? '#f5f5f7' : 'rgba(245,245,247,.4)', enColor: es ? 'rgba(245,245,247,.4)' : '#f5f5f7',
      footL: t.footL, footR: t.footR,
    };
  }
}

const STYLE = "html,body{margin:0;background:#040405}\na{color:#f5f5f7}\na:hover{color:#ffffff}\n\n.zbsap-0:hover{transform:translateY(-3px) !important;border-color:rgba(245,245,247,.5) !important}\n.zbsap-1:focus{border-color:#f5f5f7 !important;background:rgba(245,245,247,.08) !important}\n.zbsap-2:focus{border-color:#f5f5f7 !important}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      {/* Living-hide stripe field behind the page (same as Home); the ambient wet hide is off. */}
      <div data-theme="dark" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <StripeField mode="hide" __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
      </div>
      <div ref={v.rootRef} style={{"position":"relative","zIndex":"1","minHeight":"100vh","display":"flex","flexDirection":"column","background":"transparent","color":"#f5f5f7","fontFamily":"Inter,-apple-system,sans-serif"}}>
      {" "}
      <div style={{"position":"sticky","top":"0","zIndex":"5","height":"3px","background":"rgba(245,245,247,.08)"}}>
        <div style={css(`height:100%;width:${v.progress ?? ""};background-image:repeating-linear-gradient(90deg,#f5f5f7 0 8px,rgba(245,245,247,.45) 8px 12px);transition:width .7s cubic-bezier(.16,1,.3,1)`)} />
      </div>
      {" "}
      <nav style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"16px","padding":"18px clamp(20px,4vw,56px)"}}>
        {" "}
        <a href="/" style={{"display":"flex","alignItems":"center","gap":"10px","textDecoration":"none","fontSize":"15px","fontWeight":"800","letterSpacing":".1em"}}>
          <img src="/zb/assets/zebraish-mark.png" alt="" style={{"height":"24px","width":"auto"}} />
          {"ZEBRAISH"}
        </a>
        {" "}
        <div style={{"display":"flex","gap":"14px","alignItems":"center"}}>
          {" "}
          <span style={{"fontFamily":"ui-monospace,Menlo,monospace","fontSize":"11px","letterSpacing":".18em","color":"rgba(245,245,247,.5)"}}>{I(v.stepLabel)}</span>
          {" "}
          <div style={{"display":"flex","gap":"4px","fontSize":"11px","fontWeight":"700","letterSpacing":".06em"}}>
            {" "}
            <button type="button" onClick={v.setEs} style={css(`background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;padding:4px 6px;color:${v.esColor ?? ""}`)}>{"ES"}</button>
            {" "}
            <button type="button" onClick={v.setEn} style={css(`background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;padding:4px 6px;color:${v.enColor ?? ""}`)}>{"EN"}</button>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </nav>
      {" "}
      <main style={{"flex":"1","display":"flex","flexDirection":"column","justifyContent":"center","padding":"24px clamp(20px,4vw,56px) 40px","maxWidth":"1180px","width":"100%","boxSizing":"border-box","margin":"0 auto"}}>
        {" "}
        <div data-anim={v.step} style={{"display":"flex","flexDirection":"column","gap":"28px"}}>
          {" "}
          <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
            {" "}
            <span style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".28em","textTransform":"uppercase","color":"rgba(245,245,247,.55)"}}>{I(v.kicker)}</span>
            {" "}
            <h1 style={{"margin":"0","fontSize":"clamp(40px,6vw,92px)","fontWeight":"900","letterSpacing":"-.045em","lineHeight":".94","textWrap":"balance"}}>{I(v.title)}</h1>
            {" "}
            <p style={{"margin":"0","maxWidth":"640px","fontSize":"17px","lineHeight":"1.6","color":"rgba(245,245,247,.68)"}}>{I(v.sub)}</p>
            {" "}
          </div>
          {" "}
          {v.showOptions ? (
            <>
              {" "}
              <div style={css(`display:grid;grid-template-columns:repeat(auto-fill,minmax(${v.optMin ?? ""},1fr));gap:10px`)}>
              {" "}
              {each(v, v.options, "o", (v) => (
                <>
                  {" "}
                  <button type="button" onClick={v.o?.pick} aria-pressed={v.o?.on} style={css(`position:relative;text-align:left;display:flex;flex-direction:column;gap:8px;padding:${v.optPad ?? ""};border-radius:18px;cursor:pointer;font-family:inherit;color:${v.o?.fg ?? ""};background:${v.o?.bg ?? ""};border:1px solid ${v.o?.bd ?? ""};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:background .35s,color .35s,border-color .35s,transform .35s cubic-bezier(.16,1,.3,1)`)} className="zbsap-0">
                    {" "}
                    <span style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"10px"}}>
                      <span style={css(`font-size:${v.optSize ?? ""};font-weight:800;letter-spacing:-.01em`)}>{I(v.o?.label)}</span>
                      <span style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".16em","opacity":".55"}}>{I(v.o?.key)}</span>
                    </span>
                    {" "}
                    {v.o?.hasNote ? (
                      <>
                        <span style={{"fontSize":"13px","lineHeight":"1.5","opacity":".72"}}>{I(v.o?.note)}</span>
                      </>
                    ) : null}
                    {" "}
                  </button>
                  {" "}
                </>
              ))}
              {" "}
            </div>
              {" "}
            </>
          ) : null}
          {" "}
          {v.showForm ? (
            <>
              {" "}
              <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(260px,1fr))","gap":"12px"}}>
              {" "}
              {each(v, v.fields, "f", (v) => (
                <>
                  {" "}
                  <label style={{"display":"flex","flexDirection":"column","gap":"8px","fontSize":"11px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","color":"rgba(245,245,247,.6)"}}>
                    {I(v.f?.label)}{"\n              "}
                    <input type={v.f?.type} value={v.f?.value ?? ""} onChange={v.f?.change} placeholder={v.f?.ph} aria-invalid={v.f?.bad} style={css(`font-family:inherit;font-size:17px;font-weight:500;letter-spacing:0;text-transform:none;color:#f5f5f7;background:rgba(245,245,247,.05);border:1px solid ${v.f?.bd ?? ""};border-radius:14px;padding:16px 18px;outline:none`)} className="zbsap-1" />
                    {" "}
                  </label>
                  {" "}
                </>
              ))}
              {" "}
              <label style={{"gridColumn":"1/-1","display":"flex","flexDirection":"column","gap":"8px","fontSize":"11px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","color":"rgba(245,245,247,.6)"}}>
                {I(v.msgLabel)}{"\n            "}
                <textarea rows="4" onChange={v.msgChange} placeholder={v.msgPh} style={{"fontFamily":"inherit","fontSize":"17px","lineHeight":"1.5","color":"#f5f5f7","background":"rgba(245,245,247,.05)","border":"1px solid rgba(245,245,247,.16)","borderRadius":"14px","padding":"16px 18px","outline":"none","resize":"vertical"}} className="zbsap-2" value={v.msg ?? ""} />
                {" "}
              </label>
              {" "}
            </div>
              {" "}
            </>
          ) : null}
          {" "}
          {v.showDone ? (
            <>
              {" "}
              <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"16px","alignItems":"start"}}>
              {" "}
              <div style={{"borderRadius":"22px","padding":"28px","background":"rgba(245,245,247,.05)","border":"1px solid rgba(245,245,247,.16)","backdropFilter":"blur(18px)","display":"flex","flexDirection":"column","gap":"14px"}}>
                {" "}
                <span style={{"fontFamily":"ui-monospace,Menlo,monospace","fontSize":"11px","letterSpacing":".2em","color":"rgba(245,245,247,.55)"}}>{I(v.profileId)}</span>
                {" "}
                {each(v, v.summary, "s", (v) => (
                  <>
                    {" "}
                    <div style={{"display":"grid","gridTemplateColumns":"120px minmax(0,1fr)","gap":"12px","paddingTop":"12px","borderTop":"1px solid rgba(245,245,247,.08)"}}>
                      <span style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".16em","textTransform":"uppercase","color":"rgba(245,245,247,.5)"}}>{I(v.s?.k)}</span>
                      <span style={{"fontSize":"15px","fontWeight":"600"}}>{I(v.s?.v)}</span>
                    </div>
                    {" "}
                  </>
                ))}
                {" "}
              </div>
              {" "}
              <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
                {" "}
                <a href={v.trackHref} style={{"padding":"18px 26px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"13px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none","textAlign":"center"}}>{I(v.sendTrack)}</a>
                {" "}
                <a href={v.waHref} target="_blank" rel="noopener" style={{"padding":"18px 26px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.25)","fontSize":"13px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","textDecoration":"none","textAlign":"center"}}>{I(v.sendWa)}</a>
                {" "}
                <p style={{"margin":"6px 0 0","fontSize":"13px","lineHeight":"1.6","color":"rgba(245,245,247,.6)"}}>{I(v.doneNote)}</p>
                {" "}
              </div>
              {" "}
            </div>
              {" "}
            </>
          ) : null}
          {" "}
          <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"12px","flexWrap":"wrap","marginTop":"8px"}}>
            {" "}
            <button type="button" onClick={v.back} style={css(`visibility:${v.backVis ?? ""};background:none;border:1px solid rgba(245,245,247,.2);color:#f5f5f7;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:13px 22px;border-radius:100px;cursor:pointer`)}>{"← "}{I(v.backLabel)}</button>
            {" "}
            <span role="alert" style={{"fontSize":"13px","color":"rgba(245,245,247,.75)"}}>{I(v.error)}</span>
            {" "}
            <button type="button" onClick={v.next} style={css(`display:${v.nextDisplay ?? ""};background:#f5f5f7;color:#040405;border:none;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:15px 30px;border-radius:100px;cursor:pointer;opacity:${v.nextOp ?? ""}`)}>{I(v.nextLabel)}{" →"}</button>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </main>
      {" "}
      <footer style={{"padding":"18px clamp(20px,4vw,56px)","display":"flex","justifyContent":"space-between","gap":"12px","flexWrap":"wrap","fontSize":"11px","letterSpacing":".14em","textTransform":"uppercase","color":"rgba(245,245,247,.4)"}}>
        <span>{I(v.footL)}</span>
        <span>{I(v.footR)}</span>
      </footer>
    </div>
    </>
  );
}

export default dcComponent("Start a Project", Component, template, {});
