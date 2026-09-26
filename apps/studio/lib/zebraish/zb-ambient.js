/* eslint-disable */
// Ported from the Claude Design handoff (zb-ambient.js). Browser-only side-effect script.
if (typeof window !== "undefined") {
/* Zebraish ambient layer, shared by the inner pages.
   1. Wet hide: a WebGL zebra hide with a glossy, wet sheen, cursor ripples and drifting mist, behind the page.
   2. Site-wide sound: one music loop that resumes across pages (state + position in localStorage), hover and click sounds.
   3. Alive UI: magnetic buttons and a soft cursor light.
   Include with <script src="zb-ambient.js"></script>. Page roots should have a transparent background. */
(function () {
  if (window.__zbAmbient) return; window.__zbAmbient = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, touch = matchMedia('(pointer: coarse)').matches;
  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ready = f => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f) : f();

  // ---------- 1. WET HIDE ----------
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;uniform vec2 uR;uniform float uT,uS,uV;uniform vec2 uM;uniform vec4 uRip[6];uniform vec3 uInk,uBg;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
  float hide(vec2 p){vec2 q=p*1.35+vec2(0.,-uS*.35);vec2 w=vec2(fbm(q*.7+vec2(0.,uT*.02)),fbm(q*.7+vec2(5.2,-uT*.018)));
    float f=q.x*.9+q.y*.3+w.x*1.2+fbm(q*1.3+w)*.6;float v=sin(f*8.);return smoothstep(-.35,.35,v);}
  float rip(vec2 p){float r=0.;for(int i=0;i<6;i++){vec4 k=uRip[i];float age=uT-k.z;if(age<0.||age>3.)continue;float d=length(p-k.xy);float wv=sin(d*38.-age*9.)*exp(-d*5.)*exp(-age*1.3)*k.w;r+=wv;}return r;}
  float H(vec2 p){return hide(p)*.9+rip(p)*.12+fbm(p*9.+uT*.05)*.05;}
  void main(){vec2 uv=gl_FragCoord.xy/uR;float a=uR.x/uR.y;vec2 p=(uv-.5)*vec2(a,1.);
    vec2 m=(uM-.5)*vec2(a,1.);float e=1.5/uR.y;
    float c=H(p),hx=H(p+vec2(e,0.))-c,hy=H(p+vec2(0.,e))-c;vec3 N=normalize(vec3(-hx/e*.018,-hy/e*.018,1.));
    vec3 L=normalize(vec3(m-p,.55)+vec3(.35,.5,0.));vec3 V=vec3(0.,0.,1.);
    float spec=pow(max(dot(reflect(-L,N),V),0.),60.)*(.6+c*.8);float sheen=pow(max(dot(reflect(-normalize(vec3(-.6,.7,.4)),N),V),0.),22.)*.35;
    float fr=pow(1.-N.z,2.)*1.4;
    vec3 col=mix(uBg,mix(uBg,uInk,.2),c);col+=uInk*(spec*.55+sheen*.25+fr*.05);
    float mist=fbm(p*1.1+vec2(uT*.015,-uS*.12))*fbm(p*2.3-vec2(uT*.01,0.));mist=smoothstep(.12,.55,mist);
    col=mix(col,mix(uBg,uInk,.22),mist*.28);
    float glow=exp(-dot(p-m,p-m)*6.)*.05;col+=uInk*glow;
    float vig=smoothstep(1.25,.25,length(p*vec2(.8,1.)));col=mix(uBg,col,.55+.45*vig);
    gl_FragColor=vec4(col,1.);}`;
  function wet() {
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block';
    document.body.prepend(cv); document.body.style.background = '#060608';
    const gl = cv.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    if (!gl) { cv.style.background = '#060608 repeating-linear-gradient(124deg,rgba(245,245,247,.05) 0 2px,transparent 2px 16px)'; return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('wet shader', gl.getShaderInfoLog(o)); return o; };
    window.__zbWetGL = gl;
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) console.warn('wet link', gl.getProgramInfoLog(pr)); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uR', 'uT', 'uS', 'uV', 'uM', 'uRip', 'uInk', 'uBg'].forEach(k => U[k] = gl.getUniformLocation(pr, k));
    let scale = touch ? .45 : .6, t = 0, last = performance.now(), mx = .5, my = .5, tmx = .5, tmy = .5, rips = [], lastRip = 0, fpsA = 0, fpsN = 0;
    const size = () => { cv.width = Math.round(innerWidth * scale); cv.height = Math.round(innerHeight * scale); gl.viewport(0, 0, cv.width, cv.height); };
    size(); addEventListener('resize', size);
    const addRip = (x, y, s) => { rips.unshift([x, y, t, s]); rips = rips.slice(0, 6); };
    addEventListener('pointermove', e => { tmx = e.clientX / innerWidth; tmy = 1 - e.clientY / innerHeight; if (t - lastRip > .35) { lastRip = t; addRip((tmx - .5) * innerWidth / innerHeight, tmy - .5, .5); } }, { passive: true });
    addEventListener('pointerdown', e => addRip((e.clientX / innerWidth - .5) * innerWidth / innerHeight, .5 - e.clientY / innerHeight, 1.4), { passive: true });
    const frame = now => {
      requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      fpsA += dt; fpsN++; if (fpsA > 1.5) { if (fpsN / fpsA < 40 && scale > .3) { scale -= .1; size(); } fpsA = fpsN = 0; }
      mx += (tmx - mx) * .06; my += (tmy - my) * .06;
      const light = document.querySelector('[data-theme="light"]');
      gl.uniform2f(U.uR, cv.width, cv.height); gl.uniform1f(U.uT, t); gl.uniform1f(U.uS, scrollY / innerHeight); gl.uniform2f(U.uM, mx, my);
      const r = new Float32Array(24); rips.forEach((k, i) => r.set(k, i * 4)); for (let i = rips.length; i < 6; i++) r.set([0, 0, -99, 0], i * 4); gl.uniform4fv(U.uRip, r);
      if (light) { gl.uniform3f(U.uInk, .08, .08, .1); gl.uniform3f(U.uBg, .98, .976, .968); } else { gl.uniform3f(U.uInk, .96, .96, .97); gl.uniform3f(U.uBg, .024, .024, .03); }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(frame);
  }

  // ---------- 2. SOUND ----------
  function sound() {
    const music = new Audio('/zb/assets/sfx/ambient-castle.mp3'); music.loop = true; music.volume = 0; music.preload = 'auto';
    const sfx = { hover: '/zb/assets/sfx/hover.mp3', click: '/zb/assets/sfx/click.mp3', whoosh: '/zb/assets/sfx/whoosh.mp3' };
    const pool = {}; Object.keys(sfx).forEach(k => { pool[k] = [0, 1, 2].map(() => { const a = new Audio(sfx[k]); a.preload = 'auto'; return a; }); });
    let on = (LS.get('zb-sound') ?? (touch ? 'off' : 'on')) === 'on', started = false, pi = 0;
    const fade = to => { const from = music.volume, st = performance.now(); const f = n => { const k = Math.min(1, (n - st) / 1200); music.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) requestAnimationFrame(f); else if (to === 0) music.pause(); }; requestAnimationFrame(f); };
    const startMusic = () => { if (!on) return; const tm = parseFloat(LS.get('zb-music-t') || '0'); if (!started && tm) music.currentTime = tm; started = true; music.play().then(() => fade(.28)).catch(() => {}); };
    const play = (k, v) => { if (!on) return; const a = pool[k][pi++ % 3]; try { a.currentTime = 0; a.volume = v; a.play().catch(() => {}); } catch (e) {} };
    window.ZBSound = { play, get on() { return on; }, set(v) { on = v; LS.set('zb-sound', v ? 'on' : 'off'); if (v) startMusic(); else fade(0); paint(); } };
    setInterval(() => { if (!music.paused) LS.set('zb-music-t', String(music.currentTime)); }, 1000);
    addEventListener('pagehide', () => { if (!music.paused) LS.set('zb-music-t', String(music.currentTime)); });
    startMusic();
    const kick = () => { startMusic(); removeEventListener('pointerdown', kick, true); removeEventListener('keydown', kick, true); };
    addEventListener('pointerdown', kick, true); addEventListener('keydown', kick, true);
    const hit = '[data-sfx],a,button,[role="button"],label,summary,input[type="submit"]';
    let lastEl = null, lastT = 0;
    document.addEventListener('pointerover', e => { const el = e.target.closest && e.target.closest(hit); if (el && el !== lastEl && performance.now() - lastT > 60) { lastEl = el; lastT = performance.now(); play('hover', .18); } if (!el) lastEl = null; }, true);
    document.addEventListener('click', e => { const el = e.target.closest && e.target.closest(hit); if (!el) return; const href = el.getAttribute && el.getAttribute('href'); play(href && !href.startsWith('#') && !el.target ? 'whoosh' : 'click', .45); }, true);
    const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('data-ui', '1');
    btn.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:100px;background:rgba(10,10,12,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(245,245,247,.16);color:#f5f5f7;font:700 10px/1 Inter,-apple-system,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;white-space:nowrap';
    const paint = () => { btn.innerHTML = `<span style="display:flex;align-items:flex-end;gap:2px;height:11px">${[.4, .9, .6, .8].map((h, i) => `<span style="width:2px;height:${on ? h * 100 : 25}%;background:currentColor;${on && !reduce ? `animation:zbEq ${0.6 + i * .15}s ease-in-out ${i * .1}s infinite alternate` : ''}"></span>`).join('')}</span>${on ? 'Sound on' : 'Sound off'}`; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); };
    const st = document.createElement('style'); st.textContent = '@keyframes zbEq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}'; document.head.appendChild(st);
    btn.onclick = () => window.ZBSound.set(!on); paint();
    if (!window.ZB_NO_SOUND_UI) document.body.appendChild(btn);
  }

  // ---------- 3. ALIVE UI ----------
  function alive() {
    if (touch || reduce) return;
    const sel = 'a[style*="border-radius:100px"],button[style*="border-radius:100px"],a[style*="border-radius: 100px"],button[style*="border-radius: 100px"],[data-magnet]';
    let cur = null;
    document.addEventListener('pointermove', e => {
      const el = e.target.closest && e.target.closest(sel);
      if (cur && cur !== el) { cur.style.transform = cur.__t0 || ''; cur = null; }
      if (!el) return; if (el.__t0 === undefined) { el.__t0 = el.style.transform || ''; el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'transform .35s cubic-bezier(.16,1,.3,1)'; }
      cur = el; const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `${el.__t0} translate(${(dx * .18).toFixed(1)}px,${(dy * .28).toFixed(1)}px)`;
    }, { passive: true });
  }

  ready(() => { if (!window.ZB_NO_WET) wet(); sound(); alive(); });
})();

}
