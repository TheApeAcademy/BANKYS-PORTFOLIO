// @ts-nocheck
/* eslint-disable */
"use client";
// Stripe Field: ported from the Claude Design handoff (Stripe Field.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

import "@/lib/zebraish/stripes.js";
class Component extends DCLogic {
  canvasRef = React.createRef();
  modeNum() { const m = this.props.mode ?? 'hide'; return m === 'ribbed' ? 1 : m === 'tunnel' ? 2 : 0; }
  componentDidMount() {
    const c = this.canvasRef.current; if (!c) return;
    if (this.props.live === false) { c.style.display = 'none'; return; }
    c.addEventListener('webglcontextlost', e => { e.preventDefault(); c.style.display = 'none'; if (this.field) { this.field.destroy(); this.field = null; } });
    c.addEventListener('webglcontextrestored', () => { c.style.display = 'block'; this.start(); });
    this.start();
  }
  start() {
    const c = this.canvasRef.current; if (!c) return;
    if (!window.ZebraStripes) { this._t = setTimeout(() => this.start(), 60); return; }
    let root = null, a = c.parentElement;
    for (let i = 0; a && i < 6 && !root; i++, a = a.parentElement) root = a.querySelector('[data-scroll-root]');
    this.field = window.ZebraStripes.mount(c, { mode: this.modeNum(), amount: this.props.amount ?? 1, scrollEl: root || window });
  }
  componentDidUpdate() { if (this.field) this.field.set({ mode: this.modeNum(), amount: this.props.amount ?? 1 }); }
  componentWillUnmount() { clearTimeout(this._t); if (this.field) this.field.destroy(); }
  renderVals() { return { canvasRef: this.canvasRef }; }
}

const STYLE = ":root,[data-theme=\"dark\"]{--bg:#060608;--text:#f5f5f7;--tint-rgb:245,245,247}\n[data-theme=\"light\"]{--bg:#faf9f7;--text:#17171a;--tint-rgb:20,20,24}";

function template(v) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div aria-hidden="true" style={{"position":"absolute","inset":"0","pointerEvents":"none","backgroundColor":"var(--bg)","backgroundImage":"repeating-linear-gradient(124deg,rgba(var(--tint-rgb),.07) 0 2px,transparent 2px 16px),repeating-linear-gradient(118deg,rgba(var(--tint-rgb),.035) 0 9px,transparent 9px 46px)"}}>
      {" "}
      <canvas ref={v.canvasRef} style={{"position":"absolute","inset":"0","width":"100%","height":"100%","display":"block","background":"var(--bg)"}} />
    </div>
    </>
  );
}

export default dcComponent("Stripe Field", Component, template, {});
