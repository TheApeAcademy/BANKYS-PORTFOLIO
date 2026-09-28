// @ts-nocheck
/* eslint-disable */
"use client";
// Case Study: ported from the Claude Design handoff (Case Study.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { getZbLang, setSiteLang } from "@/lib/zebraish/i18n";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

import StripeField from "./StripeField";
import "@/lib/zebraish/no-wet.js";
import "@/lib/zebraish/zb-ambient.js";
import "@/lib/zebraish/projects.js";
class Component extends DCLogic {
  rootRef = React.createRef();
  state = { id: null, ready: !!window.ZB_PROJECTS };
  componentDidMount() {
    const read = () => this.setState({ id: this.props.id || 'malaak', ready: !!window.ZB_PROJECTS });
    read();
    if (!window.ZB_PROJECTS) { const t = setInterval(() => { if (window.ZB_PROJECTS) { clearInterval(t); read(); } }, 50); }
    const io = new IntersectionObserver(es => es.forEach(e => { const el = e.target; if (e.isIntersecting) { el.style.transition = 'opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)'; el.style.opacity = 1; el.style.transform = 'none'; } else if (e.boundingClientRect.top > 0) { el.style.transition = 'none'; el.style.opacity = 0; el.style.transform = 'translateY(32px)'; } }), { threshold: .08 });
    this._io = io; setTimeout(() => this.rootRef.current && this.rootRef.current.querySelectorAll('[data-rv]').forEach(el => io.observe(el)), 60);
  }
  componentDidUpdate(pp, ps) { if (ps.id !== this.state.id) { scrollTo(0, 0); const el = this.rootRef.current; el && el.querySelectorAll('[data-rv]').forEach(n => this._io.observe(n)); } }
  componentWillUnmount() { this._io && this._io.disconnect(); }
  renderVals() {
    const L = window.ZB_PROJECTS || [];
    const i = Math.max(0, L.findIndex(x => x.id === this.state.id)), raw = L[i] || { tags: [] }, nx = L[(i + 1) % Math.max(1, L.length)] || {};
    const p = Object.assign({}, raw, { host: (raw.url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''), bgImg: raw.img && !raw.logo ? `url('${raw.img}')` : 'none', tags: raw.tags || [] });
    const blocks = [['01', 'Challenge', raw.challenge], ['02', 'Approach', raw.approach], ['03', 'Product', raw.product], ['04', 'Experience', raw.experience], ['05', 'Result', raw.result]].map(([n, t, d]) => ({ n, t, d: d || '' }));
    return { rootRef: this.rootRef, p, blocks, next: { name: nx.name || '', href: '/work/' + (nx.id || '') } };
  }
}

const STYLE = "html,body{margin:0;background:#040405}\na{color:#f5f5f7}\na:hover{color:#ffffff}\n\n.zbcs-0:hover{background:rgba(245,245,247,.04) !important}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      {/* Living-hide stripe field behind the page (same as Home); the ambient wet hide is off. */}
      <div data-theme="dark" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <StripeField mode="hide" __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
      </div>
      <div ref={v.rootRef} style={{"position":"relative","zIndex":"1","minHeight":"100vh","background":"transparent","color":"#f5f5f7","fontFamily":"Inter,-apple-system,sans-serif"}}>
      {" "}
      <nav style={{"position":"sticky","top":"0","zIndex":"10","display":"flex","justifyContent":"space-between","alignItems":"center","gap":"16px","padding":"18px clamp(20px,4vw,56px)","background":"rgba(4,4,5,.7)","backdropFilter":"blur(18px)","WebkitBackdropFilter":"blur(18px)","borderBottom":"1px solid rgba(245,245,247,.08)"}}>
        {" "}
        <a href="/" style={{"display":"flex","alignItems":"center","gap":"10px","textDecoration":"none","fontSize":"15px","fontWeight":"800","letterSpacing":".1em"}}>
          <img src="/zb/assets/zebraish-mark.png" alt="" style={{"height":"24px","width":"auto"}} />
          {"ZEBRAISH"}
        </a>
        {" "}
        <div style={{"display":"flex","gap":"10px","alignItems":"center"}}>
          {" "}
          <a href="/" style={{"padding":"9px 16px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.2)","fontSize":"11px","fontWeight":"700","letterSpacing":".14em","textTransform":"uppercase","textDecoration":"none"}}>{"← All work"}</a>
          <button type="button" onClick={() => setSiteLang(getZbLang() === "es" ? "en" : "es")} aria-label={getZbLang() === "es" ? "Switch to English" : "Cambiar a español"} style={{"padding":"9px 14px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.2)","background":"none","color":"#f5f5f7","cursor":"pointer","fontFamily":"inherit","fontSize":"11px","fontWeight":"700","letterSpacing":".14em"}}>{getZbLang() === "es" ? "ES · en" : "EN · es"}</button>
          {" "}
          <a href="/start" style={{"padding":"10px 18px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"11px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}}>{"Start a project"}</a>
          {" "}
        </div>
        {" "}
      </nav>
      {" "}
      <header style={{"padding":"clamp(48px,8vw,110px) clamp(20px,4vw,56px) 40px","display":"flex","flexDirection":"column","gap":"18px","maxWidth":"1280px","margin":"0 auto"}}>
        {" "}
        <div data-rv="1" style={{"display":"flex","gap":"14px","flexWrap":"wrap","fontSize":"11px","fontWeight":"700","letterSpacing":".24em","textTransform":"uppercase","color":"rgba(245,245,247,.55)"}}>
          <span>{"Case study"}</span>
          <span>{"·"}</span>
          <span>{I(v.p?.cat)}</span>
          <span>{"·"}</span>
          <span>{I(v.p?.year)}</span>
        </div>
        {" "}
        <h1 data-rv="1" style={{"margin":"0","fontSize":"clamp(56px,10vw,160px)","fontWeight":"900","letterSpacing":"-.045em","lineHeight":".88"}}>{I(v.p?.name)}</h1>
        {" "}
        <p data-rv="1" style={{"margin":"0","maxWidth":"720px","fontSize":"clamp(17px,1.6vw,22px)","lineHeight":"1.55","color":"rgba(245,245,247,.72)","textWrap":"pretty"}}>{I(v.p?.desc)}</p>
        {" "}
        <div data-rv="1" style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          {" "}
          {each(v, v.p?.tags, "t", (v) => (
            <>
              <span style={{"padding":"6px 12px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.16)","fontSize":"11px","fontWeight":"600","letterSpacing":".12em","textTransform":"uppercase","color":"rgba(245,245,247,.7)"}}>{I(v.t)}</span>
            </>
          ))}
          {" "}
        </div>
        {" "}
      </header>
      {" "}
      <section data-rv="1" style={{"padding":"0 clamp(20px,4vw,56px)","maxWidth":"1280px","margin":"0 auto"}}>
        {" "}
        <div style={{"borderRadius":"22px","overflow":"hidden","border":"1px solid rgba(245,245,247,.14)","background":"#0c0c0e","boxShadow":"0 40px 120px rgba(0,0,0,.6)"}}>
          {" "}
          <div style={{"height":"38px","display":"flex","alignItems":"center","gap":"8px","padding":"0 16px","background":"#141416","borderBottom":"1px solid rgba(245,245,247,.08)"}}>
            <span style={{"width":"10px","height":"10px","borderRadius":"50%","background":"#555"}} />
            <span style={{"width":"10px","height":"10px","borderRadius":"50%","background":"#777"}} />
            <span style={{"width":"10px","height":"10px","borderRadius":"50%","background":"#999"}} />
            <span style={{"margin":"0 auto","fontFamily":"ui-monospace,Menlo,monospace","fontSize":"11px","color":"rgba(245,245,247,.55)","background":"rgba(245,245,247,.06)","padding":"4px 14px","borderRadius":"6px"}}>{I(v.p?.host)}</span>
          </div>
          {" "}
          <div style={css(`position:relative;aspect-ratio:16/9;background:#0c0c0e center/cover no-repeat;background-image:${v.p?.bgImg ?? ""}`)}>
            {" "}
            <iframe src={v.p?.url} title={`${v.p?.name ?? ""} live site`} loading="lazy" style={{"position":"absolute","inset":"0","width":"100%","height":"100%","border":"0","background":"transparent"}} />
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
      <section style={{"padding":"clamp(56px,8vw,120px) clamp(20px,4vw,56px)","maxWidth":"1280px","margin":"0 auto","display":"flex","flexDirection":"column"}}>
        {" "}
        {each(v, v.blocks, "b", (v) => (
          <>
            {" "}
            <div data-rv="1" style={{"display":"grid","gridTemplateColumns":"minmax(0,90px) minmax(0,1fr) minmax(0,2fr)","gap":"clamp(16px,3vw,48px)","padding":"32px 0","borderTop":"1px solid rgba(245,245,247,.1)","alignItems":"baseline"}}>
              {" "}
              <span style={{"fontSize":"12px","fontWeight":"700","letterSpacing":".2em","color":"rgba(245,245,247,.45)"}}>{I(v.b?.n)}</span>
              {" "}
              <span style={{"fontSize":"clamp(24px,2.6vw,38px)","fontWeight":"900","letterSpacing":"-.02em"}}>{I(v.b?.t)}</span>
              {" "}
              <span style={{"fontSize":"clamp(16px,1.4vw,20px)","lineHeight":"1.6","color":"rgba(245,245,247,.75)","textWrap":"pretty"}}>{I(v.b?.d)}</span>
              {" "}
            </div>
            {" "}
          </>
        ))}
        {" "}
      </section>
      {" "}
      <section data-rv="1" style={{"padding":"0 clamp(20px,4vw,56px) 80px","maxWidth":"1280px","margin":"0 auto","display":"flex","flexWrap":"wrap","gap":"12px"}}>
        {" "}
        <a href={v.p?.url} target="_blank" style={{"padding":"16px 30px","borderRadius":"100px","background":"#f5f5f7","color":"#040405","fontSize":"12px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","textDecoration":"none"}}>{"Visit live site →"}</a>
        {" "}
        <a href="/start" style={{"padding":"16px 30px","borderRadius":"100px","border":"1px solid rgba(245,245,247,.25)","fontSize":"12px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","textDecoration":"none"}}>{"Build something like this"}</a>
        {" "}
      </section>
      {" "}
      <a href={v.next?.href} data-rv="1" style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"24px","padding":"clamp(40px,6vw,80px) clamp(20px,4vw,56px)","borderTop":"1px solid rgba(245,245,247,.1)","textDecoration":"none","color":"#f5f5f7"}} className="zbcs-0">
        {" "}
        <span style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
          <span style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".24em","textTransform":"uppercase","color":"rgba(245,245,247,.5)"}}>{"Next project"}</span>
          <span style={{"fontSize":"clamp(40px,7vw,110px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":".9"}}>{I(v.next?.name)}</span>
        </span>
        {" "}
        <span style={{"fontSize":"clamp(32px,4vw,56px)","fontWeight":"200"}}>{"→"}</span>
        {" "}
      </a>
    </div>
    </>
  );
}

export default dcComponent("Case Study", Component, template, {});
