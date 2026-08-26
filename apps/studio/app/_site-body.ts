// Extracted verbatim from the original index.html body (minus the START A PROJECT form,
// which now links to /start). Rendered via dangerouslySetInnerHTML to preserve the
// original design pixel-for-pixel; site.css/site.js (in /public) provide styling + behavior.
//
// Two full-body variants (EN/ES) rather than a token-substitution template: the markup
// nests spans/attributes deeply enough that literal duplication is the safe way to keep
// pixel-for-pixel fidelity per language. The nav language toggle sets the same `zb_lang`
// cookie the rest of the Studio app reads (see lib/i18n) and reloads so the server-rendered
// page (this one included) picks the new language on next paint.
import type { Lang } from "@/lib/i18n/dictionary";
import type { Theme } from "@/lib/theme/theme";

const LANG_SCRIPT = `
<script>
function setZbLang(l){document.cookie="zb_lang="+l+"; path=/; max-age="+(60*60*24*365)+"; SameSite=Lax"; location.reload();}
function setZbTheme(t){document.cookie="zb_theme="+t+"; path=/; max-age="+(60*60*24*365)+"; SameSite=Lax"; location.reload();}
</script>
`;

function langToggle(lang: Lang) {
  return `
  <div class="lang-toggle" role="group" aria-label="Language / Idioma">
    <button type="button" class="${lang === "es" ? "active" : ""}" onclick="setZbLang('es')" aria-pressed="${lang === "es"}">ES</button>
    <span class="lang-sep">|</span>
    <button type="button" class="${lang === "en" ? "active" : ""}" onclick="setZbLang('en')" aria-pressed="${lang === "en"}">EN</button>
  </div>`;
}

// A single button rather than a light/dark pair: on mobile the pair packed
// two 19px hit targets edge-to-edge in the nav, well under the ~44px touch
// target phones need, which was almost certainly why taps weren't reliably
// landing on it. One larger button (icon shows the *current* theme; tapping
// switches to the other) needs half the width and gives a single, bigger,
// unambiguous target instead.
function themeToggle(theme: Theme) {
  const next = theme === "light" ? "dark" : "light";
  const icon =
    theme === "light"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z"/></svg>`;
  return `<button type="button" class="theme-toggle-btn" onclick="setZbTheme('${next}')" aria-label="Switch to ${next} mode">${icon}</button>`;
}

const SITE_BODY_EN = (lang: Lang, theme: Theme) => `
<div id="scroll-bar"></div>
${LANG_SCRIPT}

<!-- NAV -->
<nav>
  <a class="nav-logo" href="#hero"><img class="logo-mark" src="zebraish-mark.png" alt="Zebraish">ZEBRAISH<span class="nav-logo-tag">Studio</span></a>
  <ul class="nav-links">
    <li><a href="#build">Build</a></li>
    <li><a href="#work">Work</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#approach">Approach</a></li>
    <li><a href="#collaborate">Collaborate</a></li>
    <li><a href="#partner">Partner</a></li>
  </ul>
  <div class="nav-right">
    ${themeToggle(theme)}
    ${langToggle(lang)}
    <a href="#start-a-project" class="nav-cta">Start a Project</a>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="hero-stripes stripe-bg hs-1"></div>
  <div class="hero-stripes stripe-bg hs-2"></div>
  <div class="hero-bg-name" id="heroBgName">STUDIO</div>
  <div class="hero-grid-lines"></div>
  <div class="hero-left" id="heroLeft">
    <div class="hero-badge"><span class="badge-dot"></span>Zebraish Studio · Founder-Led · Building Now</div>
    <div class="hero-type">
      <span class="hero-type-thin">you have the idea.</span>
      <span class="hero-name">WE BUILD <span class="stripe-mark hero-name-accent">WHAT'S NEXT</span></span>
      <span class="hero-type-sub">Idea &nbsp;·&nbsp; <span style="font-weight:900;color:var(--text)">Build</span> &nbsp;·&nbsp; Launch</span>
    </div>
    <p class="hero-sub">I'm the founder behind <em>Zebraish Studio</em>, the build layer of the Zebraish ecosystem. I turn ideas into real, hand-built digital products. No templates. No agency bloat.</p>
    <div class="hero-actions">
      <a href="#start-a-project" class="btn-primary">Tell Us What You're Building →</a>
      <div class="dropdown-wrap" id="heroDropdown">
        <button class="dropdown-trigger">Message Directly <span class="arrow">▾</span></button>
        <div class="dropdown-menu">
          <a href="https://wa.me/2348165320780" class="dropdown-item" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/></svg>
            WhatsApp
          </a>
          <a href="mailto:j0shbankole19@gmail.com" class="dropdown-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
            Email
          </a>
          <a href="https://www.snapchat.com/add/j0shh.b?share_id=yZ3VJ6-qGXQ&locale=en-US" class="dropdown-item" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 3c-2.183 0-4.415 1.188-4.415 4.63v.621c0 .138-.07.266-.183.342l-.913.589c-.152.098-.243.268-.243.45 0 .098.028.194.08.278l.73 1.158c.093.148.1.335.018.489-.254.472-.722.742-1.24.742-.15 0-.305-.024-.452-.07l-.012-.004c-.093-.026-.183-.04-.268-.04-.253 0-.467.131-.544.327-.041.105-.107.38.238.65.572.45 1.475.791 2.782.99.085.012.155.073.18.156l.135.45c.047.155.19.255.348.255.048 0 .097-.009.145-.027.301-.115.618-.173.944-.173.295 0 .584.05.86.148.565.199 1.04.594 1.354.95.315-.356.79-.751 1.354-.95.276-.098.565-.148.86-.148.326 0 .643.058.944.173.048.018.097.027.145.027.158 0 .301-.1.348-.255l.135-.45c.025-.083.095-.144.18-.156 1.307-.199 2.21-.54 2.782-.99.345-.27.279-.545.238-.65-.077-.196-.291-.327-.544-.327-.085 0-.175.014-.268.04l-.012.004c-.147.046-.302.07-.452.07-.518 0-.986-.27-1.24-.742-.082-.154-.075-.341.018-.489l.73-1.158c.052-.084.08-.18.08-.278 0-.182-.091-.352-.243-.45l-.913-.589c-.113-.076-.183-.204-.183-.342v-.621C16.581 4.188 14.349 3 12.166 3Z"/></svg>
            Snapchat
          </a>
        </div>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><span class="stat-n" data-count="10" data-suffix="+">0+</span><span class="stat-l">Sites Shipped</span></div>
      <div class="stat-divider"></div>
      <div class="hero-stat"><span class="stat-n" data-count="5">0</span><span class="stat-l">Industries</span></div>
      <div class="stat-divider"></div>
      <div class="hero-stat"><span class="stat-n">5★</span><span class="stat-l">Rating</span></div>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-device" id="heroDevice">
      <video autoplay muted loop playsinline><source src="3d-broadcast.mp4" type="video/mp4"></video>
      <div class="hero-device-shine"></div>
    </div>
    <div class="hero-float-1"><span class="float-dot" style="background:var(--green)"></span>5–10 Day Delivery</div>
    <div class="hero-float-2"><span class="float-dot" style="background:#fff"></span>100% Hand-Built</div>
  </div>
</section>

<!-- TICKER -->
<div class="ticker">
  <div class="ticker-track">
    <span class="ticker-item hi">Build</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Intelligence</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Automate</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Brand</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Grow</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Idea → Product</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Zebraish Ecosystem</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Founder-Led</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Build</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Intelligence</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Automate</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Brand</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Grow</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Idea → Product</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Zebraish Ecosystem</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Founder-Led</span><span class="ticker-sep">◆</span>
  </div>
</div>

<!-- STATEMENT / MANIFESTO -->
<section id="statement">
  <div class="stmt-inner">
    <div class="stmt-label reveal">The Philosophy</div>
    <div style="overflow:hidden"><span class="stmt-thin stmt-word">every idea deserves to become</span></div>
    <div style="overflow:hidden;margin:8px 0"><span class="stmt-bold stmt-word exotic exotic-wine" style="transition-delay:.15s">SOMETHING</span></div>
    <div style="overflow:hidden"><span class="stmt-bold stmt-outline stmt-word exotic" style="transition-delay:.3s">REAL.</span></div>
    <div class="stmt-spacer"></div>
    <div style="overflow:hidden"><span class="stmt-thin stmt-word" style="transition-delay:.45s">no two businesses are the same,</span></div>
    <div style="overflow:hidden;margin-top:8px"><span class="stmt-bold stmt-word stripe-mark" style="transition-delay:.6s">NEITHER ARE WE.</span></div>
  </div>
</section>

<!-- WHAT WE BUILD -->
<section class="section" id="build">
  <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="3d-react.mp4" type="video/mp4"></video></div>
  <div class="s-label reveal">01 · What We Build</div>
  <h2 class="s-h2 reveal">IDEAS BECOME <span class="stripe-mark">INFRASTRUCTURE</span></h2>
  <p class="s-sub reveal">Website or full software system, Zebraish Studio figures out what your idea actually needs to become real.</p>
  <div class="skills-layout">
    <div class="radar-wrap reveal-left">
      <canvas id="skills-radar"></canvas>
      <div class="radar-legend">
        <div class="rl-item"><span class="rl-dot" style="background:var(--wine)"></span>Build</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--gold)"></span>Brand</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--emerald)"></span>Automate</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--sapphire)"></span>Intelligence</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--emerald)"></span>Speed</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--gold)"></span>Delivery</div>
      </div>
    </div>
    <div class="skill-list reveal-right">
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Build</span><span class="sk-pct" style="color:var(--wine)">97%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="97" style="background:repeating-linear-gradient(90deg,var(--wine) 0 6px,rgba(224,41,95,.25) 6px 6px,rgba(224,41,95,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Websites · Web Apps · Software</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Brand</span><span class="sk-pct" style="color:var(--gold)">94%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="94" style="background:repeating-linear-gradient(90deg,var(--gold) 0 6px,rgba(232,169,60,.25) 6px 6px,rgba(232,169,60,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Identity · Typography · Design Systems</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Automate</span><span class="sk-pct" style="color:var(--emerald)">88%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="88" style="background:repeating-linear-gradient(90deg,var(--emerald) 0 6px,rgba(23,201,141,.25) 6px 6px,rgba(23,201,141,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Workflows · Integrations · CRM</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Intelligence</span><span class="sk-pct" style="color:var(--sapphire)">60%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="60" style="background:repeating-linear-gradient(90deg,var(--sapphire) 0 6px,rgba(61,126,240,.25) 6px 6px,rgba(61,126,240,.25) 6px 10px)"></div></div>
        <div class="sk-tags">AI &amp; Analytics · Available on Request</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Grow</span><span class="sk-pct" style="color:var(--emerald)">82%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="82" style="background:repeating-linear-gradient(90deg,var(--emerald) 0 6px,rgba(23,201,141,.25) 6px 6px,rgba(23,201,141,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Launch Strategy · The Board (Coming)</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Live Deployment</span><span class="sk-pct" style="color:var(--gold)">100%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="100" style="background:repeating-linear-gradient(90deg,var(--gold) 0 6px,rgba(232,169,60,.25) 6px 6px,rgba(232,169,60,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Vercel · Custom Domain · SSL</div>
      </div>
    </div>
  </div>
</section>

<!-- TWO-WAY MARQUEE -->
<div class="mq-section">
  <div class="mq-row mq-row-1">
    <div class="mq-inner">
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>HTML5</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>CSS3</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>JavaScript</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Canvas API</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>WhatsApp</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Vercel</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Automation</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Zebraish Ecosystem</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>HTML5</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>CSS3</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>JavaScript</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Canvas API</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>WhatsApp</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Vercel</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Automation</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Zebraish Ecosystem</span>
    </div>
  </div>
  <div class="mq-row mq-row-2" style="margin-top:8px">
    <div class="mq-inner">
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Typography</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Brand Systems</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Dark Editorial</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Motion Design</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Mobile-First</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>Custom Cursor</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Glassmorphism</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Founder-Led</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Typography</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Brand Systems</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Dark Editorial</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Motion Design</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Mobile-First</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>Custom Cursor</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Glassmorphism</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Founder-Led</span>
    </div>
  </div>
</div>

<!-- BY THE NUMBERS -->
<section id="numbers">
  <div style="position:relative;z-index:2">
    <div class="s-label reveal" style="justify-content:center">The Proof</div>
    <h2 class="s-h2 reveal" style="text-align:center;margin-bottom:0">NUMBERS THAT<br><span class="thin">speak</span> <span class="stripe-mark">LOUDER</span></h2>
  </div>
  <div class="numbers-grid">
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big" data-count="10" data-suffix="+">0</span><div class="num-label">Sites Built &amp; Live</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big" data-count="5">0</span><div class="num-label">Industries Served</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big">∞</span><div class="num-label">Revisions Included</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big">5★</span><div class="num-label">Client Satisfaction</div></div>
  </div>
</section>

<!-- SELECTED WORK -->
<section class="section" id="work">
  <div class="s-label reveal">02 · Selected Work</div>
  <h2 class="s-h2 reveal">REAL WORK. <span class="stripe-mark">REAL PROOF.</span></h2>
  <p class="s-sub reveal">Nine live sites, nine different worlds, built by the founder before and during the formation of Zebraish Studio. This is the capability the Studio is built on.</p>
  <div class="bento-grid">

    <!-- 01 PM PORTFOLIO -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&auto=format" alt="PM Portfolio" loading="lazy">
        <div class="bento-brand"><span class="bno-name">PM PORTFOLIO</span><span class="bno-tag">Product &amp; Frontend Builder</span></div>
        <div class="bento-overlay"><a href="https://pm-portfolio-steel-rho.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">01</div>
        <div class="bento-title">PM Portfolio: Product &amp; Frontend Builder</div>
        <p class="bento-desc">Personal product portfolio. PM thinking meets frontend execution: real products shipped to production, presented in a clean dark interface.</p>
        <div class="bento-tags"><span class="bento-tag">Product</span><span class="bento-tag">Frontend</span><span class="bento-tag">Portfolio</span></div>
        <div class="bento-footer"><span class="bento-industry">Tech &amp; Product</span><a href="https://pm-portfolio-steel-rho.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 02 MALAAK -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="a3eb67a33eb96ed907adcdd7619cb9d5.jpg" alt="MALAAK" loading="lazy">
        <div class="bento-brand"><span class="bno-name">MALAAK</span><span class="bno-tag">Modest Luxury Abayas</span></div>
        <div class="bento-overlay"><a href="https://malaak-abaya.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">02</div>
        <div class="bento-title">MALAAK: Modest Luxury Abayas</div>
        <p class="bento-desc">Minimal editorial fashion site. Split-hero layout, hover-reveal product grid, seamless WhatsApp order flow. Built for Snapchat-native buyers.</p>
        <div class="bento-tags"><span class="bento-tag">Fashion</span><span class="bento-tag">Editorial</span><span class="bento-tag">WhatsApp</span></div>
        <div class="bento-footer"><span class="bento-industry">Modest Fashion</span><a href="https://malaak-abaya.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 03 DOBERMAN (full width feature) -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="b78ad4f230a4015d24a420fce2a7d53b.jpg" alt="Doberman" loading="lazy">
        <div class="bento-brand"><span class="bno-name">DOBERMAN</span><span class="bno-tag">Bold Brand Experience</span></div>
        <div class="bento-overlay"><a href="https://doberman-kappa.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-meta">
          <div class="bento-num">03</div>
          <div class="bento-title">Doberman: Bold Brand Experience</div>
          <div class="bento-tags"><span class="bento-tag">Brand</span><span class="bento-tag">Dark Bold</span><span class="bento-tag">Interactive</span></div>
          <div class="bento-footer"><span class="bento-industry">Brand &amp; Identity</span><a href="https://doberman-kappa.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
        </div>
        <p class="bento-desc">High-impact brand site. Aggressive typography, dramatic dark palette, and a conversion-focused layout that commands attention and demands action.</p>
      </div>
    </div>

    <!-- 04 CHRISTIAN PRIETO -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=400&fit=crop&auto=format" alt="Christian Prieto" loading="lazy">
        <div class="bento-brand"><span class="bno-name">CHRTT.PRIETO</span><span class="bno-tag">Fashion & Lifestyle Creator</span></div>
        <div class="bento-overlay"><a href="https://christain-theapeacademys-projects.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">04</div>
        <div class="bento-title">Christian Prieto: Digital Creator</div>
        <p class="bento-desc">Sleek creator portfolio built for a Barcelona-based fashion and lifestyle creator. Stats-forward layout, TikTok-native aesthetic, and a seamless brand collab flow, with 9.6M likes and counting.</p>
        <div class="bento-tags"><span class="bento-tag">Creator</span><span class="bento-tag">Fashion</span><span class="bento-tag">TikTok</span></div>
        <div class="bento-footer"><span class="bento-industry">Creator Economy</span><a href="https://christain-theapeacademys-projects.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 05 APE ACADEMY -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="Screenshot_20260412-220250_Chrome.png" alt="Ape Academy" loading="lazy">
        <div class="bento-brand"><span class="bno-name">APE ACADEMY</span><span class="bno-tag">Academic Excellence</span></div>
        <div class="bento-overlay"><a href="https://deploy-1-p1ke.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">05</div>
        <div class="bento-title">Ape Academy: Academic Excellence</div>
        <p class="bento-desc">Clean, bold educational platform. Strong brand identity, structured content layout, and a no-nonsense conversion flow built for serious learners.</p>
        <div class="bento-tags"><span class="bento-tag">Education</span><span class="bento-tag">Dark Theme</span><span class="bento-tag">Bold</span></div>
        <div class="bento-footer"><span class="bento-industry">Education</span><a href="https://deploy-1-p1ke.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 06 AAURA -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="ae7685b3f6993315e423325f7889a7f4.jpg" alt="AAURA" loading="lazy">
        <div class="bento-brand"><span class="bno-name">AAURA</span><span class="bno-tag">Arabian Luxury Perfumery</span></div>
        <div class="bento-overlay"><a href="https://aaura-perfume.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">06</div>
        <div class="bento-title">AAURA: Arabian Luxury Perfumery</div>
        <p class="bento-desc">Animated gold particle field, arabesque typography, WhatsApp ordering. Every pixel drips with money.</p>
        <div class="bento-tags"><span class="bento-tag">Luxury</span><span class="bento-tag">Canvas FX</span><span class="bento-tag">Arabic</span></div>
        <div class="bento-footer"><span class="bento-industry">Fragrance</span><a href="https://aaura-perfume.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 07 NOIR ATELIER -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop&auto=format" alt="NOIR ATELIER" loading="lazy">
        <div class="bento-brand"><span class="bno-name">NOIR ATELIER</span><span class="bno-tag">Luxury Ready-to-Wear</span></div>
        <div class="bento-overlay"><a href="https://noir-atelier-clothing.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">07</div>
        <div class="bento-title">NOIR ATELIER: Luxury Ready-to-Wear</div>
        <p class="bento-desc">Custom magnetic cursor, scrolling marquee, French-named product grid. Bold. Cold. Unforgettable.</p>
        <div class="bento-tags"><span class="bento-tag">High Fashion</span><span class="bento-tag">B&amp;W</span></div>
        <div class="bento-footer"><span class="bento-industry">Apparel</span><a href="https://noir-atelier-clothing.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 08 EMBER & SALT -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format" alt="Ember & Salt" loading="lazy">
        <div class="bento-brand"><span class="bno-name">EMBER &amp; SALT</span><span class="bno-tag">Wood-Fired Restaurant</span></div>
        <div class="bento-overlay"><a href="https://ember-salt-restaurant.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">08</div>
        <div class="bento-title">Ember &amp; Salt: Wood-Fired Restaurant</div>
        <p class="bento-desc">CSS animated flame, warm ember palette, seasonal menu tabs, reservation CTA. You can almost smell the smoke.</p>
        <div class="bento-tags"><span class="bento-tag">Restaurant</span><span class="bento-tag">Animation</span></div>
        <div class="bento-footer"><span class="bento-industry">Food &amp; Drink</span><a href="https://ember-salt-restaurant.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

    <!-- 09 REVERIE -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="4c7faa2cf965371c0d8c790e9d5f61a1.jpg" alt="Reverie" loading="lazy">
        <div class="bento-brand"><span class="bno-name">REVERIE</span><span class="bno-tag">Luxury Beauty Salon</span></div>
        <div class="bento-overlay"><a href="https://reverie-salon.vercel.app/" class="bento-live" target="_blank">Live Preview →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">09</div>
        <div class="bento-title">Reverie: Luxury Beauty Salon</div>
        <p class="bento-desc">Soft marble luxury aesthetic. Services grid, team showcase, WhatsApp booking integration.</p>
        <div class="bento-tags"><span class="bento-tag">Beauty</span><span class="bento-tag">Marble</span></div>
        <div class="bento-footer"><span class="bento-industry">Beauty</span><a href="https://reverie-salon.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Live Site</a></div>
      </div>
    </div>

  </div>
  <p class="work-honesty reveal">These projects were built by the founder, some before Zebraish Studio existed as a name. They're shown here as honest proof of capability, not as claimed Zebraish Studio client work.</p>
  <div class="projects-more reveal">
    <a href="all-work.html" class="btn-more">View All Work <span class="btn-more-arrow">→</span></a>
  </div>
</section>

<!-- HOW WE WORK -->
<section class="section" id="process">
  <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="3d-control.mp4" type="video/mp4"></video></div>
  <div class="s-label reveal">03 · How We Work</div>
  <h2 class="s-h2 reveal">FROM IDEA<br><span class="stripe-mark thin">TO LIVE.</span></h2>
  <p class="s-sub reveal">Four steps. No bloat, no bureaucracy, just a founder who ships.</p>
  <div class="process-timeline">
    <div class="process-line"></div>
    <div class="process-line-fill" id="processLineFill"></div>
    <div class="process-steps">
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">01</span></div><h4>Tell Us What You're Building</h4><p>Fill out the Start a Project flow or message directly. Tell us what your idea or business needs. Takes 5 minutes.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">02</span></div><h4>We Shape a Direction</h4><p>Within 48 hours you get a visual direction, structure, and a flat project price.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">03</span></div><h4>We Build It</h4><p>The full product gets built and sent to you as a live preview link. You review, we refine until it's exactly right.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">04</span></div><h4>You Launch</h4><p>Once you're happy, it goes live. From there, the wider Zebraish ecosystem is there to help you keep growing.</p></div>
    </div>
  </div>
</section>

<!-- THE ZEBRAISH APPROACH -->
<section class="section" id="approach">
  <div class="s-label reveal">04 · The Bigger Picture</div>
  <h2 class="s-h2 reveal">STUDIO IS THE <span class="exotic exotic-emerald">FIRST STEP.</span></h2>
  <p class="s-sub reveal">Zebraish Studio is the build layer of a larger ecosystem, one that's still being built, on purpose, in the open.</p>

  <div class="approach-flow reveal">
    <div class="af-node"><div class="af-node-label">Idea</div><div class="af-node-sub">You</div></div>
    <div class="af-connector"></div>
    <div class="af-node"><div class="af-node-label">Zebraish Studio</div><div class="af-node-sub">Build</div></div>
    <div class="af-connector"></div>
    <div class="af-node"><div class="af-node-label">Launch</div><div class="af-node-sub">Live Product</div></div>
    <div class="af-connector"></div>
    <div class="af-node dim"><div class="af-node-label">The Board</div><div class="af-node-sub">In Development</div></div>
    <div class="af-connector"></div>
    <div class="af-node dim"><div class="af-node-label">Grow</div><div class="af-node-sub">Discover · Learn</div></div>
  </div>

  <div class="approach-verticals reveal">
    <div class="av-card active">
      <div class="av-tag live">Live Today</div>
      <div class="av-title">Zebraish Studio</div>
      <p class="av-desc">The build layer. Turns ideas and businesses into real websites, software, brand and automation: what this page is.</p>
    </div>
    <div class="av-card">
      <div class="av-tag">In Development</div>
      <div class="av-title faint">The Board</div>
      <p class="av-desc">Where businesses built with Studio can eventually launch, gather feedback, and be discovered. Not built yet, part of the roadmap.</p>
    </div>
    <div class="av-card">
      <div class="av-tag">In Development</div>
      <div class="av-title faint">Zebraish Fashion</div>
      <p class="av-desc">The cultural and creative arm of Zebraish, an animal-inspired fashion universe. Also part of the roadmap, not this build.</p>
    </div>
  </div>
</section>

<!-- START A PROJECT -->
<section class="section" id="start-a-project">
  <div class="s-label reveal">05 · Start a Project</div>
  <h2 class="s-h2 reveal">TELL US <span class="stripe-mark">WHAT YOU'RE BUILDING.</span></h2>
  <p class="s-sub reveal">Configure your project and get an instant price. No back-and-forth.</p>

  <div class="sp-card reveal-scale" style="text-align:center;padding:56px 40px">
    <p style="font-size:15px;line-height:1.7;color:var(--text-muted);max-width:460px;margin:0 auto 32px">
      Tell us what you're building and pick exactly what you need. We calculate the price live as you go,
      no surprises, no waiting on a quote.
    </p>
    <a href="/start" class="btn-primary" style="display:inline-block">Configure Your Project →</a>
  </div>
</section>

<!-- COLLABORATE -->
<section class="section" id="collaborate">
  <div class="s-label reveal">06 · Collaborate</div>
  <h2 class="s-h2 reveal">BRING US <span class="exotic exotic-emerald">CLIENTS.</span></h2>
  <p class="s-sub reveal">Refer businesses to Zebraish Studio and earn a commission on every project you bring in.</p>

  <div class="sp-card reveal-scale" style="padding:48px 40px">
    <div style="display:flex;gap:32px;flex-wrap:wrap;justify-content:center;text-align:center">
      <div style="flex:1;min-width:240px">
        <h3 style="font-size:15px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;margin-bottom:10px">New Collaborator?</h3>
        <p style="font-size:14px;line-height:1.7;color:var(--text-muted);max-width:320px;margin:0 auto 24px">
          Apply to become an official Zebraish collaborator. Tell us a bit about yourself and we'll follow up.
        </p>
        <a href="/collaborate" class="btn-primary" style="display:inline-block">Apply to Collaborate →</a>
      </div>
      <div style="flex:1;min-width:240px">
        <h3 style="font-size:15px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;margin-bottom:10px">Already a Collaborator?</h3>
        <p style="font-size:14px;line-height:1.7;color:var(--text-muted);max-width:320px;margin:0 auto 24px">
          Enter your access code to check your dashboard: commissions, payouts, everything.
        </p>
        <a href="/login" class="btn-more">Enter Your Code <span class="btn-more-arrow">→</span></a>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="about-left">
    <div class="sec-vid reveal"><video autoplay muted loop playsinline style="width:160px;height:160px;border-radius:24px"><source src="3d-integrate-weekend.mp4" type="video/mp4"></video></div>
    <div class="s-label reveal">07 · About</div>
    <h2 class="s-h2 reveal">ABOUT <span class="exotic exotic-wine">ZEBRAISH STUDIO</span></h2>
    <p class="about-p reveal">I'm the founder behind <em>Zebraish Studio</em>, the build layer of the wider Zebraish ecosystem. Today, that means one person, hand-building real digital products for real businesses.</p>
    <p class="about-p reveal">Most agencies are slow, overpriced, and generic. I started building because good ideas kept getting undersold online. Zebraish Studio is the opposite: <em>fast, direct, custom</em>, and built around what a business actually needs to become real.</p>
    <div class="about-big-quote reveal">
      <span class="aq-thin">the difference is simple:</span>
      "I deliver in days,<br>not months."
    </div>
    <p class="about-p reveal">Based in <em>Nigeria</em>. Building for founders and businesses worldwide.</p>
    <div class="about-values reveal">
      <div class="value-card vc-1"><span class="value-num" data-count="10" data-suffix="+">0</span><div class="value-label">Days Max</div></div>
      <div class="value-card vc-2"><span class="value-num">100%</span><div class="value-label">Custom Built</div></div>
      <div class="value-card vc-3"><span class="value-num">∞</span><div class="value-label">Revisions</div></div>
      <div class="value-card vc-4"><span class="value-num">5★</span><div class="value-label">Rating</div></div>
    </div>
  </div>
  <div class="about-right">
    <div class="afc-list reveal">
      <div class="afc"><div class="afc-title">Clear Communication</div><p class="afc-desc">You'll always know exactly what's being worked on. No chasing, no going dark, no surprises.</p></div>
      <div class="afc"><div class="afc-title">Purpose-Built Design</div><p class="afc-desc">Every font, colour, layout, and interaction serves one goal: making your idea look and work undeniable.</p></div>
      <div class="afc"><div class="afc-title">You Own Everything</div><p class="afc-desc">All code, all files, all assets are yours forever. No subscriptions, no lock-in.</p></div>
      <div class="afc"><div class="afc-title">Worldwide Delivery</div><p class="afc-desc">Founders and businesses in Nigeria, the Gulf, the UK, Europe. Wherever you are, we deliver.</p></div>
    </div>
  </div>
</section>

<!-- PARTNER -->
<section class="section" id="partner">
  <div class="s-label reveal">08 · Official Partner</div>
  <h2 class="s-h2 reveal">BUILT WITH <span class="exotic exotic-violet">HENKOGEN.</span></h2>
  <p class="s-sub reveal">Our official AI partner, for founders ready to go beyond the build and automate how the business runs.</p>

  <div class="sp-card reveal-scale" style="padding:48px 40px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint);margin-bottom:14px">Applied AI · High Performance</p>
    <p style="font-size:16px;line-height:1.75;color:var(--text-muted);max-width:520px;margin:0 0 28px">
      HenkoGen designs AI agents that automate sales funnels, customer service, and social media, then stays to
      implement them alongside your team until they actually work. Where we build the product, HenkoGen builds the
      intelligence that runs behind it.
    </p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="https://henkogen.vercel.app" target="_blank" rel="noopener" class="btn-primary" style="display:inline-block">Visit HenkoGen →</a>
      <a href="https://henkogen.vercel.app/kaizen" target="_blank" rel="noopener" class="btn-more">Explore Kaizen Agents <span class="btn-more-arrow">→</span></a>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <canvas id="cta-liquid" width="900" height="500"></canvas>
  <div class="contact-inner">
    <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="cube.mp4" type="video/mp4"></video></div>
    <h2 class="contact-h2 reveal">LET'S <span class="stripe-mark">BUILD</span><br><span class="thin">SOMETHING REAL.</span></h2>
    <p class="contact-sub reveal">Every idea deserves infrastructure that does it justice. Start the project flow above, or message directly. No commitment, no pressure.</p>
    <div class="contact-links reveal">
      <a href="https://wa.me/2348165320780" class="contact-link" target="_blank"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/></svg>WhatsApp</a>
      <a href="mailto:j0shbankole19@gmail.com" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>Email</a>
      <a href="https://www.snapchat.com/add/j0shh.b?share_id=yZ3VJ6-qGXQ&locale=en-US" class="contact-link" target="_blank"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 3c-2.183 0-4.415 1.188-4.415 4.63v.621c0 .138-.07.266-.183.342l-.913.589c-.152.098-.243.268-.243.45 0 .098.028.194.08.278l.73 1.158c.093.148.1.335.018.489-.254.472-.722.742-1.24.742-.15 0-.305-.024-.452-.07l-.012-.004c-.093-.026-.183-.04-.268-.04-.253 0-.467.131-.544.327-.041.105-.107.38.238.65.572.45 1.475.791 2.782.99.085.012.155.073.18.156l.135.45c.047.155.19.255.348.255.048 0 .097-.009.145-.027.301-.115.618-.173.944-.173.295 0 .584.05.86.148.565.199 1.04.594 1.354.95.315-.356.79-.751 1.354-.95.276-.098.565-.148.86-.148.326 0 .643.058.944.173.048.018.097.027.145.027.158 0 .301-.1.348-.255l.135-.45c.025-.083.095-.144.18-.156 1.307-.199 2.21-.54 2.782-.99.345-.27.279-.545.238-.65-.077-.196-.291-.327-.544-.327-.085 0-.175.014-.268.04l-.012.004c-.147.046-.302.07-.452.07-.518 0-.986-.27-1.24-.742-.082-.154-.075-.341.018-.489l.73-1.158c.052-.084.08-.18.08-.278 0-.182-.091-.352-.243-.45l-.913-.589c-.113-.076-.183-.204-.183-.342v-.621C16.581 4.188 14.349 3 12.166 3Z"/></svg>Snapchat</a>
      <a href="tel:+2348165320780" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call Me</a>
    </div>
    <a href="#start-a-project" class="contact-main reveal">Start a Project →</a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo"><img src="zebraish-mark.png" alt="Zebraish">ZEBRAISH STUDIO</div>
  <p>Part of the Zebraish Ecosystem</p>
  <p>Based in Nigeria · Available Worldwide</p>
  <a href="/collaborate" class="footer-collab">Become a Collaborator →</a>
  <div class="footer-legal"><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a></div>
</footer>
`;

const SITE_BODY_ES = (lang: Lang, theme: Theme) => `
<div id="scroll-bar"></div>
${LANG_SCRIPT}

<!-- NAV -->
<nav>
  <a class="nav-logo" href="#hero"><img class="logo-mark" src="zebraish-mark.png" alt="Zebraish">ZEBRAISH<span class="nav-logo-tag">Studio</span></a>
  <ul class="nav-links">
    <li><a href="#build">Construir</a></li>
    <li><a href="#work">Trabajo</a></li>
    <li><a href="#process">Proceso</a></li>
    <li><a href="#approach">Enfoque</a></li>
    <li><a href="#collaborate">Colabora</a></li>
    <li><a href="#partner">Socio</a></li>
  </ul>
  <div class="nav-right">
    ${themeToggle(theme)}
    ${langToggle(lang)}
    <a href="#start-a-project" class="nav-cta">Iniciar un Proyecto</a>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="hero-stripes stripe-bg hs-1"></div>
  <div class="hero-stripes stripe-bg hs-2"></div>
  <div class="hero-bg-name" id="heroBgName">STUDIO</div>
  <div class="hero-grid-lines"></div>
  <div class="hero-left" id="heroLeft">
    <div class="hero-badge"><span class="badge-dot"></span>Zebraish Studio · Liderado por su Fundador · Construyendo Ahora</div>
    <div class="hero-type">
      <span class="hero-type-thin">tú tienes la idea.</span>
      <span class="hero-name">NOSOTROS CONSTRUIMOS <span class="stripe-mark hero-name-accent">LO QUE SIGUE</span></span>
      <span class="hero-type-sub">Idea &nbsp;·&nbsp; <span style="font-weight:900;color:var(--text)">Construir</span> &nbsp;·&nbsp; Lanzar</span>
    </div>
    <p class="hero-sub">Soy el fundador detrás de <em>Zebraish Studio</em>, la capa de construcción del ecosistema Zebraish. Convierto ideas en productos digitales reales, hechos a mano. Sin plantillas. Sin el peso de una agencia.</p>
    <div class="hero-actions">
      <a href="#start-a-project" class="btn-primary">Cuéntanos Qué Estás Construyendo →</a>
      <div class="dropdown-wrap" id="heroDropdown">
        <button class="dropdown-trigger">Escríbenos Directamente <span class="arrow">▾</span></button>
        <div class="dropdown-menu">
          <a href="https://wa.me/2348165320780" class="dropdown-item" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/></svg>
            WhatsApp
          </a>
          <a href="mailto:j0shbankole19@gmail.com" class="dropdown-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
            Correo
          </a>
          <a href="https://www.snapchat.com/add/j0shh.b?share_id=yZ3VJ6-qGXQ&locale=en-US" class="dropdown-item" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 3c-2.183 0-4.415 1.188-4.415 4.63v.621c0 .138-.07.266-.183.342l-.913.589c-.152.098-.243.268-.243.45 0 .098.028.194.08.278l.73 1.158c.093.148.1.335.018.489-.254.472-.722.742-1.24.742-.15 0-.305-.024-.452-.07l-.012-.004c-.093-.026-.183-.04-.268-.04-.253 0-.467.131-.544.327-.041.105-.107.38.238.65.572.45 1.475.791 2.782.99.085.012.155.073.18.156l.135.45c.047.155.19.255.348.255.048 0 .097-.009.145-.027.301-.115.618-.173.944-.173.295 0 .584.05.86.148.565.199 1.04.594 1.354.95.315-.356.79-.751 1.354-.95.276-.098.565-.148.86-.148.326 0 .643.058.944.173.048.018.097.027.145.027.158 0 .301-.1.348-.255l.135-.45c.025-.083.095-.144.18-.156 1.307-.199 2.21-.54 2.782-.99.345-.27.279-.545.238-.65-.077-.196-.291-.327-.544-.327-.085 0-.175.014-.268.04l-.012.004c-.147.046-.302.07-.452.07-.518 0-.986-.27-1.24-.742-.082-.154-.075-.341.018-.489l.73-1.158c.052-.084.08-.18.08-.278 0-.182-.091-.352-.243-.45l-.913-.589c-.113-.076-.183-.204-.183-.342v-.621C16.581 4.188 14.349 3 12.166 3Z"/></svg>
            Snapchat
          </a>
        </div>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><span class="stat-n" data-count="10" data-suffix="+">0+</span><span class="stat-l">Sitios Entregados</span></div>
      <div class="stat-divider"></div>
      <div class="hero-stat"><span class="stat-n" data-count="5">0</span><span class="stat-l">Industrias</span></div>
      <div class="stat-divider"></div>
      <div class="hero-stat"><span class="stat-n">5★</span><span class="stat-l">Calificación</span></div>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-device" id="heroDevice">
      <video autoplay muted loop playsinline><source src="3d-broadcast.mp4" type="video/mp4"></video>
      <div class="hero-device-shine"></div>
    </div>
    <div class="hero-float-1"><span class="float-dot" style="background:var(--green)"></span>Entrega en 5–10 Días</div>
    <div class="hero-float-2"><span class="float-dot" style="background:#fff"></span>100% Hecho a Mano</div>
  </div>
</section>

<!-- TICKER -->
<div class="ticker">
  <div class="ticker-track">
    <span class="ticker-item hi">Construir</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Inteligencia</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Automatizar</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Marca</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Crecer</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Idea → Producto</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Ecosistema Zebraish</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Liderado por su Fundador</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Construir</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Inteligencia</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Automatizar</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Marca</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Crecer</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Idea → Producto</span><span class="ticker-sep">◆</span>
    <span class="ticker-item hi">Ecosistema Zebraish</span><span class="ticker-sep">◆</span>
    <span class="ticker-item">Liderado por su Fundador</span><span class="ticker-sep">◆</span>
  </div>
</div>

<!-- STATEMENT / MANIFESTO -->
<section id="statement">
  <div class="stmt-inner">
    <div class="stmt-label reveal">La Filosofía</div>
    <div style="overflow:hidden"><span class="stmt-thin stmt-word">toda idea merece convertirse en</span></div>
    <div style="overflow:hidden;margin:8px 0"><span class="stmt-bold stmt-word exotic exotic-wine" style="transition-delay:.15s">ALGO</span></div>
    <div style="overflow:hidden"><span class="stmt-bold stmt-outline stmt-word exotic" style="transition-delay:.3s">REAL.</span></div>
    <div class="stmt-spacer"></div>
    <div style="overflow:hidden"><span class="stmt-thin stmt-word" style="transition-delay:.45s">ningún negocio es igual a otro,</span></div>
    <div style="overflow:hidden;margin-top:8px"><span class="stmt-bold stmt-word stripe-mark" style="transition-delay:.6s">NOSOTROS TAMPOCO.</span></div>
  </div>
</section>

<!-- WHAT WE BUILD -->
<section class="section" id="build">
  <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="3d-react.mp4" type="video/mp4"></video></div>
  <div class="s-label reveal">01 · Qué Construimos</div>
  <h2 class="s-h2 reveal">LAS IDEAS SE CONVIERTEN EN <span class="stripe-mark">INFRAESTRUCTURA</span></h2>
  <p class="s-sub reveal">Sitio web o sistema de software completo, Zebraish Studio descubre exactamente qué necesita tu idea para hacerse realidad.</p>
  <div class="skills-layout">
    <div class="radar-wrap reveal-left">
      <canvas id="skills-radar"></canvas>
      <div class="radar-legend">
        <div class="rl-item"><span class="rl-dot" style="background:var(--wine)"></span>Construir</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--gold)"></span>Marca</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--emerald)"></span>Automatizar</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--sapphire)"></span>Inteligencia</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--emerald)"></span>Velocidad</div>
        <div class="rl-item"><span class="rl-dot" style="background:var(--gold)"></span>Entrega</div>
      </div>
    </div>
    <div class="skill-list reveal-right">
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Construir</span><span class="sk-pct" style="color:var(--wine)">97%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="97" style="background:repeating-linear-gradient(90deg,var(--wine) 0 6px,rgba(224,41,95,.25) 6px 6px,rgba(224,41,95,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Sitios Web · Aplicaciones Web · Software</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Marca</span><span class="sk-pct" style="color:var(--gold)">94%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="94" style="background:repeating-linear-gradient(90deg,var(--gold) 0 6px,rgba(232,169,60,.25) 6px 6px,rgba(232,169,60,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Identidad · Tipografía · Sistemas de Diseño</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Automatizar</span><span class="sk-pct" style="color:var(--emerald)">88%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="88" style="background:repeating-linear-gradient(90deg,var(--emerald) 0 6px,rgba(23,201,141,.25) 6px 6px,rgba(23,201,141,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Flujos de Trabajo · Integraciones · CRM</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Inteligencia</span><span class="sk-pct" style="color:var(--sapphire)">60%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="60" style="background:repeating-linear-gradient(90deg,var(--sapphire) 0 6px,rgba(61,126,240,.25) 6px 6px,rgba(61,126,240,.25) 6px 10px)"></div></div>
        <div class="sk-tags">IA y Analítica · Disponible Bajo Solicitud</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Crecer</span><span class="sk-pct" style="color:var(--emerald)">82%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="82" style="background:repeating-linear-gradient(90deg,var(--emerald) 0 6px,rgba(23,201,141,.25) 6px 6px,rgba(23,201,141,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Estrategia de Lanzamiento · The Board (Próximamente)</div>
      </div>
      <div class="sk">
        <div class="sk-top"><span class="sk-name">Despliegue en Vivo</span><span class="sk-pct" style="color:var(--gold)">100%</span></div>
        <div class="sk-bar-bg"><div class="sk-bar-fill" data-pct="100" style="background:repeating-linear-gradient(90deg,var(--gold) 0 6px,rgba(232,169,60,.25) 6px 6px,rgba(232,169,60,.25) 6px 10px)"></div></div>
        <div class="sk-tags">Vercel · Dominio Personalizado · SSL</div>
      </div>
    </div>
  </div>
</section>

<!-- TWO-WAY MARQUEE -->
<div class="mq-section">
  <div class="mq-row mq-row-1">
    <div class="mq-inner">
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>HTML5</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>CSS3</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>JavaScript</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Canvas API</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>WhatsApp</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Vercel</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Automatización</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Ecosistema Zebraish</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>HTML5</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>CSS3</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>JavaScript</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Canvas API</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>WhatsApp</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Vercel</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Automatización</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Ecosistema Zebraish</span>
    </div>
  </div>
  <div class="mq-row mq-row-2" style="margin-top:8px">
    <div class="mq-inner">
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Tipografía</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Sistemas de Marca</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Editorial Oscuro</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Diseño de Movimiento</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Mobile-First</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>Cursor Personalizado</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Glassmorphism</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Liderado por su Fundador</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#c2c2c8"></span>Tipografía</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Sistemas de Marca</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Editorial Oscuro</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#84848c"></span>Diseño de Movimiento</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#f0f0f2"></span>Mobile-First</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#d4d4d8"></span>Cursor Personalizado</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#ffffff"></span>Glassmorphism</span>
      <span class="mq-chip"><span class="mq-chip-dot" style="background:#a8a8b0"></span>Liderado por su Fundador</span>
    </div>
  </div>
</div>

<!-- BY THE NUMBERS -->
<section id="numbers">
  <div style="position:relative;z-index:2">
    <div class="s-label reveal" style="justify-content:center">La Prueba</div>
    <h2 class="s-h2 reveal" style="text-align:center;margin-bottom:0">NÚMEROS QUE<br><span class="thin">hablan</span> <span class="stripe-mark">MÁS ALTO</span></h2>
  </div>
  <div class="numbers-grid">
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big" data-count="10" data-suffix="+">0</span><div class="num-label">Sitios Construidos y en Vivo</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big" data-count="5">0</span><div class="num-label">Industrias Atendidas</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big">∞</span><div class="num-label">Revisiones Incluidas</div></div>
    <div class="num-card reveal"><div class="stripe-rule"></div><span class="num-big">5★</span><div class="num-label">Satisfacción del Cliente</div></div>
  </div>
</section>

<!-- SELECTED WORK -->
<section class="section" id="work">
  <div class="s-label reveal">02 · Trabajo Seleccionado</div>
  <h2 class="s-h2 reveal">TRABAJO REAL. <span class="stripe-mark">PRUEBA REAL.</span></h2>
  <p class="s-sub reveal">Nueve sitios en vivo, nueve mundos distintos, construidos por el fundador antes y durante la formación de Zebraish Studio. Esta es la capacidad sobre la que se construyó el Studio.</p>
  <div class="bento-grid">

    <!-- 01 PM PORTFOLIO -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&auto=format" alt="PM Portfolio" loading="lazy">
        <div class="bento-brand"><span class="bno-name">PM PORTFOLIO</span><span class="bno-tag">Constructor de Producto y Frontend</span></div>
        <div class="bento-overlay"><a href="https://pm-portfolio-steel-rho.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">01</div>
        <div class="bento-title">PM Portfolio: Constructor de Producto y Frontend</div>
        <p class="bento-desc">Portafolio de producto personal. Pensamiento de PM se encuentra con ejecución frontend: productos reales lanzados a producción, presentados en una interfaz oscura y limpia.</p>
        <div class="bento-tags"><span class="bento-tag">Producto</span><span class="bento-tag">Frontend</span><span class="bento-tag">Portafolio</span></div>
        <div class="bento-footer"><span class="bento-industry">Tecnología y Producto</span><a href="https://pm-portfolio-steel-rho.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 02 MALAAK -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="a3eb67a33eb96ed907adcdd7619cb9d5.jpg" alt="MALAAK" loading="lazy">
        <div class="bento-brand"><span class="bno-name">MALAAK</span><span class="bno-tag">Abayas de Lujo Modesto</span></div>
        <div class="bento-overlay"><a href="https://malaak-abaya.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">02</div>
        <div class="bento-title">MALAAK: Abayas de Lujo Modesto</div>
        <p class="bento-desc">Sitio de moda editorial minimalista. Diseño hero dividido, cuadrícula de productos con revelado al pasar el cursor, flujo de pedidos por WhatsApp sin fricciones. Construido para compradores nativos de Snapchat.</p>
        <div class="bento-tags"><span class="bento-tag">Moda</span><span class="bento-tag">Editorial</span><span class="bento-tag">WhatsApp</span></div>
        <div class="bento-footer"><span class="bento-industry">Moda Modesta</span><a href="https://malaak-abaya.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 03 DOBERMAN (full width feature) -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="b78ad4f230a4015d24a420fce2a7d53b.jpg" alt="Doberman" loading="lazy">
        <div class="bento-brand"><span class="bno-name">DOBERMAN</span><span class="bno-tag">Experiencia de Marca Audaz</span></div>
        <div class="bento-overlay"><a href="https://doberman-kappa.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-meta">
          <div class="bento-num">03</div>
          <div class="bento-title">Doberman: Experiencia de Marca Audaz</div>
          <div class="bento-tags"><span class="bento-tag">Marca</span><span class="bento-tag">Oscuro y Audaz</span><span class="bento-tag">Interactivo</span></div>
          <div class="bento-footer"><span class="bento-industry">Marca e Identidad</span><a href="https://doberman-kappa.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
        </div>
        <p class="bento-desc">Sitio de marca de alto impacto. Tipografía agresiva, paleta oscura dramática, y un diseño enfocado en conversión que exige atención y demanda acción.</p>
      </div>
    </div>

    <!-- 04 CHRISTIAN PRIETO -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=400&fit=crop&auto=format" alt="Christian Prieto" loading="lazy">
        <div class="bento-brand"><span class="bno-name">CHRTT.PRIETO</span><span class="bno-tag">Creador de Moda y Estilo de Vida</span></div>
        <div class="bento-overlay"><a href="https://christain-theapeacademys-projects.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">04</div>
        <div class="bento-title">Christian Prieto: Creador Digital</div>
        <p class="bento-desc">Elegante portafolio de creador construido para un creador de moda y estilo de vida con sede en Barcelona. Diseño enfocado en estadísticas, estética nativa de TikTok, y un flujo de colaboraciones de marca sin fricciones, con 9.6M de me gusta y contando.</p>
        <div class="bento-tags"><span class="bento-tag">Creador</span><span class="bento-tag">Moda</span><span class="bento-tag">TikTok</span></div>
        <div class="bento-footer"><span class="bento-industry">Economía de Creadores</span><a href="https://christain-theapeacademys-projects.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 05 APE ACADEMY -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="Screenshot_20260412-220250_Chrome.png" alt="Ape Academy" loading="lazy">
        <div class="bento-brand"><span class="bno-name">APE ACADEMY</span><span class="bno-tag">Excelencia Académica</span></div>
        <div class="bento-overlay"><a href="https://deploy-1-p1ke.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">05</div>
        <div class="bento-title">Ape Academy: Excelencia Académica</div>
        <p class="bento-desc">Plataforma educativa limpia y audaz. Identidad de marca sólida, diseño de contenido estructurado, y un flujo de conversión directo construido para estudiantes serios.</p>
        <div class="bento-tags"><span class="bento-tag">Educación</span><span class="bento-tag">Tema Oscuro</span><span class="bento-tag">Audaz</span></div>
        <div class="bento-footer"><span class="bento-industry">Educación</span><a href="https://deploy-1-p1ke.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 06 AAURA -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="ae7685b3f6993315e423325f7889a7f4.jpg" alt="AAURA" loading="lazy">
        <div class="bento-brand"><span class="bno-name">AAURA</span><span class="bno-tag">Perfumería de Lujo Árabe</span></div>
        <div class="bento-overlay"><a href="https://aaura-perfume.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">06</div>
        <div class="bento-title">AAURA: Perfumería de Lujo Árabe</div>
        <p class="bento-desc">Campo de partículas doradas animado, tipografía arabesca, pedidos por WhatsApp. Cada píxel rebosa lujo.</p>
        <div class="bento-tags"><span class="bento-tag">Lujo</span><span class="bento-tag">Efectos Canvas</span><span class="bento-tag">Árabe</span></div>
        <div class="bento-footer"><span class="bento-industry">Perfumería</span><a href="https://aaura-perfume.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 07 NOIR ATELIER -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop&auto=format" alt="NOIR ATELIER" loading="lazy">
        <div class="bento-brand"><span class="bno-name">NOIR ATELIER</span><span class="bno-tag">Prêt-à-Porter de Lujo</span></div>
        <div class="bento-overlay"><a href="https://noir-atelier-clothing.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">07</div>
        <div class="bento-title">NOIR ATELIER: Prêt-à-Porter de Lujo</div>
        <p class="bento-desc">Cursor magnético personalizado, marquesina animada, cuadrícula de productos con nombres en francés. Audaz. Frío. Inolvidable.</p>
        <div class="bento-tags"><span class="bento-tag">Alta Costura</span><span class="bento-tag">B&amp;N</span></div>
        <div class="bento-footer"><span class="bento-industry">Indumentaria</span><a href="https://noir-atelier-clothing.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 08 EMBER & SALT -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format" alt="Ember & Salt" loading="lazy">
        <div class="bento-brand"><span class="bno-name">EMBER &amp; SALT</span><span class="bno-tag">Restaurante a Leña</span></div>
        <div class="bento-overlay"><a href="https://ember-salt-restaurant.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">08</div>
        <div class="bento-title">Ember &amp; Salt: Restaurante a Leña</div>
        <p class="bento-desc">Llama animada con CSS, paleta cálida de brasas, pestañas de menú de temporada, llamada a la acción para reservas. Casi puedes oler el humo.</p>
        <div class="bento-tags"><span class="bento-tag">Restaurante</span><span class="bento-tag">Animación</span></div>
        <div class="bento-footer"><span class="bento-industry">Comida y Bebida</span><a href="https://ember-salt-restaurant.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

    <!-- 09 REVERIE -->
    <div class="bento-card reveal-scale">
      <div class="bento-thumb">
        <img src="4c7faa2cf965371c0d8c790e9d5f61a1.jpg" alt="Reverie" loading="lazy">
        <div class="bento-brand"><span class="bno-name">REVERIE</span><span class="bno-tag">Salón de Belleza de Lujo</span></div>
        <div class="bento-overlay"><a href="https://reverie-salon.vercel.app/" class="bento-live" target="_blank">Vista en Vivo →</a></div>
      </div>
      <div class="bento-body">
        <div class="bento-num">09</div>
        <div class="bento-title">Reverie: Salón de Belleza de Lujo</div>
        <p class="bento-desc">Estética de lujo en mármol suave. Cuadrícula de servicios, presentación del equipo, integración de reservas por WhatsApp.</p>
        <div class="bento-tags"><span class="bento-tag">Belleza</span><span class="bento-tag">Mármol</span></div>
        <div class="bento-footer"><span class="bento-industry">Belleza</span><a href="https://reverie-salon.vercel.app/" class="live-badge" target="_blank"><div class="live-dot"></div>Sitio en Vivo</a></div>
      </div>
    </div>

  </div>
  <p class="work-honesty reveal">Estos proyectos fueron construidos por el fundador, algunos antes de que Zebraish Studio existiera como nombre. Se muestran aquí como prueba honesta de capacidad, no como trabajo reclamado para clientes de Zebraish Studio.</p>
  <div class="projects-more reveal">
    <a href="all-work.html" class="btn-more">Ver Todo el Trabajo <span class="btn-more-arrow">→</span></a>
  </div>
</section>

<!-- HOW WE WORK -->
<section class="section" id="process">
  <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="3d-control.mp4" type="video/mp4"></video></div>
  <div class="s-label reveal">03 · Cómo Trabajamos</div>
  <h2 class="s-h2 reveal">DE LA IDEA<br><span class="stripe-mark thin">AL LANZAMIENTO.</span></h2>
  <p class="s-sub reveal">Cuatro pasos. Sin relleno, sin burocracia, solo un fundador que entrega resultados.</p>
  <div class="process-timeline">
    <div class="process-line"></div>
    <div class="process-line-fill" id="processLineFill"></div>
    <div class="process-steps">
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">01</span></div><h4>Cuéntanos Qué Estás Construyendo</h4><p>Completa el flujo de Iniciar un Proyecto o escríbenos directamente. Cuéntanos qué necesita tu idea o negocio. Toma 5 minutos.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">02</span></div><h4>Definimos una Dirección</h4><p>En un plazo de 48 horas recibes una dirección visual, una estructura, y un precio fijo del proyecto.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">03</span></div><h4>Lo Construimos</h4><p>El producto completo se construye y se te envía como un enlace de vista previa en vivo. Tú revisas, nosotros refinamos hasta que quede exactamente como debe ser.</p></div>
      <div class="process-step reveal"><div class="process-dot"><span class="process-dot-num">04</span></div><h4>Tú Lanzas</h4><p>Una vez que estés satisfecho, se publica. Desde ahí, el ecosistema más amplio de Zebraish está para ayudarte a seguir creciendo.</p></div>
    </div>
  </div>
</section>

<!-- THE ZEBRAISH APPROACH -->
<section class="section" id="approach">
  <div class="s-label reveal">04 · El Panorama General</div>
  <h2 class="s-h2 reveal">STUDIO ES EL <span class="exotic exotic-emerald">PRIMER PASO.</span></h2>
  <p class="s-sub reveal">Zebraish Studio es la capa de construcción de un ecosistema más grande, uno que aún se está construyendo, a propósito, a la vista de todos.</p>

  <div class="approach-flow reveal">
    <div class="af-node"><div class="af-node-label">Idea</div><div class="af-node-sub">Tú</div></div>
    <div class="af-connector"></div>
    <div class="af-node"><div class="af-node-label">Zebraish Studio</div><div class="af-node-sub">Construir</div></div>
    <div class="af-connector"></div>
    <div class="af-node"><div class="af-node-label">Lanzamiento</div><div class="af-node-sub">Producto en Vivo</div></div>
    <div class="af-connector"></div>
    <div class="af-node dim"><div class="af-node-label">The Board</div><div class="af-node-sub">En Desarrollo</div></div>
    <div class="af-connector"></div>
    <div class="af-node dim"><div class="af-node-label">Crecer</div><div class="af-node-sub">Descubrir · Aprender</div></div>
  </div>

  <div class="approach-verticals reveal">
    <div class="av-card active">
      <div class="av-tag live">En Vivo Hoy</div>
      <div class="av-title">Zebraish Studio</div>
      <p class="av-desc">La capa de construcción. Convierte ideas y negocios en sitios web reales, software, marca y automatización: lo que es esta página.</p>
    </div>
    <div class="av-card">
      <div class="av-tag">En Desarrollo</div>
      <div class="av-title faint">The Board</div>
      <p class="av-desc">Donde los negocios construidos con Studio eventualmente podrán lanzarse, recopilar comentarios, y ser descubiertos. Aún no está construido, parte de la hoja de ruta.</p>
    </div>
    <div class="av-card">
      <div class="av-tag">En Desarrollo</div>
      <div class="av-title faint">Zebraish Fashion</div>
      <p class="av-desc">El brazo cultural y creativo de Zebraish, un universo de moda inspirado en animales. También parte de la hoja de ruta, no de esta construcción.</p>
    </div>
  </div>
</section>

<!-- START A PROJECT -->
<section class="section" id="start-a-project">
  <div class="s-label reveal">05 · Iniciar un Proyecto</div>
  <h2 class="s-h2 reveal">CUÉNTANOS <span class="stripe-mark">QUÉ ESTÁS CONSTRUYENDO.</span></h2>
  <p class="s-sub reveal">Configura tu proyecto y obtén un precio al instante. Sin idas y vueltas.</p>

  <div class="sp-card reveal-scale" style="text-align:center;padding:56px 40px">
    <p style="font-size:15px;line-height:1.7;color:var(--text-muted);max-width:460px;margin:0 auto 32px">
      Cuéntanos qué estás construyendo y elige exactamente lo que necesitas. Calculamos el precio en vivo a medida que avanzas,
      sin sorpresas, sin esperar un presupuesto.
    </p>
    <a href="/start" class="btn-primary" style="display:inline-block">Configura Tu Proyecto →</a>
  </div>
</section>

<!-- COLLABORATE -->
<section class="section" id="collaborate">
  <div class="s-label reveal">06 · Colabora</div>
  <h2 class="s-h2 reveal">TRÁENOS <span class="exotic exotic-emerald">CLIENTES.</span></h2>
  <p class="s-sub reveal">Refiere negocios a Zebraish Studio y gana una comisión por cada proyecto que traigas.</p>

  <div class="sp-card reveal-scale" style="padding:48px 40px">
    <div style="display:flex;gap:32px;flex-wrap:wrap;justify-content:center;text-align:center">
      <div style="flex:1;min-width:240px">
        <h3 style="font-size:15px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;margin-bottom:10px">¿Nuevo Colaborador?</h3>
        <p style="font-size:14px;line-height:1.7;color:var(--text-muted);max-width:320px;margin:0 auto 24px">
          Solicita convertirte en colaborador oficial de Zebraish. Cuéntanos un poco sobre ti y te contactaremos.
        </p>
        <a href="/collaborate" class="btn-primary" style="display:inline-block">Solicitar Colaborar →</a>
      </div>
      <div style="flex:1;min-width:240px">
        <h3 style="font-size:15px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;margin-bottom:10px">¿Ya Eres Colaborador?</h3>
        <p style="font-size:14px;line-height:1.7;color:var(--text-muted);max-width:320px;margin:0 auto 24px">
          Introduce tu código de acceso para ver tu panel: comisiones, pagos, todo.
        </p>
        <a href="/login" class="btn-more">Introduce Tu Código <span class="btn-more-arrow">→</span></a>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="about-left">
    <div class="sec-vid reveal"><video autoplay muted loop playsinline style="width:160px;height:160px;border-radius:24px"><source src="3d-integrate-weekend.mp4" type="video/mp4"></video></div>
    <div class="s-label reveal">07 · Sobre Nosotros</div>
    <h2 class="s-h2 reveal">SOBRE <span class="exotic exotic-wine">ZEBRAISH STUDIO</span></h2>
    <p class="about-p reveal">Soy el fundador detrás de <em>Zebraish Studio</em>, la capa de construcción del ecosistema más amplio de Zebraish. Hoy, eso significa una persona, construyendo a mano productos digitales reales para negocios reales.</p>
    <p class="about-p reveal">La mayoría de las agencias son lentas, caras, y genéricas. Empecé a construir porque las buenas ideas seguían siendo subestimadas en línea. Zebraish Studio es lo opuesto: <em>rápido, directo, a medida</em>, y construido en torno a lo que un negocio realmente necesita para hacerse realidad.</p>
    <div class="about-big-quote reveal">
      <span class="aq-thin">la diferencia es simple:</span>
      "Entrego en días,<br>no en meses."
    </div>
    <p class="about-p reveal">Con sede en <em>Nigeria</em>. Construyendo para fundadores y negocios en todo el mundo.</p>
    <div class="about-values reveal">
      <div class="value-card vc-1"><span class="value-num" data-count="10" data-suffix="+">0</span><div class="value-label">Días Máximo</div></div>
      <div class="value-card vc-2"><span class="value-num">100%</span><div class="value-label">Hecho a Medida</div></div>
      <div class="value-card vc-3"><span class="value-num">∞</span><div class="value-label">Revisiones</div></div>
      <div class="value-card vc-4"><span class="value-num">5★</span><div class="value-label">Calificación</div></div>
    </div>
  </div>
  <div class="about-right">
    <div class="afc-list reveal">
      <div class="afc"><div class="afc-title">Comunicación Clara</div><p class="afc-desc">Siempre sabrás exactamente en qué se está trabajando. Sin tener que perseguir respuestas, sin silencios, sin sorpresas.</p></div>
      <div class="afc"><div class="afc-title">Diseño con Propósito</div><p class="afc-desc">Cada fuente, color, diseño, e interacción tiene un objetivo: hacer que tu idea se vea y funcione de forma innegable.</p></div>
      <div class="afc"><div class="afc-title">Todo Te Pertenece</div><p class="afc-desc">Todo el código, todos los archivos, todos los recursos son tuyos para siempre. Sin suscripciones, sin ataduras.</p></div>
      <div class="afc"><div class="afc-title">Entrega Mundial</div><p class="afc-desc">Fundadores y negocios en Nigeria, el Golfo, el Reino Unido, Europa. Estés donde estés, entregamos.</p></div>
    </div>
  </div>
</section>

<!-- PARTNER -->
<section class="section" id="partner">
  <div class="s-label reveal">08 · Socio Oficial</div>
  <h2 class="s-h2 reveal">CONSTRUIDO CON <span class="exotic exotic-violet">HENKOGEN.</span></h2>
  <p class="s-sub reveal">Nuestro socio oficial de IA, para fundadores listos para ir más allá de la construcción y automatizar cómo opera el negocio.</p>

  <div class="sp-card reveal-scale" style="padding:48px 40px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--text-faint);margin-bottom:14px">IA Aplicada · Alto Rendimiento</p>
    <p style="font-size:16px;line-height:1.75;color:var(--text-muted);max-width:520px;margin:0 0 28px">
      HenkoGen diseña agentes de IA que automatizan embudos de ventas, atención al cliente y redes sociales, y se
      queda para implementarlos junto a tu equipo hasta que funcionen de verdad. Donde nosotros construimos el
      producto, HenkoGen construye la inteligencia que corre detrás.
    </p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="https://henkogen.vercel.app" target="_blank" rel="noopener" class="btn-primary" style="display:inline-block">Visitar HenkoGen →</a>
      <a href="https://henkogen.vercel.app/kaizen" target="_blank" rel="noopener" class="btn-more">Explorar Kaizen Agents <span class="btn-more-arrow">→</span></a>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <canvas id="cta-liquid" width="900" height="500"></canvas>
  <div class="contact-inner">
    <div class="sec-vid reveal"><video autoplay muted loop playsinline><source src="cube.mp4" type="video/mp4"></video></div>
    <h2 class="contact-h2 reveal">CONSTRUYAMOS<br><span class="stripe-mark">ALGO</span> <span class="thin">REAL.</span></h2>
    <p class="contact-sub reveal">Toda idea merece una infraestructura que le haga justicia. Inicia el flujo del proyecto arriba, o escríbenos directamente. Sin compromiso, sin presión.</p>
    <div class="contact-links reveal">
      <a href="https://wa.me/2348165320780" class="contact-link" target="_blank"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/></svg>WhatsApp</a>
      <a href="mailto:j0shbankole19@gmail.com" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>Correo</a>
      <a href="https://www.snapchat.com/add/j0shh.b?share_id=yZ3VJ6-qGXQ&locale=en-US" class="contact-link" target="_blank"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 3c-2.183 0-4.415 1.188-4.415 4.63v.621c0 .138-.07.266-.183.342l-.913.589c-.152.098-.243.268-.243.45 0 .098.028.194.08.278l.73 1.158c.093.148.1.335.018.489-.254.472-.722.742-1.24.742-.15 0-.305-.024-.452-.07l-.012-.004c-.093-.026-.183-.04-.268-.04-.253 0-.467.131-.544.327-.041.105-.107.38.238.65.572.45 1.475.791 2.782.99.085.012.155.073.18.156l.135.45c.047.155.19.255.348.255.048 0 .097-.009.145-.027.301-.115.618-.173.944-.173.295 0 .584.05.86.148.565.199 1.04.594 1.354.95.315-.356.79-.751 1.354-.95.276-.098.565-.148.86-.148.326 0 .643.058.944.173.048.018.097.027.145.027.158 0 .301-.1.348-.255l.135-.45c.025-.083.095-.144.18-.156 1.307-.199 2.21-.54 2.782-.99.345-.27.279-.545.238-.65-.077-.196-.291-.327-.544-.327-.085 0-.175.014-.268.04l-.012.004c-.147.046-.302.07-.452.07-.518 0-.986-.27-1.24-.742-.082-.154-.075-.341.018-.489l.73-1.158c.052-.084.08-.18.08-.278 0-.182-.091-.352-.243-.45l-.913-.589c-.113-.076-.183-.204-.183-.342v-.621C16.581 4.188 14.349 3 12.166 3Z"/></svg>Snapchat</a>
      <a href="tel:+2348165320780" class="contact-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Llámame</a>
    </div>
    <a href="#start-a-project" class="contact-main reveal">Iniciar un Proyecto →</a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo"><img src="zebraish-mark.png" alt="Zebraish">ZEBRAISH STUDIO</div>
  <p>Parte del Ecosistema Zebraish</p>
  <p>Con sede en Nigeria · Disponible en Todo el Mundo</p>
  <a href="/collaborate" class="footer-collab">Conviértete en Colaborador →</a>
  <div class="footer-legal"><a href="/terms">Términos de Servicio</a><a href="/privacy">Política de Privacidad</a></div>
</footer>
`;

export function getSiteBodyHtml(lang: Lang, theme: Theme): string {
  return lang === "es" ? SITE_BODY_ES(lang, theme) : SITE_BODY_EN(lang, theme);
}
