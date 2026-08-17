/* SCROLL RESTORATION FIX */
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* SCROLL PROGRESS */
window.addEventListener('scroll', onScroll, {passive:true});
function onScroll() {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  document.getElementById('scroll-bar').style.width = (y/h*100) + '%';
  /* PARALLAX */
  const bgN = document.getElementById('heroBgName');
  const heroL = document.getElementById('heroLeft');
  if (bgN) bgN.style.transform = `translateY(${y * 0.35}px)`;
  if (heroL) heroL.style.transform = `translateY(${y * 0.1}px)`;
  const hs1 = document.querySelector('.hs-1');
  const hs2 = document.querySelector('.hs-2');
  if (hs1) hs1.style.transform = `translateY(${y * 0.18}px)`;
  if (hs2) hs2.style.transform = `translateY(${y * 0.1}px) scaleX(-1)`;
}

/* CURSOR */
const cur = document.getElementById('cur'), curR = document.getElementById('cur-r');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function animCur(){
  rx+=(mx-rx)*.18; ry+=(my-ry)*.18;
  cur.style.left=mx+'px'; cur.style.top=my+'px';
  curR.style.left=rx+'px'; curR.style.top=ry+'px';
  requestAnimationFrame(animCur);
})();

/* HERO DEVICE TILT */
const dev = document.getElementById('heroDevice');
if (dev) {
  dev.parentElement.addEventListener('mousemove', e => {
    const r = dev.getBoundingClientRect();
    const x = e.clientX-r.left-r.width/2, y = e.clientY-r.top-r.height/2;
    dev.style.transform = `perspective(900px) rotateX(${-(y/r.height)*14}deg) rotateY(${(x/r.width)*14}deg)`;
  });
  dev.parentElement.addEventListener('mouseleave', () => { dev.style.transform=''; });
}

/* SCROLL REVEAL */
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e,i) => {
    if (e.isIntersecting) { setTimeout(()=>e.target.classList.add('visible'), i*70); revObs.unobserve(e.target); }
  });
}, {threshold:.06});
document.querySelectorAll('.reveal,.reveal-scale,.reveal-left,.reveal-right').forEach(r=>revObs.observe(r));

/* STATEMENT WORD REVEAL */
const stmtObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stmt-word').forEach((w,i) => {
        setTimeout(() => w.classList.add('vis'), i * 180);
      });
      stmtObs.unobserve(e.target);
    }
  });
}, {threshold: 0.3});
const stmt = document.getElementById('statement');
if (stmt) stmtObs.observe(stmt);

/* SKILL BARS */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sk-bar-fill').forEach((b,i) => {
        setTimeout(() => { b.style.width = b.dataset.pct + '%'; }, 150 + i*80);
      });
      barObs.unobserve(e.target);
    }
  });
}, {threshold:.2});
const sl = document.querySelector('.skill-list');
if (sl) barObs.observe(sl);

/* RADAR CHART — grayscale */
(function initRadar() {
  const canvas = document.getElementById('skills-radar');
  if (!canvas) return;
  function resize() {
    const w = canvas.parentElement.offsetWidth;
    const size = Math.min(w, 380);
    canvas.width = size; canvas.height = size;
  }
  resize();
  const ctx = canvas.getContext('2d');
  const labels = ['Build','Brand','Automate','Intelligence','Speed','Delivery'];
  const values = [0.97, 0.94, 0.88, 0.60, 0.96, 1.0];
  const colors = ['#e0295f','#e8a93c','#17c98d','#3d7ef0','#17c98d','#e8a93c'];
  const n = labels.length;
  const step = (Math.PI*2)/n;
  let prog = 0;

  function draw(p) {
    const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2, R=Math.min(W,H)*0.36;
    ctx.clearRect(0,0,W,H);
    /* grid */
    for (let lv=1;lv<=5;lv++) {
      const r=(lv/5)*R;
      ctx.beginPath();
      for (let i=0;i<n;i++) {
        const a=i*step-Math.PI/2, x=cx+r*Math.cos(a), y=cy+r*Math.sin(a);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle=`rgba(245,245,247,${.03+lv*.018})`;
      ctx.lineWidth=1; ctx.stroke();
    }
    /* axes + labels */
    for (let i=0;i<n;i++) {
      const a=i*step-Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+R*Math.cos(a), cy+R*Math.sin(a));
      ctx.strokeStyle='rgba(245,245,247,.08)'; ctx.lineWidth=1; ctx.stroke();
      const lx=cx+(R+22)*Math.cos(a), ly=cy+(R+22)*Math.sin(a);
      ctx.fillStyle='rgba(245,245,247,.45)';
      ctx.font=`600 10px -apple-system,Inter,sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(labels[i].toUpperCase(), lx, ly);
    }
    /* filled area */
    const grad=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);
    grad.addColorStop(0,'rgba(224,41,95,.20)');
    grad.addColorStop(.5,'rgba(245,245,247,.10)');
    grad.addColorStop(1,'rgba(61,126,240,.20)');
    ctx.beginPath();
    for (let i=0;i<n;i++) {
      const a=i*step-Math.PI/2, r=values[i]*p*R;
      const x=cx+r*Math.cos(a), y=cy+r*Math.sin(a);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle=grad; ctx.fill();
    ctx.strokeStyle='rgba(245,245,247,.7)'; ctx.lineWidth=1.5; ctx.stroke();
    /* vertex dots */
    for (let i=0;i<n;i++) {
      const a=i*step-Math.PI/2, r=values[i]*p*R;
      const x=cx+r*Math.cos(a), y=cy+r*Math.sin(a);
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fillStyle=colors[i]; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2);
      ctx.fillStyle=colors[i]+'33'; ctx.fill();
    }
  }
  draw(0);
  const rObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let start=null;
      function anim(ts) {
        if (!start) start=ts;
        prog = Math.min((ts-start)/1600,1);
        const ease = 1-Math.pow(1-prog,3);
        draw(ease);
        if (prog<1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
      rObs.disconnect();
    }
  },{threshold:.3});
  rObs.observe(canvas);
})();

/* COUNTER ANIMATION */
function animateCount(el) {
  const raw = el.dataset.count; if (!raw) return;
  const target=parseFloat(raw), suffix=el.dataset.suffix||'', dur=1800, start=performance.now();
  function tick(now) {
    const p=Math.min((now-start)/dur,1), ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(ease*target)+suffix;
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('[data-count]').forEach(animateCount); cntObs.unobserve(e.target); } });
},{threshold:.3});
document.querySelectorAll('#numbers,.hero-stats,.about-values').forEach(s=>cntObs.observe(s));

/* PROCESS TIMELINE */
const ptObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill=document.getElementById('processLineFill');
      const steps=document.querySelectorAll('.process-step');
      if (fill) setTimeout(()=>{fill.style.width='100%'},300);
      steps.forEach((s,i)=>setTimeout(()=>s.classList.add('lit'),400+i*350));
      ptObs.unobserve(e.target);
    }
  });
},{threshold:.3});
const pt=document.querySelector('.process-timeline');
if(pt) ptObs.observe(pt);

/* BENTO CARD 3D TILT */
document.querySelectorAll('.bento-card').forEach(card=>{
  card.addEventListener('mousemove',function(e){
    const r=this.getBoundingClientRect();
    const x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
    this.style.transform=`perspective(1000px) rotateX(${-(y/r.height)*6}deg) rotateY(${(x/r.width)*6}deg) scale(1.01)`;
    this.style.boxShadow=`0 30px 80px rgba(0,0,0,.6),${(x/r.width)*-12}px ${(y/r.height)*-12}px 30px rgba(245,245,247,.12)`;
  });
  card.addEventListener('mouseleave',function(){this.style.transform='';this.style.boxShadow='';});
});

/* DROPDOWN */
document.getElementById('heroDropdown').addEventListener('click',function(e){
  if(e.target.closest('.dropdown-item'))return;
  this.classList.toggle('open');
});
document.addEventListener('click',e=>{
  if(!e.target.closest('#heroDropdown'))document.getElementById('heroDropdown').classList.remove('open');
});

/* LIQUID METAL */
(function(){
  const canvas=document.getElementById('cta-liquid');
  if(!canvas)return;
  const ctx=canvas.getContext('2d'), W=canvas.width, H=canvas.height;
  let t=0;
  function cc(bright,spec){const b=Math.floor(bright*180+40),s=Math.floor(spec*220);return[Math.min(255,b+s),Math.min(255,b+s),Math.min(255,b+s)];}
  function draw(){
    ctx.clearRect(0,0,W,H);
    const cx=W*.5,cy=H*.6;
    const blobs=[{x:cx,y:cy+70,r:100},{x:cx-55+Math.sin(t*.3)*8,y:cy+48,r:72},{x:cx+65+Math.cos(t*.25)*6,y:cy+52,r:68},{x:cx-80+Math.sin(t*.35)*10,y:cy-18+Math.cos(t*.4)*8,r:58},{x:cx-100+Math.sin(t*.3)*12,y:cy-90+Math.cos(t*.35)*6,r:46},{x:cx-70+Math.sin(t*.25)*8,y:cy-155+Math.cos(t*.3)*5,r:35},{x:cx+90+Math.cos(t*.28)*10,y:cy-44+Math.sin(t*.35)*6,r:52},{x:cx+110+Math.cos(t*.25)*8,y:cy-128+Math.sin(t*.3)*5,r:38},{x:cx+85+Math.cos(t*.3)*6,y:cy-195+Math.sin(t*.25)*6,r:28},{x:cx-25+Math.sin(t*.6)*8,y:cy-230+Math.cos(t*.5)*10,r:24},{x:cx+18+Math.cos(t*.55)*6,y:cy-250+Math.sin(t*.45)*8,r:18},{x:cx-55+Math.sin(t*.5)*5,y:cy-265+Math.cos(t*.4)*6,r:13},{x:cx+50+Math.cos(t*.45)*5,y:cy-255+Math.sin(t*.4)*5,r:11},{x:cx-90+Math.sin(t*.7)*5,y:cy-285+Math.cos(t*.5)*8,r:8},{x:cx+80+Math.cos(t*.65)*5,y:cy-278+Math.sin(t*.55)*7,r:7}];
    const step=2,img=ctx.createImageData(W,H),data=img.data;
    for(let py=0;py<H;py+=step)for(let px=0;px<W;px+=step){
      let sum=0;
      for(const b of blobs){const dx=px-b.x,dy=py-b.y;sum+=(b.r*b.r)/(dx*dx+dy*dy+.01);}
      if(sum>1){
        const ang=Math.atan2(py-cy,px-cx);
        const kL=(Math.cos(ang-.8+t*.4)+1)/2,fL=(Math.cos(ang+2.1-t*.2)+1)/2;
        const bright=kL*.72+fL*.28,spec=Math.pow(Math.max(0,Math.cos(ang-.7+t*.5)),7);
        const edge=Math.min(1,(sum-1)*4);
        const[r,g,b]=cc(bright,spec);
        for(let sy=0;sy<step&&py+sy<H;sy++)for(let sx=0;sx<step&&px+sx<W;sx++){
          const idx=((py+sy)*W+(px+sx))*4;
          data[idx]=r;data[idx+1]=g;data[idx+2]=b;data[idx+3]=Math.floor(edge*220);
        }
      }
    }
    ctx.putImageData(img,0,0);
    [{x:cx-75,y:cy-140,r:65},{x:cx+88,y:cy-100,r:50},{x:cx,y:cy+25,r:72}].forEach(b=>{
      const sg=ctx.createRadialGradient(b.x-b.r*.2,b.y-b.r*.3,0,b.x,b.y,b.r);
      sg.addColorStop(0,'rgba(255,255,255,.6)');sg.addColorStop(.35,'rgba(200,200,200,.2)');sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
    });
    t+=.011; requestAnimationFrame(draw);
  }
  draw();
})();

/* START A PROJECT — multi-step flow */
(function(){
  const form = document.getElementById('spForm');
  if (!form) return;
  const panels = [...document.querySelectorAll('.sp-panel')];
  const segs = [...document.querySelectorAll('.sp-step-seg-fill')];
  const backBtn = document.getElementById('spBack');
  const nextBtn = document.getElementById('spNext');
  const successEl = document.getElementById('spSuccess');
  const waLink = document.getElementById('spWaLink');
  const whatInput = document.getElementById('spWhat');
  const moreInput = document.getElementById('spMore');
  let step = 1;
  const total = panels.length;
  let stage = null;
  const needs = new Set();

  function updateSegs(){
    segs.forEach((s,i)=>{ s.style.width = (i < step) ? '100%' : '0%'; });
  }
  function updateNav(){
    backBtn.classList.toggle('show', step > 1);
    if (step === 1) nextBtn.disabled = whatInput.value.trim().length === 0;
    else if (step === 2) nextBtn.disabled = !stage;
    else nextBtn.disabled = false;
    nextBtn.textContent = step === total ? 'Submit →' : 'Next →';
  }
  function showStep(n){
    step = n;
    panels.forEach(p => p.classList.toggle('active', parseInt(p.dataset.panel,10) === step));
    updateSegs();
    updateNav();
  }
  whatInput.addEventListener('input', updateNav);

  document.getElementById('spStage').addEventListener('click', e => {
    const btn = e.target.closest('.sp-chip'); if (!btn) return;
    document.querySelectorAll('#spStage .sp-chip').forEach(c=>c.classList.remove('selected'));
    btn.classList.add('selected');
    stage = btn.dataset.value;
    updateNav();
  });

  document.getElementById('spNeeds').addEventListener('click', e => {
    const btn = e.target.closest('.sp-chip'); if (!btn) return;
    btn.classList.toggle('selected');
    if (btn.classList.contains('selected')) needs.add(btn.dataset.value);
    else needs.delete(btn.dataset.value);
  });

  backBtn.addEventListener('click', () => { if (step > 1) showStep(step - 1); });

  nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    if (step < total) { showStep(step + 1); return; }
    /* submit */
    const what = whatInput.value.trim();
    const needsList = [...needs].join(', ') || 'Not specified';
    const more = moreInput.value.trim() || 'N/A';
    const msg = `Hi Zebraish Studio! Here's what I'm building:\n\n*What:* ${what}\n*Stage:* ${stage}\n*Needs:* ${needsList}\n*More:* ${more}`;
    const url = 'https://wa.me/2348165320780?text=' + encodeURIComponent(msg);
    waLink.href = url;
    form.style.display = 'none';
    document.querySelector('.sp-steps-bar').style.display = 'none';
    successEl.classList.add('active');
    window.open(url, '_blank');
  });

  updateSegs();
  updateNav();
})();
