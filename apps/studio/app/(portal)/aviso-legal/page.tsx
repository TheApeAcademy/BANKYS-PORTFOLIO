import type { Metadata } from "next";
import { CONTACT, LEGAL, mailtoUrl, telUrl } from "@zebraish/lib/contact";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui";
import { getServerLang } from "@/lib/i18n/server";

// Aviso legal: the owner details Spain's LSSI-CE (Ley 34/2002, art. 10) requires
// on any site offering services. Owner rows come from LEGAL in
// @zebraish/lib/contact and are left off until they're filled in.

export async function generateMetadata(): Promise<Metadata> {
  const es = (await getServerLang()) === "es";
  return {
    title: es ? "Aviso legal: Zebraish Studio" : "Legal notice: Zebraish Studio",
    description: es ? "Datos del titular de Zebraish Studio y condiciones de uso del sitio." : "Who runs Zebraish Studio and the terms for using this site.",
  };
}

const LAST_UPDATED = "September 29, 2026";
const LAST_UPDATED_ES = "29 de septiembre de 2026";

type Section = { heading: string; body: React.ReactNode };

function ownerRows(es: boolean): [string, React.ReactNode][] {
  const rows: [string, React.ReactNode][] = [];
  if (LEGAL.ownerName) rows.push([es ? "Titular" : "Owner", LEGAL.ownerName]);
  rows.push([es ? "Nombre comercial" : "Trading name", LEGAL.tradeName]);
  if (LEGAL.taxId) rows.push([es ? "NIF/NIE" : "Tax ID (NIF/NIE)", LEGAL.taxId]);
  if (LEGAL.address) rows.push([es ? "Domicilio" : "Address", LEGAL.address]);
  rows.push([
    "Email",
    <a key="e" href={mailtoUrl} className="text-accent hover:underline">
      {CONTACT.email}
    </a>,
  ]);
  rows.push([
    es ? "Teléfono / WhatsApp" : "Phone / WhatsApp",
    <a key="p" href={telUrl} className="text-accent hover:underline">
      {CONTACT.phoneDisplay}
    </a>,
  ]);
  rows.push([
    es ? "Actividad" : "Activity",
    es ? "Diseño y desarrollo de webs, software, marca y automatización." : "Design and development of websites, software, brand and automation.",
  ]);
  return rows;
}

const SECTIONS_ES: Section[] = [
  {
    heading: "2. Objeto",
    body: (
      <p>
        Este aviso legal regula el uso de este sitio web, a través del cual Zebraish Studio presenta sus servicios y
        permite solicitar presupuestos, seguir proyectos y realizar pagos. Al navegar por el sitio aceptas estas
        condiciones. Los encargos de trabajo se rigen además por nuestros{" "}
        <a href="/terms" className="text-accent hover:underline">términos de servicio</a>.
      </p>
    ),
  },
  {
    heading: "3. Propiedad intelectual",
    body: (
      <p>
        Los textos, diseños, logotipos, código e imágenes de este sitio pertenecen a Zebraish Studio o a sus
        respectivos titulares y están protegidos por la normativa de propiedad intelectual e industrial. No se
        permite reproducirlos ni distribuirlos sin autorización. Los proyectos mostrados como trabajos anteriores
        pertenecen a sus clientes y se enseñan como muestra de capacidad.
      </p>
    ),
  },
  {
    heading: "4. Responsabilidad",
    body: (
      <p>
        Cuidamos que la información del sitio sea correcta, pero puede contener errores o quedar desactualizada.
        Los precios que muestra el configurador son estimaciones iniciales; el precio final se confirma tras revisar
        cada proyecto. No respondemos del contenido de los sitios de terceros enlazados desde aquí.
      </p>
    ),
  },
  {
    heading: "5. Datos personales y cookies",
    body: (
      <p>
        Tratamos los datos que nos facilitas según nuestra{" "}
        <a href="/privacy" className="text-accent hover:underline">política de privacidad</a>. Sobre lo que se guarda en
        tu dispositivo, consulta la{" "}
        <a href="/cookies" className="text-accent hover:underline">política de cookies</a>.
      </p>
    ),
  },
  {
    heading: "6. Legislación aplicable",
    body: (
      <p>
        Este sitio se rige por la legislación española. Si eres consumidor, podrás acudir a los juzgados de tu
        domicilio.
      </p>
    ),
  },
];

const SECTIONS_EN: Section[] = [
  {
    heading: "2. Purpose",
    body: (
      <p>
        This legal notice covers the use of this website, where Zebraish Studio presents its services and lets you
        request quotes, track projects and make payments. By browsing the site you accept these conditions. Project
        work is also governed by our{" "}
        <a href="/terms" className="text-accent hover:underline">terms of service</a>.
      </p>
    ),
  },
  {
    heading: "3. Intellectual property",
    body: (
      <p>
        The text, designs, logos, code and images on this site belong to Zebraish Studio or their respective owners
        and are protected by intellectual and industrial property law. They may not be copied or distributed
        without permission. Projects shown as past work belong to their clients and are shown as proof of
        capability.
      </p>
    ),
  },
  {
    heading: "4. Liability",
    body: (
      <p>
        We take care to keep the information on this site accurate, but it may contain errors or go out of date.
        Prices shown by the project builder are initial estimates; the final price is confirmed after each project
        is reviewed. We are not responsible for the content of third-party sites linked from here.
      </p>
    ),
  },
  {
    heading: "5. Personal data and cookies",
    body: (
      <p>
        We handle the data you give us as set out in our{" "}
        <a href="/privacy" className="text-accent hover:underline">privacy policy</a>. For what is stored on your
        device, see the <a href="/cookies" className="text-accent hover:underline">cookie policy</a>.
      </p>
    ),
  },
  {
    heading: "6. Governing law",
    body: (
      <p>
        This site is governed by Spanish law. If you are a consumer, you may bring any claim before the courts where
        you live.
      </p>
    ),
  },
];

export default async function AvisoLegalPage() {
  const lang = await getServerLang();
  const es = lang === "es";
  const sections = es ? SECTIONS_ES : SECTIONS_EN;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="mt-8 w-full max-w-2xl">
        <Card className="prose-sm">
          <h1 className="mb-1 text-lg font-semibold">{es ? "Aviso legal" : "Legal notice"}</h1>
          <p className="mb-8 text-sm text-fg-muted">
            {es ? "Última actualización:" : "Last updated:"} {es ? LAST_UPDATED_ES : LAST_UPDATED}
          </p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-fg-muted">
            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">{es ? "1. Titular del sitio" : "1. Who runs this site"}</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                {ownerRows(es).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-fg">{k}</dt>
                    <dd className="m-0">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="mb-2 text-sm font-medium text-fg">{s.heading}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
