// @ts-nocheck
/* eslint-disable */
"use client";
// Wordmark Footer: ported from the Claude Design handoff (Wordmark Footer.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  rootRef = React.createRef();
  componentDidMount() {
    this.onScroll = () => {
      const el = this.rootRef.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.top) / r.height));
      el.style.setProperty('--sp', p.toFixed(3));
    };
    addEventListener('scroll', this.onScroll, { passive: true }); this.onScroll();
  }
  componentWillUnmount() { removeEventListener('scroll', this.onScroll); }
  renderVals() {
    const v = this.props.variant ?? 'a';
    const set = (e, k, val) => e.currentTarget.style.setProperty(k, val);
    return {
      rootRef: this.rootRef, isA: v === 'a', isB: v === 'b', isC: v === 'c',
      onEnter: e => set(e, '--on', 1), onLeave: e => set(e, '--on', 0),
      onMove: e => { const el = e.currentTarget, m = el.querySelector('[style*="aspect-ratio"]'); if (!m) return; const r = m.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); },
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--tint-rgb:245,245,247;--text:#f5f5f7;--text-faint:rgba(245,245,247,.22);--glass-b:rgba(245,245,247,.09)}\n[data-theme=\"light\"]{--bg:#faf9f7;--tint-rgb:20,20,24;--text:#17171a;--text-faint:rgba(20,20,24,.4);--glass-b:rgba(20,20,24,.09)}\n@keyframes zbslide{to{background-position:64px 0}}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <footer ref={v.rootRef} onMouseMove={v.onMove} onMouseEnter={v.onEnter} onMouseLeave={v.onLeave} style={{"--on":"0","--mx":"50%","--my":"50%","--sp":"0","position":"relative","overflow":"hidden","background":"var(--bg)","color":"var(--text)","fontFamily":"Inter,-apple-system,sans-serif","borderTop":"1px solid var(--glass-b)","padding":"36px 0 0"}}>
      {" "}
      <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap","gap":"16px","padding":"0 48px"}}>
        {" "}
        <p style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint)","margin":"0"}}>{"Based in Nigeria · Available Worldwide"}</p>
        {" "}
        <a href="/collaborate" style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text)","textDecoration":"none","borderBottom":"1px solid var(--glass-b)","paddingBottom":"2px"}}>{"Become a Collaborator →"}</a>
        {" "}
        <div style={{"display":"flex","gap":"10px 20px","flexWrap":"wrap","justifyContent":"center"}}>
          <a href="/terms" style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint)","textDecoration":"none"}}>{"Terms of Service"}</a>
          <a href="/privacy" style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint)","textDecoration":"none"}}>{"Privacy Policy"}</a>
          <a href="/cookies" style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint)","textDecoration":"none"}}>{"Cookie Policy"}</a>
          <a href="/aviso-legal" style={{"fontSize":"11px","fontWeight":"500","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint)","textDecoration":"none"}}>{"Legal Notice"}</a>
        </div>
        {" "}
      </div>
      {" "}
      <div style={{"position":"relative","margin":"48px 16px 0","aspectRatio":"1508/330","WebkitMask":"url('/zb/assets/zebraish-wordmark.png') center top/100% auto no-repeat","mask":"url('/zb/assets/zebraish-wordmark.png') center top/100% auto no-repeat"}}>
        {" "}
        <div style={{"position":"absolute","inset":"0","background":"linear-gradient(180deg,rgba(var(--tint-rgb),.13),rgba(var(--tint-rgb),.03))"}} />
        {" "}
        {v.isA ? (
          <>
            {" "}
            <div style={{"position":"absolute","inset":"0","background":"radial-gradient(520px circle at var(--mx) var(--my),rgba(var(--tint-rgb),1),rgba(var(--tint-rgb),.35) 35%,transparent 70%)","opacity":"var(--on)","transition":"opacity .6s cubic-bezier(.16,1,.3,1)"}} />
            {" "}
          </>
        ) : null}
        {" "}
        {v.isB ? (
          <>
            {" "}
            <div style={{"position":"absolute","inset":"0","backgroundImage":"repeating-linear-gradient(100deg,rgba(var(--tint-rgb),.95) 0 14px,transparent 14px 32px)","animation":"zbslide 1.4s linear infinite","WebkitMask":"radial-gradient(460px circle at var(--mx) var(--my),#000 30%,transparent 72%)","mask":"radial-gradient(460px circle at var(--mx) var(--my),#000 30%,transparent 72%)","opacity":"var(--on)","transition":"opacity .6s"}} />
            {" "}
          </>
        ) : null}
        {" "}
        {v.isC ? (
          <>
            {" "}
            <div style={{"position":"absolute","inset":"0","background":"linear-gradient(90deg,#e0295f,#e8a93c 33%,#17c98d 66%,#3d7ef0)","clipPath":"inset(0 calc((1 - var(--sp)) * 100%) 0 0)","opacity":".85"}} />
            {" "}
            <div style={{"position":"absolute","inset":"0","background":"radial-gradient(420px circle at var(--mx) var(--my),#fff,transparent 65%)","mixBlendMode":"overlay","opacity":"var(--on)","transition":"opacity .5s"}} />
            {" "}
          </>
        ) : null}
        {" "}
      </div>
    </footer>
    </>
  );
}

export default dcComponent("Wordmark Footer", Component, template, {});
