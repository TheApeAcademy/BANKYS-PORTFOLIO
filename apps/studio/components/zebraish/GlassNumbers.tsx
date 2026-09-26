// @ts-nocheck
/* eslint-disable */
"use client";
// Glass Numbers: ported from the Claude Design handoff (Glass Numbers.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  rootRef = React.createRef();
  componentDidMount() {
    const root = this.rootRef.current; if (!root) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count); if (isNaN(target)) return;
      const suf = el.dataset.suffix || '', dur = 1600, start = performance.now();
      cancelAnimationFrame(el._raf);
      const step = (now) => { const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(e * target) + suf; if (p < 1) el._raf = requestAnimationFrame(step); };
      el._raf = requestAnimationFrame(step);
    };
    this.io = new IntersectionObserver(es => es.forEach(e => {
      root.querySelectorAll('[data-count]').forEach(el => {
        if (el.dataset.count === '' ) return;
        if (e.isIntersecting) run(el); else { cancelAnimationFrame(el._raf); el.textContent = '0' + (el.dataset.suffix || ''); }
      });
    }), { threshold: .25 });
    this.io.observe(root);
  }
  componentWillUnmount() { if (this.io) this.io.disconnect(); }
  renderVals() {
    const v = this.props.variant ?? 'a';
    const cards = [
      { idx: '01', n: 12, suf: '', display: '12', old: '10+', label: 'Sites Built & Live', rgb: '224,41,95', acc: 'var(--wine)' },
      { idx: '02', n: 11, suf: '', display: '11', old: '5', label: 'Industries Served', rgb: 'var(--gold-rgb)', acc: 'var(--gold)' },
      { idx: '03', n: '', suf: '', display: '∞', old: '∞', label: 'Revisions Included', rgb: '23,201,141', acc: 'var(--emerald)' },
      { idx: '04', n: 5, suf: '★', display: '5★', old: '5★', label: 'Client Satisfaction', rgb: '61,126,240', acc: 'var(--sapphire)' },
    ];
    if (v === 'current') { cards[0].n = 10; cards[0].suf = '+'; cards[1].n = 5; }
    const set = (e, on) => e.currentTarget.style.setProperty('--on', on);
    return {
      rootRef: this.rootRef, cards,
      isCurrent: v === 'current', isA: v === 'a', isB: v === 'b', isC: v === 'c',
      pad: v === 'current' ? '100px 48px' : '84px 48px 92px',
      sectionBg: v === 'current' ? 'rgba(var(--surface-rgb),.93)' : 'transparent',
      onEnter: e => set(e, 1), onLeave: e => set(e, 0),
      onMove: e => { const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); },
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--surface:#0c0c10;--bg-rgb:6,6,8;--surface-rgb:12,12,16;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.22);--gold:#e8a93c;--gold-rgb:232,169,60;--glass-b:rgba(245,245,247,.09);--glass-bb:rgba(245,245,247,.20);--invert-bg:#fff}\n[data-theme=\"light\"]{--bg:#faf9f7;--surface:#f3f1ed;--bg-rgb:250,249,247;--surface-rgb:243,241,237;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--gold:#a8720f;--gold-rgb:168,114,15;--glass-b:rgba(20,20,24,.09);--glass-bb:rgba(20,20,24,.20);--invert-bg:#141414}\n:root{--wine:#e0295f;--emerald:#17c98d;--sapphire:#3d7ef0;--ease:cubic-bezier(0.16,1,0.3,1)}\n@keyframes zbspin{to{transform:rotate(360deg)}}\n*,*::before,*::after{box-sizing:border-box}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section ref={v.rootRef} style={css(`position:relative;overflow:hidden;font-family:Inter,-apple-system,sans-serif;color:var(--text);padding:${v.pad ?? ""};background:${v.sectionBg ?? ""}`)}>
      {" "}
      <div style={{"position":"relative","zIndex":"2","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center"}}>
        {" "}
        <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
          <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
          {"The Proof"}
        </div>
        {" "}
        <h2 style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0"}}>
          {"NUMBERS THAT"}
          <br />
          <span style={{"fontWeight":"200","letterSpacing":".02em"}}>{"speak"}</span>
          {" "}
          <span style={{"position":"relative","display":"inline-block"}}>{"LOUDER"}</span>
        </h2>
        {" "}
      </div>
      {" "}
      {v.isCurrent ? (
        <>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(200px,1fr))","gap":"16px","marginTop":"64px"}}>
          {" "}
          {each(v, v.cards, "c", (v) => (
            <>
              {" "}
              <div style={css(`background:linear-gradient(160deg,rgba(${v.c?.rgb ?? ""},.12),rgba(var(--tint-rgb),.04));backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:inset 0 1px 0 rgba(var(--tint-rgb),.05);border:1px solid rgba(var(--tint-rgb),.14);border-radius:24px;padding:48px 32px;text-align:center;position:relative;overflow:hidden`)}>
                {" "}
                <span data-count={v.c?.n} data-suffix={v.c?.suf} style={css(`display:block;font-size:clamp(52px,6vw,80px);font-weight:900;letter-spacing:-.04em;line-height:1;margin-bottom:10px;color:${v.c?.acc ?? ""}`)}>{I(v.c?.old)}</span>
                {" "}
                <div style={{"fontSize":"12px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-faint)"}}>{I(v.c?.label)}</div>
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
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(210px,1fr))","gap":"16px","marginTop":"48px","position":"relative","zIndex":"2"}}>
          {" "}
          {each(v, v.cards, "c", (v) => (
            <>
              {" "}
              <div onMouseMove={v.onMove} onMouseEnter={v.onEnter} onMouseLeave={v.onLeave} style={css(`--on:0;--mx:50%;--my:50%;--rgb:${v.c?.rgb ?? ""};position:relative;border-radius:24px;padding:48px 28px 40px;text-align:center;overflow:hidden;cursor:default;background:linear-gradient(180deg,rgba(var(--tint-rgb),.07),rgba(var(--tint-rgb),.02));backdrop-filter:blur(24px) saturate(1.5);-webkit-backdrop-filter:blur(24px) saturate(1.5);border:1px solid rgba(var(--tint-rgb),.12);box-shadow:inset 0 1px 0 rgba(var(--tint-rgb),.14),0 24px 60px rgba(0,0,0,.25),0 0 calc(var(--on) * 70px) rgba(var(--rgb),calc(var(--on) * .32));transform:translateY(calc(var(--on) * -4px));transition:box-shadow .6s var(--ease),transform .6s var(--ease)`)}>
                {" "}
                <div style={{"position":"absolute","inset":"0","background":"radial-gradient(380px circle at var(--mx) var(--my),rgba(var(--rgb),.34),transparent 50%)","opacity":"var(--on)","transition":"opacity .5s var(--ease)","pointerEvents":"none"}} />
                {" "}
                <div style={{"position":"absolute","inset":"0","borderRadius":"24px","padding":"1px","background":"radial-gradient(240px circle at var(--mx) var(--my),rgba(var(--rgb),1),transparent 65%)","WebkitMask":"linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0)","WebkitMaskComposite":"xor","maskComposite":"exclude","opacity":"var(--on)","transition":"opacity .4s","pointerEvents":"none"}} />
                {" "}
                <div style={{"position":"absolute","top":"0","left":"0","right":"0","height":"3px","backgroundImage":"repeating-linear-gradient(100deg,rgb(var(--rgb)) 0 7px,transparent 7px 15px)","transform":"scaleX(var(--on))","transformOrigin":"left","transition":"transform .6s var(--ease)"}} />
                {" "}
                <div style={{"position":"absolute","top":"0","left":"10%","right":"10%","height":"1px","background":"linear-gradient(90deg,transparent,rgba(var(--tint-rgb),.5),transparent)"}} />
                {" "}
                <span data-count={v.c?.n} data-suffix={v.c?.suf} style={{"position":"relative","display":"block","fontSize":"clamp(56px,6vw,84px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":"1","marginBottom":"12px","color":"rgb(var(--rgb))","textShadow":"0 0 calc(var(--on) * 30px) rgba(var(--rgb),.75)","transition":"text-shadow .5s"}}>{I(v.c?.display)}</span>
                {" "}
                <div style={{"position":"relative","fontSize":"12px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-muted)"}}>{I(v.c?.label)}</div>
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
      {v.isB ? (
        <>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(210px,1fr))","gap":"16px","marginTop":"48px","position":"relative","zIndex":"2"}}>
          {" "}
          {each(v, v.cards, "c", (v) => (
            <>
              {" "}
              <div onMouseMove={v.onMove} onMouseEnter={v.onEnter} onMouseLeave={v.onLeave} style={css(`--on:0;--mx:50%;--my:50%;--rgb:${v.c?.rgb ?? ""};position:relative;border-radius:24px;padding:52px 28px 44px;text-align:center;overflow:hidden;cursor:default;background:rgba(var(--tint-rgb),.045);backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4);border:1px solid rgba(var(--tint-rgb),.13);box-shadow:inset 0 1px 0 rgba(var(--tint-rgb),.1);transition:border-color .5s`)}>
                {" "}
                <div style={{"position":"absolute","inset":"0","backgroundImage":"repeating-linear-gradient(124deg,rgba(var(--rgb),.5) 0 2px,transparent 2px 13px),repeating-linear-gradient(124deg,rgba(var(--rgb),.22) 0 6px,transparent 6px 40px)","clipPath":"inset(calc((1 - var(--on)) * 100%) 0 0 0)","transition":"clip-path .8s var(--ease)","pointerEvents":"none","WebkitMask":"radial-gradient(120% 90% at 50% 100%,#000 30%,transparent 80%)","mask":"radial-gradient(120% 90% at 50% 100%,#000 30%,transparent 80%)"}} />
                {" "}
                <div style={{"position":"absolute","left":"-20%","right":"-20%","bottom":"-60%","height":"100%","background":"radial-gradient(closest-side,rgba(var(--rgb),.55),transparent)","opacity":"var(--on)","transition":"opacity .7s var(--ease)","pointerEvents":"none"}} />
                {" "}
                <span data-count={v.c?.n} data-suffix={v.c?.suf} style={{"position":"relative","display":"block","fontSize":"clamp(56px,6vw,84px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":"1","marginBottom":"12px","color":"rgba(var(--rgb),var(--on))","WebkitTextStroke":"1.5px rgb(var(--rgb))","transition":"color .6s var(--ease)"}}>{I(v.c?.display)}</span>
                {" "}
                <div style={{"position":"relative","fontSize":"12px","fontWeight":"500","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-muted)"}}>{I(v.c?.label)}</div>
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
      {v.isC ? (
        <>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(230px,1fr))","gap":"12px","marginTop":"48px","position":"relative","zIndex":"2"}}>
          {" "}
          {each(v, v.cards, "c", (v) => (
            <>
              {" "}
              <div onMouseMove={v.onMove} onMouseEnter={v.onEnter} onMouseLeave={v.onLeave} style={css(`--on:0;--mx:50%;--my:50%;--rgb:${v.c?.rgb ?? ""};position:relative;border-radius:20px;overflow:hidden;min-height:260px;cursor:default;background:rgba(var(--tint-rgb),.1);display:flex;flex-direction:column`)}>
                {" "}
                <div style={{"position":"absolute","left":"50%","top":"50%","width":"200%","aspectRatio":"1","margin":"-100% 0 0 -100%","background":"conic-gradient(from 0deg,transparent 0 62%,rgba(var(--rgb),1) 78%,transparent 86%)","animation":"zbspin 3.2s linear infinite","opacity":"var(--on)","transition":"opacity .5s"}} />
                {" "}
                <div style={{"position":"absolute","inset":"1px","borderRadius":"19px","background":"rgba(var(--bg-rgb),.78)","backdropFilter":"blur(26px) saturate(1.4)","WebkitBackdropFilter":"blur(26px) saturate(1.4)"}} />
                {" "}
                <div style={{"position":"absolute","inset":"1px","borderRadius":"19px","background":"radial-gradient(300px circle at var(--mx) var(--my),rgba(var(--rgb),.22),transparent 60%)","opacity":"var(--on)","transition":"opacity .5s","pointerEvents":"none"}} />
                {" "}
                <div style={{"position":"relative","flex":"1","boxSizing":"border-box","display":"flex","flexDirection":"column","justifyContent":"space-between","gap":"28px","padding":"22px 24px 18px","textAlign":"left"}}>
                  {" "}
                  <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","fontSize":"10px","fontWeight":"600","letterSpacing":".2em","textTransform":"uppercase","color":"var(--text-faint)"}}>
                    <span>{I(v.c?.idx)}</span>
                    <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"rgb(var(--rgb))","boxShadow":"0 0 calc(var(--on) * 14px) rgb(var(--rgb))"}} />
                  </div>
                  {" "}
                  <div>
                    {" "}
                    <div style={{"fontSize":"12px","fontWeight":"600","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text-muted)","marginBottom":"6px"}}>{I(v.c?.label)}</div>
                    {" "}
                    <span data-count={v.c?.n} data-suffix={v.c?.suf} style={{"display":"block","fontSize":"clamp(88px,8vw,124px)","fontWeight":"900","letterSpacing":"-.06em","lineHeight":".8","marginBottom":"-4px","color":"rgb(var(--rgb))","textShadow":"0 0 calc(var(--on) * 40px) rgba(var(--rgb),.6)","transition":"text-shadow .5s"}}>{I(v.c?.display)}</span>
                    {" "}
                  </div>
                  {" "}
                </div>
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

export default dcComponent("Glass Numbers", Component, template, {});
