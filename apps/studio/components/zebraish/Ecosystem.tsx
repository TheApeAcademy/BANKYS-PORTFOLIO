// @ts-nocheck
/* eslint-disable */
"use client";
// Ecosystem: ported from the Claude Design handoff (Ecosystem.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";
import ZebraHead from "./ZebraHead";

class Component extends DCLogic {
  rootRef = React.createRef();
  state = { sel: 1 };
  componentDidMount() { this.bindReveal(); }
  componentDidUpdate(pp) { if (pp.variant !== this.props.variant) setTimeout(() => this.bindReveal(), 30); }
  componentWillUnmount() { if (this.io) this.io.disconnect(); }
  bindReveal() {
    const root = this.rootRef.current; if (!root) return;
    if (this.io) this.io.disconnect();
    const els = [...root.querySelectorAll('[data-rv],[data-draw]')];
    const hide = el => { el.style.transition = 'none'; if (el.dataset.draw) el.style.transform = 'scaleX(0)'; else { el.style.opacity = '0'; el.style.transform = el.dataset.rv === 'x' ? 'translateX(-40px)' : 'translateY(28px)'; } };
    const show = (el, i) => { el.style.transition = `opacity .9s var(--ease) ${i * 70}ms, transform ${el.dataset.draw ? 1.6 : .9}s var(--ease) ${el.dataset.draw ? 200 : i * 70}ms, padding .6s var(--ease)`; el.style.opacity = '1'; el.style.transform = el.dataset.draw ? 'scaleX(1)' : 'none'; };
    this.io = new IntersectionObserver(es => es.forEach(e => {
      const i = els.indexOf(e.target) % 6;
      if (e.isIntersecting) show(e.target, i); else if (e.boundingClientRect.top > 0) hide(e.target);
    }), { threshold: .12 });
    els.forEach(el => this.io.observe(el));
  }
  renderVals() {
    const v = this.props.variant ?? 'a';
    const LIVE = { tagColor: 'var(--green)', tagBorder: 'rgba(48,209,88,.3)' };
    const DEV = { tagColor: 'var(--text-faint)', tagBorder: 'var(--glass-b)' };
    const base = [
      { key: 'studio', idx: '01', name: 'Zebraish Studio', short: 'Studio', verb: 'Build', status: 'Live Today', live: true, desc: 'The build layer. Turns ideas and businesses into real websites, software, brand and automation: what this page is.' },
      { key: 'board', idx: '02', name: 'The Board', short: 'The Board', verb: 'Launch', status: 'In Development', desc: 'Where businesses built with Studio can eventually launch, gather feedback, and be discovered. Not built yet, part of the roadmap.' },
      { key: 'fashion', idx: '03', name: 'Zebraish Fashion', short: 'Fashion', verb: 'Create', status: 'In Development', desc: 'The cultural and creative arm of Zebraish, an animal-inspired fashion universe. Also part of the roadmap, not this build.' },
      { key: 'zelm', idx: '04', name: 'ZELM', short: 'ZELM', verb: 'The World', status: 'On the Roadmap', desc: 'ZELM stands for Zebraish El Mundo, meaning “Zebraish, the World.” Zebraish’s fashion, culture, and lifestyle ecosystem, built around discovering, showcasing, and connecting with the modern world of fashion, style, people, brands, and culture.' },
    ];
    const cards = base.map(c => Object.assign({}, c, c.live ? LIVE : DEV, {
      border: c.live ? 'rgba(23,201,141,.4)' : 'rgba(var(--tint-rgb),.14)',
      bandBg: c.live ? 'var(--invert-bg)' : 'rgba(var(--tint-rgb),.04)',
      bandFg: c.live ? 'var(--invert-fg)' : 'var(--text)',
      bandBorder: c.live ? 'transparent' : 'rgba(var(--tint-rgb),.12)',
      stripe: c.live ? 'rgba(23,201,141,.28)' : 'rgba(var(--tint-rgb),.06)',
    }));
    const idea = { key: 'idea', idx: '00', name: 'Idea', short: 'Idea', verb: 'You', status: 'Where it starts', desc: 'Every part of the ecosystem begins the same way: with you and an idea. Studio turns it into something real, and the rest of Zebraish helps it grow.', ...DEV };
    const nodes = [idea, ...cards].map((n, i) => Object.assign({}, n, {
      idx: String(i).padStart(2, '0'),
      dotBg: n.live ? 'var(--invert-bg)' : 'rgba(var(--bg-rgb),.8)',
      dotFg: n.live ? 'var(--invert-fg)' : 'var(--text-muted)',
      dotBorder: n.live ? 'transparent' : 'var(--glass-bb)',
      dotGlow: n.live ? '0 0 30px rgba(23,201,141,.45)' : 'none',
      name: n.short,
    }));
    const all = [idea, ...cards];
    const selI = this.state.sel;
    const ringNodes = all.map((n, i) => {
      const a = (-90 + i * 72) * Math.PI / 180, on = i === selI;
      return {
        name: n.short, x: (50 + 45 * Math.cos(a)).toFixed(2) + '%', y: (50 + 45 * Math.sin(a)).toFixed(2) + '%',
        size: on ? '22px' : '14px',
        dotBg: n.live ? 'var(--emerald)' : on ? 'var(--text)' : 'rgba(var(--bg-rgb),.9)',
        dotBorder: on || n.live ? 'transparent' : 'var(--glass-bb)',
        glow: on ? '0 0 0 6px rgba(var(--tint-rgb),.08),0 0 28px rgba(23,201,141,.5)' : 'none',
        labelOp: on ? 1 : .6,
        chipBg: on ? 'var(--invert-bg)' : 'var(--glass)', chipFg: on ? 'var(--invert-fg)' : 'var(--text-muted)', chipBorder: on ? 'var(--invert-bg)' : 'var(--glass-b)',
        pick: () => this.setState({ sel: i }),
      };
    });
    const sel = Object.assign({}, all[selI], { idx: String(selI + 1).padStart(2, '0') });
    const rings = [
      { r: 180, w: 1, op: .5, dash: '2 6' }, { r: 172, w: 5, op: .22, dash: '60 14 20 10' }, { r: 163, w: 2, op: .4, dash: '120 8' },
      { r: 156, w: 7, op: .12, dash: '30 18 80 12' }, { r: 147, w: 1.5, op: .35, dash: '4 4' }, { r: 140, w: 4, op: .18, dash: '90 20 10 20' }, { r: 132, w: 1, op: .3, dash: '' },
    ];
    const set = (e, on) => e.currentTarget.style.setProperty('--on', on);
    return {
      rootRef: this.rootRef, cards, nodes, ringNodes, sel, rings,
      isCurrent: v === 'current', isNew: v !== 'current', isA: v === 'a', isB: v === 'b', isC: v === 'c',
      label: v === 'current' ? '04 · The Bigger Picture' : '04 · The Ecosystem',
      pad: v === 'current' ? '110px 48px' : '88px 48px 96px',
      sectionBg: v === 'current' ? 'rgba(var(--approach-bg-rgb),.95)' : 'transparent',
      bandEnter: e => set(e, 1), bandLeave: e => set(e, 0),
      oldFlow: [
        { name: 'Idea', sub: 'You', op: 1, conn: true }, { name: 'Zebraish Studio', sub: 'Build', op: 1, conn: true }, { name: 'Launch', sub: 'Live Product', op: 1, conn: true },
        { name: 'The Board', sub: 'In Development', op: .45, conn: true }, { name: 'Grow', sub: 'Discover · Learn', op: .45, conn: false },
      ],
      oldCards: cards.slice(0, 3).map(c => Object.assign({}, c, { titleColor: c.live ? 'var(--text)' : 'var(--text-muted)' })),
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--surface:#0c0c10;--bg-rgb:6,6,8;--approach-bg-rgb:8,20,17;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.22);--glass:rgba(245,245,247,.05);--glass-b:rgba(245,245,247,.09);--glass-bb:rgba(245,245,247,.20);--invert-bg:#fff;--invert-fg:#000}\n[data-theme=\"light\"]{--bg:#faf9f7;--surface:#f3f1ed;--bg-rgb:250,249,247;--approach-bg-rgb:232,244,238;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--glass:rgba(20,20,24,.05);--glass-b:rgba(20,20,24,.09);--glass-bb:rgba(20,20,24,.20);--invert-bg:#141414;--invert-fg:#fff}\n:root{--emerald:#17c98d;--green:#30D158;--ease:cubic-bezier(0.16,1,0.3,1)}\n@keyframes zbflow{to{stroke-dashoffset:-40}}\n@keyframes zbrot{to{transform:rotate(360deg)}}\n@keyframes zbrotr{to{transform:rotate(-360deg)}}\n@keyframes zbpulse{0%,100%{box-shadow:0 0 0 0 rgba(48,209,88,.6)}50%{box-shadow:0 0 0 6px rgba(48,209,88,0)}}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section id="approach" ref={v.rootRef} style={css(`scroll-margin-top:72px;position:relative;overflow:hidden;font-family:Inter,-apple-system,sans-serif;color:var(--text);padding:${v.pad ?? ""};background:${v.sectionBg ?? ""}`)}>
      {" "}
      {v.isCurrent ? (
        <>
          {" "}
          <div style={{"position":"absolute","inset":"0","zIndex":"0","backgroundImage":"linear-gradient(rgba(var(--approach-bg-rgb),.78),rgba(var(--approach-bg-rgb),.82)),repeating-linear-gradient(124deg,rgba(23,201,141,.09) 0 2px,transparent 2px 16px),url('/zb/assets/zebra-interference.jpg')","backgroundSize":"auto,auto,cover","backgroundPosition":"center"}} />
          {" "}
        </>
      ) : null}
      {" "}
      {v.isNew ? (
        <>
          {" "}
          <div style={{"position":"absolute","inset":"0","zIndex":"0","background":"linear-gradient(180deg,transparent,rgba(var(--approach-bg-rgb),.7) 18%,rgba(var(--approach-bg-rgb),.7) 82%,transparent)"}} />
          {" "}
        </>
      ) : null}
      {" "}
      <div style={{"position":"relative","zIndex":"2"}}>
        {" "}
        <div data-rv="1" style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint)","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
          <span style={{"width":"28px","height":"1px","background":"var(--glass-bb)"}} />
          {I(v.label)}
        </div>
        {" "}
        {v.isCurrent ? (
          <>
            {" "}
            <h2 style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
            {"STUDIO IS THE "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"var(--emerald)"}}>{"FIRST STEP."}</span>
          </h2>
            {" "}
          </>
        ) : null}
        {" "}
        {v.isNew ? (
          <>
            {" "}
            <h2 data-rv="1" style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
            {"THE "}
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","letterSpacing":"-.01em","color":"var(--emerald)"}}>{"ECOSYSTEM."}</span>
          </h2>
            {" "}
          </>
        ) : null}
        {" "}
        <p data-rv="1" style={{"fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted)","maxWidth":"520px","margin":"0"}}>
          {"Zebraish Studio is the build layer of a larger ecosystem, one that's still being built, on purpose, in the open."}
        </p>
        {" "}
      </div>
      {" "}
      {" "}
      {v.isCurrent ? (
        <>
          {" "}
          <div style={{"position":"relative","zIndex":"2"}}>
          {" "}
          <div style={{"display":"flex","alignItems":"center","margin":"64px 0 56px","overflowX":"auto","paddingBottom":"8px"}}>
            {" "}
            {each(v, v.oldFlow, "f", (v) => (
              <>
                {" "}
                <div style={{"display":"flex","alignItems":"center","flex":"1"}}>
                  {" "}
                  <div style={css(`flex:1;min-width:130px;text-align:center;padding:20px 10px;opacity:${v.f?.op ?? ""}`)}>
                    <div style={{"fontSize":"11px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","color":"var(--text)"}}>{I(v.f?.name)}</div>
                    <div style={{"fontSize":"9px","fontWeight":"500","letterSpacing":".08em","textTransform":"uppercase","color":"var(--text-faint)","marginTop":"4px"}}>{I(v.f?.sub)}</div>
                  </div>
                  {" "}
                  {v.f?.conn ? (
                    <>
                      <div style={{"flexShrink":"0","width":"48px","height":"2px","backgroundImage":"repeating-linear-gradient(90deg,rgba(var(--tint-rgb),.5) 0 5px,transparent 5px 10px)"}} />
                    </>
                  ) : null}
                  {" "}
                </div>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(260px,1fr))","gap":"14px","marginTop":"16px"}}>
            {" "}
            {each(v, v.oldCards, "c", (v) => (
              <>
                {" "}
                <div style={css(`background:rgba(var(--tint-rgb),.045);backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:inset 0 1px 0 rgba(var(--tint-rgb),.05);border:1px solid ${v.c?.border ?? ""};border-radius:22px;padding:32px 26px`)}>
                  {" "}
                  <div style={css(`font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${v.c?.tagColor ?? ""};border:1px solid ${v.c?.tagBorder ?? ""};padding:4px 9px;border-radius:5px;display:inline-block;margin-bottom:16px`)}>{I(v.c?.status)}</div>
                  {" "}
                  <div style={css(`font-size:19px;font-weight:800;letter-spacing:-.01em;margin-bottom:8px;color:${v.c?.titleColor ?? ""}`)}>{I(v.c?.name)}</div>
                  {" "}
                  <p style={{"fontSize":"13px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>{I(v.c?.desc)}</p>
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
        </>
      ) : null}
      {" "}
      {" "}
      {v.isA ? (
        <>
          {" "}
          <div style={{"position":"relative","zIndex":"2","marginTop":"56px"}}>
          {" "}
          <div style={{"position":"relative","display":"grid","gridTemplateColumns":"repeat(5,minmax(0,1fr))"}}>
            {" "}
            <div style={{"position":"absolute","top":"27px","left":"10%","right":"10%","height":"2px","background":"var(--glass-b)"}} />
            {" "}
            <div data-draw="1" style={{"position":"absolute","top":"26px","left":"10%","right":"10%","height":"4px","backgroundImage":"repeating-linear-gradient(100deg,var(--text) 0 7px,transparent 7px 13px)","transformOrigin":"left"}} />
            {" "}
            {each(v, v.nodes, "n", (v) => (
              <>
                {" "}
                <div data-rv="1" style={{"position":"relative","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center","gap":"14px"}}>
                  {" "}
                  <div style={css(`width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${v.n?.dotBg ?? ""};border:1px solid ${v.n?.dotBorder ?? ""};box-shadow:${v.n?.dotGlow ?? ""};backdrop-filter:blur(12px)`)}>
                    <span style={css(`font-size:12px;font-weight:800;color:${v.n?.dotFg ?? ""}`)}>{I(v.n?.idx)}</span>
                  </div>
                  {" "}
                  <div>
                    <div style={{"fontSize":"12px","fontWeight":"800","letterSpacing":".1em","textTransform":"uppercase"}}>{I(v.n?.name)}</div>
                    <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","color":"var(--text-faint)","marginTop":"4px"}}>{I(v.n?.verb)}</div>
                  </div>
                  {" "}
                </div>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{"position":"relative","height":"70px","margin":"-8px 0 0"}}>
            {" "}
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" style={{"position":"absolute","inset":"0","width":"100%","height":"100%","overflow":"visible"}}>
              {" "}
              <path d="M 900 4 C 900 64, 300 64, 300 4" fill="none" stroke="var(--emerald)" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" style={{"animation":"zbflow 1.6s linear infinite"}} />
              {" "}
            </svg>
            {" "}
            <div style={{"position":"absolute","left":"50%","bottom":"0","transform":"translate(-50%,40%)","fontSize":"10px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","color":"var(--emerald)","background":"rgba(var(--approach-bg-rgb),1)","padding":"4px 12px","borderRadius":"100px","border":"1px solid rgba(23,201,141,.3)","whiteSpace":"nowrap"}}>{"↺ New ideas return to build"}</div>
            {" "}
          </div>
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(220px,1fr))","gap":"14px","marginTop":"44px"}}>
            {" "}
            {each(v, v.cards, "c", (v) => (
              <>
                {" "}
                <div data-rv="1" style={css(`position:relative;background:rgba(var(--tint-rgb),.045);backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:inset 0 1px 0 rgba(var(--tint-rgb),.08);border:1px solid ${v.c?.border ?? ""};border-radius:22px;padding:26px 24px;display:flex;flex-direction:column;gap:10px`)}>
                  {" "}
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                    <span style={css(`font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${v.c?.tagColor ?? ""};border:1px solid ${v.c?.tagBorder ?? ""};padding:4px 9px;border-radius:5px`)}>{I(v.c?.status)}</span>
                    <span style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".2em","color":"var(--text-faint)"}}>{I(v.c?.idx)}</span>
                  </div>
                  {" "}
                  <div style={{"fontSize":"21px","fontWeight":"800","letterSpacing":"-.01em","marginTop":"6px"}}>{I(v.c?.name)}</div>
                  {" "}
                  <p style={{"fontSize":"13px","lineHeight":"1.7","color":"var(--text-muted)","margin":"0","textWrap":"pretty"}}>{I(v.c?.desc)}</p>
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
        </>
      ) : null}
      {" "}
      {" "}
      {v.isB ? (
        <>
          {" "}
          <div style={{"position":"relative","zIndex":"2","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(340px,1fr))","gap":"48px","alignItems":"center","marginTop":"40px"}}>
          {" "}
          <div style={{"position":"relative","width":"100%","maxWidth":"560px","aspectRatio":"1","margin":"0 auto"}}>
            {" "}
            <svg viewBox="0 0 400 400" style={{"position":"absolute","inset":"0","width":"100%","height":"100%","overflow":"visible"}}>
              {" "}
              <g style={{"transformOrigin":"200px 200px","animation":"zbrot 60s linear infinite"}}>
                {" "}
                {each(v, v.rings, "r", (v) => (
                  <>
                    {" "}
                    <circle cx="200" cy="200" r={v.r?.r} fill="none" stroke="var(--text)" strokeOpacity={v.r?.op} strokeWidth={v.r?.w} strokeDasharray={v.r?.dash} />
                    {" "}
                  </>
                ))}
                {" "}
              </g>
              {" "}
              <g style={{"transformOrigin":"200px 200px","animation":"zbrotr 14s linear infinite"}}>
                {" "}
                <circle cx="200" cy="40" r="4" fill="var(--emerald)" />
                {" "}
              </g>
              {" "}
            </svg>
            {" "}
            <div style={{"position":"absolute","inset":"26%","borderRadius":"50%","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","textAlign":"center","gap":"6px"}}>
              {" "}
              <div style={{"position":"relative","width":"150%","height":"78%","marginTop":"-18%"}}>
                <ZebraHead variant="a" __hostStyle={hostPositionStyle("position:absolute;inset:0")} />
              </div>
              {" "}
              <div style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".2em","textTransform":"uppercase","color":"var(--text-faint)"}}>
                {"One pattern."}
                <br />
                {"Infinite directions."}
              </div>
              {" "}
            </div>
            {" "}
            {each(v, v.ringNodes, "n", (v) => (
              <>
                {" "}
                <button type="button" onClick={v.n?.pick} style={css(`position:absolute;left:${v.n?.x ?? ""};top:${v.n?.y ?? ""};transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:none;cursor:pointer;font-family:inherit;color:var(--text);padding:0`)}>
                  {" "}
                  <span style={css(`width:${v.n?.size ?? ""};height:${v.n?.size ?? ""};border-radius:50%;background:${v.n?.dotBg ?? ""};border:1px solid ${v.n?.dotBorder ?? ""};box-shadow:${v.n?.glow ?? ""};backdrop-filter:blur(10px);transition:all .4s var(--ease)`)} />
                  {" "}
                  <span style={css(`font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;background:rgba(var(--bg-rgb),.6);padding:3px 8px;border-radius:6px;opacity:${v.n?.labelOp ?? ""}`)}>{I(v.n?.name)}</span>
                  {" "}
                </button>
                {" "}
              </>
            ))}
            {" "}
          </div>
          {" "}
          <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
            {" "}
            <div style={{"display":"flex","gap":"6px","flexWrap":"wrap"}}>
              {" "}
              {each(v, v.ringNodes, "n", (v) => (
                <>
                  {" "}
                  <button type="button" onClick={v.n?.pick} style={css(`font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:9px 16px;border-radius:100px;cursor:pointer;background:${v.n?.chipBg ?? ""};color:${v.n?.chipFg ?? ""};border:1px solid ${v.n?.chipBorder ?? ""};transition:all .3s`)}>{I(v.n?.name)}</button>
                  {" "}
                </>
              ))}
              {" "}
            </div>
            {" "}
            <div style={{"background":"rgba(var(--tint-rgb),.05)","backdropFilter":"blur(24px) saturate(1.4)","WebkitBackdropFilter":"blur(24px) saturate(1.4)","border":"1px solid rgba(var(--tint-rgb),.14)","boxShadow":"inset 0 1px 0 rgba(var(--tint-rgb),.08)","borderRadius":"26px","padding":"34px 32px","minHeight":"260px","display":"flex","flexDirection":"column","gap":"14px"}}>
              {" "}
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
                <span style={css(`font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${v.sel?.tagColor ?? ""};border:1px solid ${v.sel?.tagBorder ?? ""};padding:4px 9px;border-radius:5px`)}>{I(v.sel?.status)}</span>
                <span style={{"fontSize":"11px","fontWeight":"600","letterSpacing":".2em","color":"var(--text-faint)"}}>{I(v.sel?.idx)}{" / 05"}</span>
              </div>
              {" "}
              <div style={{"fontSize":"clamp(32px,3.4vw,48px)","fontWeight":"900","letterSpacing":"-.03em","lineHeight":"1"}}>{I(v.sel?.name)}</div>
              {" "}
              <div style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"600","fontSize":"20px","color":"var(--emerald)"}}>{I(v.sel?.verb)}</div>
              {" "}
              <p style={{"fontSize":"14px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0","maxWidth":"440px","textWrap":"pretty"}}>{I(v.sel?.desc)}</p>
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
      {v.isC ? (
        <>
          {" "}
          <div style={{"position":"relative","zIndex":"2","marginTop":"44px","display":"flex","flexDirection":"column","gap":"8px"}}>
          {" "}
          {each(v, v.cards, "c", (v) => (
            <>
              {" "}
              <div data-rv="x" onMouseEnter={v.bandEnter} onMouseLeave={v.bandLeave} style={css(`--on:0;position:relative;display:grid;grid-template-columns:64px minmax(0,1.3fr) minmax(0,1fr) auto;align-items:center;gap:24px;padding:calc(22px + var(--on) * 14px) 28px;border-radius:18px;overflow:hidden;background:${v.c?.bandBg ?? ""};color:${v.c?.bandFg ?? ""};border:1px solid ${v.c?.bandBorder ?? ""};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);transition:padding .6s var(--ease)`)}>
                {" "}
                <div style={css(`position:absolute;inset:0;background-image:repeating-linear-gradient(124deg,${v.c?.stripe ?? ""} 0 2px,transparent 2px 16px);opacity:calc(.35 + var(--on) * .65);transition:opacity .5s;pointer-events:none`)} />
                {" "}
                <span style={{"position":"relative","fontSize":"12px","fontWeight":"700","letterSpacing":".2em","opacity":".55"}}>{I(v.c?.idx)}</span>
                {" "}
                <span style={{"position":"relative","fontSize":"clamp(34px,4.6vw,68px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":".95"}}>{I(v.c?.name)}</span>
                {" "}
                <p style={{"position":"relative","fontSize":"13px","lineHeight":"1.65","margin":"0","opacity":".72","textWrap":"pretty"}}>{I(v.c?.desc)}</p>
                {" "}
                <span style={{"position":"relative","display":"flex","flexDirection":"column","alignItems":"flex-end","gap":"6px","textAlign":"right"}}>
                  <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"600","fontSize":"18px"}}>{I(v.c?.verb)}</span>
                  <span style={{"fontSize":"9px","fontWeight":"700","letterSpacing":".14em","textTransform":"uppercase","padding":"4px 9px","borderRadius":"5px","border":"1px solid currentColor","opacity":".7","whiteSpace":"nowrap"}}>{I(v.c?.status)}</span>
                </span>
                {" "}
              </div>
              {" "}
            </>
          ))}
          {" "}
          <div data-rv="1" style={{"display":"flex","alignItems":"center","gap":"14px","padding":"14px 28px","color":"var(--emerald)","fontSize":"11px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase"}}>
            {" "}
            <span style={{"flex":"1","height":"2px","backgroundImage":"repeating-linear-gradient(90deg,var(--emerald) 0 6px,transparent 6px 12px)"}} />
            {"↺ New ideas return to Studio"}
            <span style={{"flex":"1","height":"2px","backgroundImage":"repeating-linear-gradient(90deg,var(--emerald) 0 6px,transparent 6px 12px)"}} />
            {" "}
          </div>
          {" "}
        </div>
          {" "}
        </>
      ) : null}
    </section>
    </>
  );
}

export default dcComponent("Ecosystem", Component, template, {});
