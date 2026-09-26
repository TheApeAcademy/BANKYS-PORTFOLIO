// @ts-nocheck
/* eslint-disable */
"use client";
// HenkoGen Intro: ported from the Claude Design handoff (HenkoGen Intro.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  renderVals() {
    const live = { tagc: '#8b5cf6', border: 'rgba(139,92,246,.3)' }, soon = { tagc: 'rgba(var(--tint-rgb),.45)', border: 'rgba(var(--tint-rgb),.12)' };
    const v = this.props.variant ?? 'a';
    const layers = [
      { layer: 'Layer 03', t: 'Shared pool', d: 'Software and artifacts both teams can reuse. To be defined.', who: 'Coming', indent: '0px', bg: 'rgba(var(--tint-rgb),.03)', bd: 'rgba(var(--tint-rgb),.12)', tc: 'var(--text-faint)' },
      { layer: 'Layer 02', t: 'Intelligence', d: 'AI agents for sales funnels, customer service and social media, implemented alongside your team.', who: 'HenkoGen', indent: '40px', bg: 'linear-gradient(160deg,rgba(139,92,246,.18),rgba(var(--tint-rgb),.03))', bd: 'rgba(139,92,246,.4)', tc: '#8b5cf6' },
      { layer: 'Layer 01', t: 'Product', d: 'Websites, web apps, software, brand and automation, hand-built and launched.', who: 'Zebraish Studio', indent: '80px', bg: 'rgba(var(--tint-rgb),.06)', bd: 'rgba(var(--tint-rgb),.2)', tc: 'var(--text)' },
    ];
    return { layers, isA: v === 'a', isB: v === 'b', isC: v === 'c', agents: [
      { tag: 'Kaizen Agent', t: 'Sales funnels', ...live },
      { tag: 'Kaizen Agent', t: 'Customer service', ...live },
      { tag: 'Kaizen Agent', t: 'Social media', ...live },
      { tag: 'Coming · to be defined', t: 'Shared pool of software & artifacts', ...soon },
    ] };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.3);--invert-bg:#fff;--invert-fg:#000;--logo-inv:0}\n[data-theme=\"light\"]{--bg:#faf9f7;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--invert-bg:#141414;--invert-fg:#fff;--logo-inv:1}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section id="partner" style={{"position":"relative","padding":"84px 48px","fontFamily":"Inter,-apple-system,sans-serif","color":"var(--text,#f5f5f7)","overflow":"hidden"}}>
      {" "}
      <div style={{"position":"absolute","inset":"0","background":"radial-gradient(ellipse 50% 60% at 75% 40%,rgba(139,92,246,.16),transparent 70%)","pointerEvents":"none"}} />
      {" "}
      <div style={{"position":"relative","fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint,rgba(var(--tint-rgb),.3))","display":"flex","alignItems":"center","gap":"14px","marginBottom":"20px"}}>
        <span style={{"width":"28px","height":"1px","background":"rgba(var(--tint-rgb),.2)"}} />
        {"08 · Official AI Partner"}
      </div>
      {" "}
      <h2 style={{"position":"relative","fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 18px"}}>
        {"MEET "}
        <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","color":"#8b5cf6"}}>{"HENKOGEN."}</span>
      </h2>
      {" "}
      <p style={{"position":"relative","fontSize":"17px","lineHeight":"1.7","color":"var(--text-muted,rgba(var(--tint-rgb),.55))","maxWidth":"560px","margin":"0"}}>
        {"Where we build the product, HenkoGen builds the intelligence that runs behind it."}
      </p>
      {" "}
      {v.isB ? (
        <>
          {" "}
          <div style={{"position":"relative","marginTop":"44px","display":"flex","flexDirection":"column","gap":"6px"}}>
          {" "}
          <div style={{"display":"flex","alignItems":"baseline","gap":"24px","flexWrap":"wrap","fontSize":"clamp(40px,6.4vw,104px)","fontWeight":"900","letterSpacing":"-.04em","lineHeight":".95"}}>
            {" "}
            <span>{"STUDIO"}</span>
            <span style={{"fontWeight":"200","color":"var(--text-faint)"}}>{"+"}</span>
            <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","color":"#8b5cf6"}}>{"HENKOGEN"}</span>
            <span style={{"fontWeight":"200","color":"var(--text-faint)"}}>{"="}</span>
            {" "}
          </div>
          {" "}
          <div style={{"fontSize":"clamp(40px,6.4vw,104px)","fontWeight":"200","letterSpacing":"-.03em","lineHeight":".95"}}>
            {"a product that "}
            <span style={{"fontWeight":"900"}}>{"thinks."}</span>
          </div>
          {" "}
          <div style={{"height":"3px","margin":"28px 0 8px","backgroundImage":"repeating-linear-gradient(100deg,#8b5cf6 0 7px,transparent 7px 15px)"}} />
          {" "}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(240px,1fr))","gap":"28px"}}>
            {" "}
            <p style={{"fontSize":"14px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>
              <strong style={{"color":"var(--text)"}}>{"Studio"}</strong>
              {" builds the product: websites, web apps, software, brand and automation, hand-built and launched."}
            </p>
            {" "}
            <p style={{"fontSize":"14px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>
              <strong style={{"color":"var(--text)"}}>{"HenkoGen"}</strong>
              {" designs AI agents that automate sales funnels, customer service, and social media, then stays to implement them alongside your team until they actually work."}
            </p>
            {" "}
            <p style={{"fontSize":"14px","lineHeight":"1.75","color":"var(--text-muted)","margin":"0"}}>
              <strong style={{"color":"var(--text)"}}>{"Together"}</strong>
              {", a shared pool of software and artifacts is on the way. Details to be defined."}
            </p>
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
          <div style={{"position":"relative","marginTop":"44px","display":"flex","flexDirection":"column","gap":"0","maxWidth":"880px"}}>
          {" "}
          {each(v, v.layers, "l", (v) => (
            <>
              {" "}
              <div style={css(`position:relative;display:grid;grid-template-columns:140px minmax(0,1fr) auto;align-items:center;gap:24px;padding:26px 30px;margin-left:${v.l?.indent ?? ""};margin-top:-10px;border-radius:22px;background:${v.l?.bg ?? ""};border:1px solid ${v.l?.bd ?? ""};backdrop-filter:blur(18px);box-shadow:0 24px 50px rgba(0,0,0,.25)`)}>
                {" "}
                <span style={css(`font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${v.l?.tc ?? ""}`)}>{I(v.l?.layer)}</span>
                {" "}
                <div>
                  <div style={{"fontSize":"24px","fontWeight":"900","letterSpacing":"-.02em"}}>{I(v.l?.t)}</div>
                  <div style={{"fontSize":"13px","lineHeight":"1.6","color":"var(--text-muted)","marginTop":"4px"}}>{I(v.l?.d)}</div>
                </div>
                {" "}
                <span style={css(`font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${v.l?.tc ?? ""}`)}>{I(v.l?.who)}</span>
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
          <div style={{"position":"relative","display":"grid","gridTemplateColumns":"minmax(0,1fr) 120px minmax(0,1fr)","alignItems":"stretch","marginTop":"48px"}}>
          {" "}
          <div style={{"padding":"34px 32px","borderRadius":"26px","background":"rgba(var(--tint-rgb),.045)","border":"1px solid rgba(var(--tint-rgb),.14)","backdropFilter":"blur(20px)","display":"flex","flexDirection":"column","gap":"14px"}}>
            {" "}
            <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
              <img src="/zb/assets/zebraish-mark.png" alt="" style={{"height":"26px","filter":"invert(var(--logo-inv))"}} />
              <span style={{"fontSize":"13px","fontWeight":"800","letterSpacing":".1em"}}>{"ZEBRAISH STUDIO"}</span>
            </div>
            {" "}
            <div style={{"fontSize":"30px","fontWeight":"900","letterSpacing":"-.02em","lineHeight":"1"}}>{"Builds the product."}</div>
            {" "}
            <p style={{"fontSize":"13px","lineHeight":"1.7","color":"var(--text-muted,rgba(var(--tint-rgb),.55))","margin":"0"}}>
              {"Websites, web apps, software, brand and automation, hand-built and launched."}
            </p>
            {" "}
          </div>
          {" "}
          <div style={{"position":"relative","display":"flex","alignItems":"center","justifyContent":"center"}}>
            {" "}
            <div style={{"position":"absolute","left":"0","right":"0","top":"50%","height":"2px","backgroundImage":"repeating-linear-gradient(90deg,#8b5cf6 0 6px,transparent 6px 12px)"}} />
            {" "}
            <span style={{"position":"relative","width":"44px","height":"44px","borderRadius":"50%","background":"var(--bg)","border":"1px solid rgba(139,92,246,.5)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"18px","fontWeight":"300","color":"#8b5cf6"}}>{"+"}</span>
            {" "}
          </div>
          {" "}
          <div style={{"padding":"34px 32px","borderRadius":"26px","background":"linear-gradient(160deg,rgba(139,92,246,.16),rgba(var(--tint-rgb),.03))","border":"1px solid rgba(139,92,246,.35)","backdropFilter":"blur(20px)","display":"flex","flexDirection":"column","gap":"14px"}}>
            {" "}
            <div style={{"fontSize":"13px","fontWeight":"800","letterSpacing":".1em","color":"#b9a2fb"}}>{"HENKOGEN · APPLIED AI"}</div>
            {" "}
            <div style={{"fontSize":"30px","fontWeight":"900","letterSpacing":"-.02em","lineHeight":"1"}}>{"Builds the intelligence."}</div>
            {" "}
            <p style={{"fontSize":"13px","lineHeight":"1.7","color":"var(--text-muted,rgba(var(--tint-rgb),.55))","margin":"0"}}>
              {"HenkoGen designs AI agents that automate sales funnels, customer service, and social media, then stays to implement them alongside your team until they actually work."}
            </p>
            {" "}
          </div>
          {" "}
        </div>
          {" "}
          <div style={{"position":"relative","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(200px,1fr))","gap":"12px","marginTop":"14px"}}>
          {" "}
          {each(v, v.agents, "a", (v) => (
            <>
              {" "}
              <div style={css(`padding:20px 22px;border-radius:18px;border:1px solid ${v.a?.border ?? ""};background:rgba(var(--tint-rgb),.03);display:flex;flex-direction:column;gap:6px`)}>
                {" "}
                <span style={css(`font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${v.a?.tagc ?? ""}`)}>{I(v.a?.tag)}</span>
                {" "}
                <span style={{"fontSize":"15px","fontWeight":"700"}}>{I(v.a?.t)}</span>
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
      <div style={{"position":"relative","display":"flex","gap":"14px","flexWrap":"wrap","marginTop":"32px"}}>
        {" "}
        <a href="https://henkogen.vercel.app" target="_blank" style={{"background":"var(--invert-bg,#fff)","color":"var(--invert-fg,#000)","padding":"14px 30px","fontSize":"13px","fontWeight":"700","letterSpacing":".03em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none"}}>{"Visit HenkoGen →"}</a>
        {" "}
        <a href="https://henkogen.vercel.app/kaizen" target="_blank" style={{"color":"var(--text-muted,rgba(var(--tint-rgb),.6))","border":"1px solid rgba(var(--tint-rgb),.12)","padding":"14px 30px","fontSize":"12px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","borderRadius":"100px","textDecoration":"none"}}>{"Explore Kaizen Agents →"}</a>
        {" "}
      </div>
    </section>
    </>
  );
}

export default dcComponent("HenkoGen Intro", Component, template, {});
