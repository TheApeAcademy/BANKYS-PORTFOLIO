// @ts-nocheck
/* eslint-disable */
"use client";
// Zebra Head: the studio's 3D logo (apps/studio/components/zebraish/ZebraHead.tsx),
// ported from the Claude Design handoff (Zebra Head.dc.html).
// Logic is the prototype's own class; the template below mirrors its markup 1:1.
import React from "react";
import { DCLogic, dcComponent, each, I, css, hostPositionStyle } from "@/lib/dc";

class Component extends DCLogic {
  wrapRef = React.createRef(); canvasRef = React.createRef();
  static lib() {
    if (!window.__zbHead) window.__zbHead = (async () => {
      const T = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      const gltf = await new GLTFLoader().loadAsync('/zb/assets/zebraish-head-sculpted.glb');
      return { T, RoomEnvironment, src: gltf.scene };
    })();
    return window.__zbHead;
  }
  componentDidMount() {
    const wrap = this.wrapRef.current; if (!wrap) return;
    this.gate = new IntersectionObserver(es => {
      const on = es[es.length - 1].isIntersecting;
      if (on && !this.live) { this.live = true; this.init().catch(e => { console.warn('Zebra Head init failed', e); this.live = false; }); }
      else if (!on && this.live) this.teardown();
    }, { rootMargin: '300px' });
    this.gate.observe(wrap);
  }
  teardown() {
    this.live = false; this.token = (this.token || 0) + 1; cancelAnimationFrame(this.raf);
    this.ro && this.ro.disconnect(); this.ro = null;
    if (this.r) { this.r.dispose(); this.r.forceContextLoss(); this.r = null; }
    const cv = this.canvasRef.current; if (cv) { const n = cv.cloneNode(); cv.replaceWith(n); this.canvasRef.current = n; }
  }
  async init() {
    const tok = this.token = (this.token || 0) + 1;
    const { T, RoomEnvironment, src } = await Component.lib();
    const cv = this.canvasRef.current, wrap = this.wrapRef.current;
    if (!cv || !wrap || this.dead || tok !== this.token) return;
    const v = this.props.variant ?? 'a';
    const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'low-power' }); this.r = r;
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = v === 'b' ? 1.1 : .95;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(this.raf); });
    const scene = new T.Scene();
    const pm = new T.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
    scene.environmentIntensity = v === 'b' ? 1 : .35;
    const cam = new T.PerspectiveCamera(30, 1, .01, 100);
    const key = new T.SpotLight(0xffffff, v === 'b' ? 30 : 60, 0, .45, .6, 1.4); key.position.set(2.2, 4, 3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, v === 'b' ? 1.5 : 2.2); rim.position.set(-3, 2, -3); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, .08));
    const pivot = new T.Group(); scene.add(pivot);
    const obj = src.clone(true);
    const box = new T.Box3().setFromObject(obj), size = box.getSize(new T.Vector3()), ctr = box.getCenter(new T.Vector3());
    obj.position.sub(ctr); pivot.add(obj);
    const wires = [];
    obj.traverse(m => {
      if (!m.isMesh) return; m.castShadow = m.receiveShadow = true;
      const n = (m.name + ' ' + (m.material && m.material.name || '')).toLowerCase();
      if (v === 'b') {
        if (n.includes('white') || n.includes('enamel')) m.material = new T.MeshPhysicalMaterial({ color: 0xf2f2f4, metalness: 1, roughness: .12, clearcoat: 1 });
        else if (n.includes('stripe') || n.includes('lacquer')) m.material = new T.MeshPhysicalMaterial({ color: 0x050506, metalness: .2, roughness: .25, clearcoat: 1, clearcoatRoughness: .05 });
      }
      if (v === 'c') {
        m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0;
        const w = new T.LineSegments(new T.WireframeGeometry(m.geometry), new T.LineBasicMaterial({ color: 0xf5f5f7, transparent: true, opacity: .5 }));
        m.add(w); wires.push({ m, w });
      }
    });
    const R = Math.max(size.x, size.y, size.z);
    cam.position.set(0, R * .12, R * 2.6); cam.lookAt(0, 0, 0);
    const resize = () => { const b = wrap.getBoundingClientRect(); if (!b.width || !this.r) return; r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); };
    resize(); this.ro = new ResizeObserver(resize); this.ro.observe(wrap);
    let rotY = -.6, velY = 0, drag = false, lx = 0, tiltX = 0, ttx = 0, reveal = 0, last = performance.now();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.bound) {
      this.bound = true;
      wrap.addEventListener('pointerdown', e => { this.drag = true; this.lx = e.clientX; wrap.style.cursor = 'grabbing'; wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener('pointermove', e => { const b = wrap.getBoundingClientRect(); this.ttx = ((e.clientY - b.top) / b.height - .5) * .25; if (this.drag) { this.velY = (e.clientX - this.lx) * .008; this.dx = (this.dx || 0) + this.velY; this.lx = e.clientX; } });
      const up = () => { this.drag = false; wrap.style.cursor = 'grab'; }; wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    }
    const loop = now => {
      if (tok !== this.token || this.dead) return; this.raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (this.dx) { rotY += this.dx; this.dx = 0; velY = this.velY || 0; }
      if (!this.drag) { velY *= .94; rotY += velY + (reduce ? 0 : dt * .25); }
      tiltX += ((this.ttx || 0) - tiltX) * .05; pivot.rotation.set(tiltX, rotY, 0);
      pivot.position.y = reduce ? 0 : Math.sin(now / 1400) * R * .012;
      if (v === 'c') { reveal = Math.min(1, reveal + dt * .45); const e = reveal * reveal * (3 - 2 * reveal); wires.forEach(({ m, w }) => { m.material.opacity = e; w.material.opacity = .5 * (1 - e) + .04; }); }
      r.render(scene, cam);
    };
    this.raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() { this.dead = true; this.gate && this.gate.disconnect(); this.teardown(); }
  renderVals() { return { wrapRef: this.wrapRef, canvasRef: this.canvasRef }; }
}

const STYLE = "";

function template(v) {
  return (
    <>
      
      <div ref={v.wrapRef} style={{"position":"relative","width":"100%","height":"100%","minHeight":"160px","cursor":"grab","touchAction":"pan-y"}}>
      {" "}
      <canvas ref={v.canvasRef} style={{"position":"absolute","inset":"0","width":"100%","height":"100%","display":"block"}} />
    </div>
    </>
  );
}

export default dcComponent("Zebra Head", Component, template, {});
