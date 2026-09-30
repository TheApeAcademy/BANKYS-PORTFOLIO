/* eslint-disable */
// Ported from the Claude Design handoff (stripes.js). Browser-only side-effect script.
if (typeof window !== "undefined") {
/* Zebraish procedural stripe field. One WebGL fragment shader, three modes:
   0 = Living Hide (organic zebra bands), 1 = Ribbed Light (fine ribs + light sweep),
   2 = Signal Tunnel (stripes wrapped into a vortex). Reacts to cursor, scroll
   position and scroll velocity. Single rAF loop, paused off-screen. */
(function () {
  /* Lite mode. Every page with a stripe field samples its frame rate here; a
     machine that can't hold ~42fps gets html[data-lite] and a 'zb:lite' event,
     and the heavy effects (this shader, the 3D heads, smooth scrolling, big
     glass blurs) step down so scrolling stays responsive. */
  const G = window.__zbPerf || (window.__zbPerf = { lite: false, t0: 0, n: 0, acc: 0, low: 0, last: 0 });
  function goLite() {
    if (G.lite) return; G.lite = true;
    document.documentElement.setAttribute('data-lite', '');
    window.dispatchEvent(new Event('zb:lite'));
  }
  const forced = new URLSearchParams(location.search).has('lite'); // ?lite to preview it
  function sample(now) {
    if (G.lite) return;
    if (forced) { goLite(); return; }
    const d = now - G.last; G.last = now;
    if (!G.t0) G.t0 = now;
    if (now - G.t0 < 2000 || document.hidden || d <= 0 || d > 1000) return;
    G.n++; G.acc += d;
    if (G.acc < 1000) return;
    const fps = G.n * 1000 / G.acc; G.n = G.acc = 0;
    G.low = fps < 42 ? G.low + 1 : 0;
    if (G.low >= 2) goLite();
  }
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uVel;uniform float uScroll;
uniform float uMode;uniform vec3 uInk;uniform vec3 uBg;uniform float uAmt;uniform float uHover;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
 vec2 p=(uv-.5)*vec2(asp,1.);vec2 m=(uMouse-.5)*vec2(asp,1.);
 vec2 d=p-m;float fall=exp(-dot(d,d)*7.)*uHover;vec2 dn=d/(length(d)+.0001);
 float t=uTime;float s=0.;float amt=uAmt;
 if(uMode<.5){
  vec2 q=p*1.5;q.y-=uScroll*.45;q+=dn*fall*.32;
  vec2 w=vec2(fbm(q*.7+vec2(0.,t*.05)),fbm(q*.7+vec2(5.2,-t*.04)));
  float f=q.x*.9+q.y*.35+w.x*1.1+fbm(q*1.3+w)*.55;
  float v=sin(f*15.+t*.18);
  float wd=-.3+.55*n(q*1.4+3.7);
  s=smoothstep(wd-.05,wd+.05,v);
 }else if(uMode<1.5){
  vec2 q=p;q.y-=uScroll*.25;
  float bend=sin(q.y*2.1+t*.5)*.035*(1.+uVel*5.)+(fbm(vec2(q.y*1.3,t*.12))-.5)*.09;
  bend+=dn.x*fall*.06;
  float x=q.x+bend;float N=46.;
  float e=abs(fract(x*N)-.5);
  float line=1.-smoothstep(.06,.2,e);
  float band=exp(-pow((q.y-(fract(t*.035+uScroll*.08)*2.4-1.2))*2.6,2.));
  float band2=.35+.65*smoothstep(.2,.9,fbm(vec2(x*3.,q.y*1.2-t*.05)));
  s=line*(.25+.75*max(band,band2*.6));
 }else{
  vec2 c=m*.4*uHover;vec2 r=p-c;float rad=length(r);float ang=atan(r.y,r.x);
  float z=.32/max(rad,.015)+t*.35+uScroll*1.4;
  float v=sin(z*5.+sin(ang*3.+z*.4)*.9+fbm(vec2(ang*1.5,z*.25))*2.2);
  s=smoothstep(-.12,.12,v)*smoothstep(.03,.42,rad);
 }
 float vig=1.-smoothstep(.35,1.1,length((uv-.5)*vec2(asp*.8,1.)));
 amt*=mix(.55,1.,vig)*(1.+uVel*.8);
 gl_FragColor=vec4(mix(uBg,uInk,clamp(s*amt,0.,1.)),1.);
}`;

  function hex(c) {
    c = (c || '').trim();
    if (c.startsWith('#')) {
      if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      const v = parseInt(c.slice(1, 7), 16);
      return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255];
    }
    const m = c.match(/[\d.]+/g);
    return m ? [m[0] / 255, m[1] / 255, m[2] / 255] : [0, 0, 0];
  }

  function mount(canvas, opts) {
    opts = Object.assign({ mode: 0, amount: 1, scrollEl: window }, opts);
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { canvas.style.display = 'none'; return { set() {}, destroy() {} }; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('stripes shader', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uTime', 'uMouse', 'uVel', 'uScroll', 'uMode', 'uInk', 'uBg', 'uAmt', 'uHover'].forEach(k => U[k] = gl.getUniformLocation(pr, k));

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, raf = 0, visible = true, t = 0, last = performance.now(), frame = 0;
    let mx = .5, my = .5, tmx = .5, tmy = .5, hov = 0, thov = 0, vel = 0, lastS = null, ink = [1, 1, 1], bg = [0, 0, 0];
    const getScroll = () => opts.scrollEl === window ? window.scrollY : opts.scrollEl.scrollTop;
    const readColors = () => { const cs = getComputedStyle(canvas); ink = hex(cs.getPropertyValue('--text') || '#f5f5f7'); bg = hex(cs.getPropertyValue('--bg') || '#060608'); };
    function resize() {
      const r = canvas.getBoundingClientRect();
      const scale = (opts.mode === 1 ? 1 : G.lite ? .38 : .6) * Math.min(devicePixelRatio || 1, G.lite ? 1 : 1.5);
      W = Math.max(2, Math.round(r.width * scale)); H = Math.max(2, Math.round(r.height * scale));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.viewport(0, 0, W, H);
    }
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width; tmy = 1 - (e.clientY - r.top) / r.height;
      thov = (tmx >= 0 && tmx <= 1 && tmy >= 0 && tmy <= 1) ? 1 : 0;
    }
    function onLeave() { thov = 0; }
    let skip = 0;
    function tick(now) {
      raf = requestAnimationFrame(tick);
      sample(now);
      if (G.lite && (skip++ & 1)) return;
      draw(now);
    }
    function draw(now) {
      if (frame % 10 === 0) { const r = canvas.getBoundingClientRect(); visible = r.bottom > 0 && r.top < innerHeight && r.width > 0; }
      if (!visible && frame++ > 2) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (frame++ % 30 === 0) { readColors(); resize(); }
      const s = getScroll(); const vh = (opts.scrollEl === window ? innerHeight : opts.scrollEl.clientHeight) || 1;
      if (lastS === null) lastS = s;
      const v = Math.min(1, Math.abs(s - lastS) / vh * 12); lastS = s;
      vel += (v - vel) * .08;
      mx += (tmx - mx) * .06; my += (tmy - my) * .06; hov += (thov - hov) * .04;
      if (!reduce) t += dt * (1 + vel * 6);
      gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uTime, t); gl.uniform2f(U.uMouse, mx, my);
      gl.uniform1f(U.uVel, reduce ? 0 : vel); gl.uniform1f(U.uScroll, s / vh); gl.uniform1f(U.uMode, opts.mode);
      gl.uniform3fv(U.uInk, ink); gl.uniform3fv(U.uBg, bg);
      gl.uniform1f(U.uAmt, (opts.mode === 1 ? .2 : opts.mode === 2 ? .085 : .075) * opts.amount);
      gl.uniform1f(U.uHover, reduce ? 0 : hov);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const io = { disconnect() {} };
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    addEventListener('resize', resize);
    addEventListener('zb:lite', resize);
    readColors(); resize(); draw(performance.now()); raf = requestAnimationFrame(tick);
    return {
      set(o) { Object.assign(opts, o); resize(); },
      destroy() { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); removeEventListener('resize', resize); removeEventListener('zb:lite', resize); }
    };
  }
  window.ZebraStripes = { mount };
})();

}
