/* eslint-disable */
// ZEBRAISH · world engine. One renderer, modular systems:
// Pattern Engine · Signal System · Stripe World · Environment (Forge) · 3D Core · Services (Idea → Form)
// Project Objects · Systems (stripes → businesses) · Ecosystem Network · Zebra · Camera · Interaction · Performance
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const NOISE = `float h1(float x){return fract(sin(x*127.1)*43758.5453);}
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n2(p);p*=2.03;a*=.5;}return v;}`;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const win = (a, b, c, d, x) => ss(a, b, x) * (1 - ss(c, d, x));
const CORE = new THREE.Vector3(0, 0, -44);

export async function mount(canvas, opts = {}) {
  const mobile = !!opts.mobile, reduce = !!opts.reduce;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
  let dprMax = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75), dpr = Math.min(1.25, dprMax);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor('#040405');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#040405', .03);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environment = envTex;
  const cam = new THREE.PerspectiveCamera(45, 1, .05, 220); cam.position.set(0, 0, 8.5);
  const G = { uT: { value: 0 }, uVel: { value: 0 }, uWarp: { value: 0 }, uSeed: { value: opts.seed || 0 } };

  // ---------------- PATTERN ENGINE (Act I) ----------------
  const PU = { uT: G.uT, uVel: G.uVel, uSeed: G.uSeed, uCount: { value: 0 }, uSolo: { value: 0 }, uM: { value: new THREE.Vector2(99, 99) }, uHov: { value: 0 }, uFade: { value: 1 }, uDim: { value: 0 } };
  const patMat = new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `precision highp float;varying vec3 vW;uniform float uT,uVel,uSeed,uCount,uSolo,uHov,uFade,uDim;uniform vec2 uM;${NOISE}
    float czf(vec2 p,float drift){vec2 q=p*.2+vec2(uSeed*3.1,uSeed*1.7);vec2 w=vec2(fbm(q*.8+vec2(0.,uT*.03)),fbm(q*.8+vec2(5.2,-uT*.025)));return (q.x*.95+q.y*.3+w.x*1.2+fbm(q*1.4+w)*.6)*9.+drift*2.;}
    void main(){
      vec2 p=vW.xy;vec2 d=p-uM;float fall=exp(-dot(d,d)*.35)*uHov;p+=normalize(d+1e-4)*fall*.55;
      float drift=uT*.05*(1.+uVel*9.);
      float cz=czf(p,drift),cz0=czf(vec2(0.),drift);
      float zid=floor(cz),zid0=floor(cz0);float dd=abs(zid-zid0);float rank=zid>zid0?dd*2.-1.:dd*2.;
      float loc=clamp(uCount-rank,0.,1.);float first=1.-step(.5,dd);
      float zf=abs(fract(cz)-.5)*2.;float zw=(.3+.4*h1(zid+uSeed*5.)+(fbm(p*.6)-.5)*.16)*loc;zw=mix(zw,1.25,uSolo*first);
      float zaa=fwidth(cz)*1.6;float Z=(1.-smoothstep(zw-zaa,zw+zaa,zf))*step(.001,loc);
      float vig=1.-smoothstep(4.,11.,length(vW.xy*vec2(.7,1.)));
      float a=mix(mix(.35,1.,vig)*.62*(1.-uDim*.45),1.,uSolo*first)*mix(1.,first,uSolo);
      if(uSolo>0.){float Ws=1.+uSolo*uSolo*18.;float Zs=1.-smoothstep(Ws-zaa,Ws+zaa,abs(cz-zid0-.5)*2.);gl_FragColor=vec4(vec3(.95),mix(Z*a,Zs,smoothstep(0.,.25,uSolo))*uFade);return;}
      gl_FragColor=vec4(vec3(.95),Z*a*uFade);
    }` });
  const pattern = new THREE.Mesh(new THREE.PlaneGeometry(34, 20), patMat); scene.add(pattern);
  // Act I signal streak travelling across the screen
  const streakMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uA;void main(){float x=vUv.x;float core=exp(-pow((vUv.y-.5)*9.,2.));float tail=pow(x,3.);gl_FragColor=vec4(vec3(1.),core*tail*uA);}` });
  const streak = new THREE.Mesh(new THREE.PlaneGeometry(4.5, .16), streakMat); streak.position.set(-12, .45, .05); scene.add(streak);
  const streakHead = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, fog: false })); scene.add(streakHead);

  // ---------------- SIGNAL SYSTEM + STRIPE WORLD (Act II) ----------------
  const PATH = [[0, 0, 8.5], [0, -.1, 4], [.2, -.1, .5], [1, .3, -5], [-.9, -.2, -11], [.7, .4, -17], [-.3, .1, -23], [0, .6, -31]].map(a => new THREE.Vector3(...a));
  const path = new THREE.CatmullRomCurve3(PATH, false, 'catmullrom', .5);
  const sigCurve = new THREE.CatmullRomCurve3(PATH.map((v, i) => i === 0 ? new THREE.Vector3(3.2, .45, .05) : i === 1 ? new THREE.Vector3(1.4, .1, .6) : v.clone().add(new THREE.Vector3(.18, -.34, 0))), false, 'catmullrom', .5);
  const sigGeo = new THREE.TubeGeometry(sigCurve, 400, .009, 6, false), sigGlowGeo = new THREE.TubeGeometry(sigCurve, 400, .035, 8, false);
  const sigMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, fog: false });
  const sigGlowMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const sig = new THREE.Mesh(sigGeo, sigMat), sigGlow = new THREE.Mesh(sigGlowGeo, sigGlowMat); scene.add(sig, sigGlow);
  const sigN = sigGeo.index.count, sigGN = sigGlowGeo.index.count;
  const tunnelCurve = new THREE.CatmullRomCurve3(PATH.slice(2), false, 'catmullrom', .5);
  const TU = { uT: G.uT, uVel: G.uVel, uSeed: G.uSeed, uShow: { value: 0 } };
  const tunnel = new THREE.Mesh(new THREE.TubeGeometry(tunnelCurve, 260, 3, 64, false), new THREE.ShaderMaterial({ uniforms: TU, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false,
    vertexShader: `varying vec2 vUv;varying float vD;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `precision highp float;varying vec2 vUv;varying float vD;uniform float uT,uVel,uSeed,uShow;${NOISE}
    void main(){float x=vUv.x,y=vUv.y;
      float c=x*150.+sin(y*6.2832*2.+x*18.)*.9+fbm(vec2(y*5.,x*9.+uSeed))*2.4-uT*.35*(1.+uVel*7.);
      float id=floor(c);float fr=abs(fract(c)-.5)*2.;float w=.12+.7*h1(id+uSeed*3.);float aa=fwidth(c)*1.5;
      float s=1.-smoothstep(w-aa,w+aa,fr);
      float ends=smoothstep(0.,.06,x)*(1.-smoothstep(.9,1.,x));
      float fade=exp(-vD*.075);
      gl_FragColor=vec4(vec3(.9),s*ends*fade*uShow*.85);}` }));
  scene.add(tunnel);

  // ---------------- ENVIRONMENT: THE FORGE (Act III) ----------------
  const forge = new THREE.Group(); forge.position.copy(CORE); scene.add(forge);
  const matBlack = new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: .38, metalness: .55, envMapIntensity: .6 });
  const matCeramic = new THREE.MeshPhysicalMaterial({ color: '#e9e8e4', roughness: .28, metalness: 0, clearcoat: 1, clearcoatRoughness: .2, envMapIntensity: .5 });
  const matChrome = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .06, metalness: 1, envMapIntensity: 1.3 });
  const matGlass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .04, metalness: .1, transparent: true, opacity: .05, envMapIntensity: 1.2, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: '#070708', roughness: .95, metalness: 0, envMapIntensity: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -3.2; forge.add(floor); floor.material.envMapIntensity = 0;
  for (let i = 0; i < 12; i++) { const a = Math.PI * (1.05 + i / 11 * .9), r = 13 + (i % 3) * 2.2; const h = 9 + (i * 7 % 5) * 2; const pil = new THREE.Mesh(new THREE.BoxGeometry(.9, h, .9), i % 3 === 1 ? matCeramic : matBlack); pil.position.set(Math.cos(a) * r * 1.2, -3.2 + h / 2, Math.sin(a) * r - 1); forge.add(pil); }
  const glassPanels = [];
  for (let i = 0; i < 9; i++) { const g = new THREE.Mesh(new THREE.BoxGeometry(1.6 + (i % 3) * .6, 2.4 + (i % 2), .03), matGlass); const a = Math.PI * (1.08 + i / 8 * .84); g.position.set(Math.cos(a) * 11, .6 + Math.sin(i * 1.7) * 1.6, Math.sin(a) * 9 - 2); g.lookAt(0, g.position.y, 0); g.userData.bob = i; forge.add(g); glassPanels.push(g); }
  const chromes = [[-8.5, -1.6, -6, .55], [7.8, -1.2, -4, .4], [5.5, -1.8, -9, .7]].map(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), matChrome); m.position.set(x, y, z); forge.add(m); return m; });
  const wireA = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(6.4, 1)), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .07 }));
  const wireB = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(9.5, 0)), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .05 }));
  forge.add(wireA, wireB);
  const uiTex = canvasTex(512, 320, (x, w, hh) => { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, 0, w, hh); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(24, 24, 140, 10); for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(255,255,255,${.15 + i * .08})`; x.fillRect(24, 60 + i * 34, 80 + (i * 97 % 300), 14); } x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < 20; i++) x.lineTo(300 + i * 10, 250 - Math.sin(i * .7) * 30 - i * 4); x.stroke(); });
  const codeTex = canvasTex(512, 320, (x) => { x.font = '20px monospace'; ['const idea = new Signal();', 'idea.pattern = zebra(seed);', 'build(idea).then(launch);', '', '<Form of={idea} />', 'await system.connect()'].forEach((l, i) => { x.fillStyle = `rgba(255,255,255,${.35 + (i % 3) * .2})`; x.fillText(l, 20, 40 + i * 42); }); });
  const frags = [];
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .95), new THREE.MeshBasicMaterial({ map: i % 2 ? uiTex : codeTex, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide })); const a = Math.PI * (1.1 + i / 9 * .8); m.position.set(Math.cos(a) * (12 + (i % 2) * 2), -1 + (i % 4) * 1.4, Math.sin(a) * 10 - 2); m.lookAt(0, m.position.y, 6); m.userData.bob = i * 1.3; forge.add(m); frags.push(m); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.9, 4.2, 16, 48, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uA;void main(){float a=pow(vUv.y,1.6)*.22*uA*(1.-abs(vUv.x-.5)*.3);gl_FragColor=vec4(vec3(1.),a);}` }));
  beam.position.set(0, 5, 0); forge.add(beam);
  const dustN = mobile ? 700 : 1600, dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { dustPos[i * 3] = (Math.random() - .5) * 34; dustPos[i * 3 + 1] = Math.random() * 12 - 3; dustPos[i * 3 + 2] = (Math.random() - .5) * 34; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#ffffff', size: .035, transparent: true, opacity: .5, depthWrite: false })); forge.add(dust);
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(6, 10, 4); key.target.position.copy(CORE); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#ffffff', 1.4); rim.position.set(-8, 4, -60); rim.target.position.copy(CORE); scene.add(rim, rim.target);
  const amb = new THREE.AmbientLight('#ffffff', .12); scene.add(amb);
  const spot = new THREE.SpotLight('#ffffff', 60, 30, .42, .7, 1.2); spot.position.set(0, 11, -44); spot.target.position.copy(CORE); scene.add(spot, spot.target);

  // ---------------- 3D CORE ----------------
  const coreGroup = new THREE.Group(); coreGroup.position.copy(CORE); scene.add(coreGroup);
  const cg0 = new THREE.IcosahedronGeometry(1, 4), cg = cg0.index ? cg0.toNonIndexed() : cg0;
  { const P = cg.attributes.position, n = P.count, grp = new Float32Array(n), jit = new Float32Array(n * 3);
    const D = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [.7, .7, .7]];
    for (let i = 0; i < n; i += 3) { const cx = (P.getX(i) + P.getX(i + 1) + P.getX(i + 2)) / 3, cy = (P.getY(i) + P.getY(i + 1) + P.getY(i + 2)) / 3, cz = (P.getZ(i) + P.getZ(i + 1) + P.getZ(i + 2)) / 3; let best = 0, bd = -9; D.forEach((d, k) => { const v = (d[0] * cx + d[1] * cy + d[2] * cz) / Math.hypot(...d); if (v > bd) { bd = v; best = k; } }); const j = [Math.random() - .5, Math.random() - .5, Math.random() - .5]; for (let k = 0; k < 3; k++) { grp[i + k] = best; jit.set(j, (i + k) * 3); } }
    cg.setAttribute('aGrp', new THREE.BufferAttribute(grp, 1)); cg.setAttribute('aJit', new THREE.BufferAttribute(jit, 3)); }
  const SLOTS = [];
  for (let i = 0; i < 7; i++) { const a = (-72 + i * 24) * Math.PI / 180; SLOTS.push(new THREE.Vector3(Math.sin(a) * 4.6, (i % 2 ? -.7 : .7) + .2, Math.cos(a) * 2.4 - .6)); }
  const CU = { uT: G.uT, uVel: G.uVel, uSeed: G.uSeed, uAwake: { value: 0 }, uFrag: { value: 0 }, uDiss: { value: 0 }, uSlots: { value: SLOTS } };
  const coreMat = new THREE.ShaderMaterial({ uniforms: CU, fog: false,
    vertexShader: `attribute float aGrp;attribute vec3 aJit;uniform float uT,uAwake,uFrag;uniform vec3 uSlots[7];varying vec3 vL;varying vec3 vP;
    vec3 shape(vec3 p){float sw=1.+.15*sin(p.y*2.3+uT*.3*uAwake)*cos(p.x*1.7-uT*.18*uAwake)+.09*sin(p.z*3.1+1.3);p*=sw;p.y*=1.9;p.x*=.8;p.z*=.64;
      float tw=p.y*.34+sin(uT*.12)*.1*uAwake;float c=cos(tw),s=sin(tw);p.xz=mat2(c,-s,s,c)*p.xz;return p;}
    void main(){vL=position;vec3 p=shape(position);int g=int(aGrp+.5);vec3 slot=uSlots[0];
      for(int k=0;k<7;k++){if(k==g)slot=uSlots[k];}
      p=mix(p,slot+p*.35+aJit*.6*(1.-uFrag),uFrag);
      vec4 w=modelMatrix*vec4(p,1.);vP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `precision highp float;uniform float uT,uAwake,uDiss,uVel,uSeed,uFrag;varying vec3 vL;varying vec3 vP;${NOISE}
    void main(){vec3 N=normalize(cross(dFdx(vP),dFdy(vP)));vec3 V=normalize(cameraPosition-vP);if(dot(N,V)<0.)N=-N;
      float ang=atan(vL.z,vL.x);float t=uT*.2*uAwake;vec2 q=vec2(ang*.9,vL.y*1.4);
      float warp=fbm(q*1.3+vec2(t*.4,-t*.3)+uSeed)*1.6+sin(ang*2.+vL.y*3.)*.35;float f=vL.y*5.4+warp+t;float v=sin(f*3.14159);
      float wd=-.55+1.1*h(vec2(floor(f)*1.7,3.1+uSeed))+(fbm(q*2.2)-.5)*.5;float s=smoothstep(wd-.03,wd+.03,v);
      s=mix(1.,s,smoothstep(.15,.55,fbm(q*1.6+7.))*.9+.1);
      float edge=1.-smoothstep(0.,.08,abs(v-wd));float lum=step(.74,h(vec2(floor(f)*3.3,1.7)))*uAwake;
      if(uDiss>0.&&fbm(vL.xy*4.+vL.z*2.)<uDiss*1.05)discard;
      vec3 L=normalize(vec3(.55,.8,.45));float diff=max(dot(N,L),0.),fr=pow(1.-max(dot(N,V),0.),3.);float sp=pow(max(dot(reflect(-L,N),V),0.),48.);
      vec3 col=mix(vec3(.03),vec3(.88),s)*(.16+.84*diff)+sp*.4*mix(.35,1.,s);col*=1.-edge*.5;col+=vec3(.7)*fr*.5;col+=vec3(1.)*edge*lum*(1.1+uVel*2.);
      gl_FragColor=vec4(col,1.);}` });
  const core = new THREE.Mesh(cg, coreMat); coreGroup.add(core); core.scale.setScalar(0);

  // ---------------- SERVICES: IDEA → FORM (Act IV / V) ----------------
  const services = new THREE.Group(); services.position.copy(CORE); scene.add(services);
  const svc = [];
  const loadTex = (src, draw) => { const t = new THREE.CanvasTexture(document.createElement('canvas')); t.colorSpace = THREE.SRGBColorSpace; const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { t.image = draw(img); t.needsUpdate = true; }; img.src = src; return t; };
  const cover = (img, w, hgt, bar) => { const c = document.createElement('canvas'); c.width = w; c.height = hgt; const x = c.getContext('2d'); x.fillStyle = '#0c0c0e'; x.fillRect(0, 0, w, hgt); const top = bar ? 34 : 0; const s = Math.max(w / img.width, (hgt - top) / img.height); x.drawImage(img, (w - img.width * s) / 2, top, img.width * s, img.height * s); if (bar) { x.fillStyle = '#1a1a1d'; x.fillRect(0, 0, w, top); ['#666', '#888', '#aaa'].forEach((c2, i) => { x.fillStyle = c2; x.beginPath(); x.arc(20 + i * 18, 17, 5, 0, 7); x.fill(); }); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(w / 2 - 120, 9, 240, 16); } return c; };
  function addSvc(obj, kind) { const g = new THREE.Group(); g.add(obj); g.userData = { kind, spin: 0, hover: 0, ang: new THREE.Vector2(), vel: new THREE.Vector2(), burst: 0 }; services.add(g); svc.push(g); return g; }
  { // 0 Digital products: floating interface
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.2), new THREE.MeshBasicMaterial({ map: uiTex, transparent: true, side: THREE.DoubleSide }));
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.96, 1.26, .02), matGlass); const g = new THREE.Group(); g.add(frame, m); addSvc(g, 'Drag'); }
  { // 1 Websites: browser environment
    const t = loadTex('/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg', img => cover(img, 800, 520, true));
    const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.4, .05), matBlack)); const s = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 1.32), new THREE.MeshBasicMaterial({ map: t })); s.position.z = .03; g.add(s); addSvc(g, 'Drag'); }
  { // 2 Apps: a phone materialises
    const t = loadTex('/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg', img => cover(img, 360, 760, false));
    const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(.72, 1.48, .07), matChrome)); const s = new THREE.Mesh(new THREE.PlaneGeometry(.64, 1.38), new THREE.MeshBasicMaterial({ map: t })); s.position.z = .04; g.add(s); addSvc(g, 'Drag'); }
  { // 3 AI: a neural system that responds
    const N = 420, pos = new Float32Array(N * 3), pts = []; for (let i = 0; i < N; i++) { const y = 1 - i / (N - 1) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(.75); pts.push(v); pos.set([v.x, v.y, v.z], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const lp = []; for (let i = 0; i < N; i += 3) { const j = (i * 7 + 13) % N; lp.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    const g = new THREE.Group(); const P = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: .03, transparent: true, opacity: .9 })); const L = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .14 })); g.add(P, L); g.userData.pulse = P; addSvc(g, 'Play'); }
  { // 4 Automation: nodes connect
    const g = new THREE.Group(); const nodesA = [[-.8, .4, 0], [-.2, .7, .2], [.5, .4, -.1], [.8, -.2, .1], [.1, -.5, 0], [-.6, -.4, .2]].map(a => new THREE.Vector3(...a));
    nodesA.forEach(v => { const s = new THREE.Mesh(new THREE.SphereGeometry(.09, 24, 16), matChrome); s.position.copy(v); g.add(s); });
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [0, 3]]; const lp = []; edges.forEach(([a, b]) => lp.push(...nodesA[a].toArray(), ...nodesA[b].toArray()));
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .5 })));
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); g.add(pulse); g.userData.flow = { pulse, nodesA, edges }; addSvc(g, 'Drag'); }
  { // 5 Brand: typography and visual system assemble
    const t = canvasTex(640, 420, (x, w, hh) => { x.fillStyle = '#efeeea'; x.fillRect(0, 0, w, hh); x.fillStyle = '#0b0b0d'; x.font = '900 190px Inter, Arial'; x.fillText('Aa', 30, 210); x.font = 'italic 900 46px Georgia'; x.fillText('Zebraish', 34, 290); ['#0b0b0d', '#5a5a5e', '#b9b9bc', '#ffffff'].forEach((c, i) => { x.fillStyle = c; x.fillRect(360 + (i % 2) * 120, 50 + Math.floor(i / 2) * 120, 104, 104); x.strokeStyle = '#0b0b0d'; x.strokeRect(360 + (i % 2) * 120, 50 + Math.floor(i / 2) * 120, 104, 104); }); for (let i = 0; i < 12; i++) { x.fillStyle = '#0b0b0d'; x.fillRect(34 + i * 50, 340, 12 + (i * 13 % 30), 50); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.18), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); addSvc(m, 'Drag'); }
  { // 6 Creative technology: the environment starts behaving differently
    const km = new THREE.ShaderMaterial({ uniforms: { uT: G.uT, uSeed: G.uSeed }, vertexShader: `varying vec3 vL;varying vec3 vN;void main(){vL=position;vN=normalMatrix*normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform float uT,uSeed;varying vec3 vL;varying vec3 vN;${NOISE}void main(){float f=(vL.x+vL.y*.6)*9.+fbm(vL.xy*2.+uSeed)*2.-uT*.6;float s=step(.5,fract(f));float l=.3+.7*max(dot(normalize(vN),normalize(vec3(.5,.8,.6))),0.);gl_FragColor=vec4(vec3(mix(.04,.92,s)*l),1.);}` });
    addSvc(new THREE.Mesh(new THREE.TorusKnotGeometry(.45, .14, 180, 24), km), 'Play'); }
  svc.forEach((g, i) => { g.position.copy(SLOTS[i]); g.scale.setScalar(0); g.userData.i = i; g.userData.flowT = 0; g.userData.seen = 0; });
  const rings = SLOTS.map(sl => { const m = new THREE.Mesh(new THREE.RingGeometry(.98, 1, 96), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); m.position.copy(sl); services.add(m); return m; });

  // ---------------- PROJECT OBJECTS ----------------
  const projGroup = new THREE.Group(); projGroup.position.copy(CORE); scene.add(projGroup);
  const projects = (opts.projects || []).map((pj, i, arr) => {
    const w = 1.75, hh = 1.12, n = arr.length, a = (-54 + i * (108 / Math.max(1, n - 1))) * Math.PI / 180;
    const t = pj.img ? loadTex(pj.img, img => { if (pj.logo) { const c = document.createElement('canvas'); c.width = 840; c.height = 540; const x = c.getContext('2d'); x.fillStyle = pj.bg || '#f1f0ec'; x.fillRect(0, 0, 840, 540); const s = Math.min(420 / img.width, 300 / img.height); x.drawImage(img, 420 - img.width * s / 2, 250 - img.height * s / 2, img.width * s, img.height * s); x.fillStyle = '#0b0b0d'; x.font = '800 30px Inter, Arial'; x.textAlign = 'center'; x.fillText(pj.name, 420, 480); return c; } return cover(img, 840, 540, true); })
      : canvasTex(840, 540, (x, W, H) => { x.fillStyle = '#0c0c0e'; x.fillRect(0, 0, W, H); for (let k = 0; k < 26; k++) { x.fillStyle = `rgba(255,255,255,${.04 + (k % 3) * .03})`; x.save(); x.translate(W / 2, H / 2); x.rotate(-.55); x.fillRect(-700, -400 + k * 34, 1400, 6 + (k * 7 % 16)); x.restore(); } x.fillStyle = '#f5f5f7'; x.textAlign = 'center'; x.font = (pj.serif ? 'italic 900 70px Georgia' : '900 76px Inter, Arial'); x.fillText(pj.name, W / 2, H / 2 + 10); x.font = '600 22px Inter, Arial'; x.fillStyle = 'rgba(245,245,247,.6)'; x.fillText(pj.cat.toUpperCase(), W / 2, H / 2 + 60); });
    const g = new THREE.Group(); const fr = new THREE.Mesh(new THREE.BoxGeometry(w + .08, hh + .08, .05), matBlack); const sc = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false })); sc.renderOrder = 5; fr.renderOrder = 4; sc.position.z = .03; g.add(fr, sc);
    g.position.set(Math.sin(a) * 5.6, (i % 2 ? -1.15 : 1.05) + .2, Math.cos(a) * 2 - 1.2 - (i % 2) * .5); g.lookAt(new THREE.Vector3(0, g.position.y, 9)); g.userData = { id: pj.id, i, hover: 0, base: g.position.clone(), mats: [fr.material, sc.material] };
    g.scale.setScalar(0); projGroup.add(g); return g;
  });

  // ---------------- SYSTEMS: stripes → lines → nodes → systems → products → businesses (Act VI) ----------------
  const SN = mobile ? 44 : 72, sysGroup = new THREE.Group(); sysGroup.position.copy(CORE).add(new THREE.Vector3(1.6, .3, -1.5)); sysGroup.scale.setScalar(.62); scene.add(sysGroup);
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, .02), new THREE.MeshBasicMaterial({ color: '#f2f2f2', transparent: true, opacity: 0 }), SN);
  const knots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .1, metalness: 1, envMapIntensity: 1.2, transparent: true, opacity: 0 }), SN * 2);
  sysGroup.add(bars, knots);
  const CL = [[-3.6, 1.1], [-1.2, -1.2], [1.3, 1.2], [3.7, -.9], [0, .1]];
  const segs = Array.from({ length: SN }, (_, i) => { const y = -2.3 + i * (4.6 / SN) + (Math.random() - .5) * .04, x0 = -5 + Math.random() * .8, x1 = 5 - Math.random() * .8; const k = i % 5, a0 = Math.random() * 6.28, a1 = a0 + 1 + Math.random() * 2; const bridge = i % 9 === 0; return { y, x0, x1, th: .015 + Math.pow(Math.random(), 2) * .14, k, a0, a1, r0: .4 + Math.random() * .9, r1: .4 + Math.random() * .9, bridge }; });
  const dm = new THREE.Object3D(), va = new THREE.Vector3(), vb = new THREE.Vector3(), t1 = new THREE.Vector3(), t2 = new THREE.Vector3();
  function updSystems(t, show) {
    const lineT = ss(.14, .3, t), nodeT = ss(.3, .45, t), sysT = ss(.45, .62, t), prodT = ss(.62, .78, t), bizT = ss(.78, .95, t);
    segs.forEach((s, i) => {
      va.set(s.x0, s.y, 0); vb.set(s.x1, s.y, 0);
      const c = CL[s.k], spread = 1 + bizT * .45;
      t1.set(c[0] * spread + Math.cos(s.a0) * s.r0, c[1] * spread + Math.sin(s.a0) * s.r0 * .8, Math.sin(s.a0) * .4); t2.set(c[0] * spread + Math.cos(s.a1) * s.r1, c[1] * spread + Math.sin(s.a1) * s.r1 * .8, Math.cos(s.a1) * .4);
      va.lerp(t1, sysT); vb.lerp(t2, sysT);
      const pr = .62 + bizT * .12; t1.set(c[0] * spread + Math.cos(s.a0 * 2) * pr, c[1] * spread + Math.sin(s.a0 * 2) * pr, 0); t2.set(c[0] * spread + Math.cos(s.a0 * 2 + 1.05) * pr, c[1] * spread + Math.sin(s.a0 * 2 + 1.05) * pr, 0);
      va.lerp(t1, prodT); vb.lerp(t2, prodT);
      if (s.bridge) { const c2 = CL[(s.k + 1) % 5]; t2.set(c2[0] * spread, c2[1] * spread, 0); vb.lerp(t2, bizT); }
      const len = va.distanceTo(vb), th = THREE.MathUtils.lerp(s.th, .012, lineT);
      dm.position.copy(va).add(vb).multiplyScalar(.5); dm.rotation.set(0, 0, Math.atan2(vb.y - va.y, vb.x - va.x)); dm.scale.set(Math.max(.0001, len), th, 1); dm.updateMatrix(); bars.setMatrixAt(i, dm.matrix);
      const kr = .045 * nodeT * (1 + (s.k === 4 ? prodT * .5 : 0)); [va, vb].forEach((v, j) => { dm.position.copy(v); dm.rotation.set(0, 0, 0); dm.scale.setScalar(Math.max(.0001, kr)); dm.updateMatrix(); knots.setMatrixAt(i * 2 + j, dm.matrix); });
    });
    bars.instanceMatrix.needsUpdate = true; knots.instanceMatrix.needsUpdate = true;
    bars.material.opacity = show * .9; knots.material.opacity = show; sysGroup.visible = show > .001;
  }

  // ---------------- ECOSYSTEM NETWORK (Act VII) ----------------
  const ecoGroup = new THREE.Group(); ecoGroup.position.copy(CORE).add(new THREE.Vector3(0, -1.2, 0)); scene.add(ecoGroup);
  const ECO = opts.eco || []; const ecoNodes = ECO.map((e, i) => { const a = i / ECO.length * Math.PI * 2 - Math.PI / 2; const g = new THREE.Group(); g.position.set(Math.cos(a) * 9, 0, Math.sin(a) * 9); const ring = new THREE.Mesh(new THREE.TorusGeometry(.62, .025, 12, 64), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })); ring.rotation.x = -Math.PI / 2; const orb = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? .36 : .26, 32, 24), i === 0 ? matCeramic : matChrome); g.add(ring, orb); g.userData = { id: e.id, i, ring, orb, hover: 0 }; ecoGroup.add(g); return g; });
  const flowMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: G.uT, uA: { value: 0 } }, vertexShader: `attribute float aU;varying float vU;void main(){vU=aU;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `uniform float uT,uA;varying float vU;void main(){float d=step(.45,fract(vU*14.-uT*.6));gl_FragColor=vec4(vec3(1.),(.18+.82*d)*uA*.8);}` });
  if (ecoNodes.length) { const pts = [], us = []; ecoNodes.forEach((g, i) => { const a = g.position, b = ecoNodes[(i + 1) % ecoNodes.length].position; const mid = a.clone().add(b).multiplyScalar(.5).multiplyScalar(1.12).setY(.9); const cv = new THREE.QuadraticBezierCurve3(a, mid, b); const P = cv.getPoints(40); for (let k = 0; k < 40; k++) { pts.push(...P[k].toArray(), ...P[k + 1].toArray()); us.push(k / 40, (k + 1) / 40); } }); const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); fg.setAttribute('aU', new THREE.Float32BufferAttribute(us, 1)); ecoGroup.add(new THREE.LineSegments(fg, flowMat)); }
  const webN = mobile ? 90 : 180, webP = [], webL = []; for (let i = 0; i < webN; i++) { const a = Math.random() * 6.28, r = 3 + Math.pow(Math.random(), .6) * 22; webP.push(new THREE.Vector3(Math.cos(a) * r, -.02, Math.sin(a) * r)); }
  webP.forEach((p, i) => { let best = -1, bd = 1e9; for (let j = 0; j < webN; j++) { if (j === i) continue; const d = p.distanceToSquared(webP[j]); if (d < bd) { bd = d; best = j; } } webL.push(...p.toArray(), ...webP[best].toArray()); if (i % 3 === 0) { const j = (i * 17 + 5) % webN; webL.push(...p.toArray(), ...webP[j].toArray()); } });
  const webGeo = new THREE.BufferGeometry(); webGeo.setAttribute('position', new THREE.Float32BufferAttribute(webL, 3));
  const web = new THREE.LineSegments(webGeo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); ecoGroup.add(web);
  const webDots = new THREE.Points(new THREE.BufferGeometry().setFromPoints(webP), new THREE.PointsMaterial({ color: '#ffffff', size: .06, transparent: true, opacity: 0 })); ecoGroup.add(webDots);

  // ---------------- THE ZEBRA (Act VIII) ----------------
  const zebraGroup = new THREE.Group(); zebraGroup.position.copy(CORE); scene.add(zebraGroup); zebraGroup.visible = false;
  const zebraKey = new THREE.SpotLight('#ffffff', 0, 20, .5, .6, 1.3); zebraKey.position.set(3, 5, 5).add(CORE); zebraKey.target = zebraGroup; scene.add(zebraKey);
  const zebraRim = new THREE.PointLight('#ffffff', 0, 12, 1.6); scene.add(zebraRim);
  let zebra = null, zebraMats = [], heroZebra = null; const heroMats = [];
  const heroGroup = new THREE.Group(), heroPivot = new THREE.Group(); heroGroup.add(heroPivot); scene.add(heroGroup);
  const HERO_POS = new THREE.Vector3(mobile ? 0 : 2.7, mobile ? .9 : -.15, 2.4); heroGroup.position.copy(HERO_POS); heroGroup.scale.setScalar(mobile ? .8 : 1.15);
  const heroLight = new THREE.DirectionalLight('#ffffff', 0); heroLight.position.set(6, 5, 9); heroLight.target = heroGroup; scene.add(heroLight);
  const heroRim = new THREE.PointLight('#ffffff', 0, 10, 1.5); heroRim.position.copy(HERO_POS).add(new THREE.Vector3(-2.2, 1.5, -1.6)); scene.add(heroRim);
  const zebraReady = new GLTFLoader().loadAsync('/zb/assets/zebraish-head-sculpted.glb', e => opts.onLoad && e.total && opts.onLoad(e.loaded / e.total)).then(g => {
    zebra = g.scene; const box = new THREE.Box3().setFromObject(zebra), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const s = 2.5 / Math.max(size.x, size.y, size.z); zebra.scale.setScalar(s); zebra.position.copy(ctr).multiplyScalar(-s);
    zebra.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0; if ('envMapIntensity' in m.material) m.material.envMapIntensity = .5; zebraMats.push(m.material); } });
    const turn = new THREE.Group(); turn.rotation.y = Math.PI / 3; turn.add(zebra); const pivot = new THREE.Group(); pivot.add(turn); zebraGroup.add(pivot); zebraGroup.position.y += .25; zebraGroup.userData.pivot = pivot; if (opts.onLoad) opts.onLoad(1);
    heroZebra = zebra.clone(true); heroZebra.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.opacity = 0; heroMats.push(m.material); } });
    const ht = new THREE.Group(); ht.rotation.y = Math.PI; ht.add(heroZebra); heroPivot.add(ht);
  }).catch(e => { console.warn('zebra load failed', e); if (opts.onLoad) opts.onLoad(1); });

  // ---------------- CAMERA SYSTEM ----------------
  const KEYS = [[.30, [0, .6, -31], [0, 0, -44]], [.36, [0, .8, -35.6], [0, .1, -44]], [.42, [1.3, .4, -37.6], [0, .1, -44]], [.50, [0, 1.5, -33.6], [0, .85, -44]], [.58, [-.3, 1.4, -33.9], [0, .85, -44]], [.64, [0, 2.1, -33.2], [0, .5, -44]], [.72, [0, 1.8, -34], [0, .3, -44]], [.80, [0, .9, -36.2], [0, .3, -44]], [.88, [0, 15, -25], [0, -1.2, -44]], [.95, [0, .45, -37.6], [0, .3, -44]], [1, [0, .45, -37.4], [0, .3, -44]]];
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3(), camLook = new THREE.Vector3(0, 0, 0);
  function camAt(p) {
    if (p < .12) { pos.set(0, 0, 8.5 + (1 - ss(0, .12, p)) * .6); look.set(0, 0, 0); return; }
    if (p < .30) { const u = ss(0, 1, (p - .12) / .18) * .999; path.getPointAt(u, pos); path.getPointAt(Math.min(1, u + .035), look); if (u > .82) look.lerp(CORE, ss(.82, 1, u)); return; }
    let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++; const a = KEYS[i], b = KEYS[i + 1], e = ss(a[0], b[0], p);
    pos.lerpVectors(A.fromArray(a[1]), B.fromArray(b[1]), e); look.lerpVectors(A.fromArray(a[2]), B.fromArray(b[2]), e);
    const orb = win(.8, .84, .88, .92, p) * (p - .8) * 2.2; if (orb) { pos.sub(CORE).applyAxisAngle(UPV, orb).add(CORE); }
  }
  const UPV = new THREE.Vector3(0, 1, 0);
  const CLOSE = new THREE.Vector3(), HERO_CAM = new THREE.Vector3(0, 0, 9.1), zeroV = new THREE.Vector3();
  function introCam() {
    if (intro.hero >= 0) { const e = 1 - Math.pow(1 - Math.min(1, intro.hero), 3); CLOSE.copy(HERO_POS).add(new THREE.Vector3(-.1, .15, 1.55)); pos.lerpVectors(CLOSE, HERO_CAM, e); look.lerpVectors(HERO_POS, zeroV, e); return true; }
    if (intro.zoom > 0) { const e = Math.pow(intro.zoom, 2.4); pos.set(0, 0, THREE.MathUtils.lerp(9.1, 2.2, e)); look.set(0, 0, 0); return true; }
    return false; }
  let focusObj = null, focusT = 0; const fPos = new THREE.Vector3(), fLook = new THREE.Vector3();

  // ---------------- INTERACTION ----------------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9); let mx = 0, my = 0, tmx = 0, tmy = 0, hov = 0, thov = 0, hovered = null, dragging = null, lastPX = 0, lastPY = 0, downAt = 0;
  const mouseWorld = new THREE.Vector2(99, 99);
  const interactive = () => { const L = []; svc.forEach(g => { if (g.scale.x > .3) L.push(g); }); projects.forEach(g => { if (g.scale.x > .3) L.push(g); }); ecoNodes.forEach(g => { if (g.userData.ring.material.opacity > .3) L.push(g); }); return L; };
  function pick() { ray.setFromCamera(ndc, cam); const L = interactive(); const hits = ray.intersectObjects(L, true); if (!hits.length) return null; let o = hits[0].object; while (o && !L.includes(o)) o = o.parent; return o; }
  const isUI = e => e.target && e.target.closest && e.target.closest('a,button,input,textarea,[data-ui]');
  function onMove(e) { const W = innerWidth, H = innerHeight; ndc.set(e.clientX / W * 2 - 1, -(e.clientY / H) * 2 + 1); tmx = ndc.x; tmy = ndc.y; thov = 1; if (dragging) { const dx = e.clientX - lastPX, dy = e.clientY - lastPY; dragging.userData.vel.set(dy * .006, dx * .008); dragging.userData.ang.x += dy * .006; dragging.userData.ang.y += dx * .008; lastPX = e.clientX; lastPY = e.clientY; } }
  function onDown(e) { if (isUI(e)) return; const o = pick(); downAt = performance.now(); if (o && svc.includes(o)) { dragging = o; lastPX = e.clientX; lastPY = e.clientY; } }
  function onUp(e) { const d = dragging; dragging = null; if (isUI(e) || performance.now() - downAt > 260) return; const o = pick(); if (!o) return; if (svc.includes(o)) { o.userData.burst = 1; opts.onClick && opts.onClick('service', o.userData.i); } else if (projects.includes(o)) { opts.onClick && opts.onClick('project', o.userData.id); } else if (ecoNodes.includes(o)) opts.onClick && opts.onClick('eco', o.userData.id); }
  addEventListener('pointermove', onMove, { passive: true }); addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp);

  // ---------------- PERFORMANCE ----------------
  let W = 0, H = 0; function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); cam.aspect = W / H; cam.fov = W / H < .8 ? 62 : 45; cam.updateProjectionMatrix(); }
  resize(); addEventListener('resize', resize);
  let fpsAcc = 0, fpsN = 0, fpsT = 0;
  function adapt(dt) { fpsAcc += dt; fpsN++; fpsT += dt; if (fpsT < 1.2) return; const fps = fpsN / fpsAcc; fpsAcc = fpsN = fpsT = 0; if (fps < 46 && dpr > .6) { dpr = Math.max(.6, dpr - .15); renderer.setPixelRatio(dpr); resize(); } else if (fps > 58 && dpr < dprMax) { dpr = Math.min(dprMax, dpr + .1); renderer.setPixelRatio(dpr); resize(); } }

  // ---------------- MAIN LOOP ----------------
  const intro = { count: 0, solo: 0, zoom: 0, hero: -1, heroOn: false, dim: 0, streak: -1 };
  let raf = 0, last = performance.now(), cursorKind = 'Explore', seedTarget = G.uSeed.value;
  const tmpV = new THREE.Vector3(), labelsOut = [];
  function tick(now) {
    raf = requestAnimationFrame(tick);
    try { step(now); } catch (err) { window.__zbErr = String(err && err.stack || err); }
  }
  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; adapt(dt);
    const st = opts.frame ? opts.frame(dt, now) : { p: 0, vel: 0 }; const p = st.p, vel = st.vel;
    G.uVel.value += (vel - G.uVel.value) * .1; G.uT.value += reduce ? 0 : dt * (1 + G.uVel.value * 5 + G.uWarp.value * 2);
    G.uSeed.value += (seedTarget - G.uSeed.value) * .02;
    mx += (tmx - mx) * .06; my += (tmy - my) * .06; hov += (thov - hov) * .05;
    // camera
    camAt(p); const inIntro = p < .01 && introCam();
    if (focusObj) { focusObj.getWorldPosition(fPos); tmpV.set(0, 0, 1).applyQuaternion(focusObj.getWorldQuaternion(new THREE.Quaternion())); fLook.copy(fPos); fPos.addScaledVector(tmpV, 2.9); }
    focusT += ((focusObj ? 1 : 0) - focusT) * .07; const fe = ss(0, 1, focusT);
    if (fe > .001) { pos.lerp(fPos, fe); look.lerp(fLook, fe); }
    const xq = st.xq || 0; if (xq > 0) { const e = Math.pow(ss(0, .85, xq), 1.6); pos.lerp(tmpV.copy(CORE).add(new THREE.Vector3(.18, .55, .62)), e); look.lerp(new THREE.Vector3(CORE.x + .18, CORE.y + .55, CORE.z), Math.min(1, e * 1.4)); }
    const par = reduce || inIntro || xq > 0 ? 0 : (1 - fe);
    cam.position.set(pos.x + mx * .25 * par, pos.y + my * .15 * par, pos.z);
    if (inIntro) camLook.copy(look); else camLook.lerp(look, .12); cam.lookAt(camLook);
    cam.rotation.z += G.uWarp.value * Math.sin(G.uT.value * .7) * .02 + (p > .13 && p < .3 ? (st.sv || 0) * .06 + Math.sin(G.uT.value * .4) * .015 : 0);
    // pattern (Act I)
    PU.uDim.value = intro.dim || 0; PU.uCount.value = intro.count; PU.uSolo.value = intro.solo; PU.uFade.value = 1 - ss(.125, .158, p);
    const pz = pattern.position.z; mouseWorld.set(mx * 6.5 * cam.aspect * .55, my * 3.6); PU.uM.value.copy(mouseWorld); PU.uHov.value = reduce || intro.zoom > 0 || intro.solo > 0 ? 0 : hov; pattern.visible = PU.uFade.value > .001;
    const sx = intro.streak; streakMat.uniforms.uA.value = sx >= 0 && sx <= 1 ? Math.sin(Math.min(1, sx * 1.2) * Math.PI) * .9 + (sx > .8 ? .5 : 0) : 0; streak.position.x = -11 + sx * 14.5; streakHead.position.set(streak.position.x + 2.25, .45, .06); streakHead.material.opacity = sx > 0 && sx < 1.2 ? 1 : 0;
    // signal
    const sd = ss(.1, .3, p) * .9 + (p > .3 ? .1 : 0); const sFade = 1 - ss(.31, .36, p);
    sigGeo.setDrawRange(0, Math.floor(sigN * Math.min(1, sd + .06) / 6) * 6); sigGlowGeo.setDrawRange(0, Math.floor(sigGN * Math.min(1, sd + .06) / 6) * 6);
    sigMat.opacity = p > .095 ? sFade : 0; sigGlowMat.opacity = p > .095 ? .25 * sFade : 0; sig.visible = sigGlow.visible = sigMat.opacity > .001;
    if (intro.streak >= 1 && p < .1) { sigGeo.setDrawRange(0, Math.floor(sigN * .012 / 6) * 6); sigMat.opacity = 1; sig.visible = true; }
    TU.uShow.value = win(.13, .17, .3, .36, p); tunnel.visible = TU.uShow.value > .001;
    // forge
    const fg = ss(.26, .34, p); forge.visible = p > .2; scene.fog.density = THREE.MathUtils.lerp(.06, .028, fg) * (p > .86 && p < .9 ? 1.4 : 1);
    beam.material.uniforms.uA.value = fg * (1 - ss(.86, .9, p) * .6); wireA.visible = wireB.visible = !(p > .62 && p < .78); wireA.rotation.y += dt * (.03 + G.uWarp.value * .6); wireB.rotation.y -= dt * (.02 + G.uWarp.value * .4); wireA.rotation.x += dt * .01;
    const quiet = 1 - ss(.88, .93, p) * .85;
    glassPanels.forEach(g => { g.position.y += Math.sin(G.uT.value * .4 + g.userData.bob) * .0015 * quiet; g.rotation.y += dt * .02 * quiet; });
    frags.forEach(f => { f.position.y += Math.sin(G.uT.value * .5 + f.userData.bob) * .002 * quiet; f.material.opacity = .3 * fg * (1 - ss(.86, .9, p)); });
    dust.rotation.y += dt * (.01 + G.uWarp.value * .4) * quiet; dust.material.opacity = .45 * fg;
    chromes.forEach((c, i) => { c.position.y += Math.sin(G.uT.value * .3 + i * 2) * .002 * quiet; });
    spot.intensity = 60 * fg * (1 - ss(.86, .9, p));
    // core: evolves, fragments into services, returns to resolve into the zebra
    const coreShow = win(.3, .37, .54, .56, p) + win(.855, .88, .915, .935, p);
    CU.uAwake.value = ss(.35, .44, p) + ss(.86, .9, p); CU.uFrag.value = win(.43, .52, 2, 3, p) * (p < .8 ? 1 : 0) + (p > .8 ? 1 - ss(.855, .885, p) : 0);
    CU.uDiss.value = ss(.51, .555, p) * (p < .8 ? 1 : 0) + (p > .8 ? ss(.9, .935, p) : 0);
    core.scale.setScalar(coreShow * 1.25); core.visible = coreShow > .001;
    core.rotation.y += dt * (.1 + CU.uAwake.value * .25 + G.uVel.value * .8) * quiet;
    // services
    const svShow = win(.47, .55, .64, .68, p);
    svc.forEach((g, i) => { const u = g.userData; const o = svShow * ss(0, 1, (svShow * 7 - i * .5)); const hv = hovered === g ? 1 : 0; u.hover += (hv - u.hover) * .15; u.burst *= .94;
      if (!dragging || dragging !== g) { u.ang.x += u.vel.x; u.ang.y += u.vel.y; u.vel.multiplyScalar(.93); u.ang.x *= .96; }
      g.scale.setScalar(Math.max(.0001, o * (1 + u.hover * .1 + u.burst * .25)));
      g.rotation.set(u.ang.x + Math.sin(G.uT.value * .5 + i) * .08, u.ang.y + Math.sin(G.uT.value * .3 + i * 2) * .25 + u.burst * 6.28, 0);
      g.position.y = SLOTS[i].y + Math.sin(G.uT.value * .6 + i) * .08; g.visible = o > .001;
      if (u.pulse) { u.pulse.material.size = .03 * (1 + Math.sin(G.uT.value * 3) * .3 + u.hover + u.burst * 2); u.pulse.scale.setScalar(1 + u.burst * .9 + u.hover * .15); }
      const rg = rings[i]; rg.lookAt(cam.position); if (o >= .999) u.seen = 1; if (o < .01) u.seen = 0;
      const arrive = u.seen ? 0 : Math.sin(Math.min(1, o) * Math.PI); rg.scale.setScalar(.4 + (u.seen ? 1.25 + u.hover * .15 + u.burst * .6 : o * 1.6));
      rg.material.opacity = Math.max(arrive * .75, u.hover * .4 * o, u.burst * .6); rg.visible = rg.material.opacity > .003; rg.position.y = g.position.y;
      u.flowT += dt * (.8 + u.burst * 7 + u.hover * 1.5); if (u.flow) { const f = u.flow, k = u.flowT % f.edges.length, e = f.edges[Math.floor(k)]; f.pulse.position.lerpVectors(f.nodesA[e[0]], f.nodesA[e[1]], k % 1); } });
    G.uWarp.value += (((hovered && hovered === svc[6]) ? 1 : 0) - G.uWarp.value) * .04;
    // projects
    const pjShow = win(.63, .675, .705, .728, p);
    projects.forEach((g, i) => { const u = g.userData, hv = hovered === g ? 1 : 0; u.hover += (hv - u.hover) * .15; const o = pjShow * ss(0, 1, pjShow * 6 - i * .35); g.scale.setScalar(Math.max(.0001, o * (1 + u.hover * .08))); g.visible = o > .001; g.position.y = u.base.y + Math.sin(G.uT.value * .5 + i) * .06 + u.hover * .12; u.mats[1].opacity = o;
      if (!u.q0) u.q0 = g.quaternion.clone(); g.quaternion.copy(u.q0); g.rotateY(u.hover * mx * .35 + (1 - o) * .9 * (i % 2 ? 1 : -1)); g.rotateX(-u.hover * my * .25 + (1 - o) * .4); });
    // systems
    const syShow = win(.728, .75, .8, .83, p); updSystems(ss(.732, .805, p), syShow);
    // ecosystem
    const ecShow = win(.8, .845, .9, .92, p);
    ecoNodes.forEach((g, i) => { const u = g.userData, hv = hovered === g ? 1 : 0; u.hover += (hv - u.hover) * .15; const o = ecShow * ss(0, 1, ecShow * 5 - i * .4); u.ring.material.opacity = o * (.5 + u.hover * .5); u.ring.scale.setScalar(1 + u.hover * .25 + Math.sin(G.uT.value * 2 + i) * .03); g.scale.setScalar(Math.max(.0001, o)); g.visible = o > .001; });
    flowMat.uniforms.uA.value = ecShow; web.material.opacity = ecShow * .16; webDots.material.opacity = ecShow * .5; ecoGroup.visible = ecShow > .001; web.rotation.y += dt * .01;
    // zebra
    const zb = Math.max(ss(.905, .935, p) * (1 - ss(.962, .99, p) * .82), ss(0, .2, st.xq || 0)), lit = ss(.925, .955, p);
    zebraGroup.visible = zb > .001 && !!zebra; zebraMats.forEach(m => { m.opacity = zb; m.depthWrite = zb > .95; });
    zebraKey.intensity = 45 * lit; zebraRim.intensity = 18 * zb; zebraRim.position.set(CORE.x + Math.cos(G.uT.value * .25) * 2.6, CORE.y + 1.6, CORE.z - 1.8 + Math.sin(G.uT.value * .25) * .8);
    amb.intensity = .12 * (1 - zb * .5);
    if (zebraGroup.userData.pivot) { const pv = zebraGroup.userData.pivot; pv.rotation.y += ((mx * .35) - pv.rotation.y) * .04; pv.rotation.x += ((-my * .12) - pv.rotation.x) * .04; pv.position.y = Math.sin(G.uT.value * .8) * .025; }
    const hz = intro.heroOn ? 1 - ss(.035, .085, p) : 0; heroGroup.visible = hz > .001 && !!heroZebra;
    heroMats.forEach(m => { m.opacity = hz; m.depthWrite = hz > .95; }); heroLight.intensity = 2.6 * hz; heroRim.intensity = 14 * hz;
    heroPivot.rotation.y += ((mx * .4) - heroPivot.rotation.y) * .04; heroPivot.rotation.x += ((-my * .14) - heroPivot.rotation.x) * .04; heroPivot.position.y = Math.sin(G.uT.value * .8) * .03 + p * 12;
    heroGroup.scale.setScalar((mobile ? .8 : 1.15) * (1 - ss(.02, .085, p) * .35));
    // hover + cursor
    hovered = p > .44 && !focusObj ? pick() : null; if (dragging) hovered = dragging;
    const kind = dragging ? 'Drag' : hovered ? (svc.includes(hovered) ? hovered.userData.kind : projects.includes(hovered) ? 'View' : 'Enter') : 'Explore';
    if (kind !== cursorKind) { cursorKind = kind; opts.onCursor && opts.onCursor(kind); }
    // labels projected to screen
    if (opts.onLabels) { labelsOut.length = 0; const put = (id, obj, o, dy) => { obj.getWorldPosition(tmpV); tmpV.y += dy; tmpV.project(cam); labelsOut.push({ id, x: (tmpV.x * .5 + .5) * W, y: (-tmpV.y * .5 + .5) * H, o: tmpV.z < 1 ? o : 0 }); };
      svc.forEach((g, i) => put('svc' + i, g, Math.min(1, g.scale.x) * (1 - fe), [.95, -.95, 1.08, -.95, 1.32, -.95, .95][i])); ecoNodes.forEach(g => put('eco-' + g.userData.id, g, g.userData.ring.material.opacity > .05 ? Math.min(1, g.scale.x) : 0, -.9)); projects.forEach(g => put('pj-' + g.userData.id, g, Math.min(1, g.scale.x) * (1 - fe), -.95));
      opts.onLabels(labelsOut); }
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(tick);
  return {
    intro, zebraReady,
    focus(id) { focusObj = projects.find(g => g.userData.id === id) || null; },
    unfocus() { focusObj = null; },
    nudgeSeed(d) { seedTarget += d; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp); removeEventListener('resize', resize); renderer.dispose(); pmrem.dispose(); },
  };
}

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
