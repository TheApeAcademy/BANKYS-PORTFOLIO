// @ts-nocheck
/* eslint-disable */
"use client";
// Idea Prompt: ported from the Claude Design handoff (Idea Prompt.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  state = { text: '', type: 'Website', ph: 0, step: -1, ans: [] };
  componentDidMount() { this.t = setInterval(() => this.setState(s => ({ ph: (s.ph + 1) % 4 })), 3200); }
  componentWillUnmount() { clearInterval(this.t); clearTimeout(this.t2); }
  renderVals() {
    const P = ['A booking site for my salon with WhatsApp reminders…', 'An online store for my perfume brand…', 'An AI assistant that answers my customers 24/7…', 'A 3D launch page for our new product…'];
    const T = ['Website', 'Web App', 'E-commerce', 'AI Product', 'Automation', 'Creative Experience'];
    const st = this.state;
    const txt = st.text.toLowerCase();
    const goal = /sell|store|shop|perfume/.test(txt) ? 'Sell' : /ai|automat|24\/7/.test(txt) ? 'Automate' : /launch|new/.test(txt) ? 'Launch' : 'Engage';
    const amb = st.type === 'Creative Experience' || /3d|immersive/.test(txt) ? 'Immersive' : st.type === 'Website' ? 'Essential' : 'Advanced';
    const rows = [{ k: 'Creating', v: st.type }, { k: 'For', v: goal }, { k: 'Needs', v: /whatsapp/.test(txt) ? 'WhatsApp flow' : /book/.test(txt) ? 'Booking' : 'Custom build' }, { k: 'Ambition', v: amb }];
    const submit = () => { if (!st.text.trim()) return; this.setState({ step: 0 }); const tick = n => { this.t2 = setTimeout(() => { this.setState({ step: n }); if (n < 4) tick(n + 1); }, 260); }; tick(1); };
    const v = this.props.variant ?? 'a';
    const Q = [['What are we creating?', ['Website', 'Web App', 'AI Product', 'E-commerce']], ['What is it for?', ['Launch', 'Sell', 'Automate', 'Engage']], ['What does it need to do?', ['Bookings', 'Payments', 'WhatsApp flow', 'Dashboard']], ['How ambitious?', ['Essential', 'Advanced', 'Immersive']]];
    const me = { side: 'flex-end', bg: 'var(--invert-bg)', fg: 'var(--invert-fg)' }, zb = { side: 'flex-start', bg: 'rgba(var(--tint-rgb),.05)', fg: 'var(--text)' };
    const chat = [{ t: 'Hi, I\'m Zebraish. Four quick questions and I\'ll shape your project.', ...zb }];
    st.ans.forEach((a, k) => { chat.push({ t: Q[k][0], ...zb }); chat.push({ t: a, ...me }); });
    const qi = st.ans.length;
    if (qi < 4) chat.push({ t: Q[qi][0], ...zb }); else chat.push({ t: 'Got it: ' + st.ans.join(' · ') + '. I\'ll prepare a tailored proposal.', ...zb });
    return {
      isA: v === 'a', isB: v === 'b', isC: v === 'c', chat, chatDone: qi >= 4, chatInputDisp: qi < 4 ? 'flex' : 'none',
      quick: qi < 4 ? Q[qi][1].map(label => ({ label, pick: () => this.setState(s2 => ({ ans: [...s2.ans, label] })) })) : [],
      resetChat: () => this.setState({ ans: [] }),
      liveProfile: rows.map(r => ({ ...r, c: st.text.trim() ? '#17c98d' : 'var(--text-faint)', v: st.text.trim() ? r.v : '…' })),
      text: st.text, onType: e => this.setState({ text: e.target.value }), ph: P[st.ph],
      types: T.map(label => { const on = label === st.type; return { label, bg: on ? 'var(--invert-bg)' : 'rgba(var(--tint-rgb),.05)', fg: on ? 'var(--invert-fg)' : 'rgba(var(--tint-rgb),.6)', bd: on ? 'var(--invert-bg)' : 'rgba(var(--tint-rgb),.12)', pick: () => this.setState({ type: label }) }; }),
      canOp: st.text.trim() ? 1 : .4, submit,
      showProfile: st.step >= 0,
      profile: rows.map((r, i) => ({ ...r, op: st.step > i ? 1 : 0, y: st.step > i ? '0' : '10px' })),
    };
  }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--tint-rgb:245,245,247;--text:#f5f5f7;--text-muted:rgba(245,245,247,.55);--text-faint:rgba(245,245,247,.3);--invert-bg:#fff;--invert-fg:#000;--logo-inv:0}\n[data-theme=\"light\"]{--bg:#faf9f7;--tint-rgb:20,20,24;--text:#17171a;--text-muted:rgba(20,20,24,.65);--text-faint:rgba(20,20,24,.4);--invert-bg:#141414;--invert-fg:#fff;--logo-inv:1}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <section id="start-a-project" style={{"position":"relative","padding":"84px 48px","fontFamily":"Inter,-apple-system,sans-serif","color":"var(--text,#f5f5f7)","display":"flex","flexDirection":"column","alignItems":"center","textAlign":"center"}}>
      {" "}
      <div style={{"fontSize":"10px","fontWeight":"600","letterSpacing":".28em","textTransform":"uppercase","color":"var(--text-faint,rgba(var(--tint-rgb),.3))","marginBottom":"20px"}}>{"05 · Start a Project"}</div>
      {" "}
      <h2 style={{"fontSize":"clamp(44px,6vw,88px)","fontWeight":"900","lineHeight":".94","letterSpacing":"-.03em","margin":"0 0 14px"}}>
        {"YOUR NEXT IDEA "}
        <span style={{"fontFamily":"Fraunces,Georgia,serif","fontStyle":"italic","fontWeight":"900","color":"#17c98d"}}>{"STARTS HERE."}</span>
      </h2>
      {" "}
      <p style={{"fontSize":"16px","lineHeight":"1.7","color":"var(--text-muted,rgba(var(--tint-rgb),.55))","maxWidth":"520px","margin":"0 0 36px"}}>
        {"Tell us what you're building. We'll shape a project profile and send a tailored proposal."}
      </p>
      {" "}
      {v.isB ? (
        <>
          {" "}
          <div style={{"width":"100%","maxWidth":"720px","display":"flex","flexDirection":"column","gap":"10px","textAlign":"left"}}>
          {" "}
          {each(v, v.chat, "m", (v) => (
            <>
              {" "}
              <div style={css(`display:flex;justify-content:${v.m?.side ?? ""}`)}>
                <div style={css(`max-width:78%;padding:13px 17px;border-radius:20px;font-size:15px;line-height:1.5;background:${v.m?.bg ?? ""};color:${v.m?.fg ?? ""};border:1px solid rgba(var(--tint-rgb),.1)`)}>{I(v.m?.t)}</div>
              </div>
              {" "}
            </>
          ))}
          {" "}
          <div style={css(`display:${v.chatInputDisp ?? ""};gap:8px;margin-top:6px`)}>
            {" "}
            {each(v, v.quick, "q", (v) => (
              <>
                <button type="button" onClick={v.q?.pick} style={{"fontFamily":"inherit","fontSize":"12px","fontWeight":"600","padding":"9px 15px","borderRadius":"100px","cursor":"pointer","background":"rgba(var(--tint-rgb),.05)","color":"var(--text)","border":"1px solid rgba(var(--tint-rgb),.16)"}}>{I(v.q?.label)}</button>
              </>
            ))}
            {" "}
          </div>
          {" "}
          {v.chatDone ? (
            <>
              <a href="/start" style={{"alignSelf":"flex-start","marginTop":"6px","fontSize":"12px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","color":"#17c98d","textDecoration":"none"}}>{"Project profile generated · See your tailored proposal →"}</a>
            </>
          ) : null}
          {" "}
          <button type="button" onClick={v.resetChat} style={{"alignSelf":"flex-start","fontFamily":"inherit","background":"none","border":"none","color":"var(--text-faint)","fontSize":"11px","letterSpacing":".1em","textTransform":"uppercase","cursor":"pointer","padding":"0","marginTop":"4px"}}>{"Start over"}</button>
          {" "}
        </div>
          {" "}
        </>
      ) : null}
      {" "}
      {v.isC ? (
        <>
          {" "}
          <div style={{"width":"100%","maxWidth":"1040px","display":"grid","gridTemplateColumns":"minmax(0,1.3fr) minmax(0,1fr)","gap":"14px","textAlign":"left"}}>
          {" "}
          <div style={{"borderRadius":"22px","background":"#0a0a0d","border":"1px solid rgba(var(--tint-rgb),.14)","padding":"18px 20px","fontFamily":"ui-monospace,Menlo,monospace","color":"#e6e6ea"}}>
            {" "}
            <div style={{"display":"flex","gap":"6px","marginBottom":"14px"}}>
              <span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#ff5f57"}} />
              <span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#febc2e"}} />
              <span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#28c840"}} />
              <span style={{"marginLeft":"auto","fontSize":"10px","color":"rgba(230,230,234,.4)"}}>{"zebraish ~ new-project"}</span>
            </div>
            {" "}
            <div style={{"fontSize":"13px","color":"#17c98d","marginBottom":"6px"}}>{"$ zebraish build"}</div>
            {" "}
            <textarea value={v.text ?? ""} onChange={v.onType} placeholder={v.ph} rows="4" style={{"width":"100%","boxSizing":"border-box","resize":"none","background":"none","border":"none","outline":"none","color":"#e6e6ea","fontFamily":"inherit","fontSize":"15px","lineHeight":"1.6"}} />
            {" "}
            <button type="button" onClick={v.submit} style={css(`margin-top:10px;font-family:inherit;background:#17c98d;color:#000;border:none;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;opacity:${v.canOp ?? ""}`)}>{"⏎ Run"}</button>
            {" "}
          </div>
          {" "}
          <div style={{"borderRadius":"22px","background":"rgba(var(--tint-rgb),.04)","border":"1px solid rgba(var(--tint-rgb),.14)","padding":"22px 24px","display":"flex","flexDirection":"column","gap":"14px"}}>
            {" "}
            <div style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".2em","textTransform":"uppercase","color":"var(--text-faint)"}}>{"Live project profile"}</div>
            {" "}
            {each(v, v.liveProfile, "p", (v) => (
              <>
                {" "}
                <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","paddingBottom":"10px","borderBottom":"1px solid rgba(var(--tint-rgb),.08)"}}>
                  <span style={{"fontSize":"11px","fontWeight":"600","letterSpacing":".14em","textTransform":"uppercase","color":"var(--text-muted)"}}>{I(v.p?.k)}</span>
                  <span style={css(`font-size:14px;font-weight:700;color:${v.p?.c ?? ""}`)}>{I(v.p?.v)}</span>
                </div>
                {" "}
              </>
            ))}
            {" "}
            <div style={{"marginTop":"auto","fontSize":"12px","color":"var(--text-faint)"}}>{"Updates as you type. Tailored proposal follows."}</div>
            {" "}
          </div>
          {" "}
        </div>
          {" "}
        </>
      ) : null}
      {" "}
      {v.isA ? (
        <>
          {" "}
          <div style={{"width":"100%","maxWidth":"760px","borderRadius":"28px","padding":"1px","background":"linear-gradient(135deg,rgba(var(--tint-rgb),.35),rgba(var(--tint-rgb),.06) 40%,rgba(23,201,141,.4))"}}>
          {" "}
          <div style={{"borderRadius":"27px","background":"rgba(var(--tint-rgb),.04)","backdropFilter":"blur(24px)","padding":"22px 22px 16px","textAlign":"left"}}>
            {" "}
            <textarea value={v.text ?? ""} onChange={v.onType} placeholder={v.ph} rows="3" style={{"width":"100%","boxSizing":"border-box","resize":"none","background":"none","border":"none","outline":"none","color":"var(--text)","fontFamily":"inherit","fontSize":"19px","lineHeight":"1.5"}} />
            {" "}
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","flexWrap":"wrap","marginTop":"10px"}}>
              {" "}
              <div style={{"display":"flex","gap":"6px","flexWrap":"wrap"}}>
                {" "}
                {each(v, v.types, "t", (v) => (
                  <>
                    {" "}
                    <button type="button" onClick={v.t?.pick} style={css(`font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.04em;padding:7px 13px;border-radius:100px;cursor:pointer;background:${v.t?.bg ?? ""};color:${v.t?.fg ?? ""};border:1px solid ${v.t?.bd ?? ""}`)}>{I(v.t?.label)}</button>
                    {" "}
                  </>
                ))}
                {" "}
              </div>
              {" "}
              <button type="button" onClick={v.submit} style={css(`font-family:inherit;display:flex;align-items:center;gap:8px;background:var(--invert-bg);color:var(--invert-fg);border:none;padding:12px 22px;border-radius:100px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;opacity:${v.canOp ?? ""}`)}>{"Build it →"}</button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
          {" "}
          {v.showProfile ? (
          <>
            {" "}
            <div style={{"width":"100%","maxWidth":"760px","marginTop":"16px","borderRadius":"24px","border":"1px solid rgba(23,201,141,.35)","background":"rgba(23,201,141,.05)","padding":"22px 24px","textAlign":"left","display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(160px,1fr))","gap":"14px"}}>
            {" "}
            {each(v, v.profile, "p", (v) => (
              <>
                {" "}
                <div style={css(`display:flex;flex-direction:column;gap:4px;opacity:${v.p?.op ?? ""};transform:translateY(${v.p?.y ?? ""});transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)`)}>
                  {" "}
                  <span style={{"fontSize":"9px","fontWeight":"700","letterSpacing":".18em","textTransform":"uppercase","color":"#17c98d"}}>{I(v.p?.k)}</span>
                  {" "}
                  <span style={{"fontSize":"14px","fontWeight":"700"}}>{I(v.p?.v)}</span>
                  {" "}
                </div>
                {" "}
              </>
            ))}
            {" "}
            <a href="/start" style={{"gridColumn":"1/-1","fontSize":"12px","fontWeight":"700","letterSpacing":".1em","textTransform":"uppercase","color":"#17c98d","textDecoration":"none","marginTop":"6px"}}>{"Project profile generated · Continue to your tailored proposal →"}</a>
            {" "}
          </div>
            {" "}
          </>
        ) : null}
          {" "}
        </>
      ) : null}
      {" "}
      <div style={{"display":"flex","gap":"22px","flexWrap":"wrap","justifyContent":"center","marginTop":"26px","fontSize":"11px","fontWeight":"600","letterSpacing":".12em","textTransform":"uppercase","color":"var(--text-faint,rgba(var(--tint-rgb),.35))"}}>
        {" "}
        <span>{"Websites from £[TBC]"}</span>
        <span>{"Web apps from £[TBC]"}</span>
        <span>{"AI products from £[TBC]"}</span>
        <span>{"Immersive from £[TBC]"}</span>
        {" "}
      </div>
    </section>
    </>
  );
}

export default dcComponent("Idea Prompt", Component, template, {});
