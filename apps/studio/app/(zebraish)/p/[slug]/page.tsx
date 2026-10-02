import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PITCHES, getPitch } from "@/lib/zebraish/pitches";

// A private proposal for one business. Not indexed; the link only travels in
// the email we send them. The same page prints straight to the PDF version.

export function generateStaticParams() {
  return PITCHES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getPitch(slug);
  if (!p) return {};
  return {
    title: `Propuesta para ${p.business} · Zebraish Studio`,
    description: p.promise,
    robots: { index: false, follow: false },
    openGraph: { title: `Así podría verse ${p.brand} en internet`, description: p.promise, images: [`/zb/pitch/${p.slug}-hero.jpg`] },
  };
}

const IG = "https://www.instagram.com/zebraish_studio";

export default async function PitchPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const p = getPitch(slug);
  if (!p) notFound();

  return (
    <main className="pp" style={{ ["--acc" as string]: p.accent }}>
      <style>{CSS}</style>

      <header className="pp-bar">
        <a href="https://zebraish.com/?lang=es" className="pp-logo">
          <img src="/zb/assets/zebraish-mark.png" alt="" width={26} height={26} />
          <span>ZEBRAISH</span>
          <em>STUDIO</em>
        </a>
        <span className="pp-meta">Propuesta privada · {p.date}</span>
      </header>

      <section className="pp-hero">
        <div className="pp-k">Para {p.business} · {p.city}</div>
        <h1>
          Una propuesta para <i>{p.business}</i>.
        </h1>
        <p className="pp-lead">{p.promise}</p>
        <img className="pp-heroimg" src={`/zb/pitch/${p.slug}-hero.jpg`} alt={`Concepto de web para ${p.business}`} />
      </section>

      <section className="pp-sec pp-today">
        <div className="pp-k">Lo que vemos hoy</div>
        <h2>{p.greeting}.</h2>
        {p.today.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </section>

      <section className="pp-sec">
        <div className="pp-k">El concepto</div>
        <h2>Diseñado para {p.brand}, en ordenador y en móvil.</h2>
        <div className="pp-concept">
          <figure className="pp-desk">
            <div className="pp-chrome"><span /><span /><span /><b>Concepto · {p.brand}</b></div>
            <img src={`/zb/pitch/${p.slug}-desk.webp`} alt="Concepto en ordenador" />
          </figure>
          <figure className="pp-mob">
            <img src={`/zb/pitch/${p.slug}-mob.webp`} alt="Concepto en móvil" />
          </figure>
        </div>
        <p className="pp-note">Es un primer boceto con fotos de muestra. La web final lleva vuestras fotos, vuestros textos y vuestros servicios.</p>
      </section>

      <section className="pp-sec">
        <div className="pp-k">Qué incluye</div>
        <h2>Lo que haría por vosotros.</h2>
        <div className="pp-grid">
          {p.features.map((f, i) => (
            <div key={f.t} className="pp-card">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pp-sec">
        <div className="pp-k">Ya lo hemos hecho</div>
        <h2>Webs que hemos creado en vuestro sector.</h2>
        <div className="pp-samples">
          {p.samples.map((s) => (
            <a key={s.name} href={`https://${s.host}`} target="_blank" rel="noopener noreferrer" className="pp-sample">
              <img src={s.shot} alt={s.name} />
              <div>
                <b>{s.name}</b>
                <span>{s.what}</span>
                <em>Ver la web en vivo ↗</em>
              </div>
            </a>
          ))}
        </div>
        <p className="pp-note">
          Y 12 más en moda, educación, hostelería y tecnología en <a href="https://zebraish.com/studio?lang=es">zebraish.com</a>.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-k">Cómo trabajamos</div>
        <h2>De la idea a la web, sin complicaciones.</h2>
        <ol className="pp-steps">
          <li><b>Una charla de 15 minutos.</b> Por email, Instagram o videollamada. Nos contáis qué necesitáis.</li>
          <li><b>Precio cerrado.</b> Lo sabéis antes de empezar. Sin sorpresas ni cuotas escondidas.</li>
          <li><b>Diseño y desarrollo.</b> Seguís el avance en vivo desde vuestro panel.</li>
          <li><b>Lanzamiento.</b> Con vuestro dominio, y seguimos a vuestro lado para lo que venga.</li>
        </ol>
      </section>

      <section className="pp-cta">
        <h2>¿Lo vemos juntos?</h2>
        <p>Si os gusta la idea, respondedme al email o escribidme por Instagram. Lo leo yo mismo.</p>
        <div className="pp-btns">
          <a href={`mailto:hola@zebraish.com?subject=${encodeURIComponent(`Propuesta para ${p.business}`)}`} className="pp-btn">Responder por email</a>
          <a href={IG} target="_blank" rel="noopener noreferrer" className="pp-btn pp-ghost">Instagram @zebraish_studio</a>
          <a href="https://zebraish.com/studio?lang=es" className="pp-btn pp-ghost">Ver nuestro trabajo</a>
        </div>
        <div className="pp-sign">
          <b>Banks</b>
          <span>Fundador, Zebraish Studio</span>
        </div>
      </section>

      <footer className="pp-foot">
        Zebraish Studio · zebraish.com · hola@zebraish.com · @zebraish_studio
        <br />
        Esta propuesta se ha preparado solo para {p.business}. Si no os interesa, basta con decírnoslo y no volveremos a escribir.
      </footer>
    </main>
  );
}

const CSS = `
.pp{--bg:#060608;--card:#0f0f13;--line:#22222a;--ink:#f5f5f7;--soft:#a3a3ad;font-family:Inter,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;
  background-image:radial-gradient(900px 520px at 80% 0%,color-mix(in srgb,var(--acc) 22%,transparent),transparent 70%)}
.pp *{box-sizing:border-box}.pp img{display:block;max-width:100%}
.pp a{color:inherit}
.pp-bar{display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto;padding:26px 24px}
.pp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;letter-spacing:.14em;font-size:14px}
.pp-logo em{font-style:normal;font-size:9px;letter-spacing:.2em;color:var(--soft);border:1px solid var(--line);border-radius:4px;padding:3px 6px}
.pp-meta{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
.pp-hero,.pp-sec,.pp-cta{max-width:1100px;margin:0 auto;padding:56px 24px 0}
.pp-k{font-size:11px;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:var(--acc);margin-bottom:16px}
.pp h1{font-size:clamp(40px,7vw,84px);line-height:1;letter-spacing:-.035em;font-weight:900;margin:0;max-width:900px}
.pp h1 i,.pp h2 i{font-family:Georgia,"Times New Roman",serif;font-weight:400}
.pp-lead{font-size:clamp(17px,2vw,21px);line-height:1.55;color:var(--soft);max-width:640px;margin:22px 0 36px}
.pp-heroimg{width:100%;border-radius:22px;border:1px solid var(--line);box-shadow:0 50px 100px -40px #000}
.pp h2{font-size:clamp(28px,4vw,44px);line-height:1.08;letter-spacing:-.025em;font-weight:900;margin:0 0 22px;max-width:780px}
.pp-today p{font-size:18px;line-height:1.7;color:var(--soft);max-width:720px;margin:0 0 12px}
.pp-concept{display:grid;grid-template-columns:1fr 250px;gap:28px;align-items:end}
.pp-desk{margin:0;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#111}
.pp-chrome{display:flex;align-items:center;gap:6px;padding:10px 14px;background:#17171c;border-bottom:1px solid var(--line)}
.pp-chrome span{width:10px;height:10px;border-radius:50%;background:#3a3a42}.pp-chrome b{margin-left:14px;font-size:11px;font-weight:500;color:var(--soft);background:#0c0c10;border-radius:6px;padding:4px 12px}
.pp-mob{margin:0;border:8px solid #18181d;border-radius:36px;overflow:hidden;box-shadow:0 30px 60px -20px #000,0 0 0 1px #2c2c33;aspect-ratio:390/844}
.pp-mob img{width:100%;height:100%;object-fit:cover;object-position:top}
.pp-note{font-size:14px;color:var(--soft);margin-top:18px}.pp-note a{color:var(--acc)}
.pp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.pp-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px}
.pp-card span{font-size:12px;font-weight:800;color:var(--acc);letter-spacing:.14em}
.pp-card h3{font-size:19px;margin:10px 0 8px}.pp-card p{font-size:15px;line-height:1.6;color:var(--soft);margin:0}
.pp-samples{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.pp-sample{display:block;text-decoration:none;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;transition:transform .3s}
.pp-sample:hover{transform:translateY(-3px)}
.pp-sample img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.pp-sample div{padding:18px 20px;display:flex;flex-direction:column;gap:4px}
.pp-sample b{font-size:18px}.pp-sample span{font-size:14px;color:var(--soft)}.pp-sample em{font-style:normal;font-size:12px;font-weight:800;letter-spacing:.1em;color:var(--acc);margin-top:6px;text-transform:uppercase}
.pp-steps{list-style:none;padding:0;margin:0;counter-reset:s;display:grid;gap:12px;max-width:760px}
.pp-steps li{counter-increment:s;position:relative;padding:4px 0 4px 52px;font-size:16px;line-height:1.6;color:var(--soft)}
.pp-steps li b{color:var(--ink)}
.pp-steps li::before{content:counter(s);position:absolute;left:0;top:2px;width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--bg);font-weight:800;font-size:13px;display:grid;place-items:center}
.pp-cta{padding-top:72px;padding-bottom:20px}
.pp-cta>p{font-size:18px;line-height:1.6;color:var(--soft);max-width:600px}
.pp-btns{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0 34px}
.pp-btn{display:inline-block;text-decoration:none;background:var(--acc);color:#fff !important;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:16px 28px;border-radius:100px}
.pp-ghost{background:transparent;border:1px solid var(--line);color:var(--ink) !important}
.pp-sign b{display:block;font-size:17px}.pp-sign span{font-size:14px;color:var(--soft)}
.pp-foot{max-width:1100px;margin:60px auto 0;padding:26px 24px 46px;border-top:1px solid var(--line);font-size:12px;line-height:1.8;color:#6b6b73}
@media (max-width:760px){.pp-concept,.pp-grid,.pp-samples{grid-template-columns:1fr}.pp-mob{width:230px;margin:0 auto}.pp-hero,.pp-sec{padding-top:44px}.pp-meta{display:none}}
@media print{
  @page{size:A4;margin:0}
  .pp{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pp-sec,.pp-cta{break-inside:avoid;page-break-inside:avoid}
  .pp-hero{padding-top:20px}
  .pp-sample:hover{transform:none}
}
`;
