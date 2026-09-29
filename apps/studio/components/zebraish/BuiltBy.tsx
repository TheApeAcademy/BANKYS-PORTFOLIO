// @ts-nocheck
/* eslint-disable */
"use client";
// Built By: ported from the Claude Design handoff (Built By.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  renderVals() {
    const S = 'Inter,sans-serif', F = 'Fraunces,Georgia,serif';
    const names = [
      { img: '/zb/assets/mfm-logo.png', imgH: '64px', imgBg: '#fff', href: 'https://cct-rho.vercel.app/', name: 'MFM', kind: 'Children’s Ministry', font: S, style: 'normal', weight: 900, size: '44px', ls: '.08em' },
      { href: 'https://christain-theapeacademys-projects.vercel.app/', name: 'Christian Prieto', kind: 'Creator', font: F, style: 'italic', weight: 600, size: '30px', ls: '-.01em' },
      { href: 'https://hot-chef.vercel.app/', name: 'HOT CHEF', kind: 'Food & Drink', font: S, style: 'normal', weight: 800, size: '30px', ls: '.14em' },
      { href: 'https://doberman-kappa.vercel.app/', name: 'DOBERMAN', kind: 'Brand', font: S, style: 'normal', weight: 900, size: '32px', ls: '-.02em' },
      { img: '/zb/assets/thisorthat-wordmark-dark.png', imgH: '46px', imgBg: 'transparent', href: 'https://this-or-that-fawn-rho.vercel.app/', name: 'This or That', kind: 'Product', font: F, style: 'normal', weight: 900, size: '32px', ls: '-.02em' },
      { href: '#start-a-project', name: 'Your brand', kind: 'Next →', font: S, style: 'normal', weight: 200, size: '30px', ls: '.02em' },
    ];
    const set = (e, v) => e.currentTarget.style.setProperty('--on', v);
    names.forEach((n, i) => { n.idx = String(i + 1).padStart(2, '0'); n.hasImg = !!n.img; n.noImg = !n.img; n.target = n.href && n.href.startsWith('http') ? '_blank' : '_self'; });
    const v = this.props.variant ?? 'a';
    return { names, loop: [...names, ...names], isA: v === 'a', isB: v === 'b', isC: v === 'c', on: e => set(e, 1), off: e => set(e, 0), move: e => { const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px'); } };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.3);--invert-bg:#fff;--invert-fg:#000;--logo-inv:0}\n[data-theme=\"light\"]{--bg:#faf9f7;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--invert-bg:#141414;--invert-fg:#fff;--logo-inv:1}\n@keyframes bbmq{to{transform:translateX(-50%)}}\n\n.zbbb-0:hover{color:var(--text) !important}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section id="built-by" style={{"position":"relative","padding":"84px 48px","fontFamily":"Inter,-apple-system,sans-serif","color":"var(--text,#f5f5f7)"}}>
      {" "}
      <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","flexWrap":"wrap","gap":"24px","marginBottom":"40px"}}>
        {" "}
        <div>
          {" "}
          <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint,rgba(var(--tint-rgb),.3))","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
            <span style={{"width":"28px","height":"1px","background":"rgba(var(--tint-rgb),.2)"}} />
            {"Built by Zebraish"}
          </div>
          {" "}
          <h2 style={{"fontSize":"clamp(40px,5vw,72px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0"}}>
            {"PEOPLE WHO "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","color":"var(--gold,#e8a93c)"}}>{"TRUSTED"}</span>
            {" US."}
          </h2>
          {" "}
        </div>
        {" "}
        <p style={{"fontSize":"15px","lineHeight":"1.7","color":"var(--text-muted,rgba(var(--tint-rgb),.55))","maxWidth":"380px","margin":"0"}}>
          {"Founders, creators and businesses we have built for. Logos arrive as each one signs off."}
        </p>
        {" "}
      </div>
      {" "}
      {v.isB ? (
        <>
          {" "}
          <div data-bleed="1" style={{"overflow":"hidden","margin":"0 -48px","borderTop":"1px solid rgba(var(--tint-rgb),.1)","borderBottom":"1px solid rgba(var(--tint-rgb),.1)","padding":"26px 0","WebkitMask":"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)","mask":"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)"}}>
          {" "}
          <div style={{"display":"flex","alignItems":"center","gap":"72px","width":"max-content","animation":"bbmq 28s linear infinite"}}>
            {" "}
            {each(v, v.loop, "n", (v) => (
              <>
                {" "}
                <a href={v.n?.href} target={v.n?.target} style={{"display":"flex","alignItems":"center","gap":"72px","textDecoration":"none","color":"inherit"}}>
                  {v.n?.hasImg ? (
                    <>
                      <img src={v.n?.img} alt={v.n?.name} style={css(`height:${v.n?.imgH ?? ""};width:auto;display:block;border-radius:10px;background:${v.n?.imgBg ?? ""};padding:4px`)} />
                    </>
                  ) : null}
                  {v.n?.noImg ? (
                    <>
                      <span style={css(`font-family:${v.n?.font ?? ""};font-style:${v.n?.style ?? ""};font-weight:${v.n?.weight ?? ""};font-size:calc(${v.n?.size ?? ""} * 1.8);letter-spacing:${v.n?.ls ?? ""};color:rgba(var(--tint-rgb),.6);white-space:nowrap;line-height:1;transition:color .3s`)} className="zbbb-0">{I(v.n?.name)}</span>
                    </>
                  ) : null}
                  <span style={{"width":"10px","height":"10px","transform":"rotate(45deg)","background":"var(--gold,#e8a93c)"}} />
                </a>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
        </div>
          {" "}
        </>
      ) : null}
      {" "}
      {v.isC ? (
        <>
          {" "}
          <div style={{"display":"flex","flexDirection":"column","borderTop":"1px solid rgba(var(--tint-rgb),.12)"}}>
          {" "}
          {each(v, v.names, "n", (v) => (
            <>
              {" "}
              <div onMouseEnter={v.on} onMouseLeave={v.off} style={{"--on":"0","position":"relative","display":"grid","gridTemplateColumns":"60px minmax(0,1fr) 220px 40px","alignItems":"center","gap":"20px","padding":"20px 8px","borderBottom":"1px solid rgba(var(--tint-rgb),.12)","overflow":"hidden","cursor":"default"}}>
                {" "}
                <div style={{"position":"absolute","inset":"0","background":"var(--invert-bg)","transform":"scaleY(var(--on))","transformOrigin":"bottom","transition":"transform .5s cubic-bezier(.16,1,.3,1)"}} />
                {" "}
                <span style={{"position":"relative","fontSize":"11px","fontWeight":"600","letterSpacing":".2em","color":"rgba(var(--tint-rgb),.4)","mixBlendMode":"difference"}}>{I(v.n?.idx)}</span>
                {" "}
                <span style={css(`position:relative;font-family:${v.n?.font ?? ""};font-style:${v.n?.style ?? ""};font-weight:${v.n?.weight ?? ""};font-size:calc(${v.n?.size ?? ""} * 1.5);letter-spacing:${v.n?.ls ?? ""};line-height:1;color:#fff;mix-blend-mode:difference`)}>{I(v.n?.name)}</span>
                {" "}
                <span style={{"position":"relative","fontSize":"10px","fontWeight":"600","letterSpacing":".18em","textTransform":"uppercase","color":"#fff","opacity":".55","mixBlendMode":"difference"}}>{I(v.n?.kind)}</span>
                {" "}
                <span style={{"position":"relative","fontSize":"20px","color":"#fff","mixBlendMode":"difference","transform":"translateX(calc(var(--on) * 6px))","transition":"transform .4s"}}>{"→"}</span>
                {" "}
              </div>
              {" "}
            </>
          ))}
          {" "}
        </div>
          {" "}
        </>
      ) : null}
      {" "}
      {v.isA ? (
        <>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(200px,1fr))","gap":"1px","background":"rgba(var(--tint-rgb),.1)","border":"1px solid rgba(var(--tint-rgb),.1)","borderRadius":"24px","overflow":"hidden"}}>
          {" "}
          {each(v, v.names, "n", (v) => (
            <>
              {" "}
              <div onMouseMove={v.move} onMouseEnter={v.on} onMouseLeave={v.off} style={{"--on":"0","--mx":"50%","--my":"50%","position":"relative","height":"160px","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"10px","background":"var(--bg,#060608)","overflow":"hidden","cursor":"default"}}>
                {" "}
                <div style={{"position":"absolute","inset":"0","background":"radial-gradient(260px circle at var(--mx) var(--my),rgba(var(--tint-rgb),.1),transparent 70%)","opacity":"var(--on)","transition":"opacity .4s","pointerEvents":"none"}} />
                {" "}
                <span style={css(`position:relative;font-family:${v.n?.font ?? ""};font-style:${v.n?.style ?? ""};font-weight:${v.n?.weight ?? ""};font-size:${v.n?.size ?? ""};letter-spacing:${v.n?.ls ?? ""};color:rgba(var(--tint-rgb),calc(.55 + var(--on) * .45));transition:color .4s;text-align:center;line-height:1`)}>{I(v.n?.name)}</span>
                {" "}
                <span style={{"position":"relative","fontSize":"9px","fontWeight":"600","letterSpacing":".2em","textTransform":"uppercase","color":"var(--text-faint,rgba(var(--tint-rgb),.3))"}}>{I(v.n?.kind)}</span>
                {" "}
              </div>
              {" "}
            </>
          ))}
          {" "}
        </div>
          {" "}
        </>
      ) : null}
    </section>
    </>
  );
}

export default dcComponent("Built By", Component, template, {});
