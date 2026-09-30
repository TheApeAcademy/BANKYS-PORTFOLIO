import type { Metadata } from "next";
import { CONTACT, mailtoUrl } from "@zebraish/lib/contact";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui";
import { getServerLang } from "@/lib/i18n/server";

// Cookie policy. Everything the site stores is technical or a preference the
// visitor sets themselves (LSSI art. 22.2 exempts these from consent), so the
// site shows a notice, not a consent wall. Keep this list in step with the code:
// a new analytics or advertising cookie would need real consent first.

export async function generateMetadata(): Promise<Metadata> {
  const es = (await getServerLang()) === "es";
  return {
    title: es ? "Política de cookies: Zebraish Studio" : "Cookie policy: Zebraish Studio",
    description: es ? "Qué guarda Zebraish Studio en tu dispositivo y por qué." : "What Zebraish Studio stores on your device, and why.",
  };
}

const LAST_UPDATED = "September 29, 2026";
const LAST_UPDATED_ES = "29 de septiembre de 2026";

type Row = { name: string; kind: string; purpose: [string, string]; lasts: [string, string] };

const ROWS: Row[] = [
  { name: "zb_lang", kind: "Cookie", purpose: ["Recuerda el idioma que elegiste.", "Remembers the language you chose."], lasts: ["1 año", "1 year"] },
  { name: "zb_theme", kind: "Cookie", purpose: ["Recuerda el tema claro u oscuro.", "Remembers light or dark theme."], lasts: ["1 año", "1 year"] },
  {
    name: "zb_collab_code",
    kind: "Cookie",
    purpose: ["Mantiene abierta la sesión de colaboradores (solo si entras con tu código).", "Keeps collaborators signed in (only if you enter your code)."],
    lasts: ["180 días", "180 days"],
  },
  {
    name: "sb-…-auth-token",
    kind: "Cookie",
    purpose: ["Sesión de inicio de sesión (solo en el área privada).", "Signed-in session (private area only)."],
    lasts: ["Sesión", "Session"],
  },
  { name: "zb-track-token", kind: "localStorage", purpose: ["Te devuelve a tu proyecto al volver.", "Takes you back to your project when you return."], lasts: ["Hasta que lo borres", "Until you clear it"] },
  { name: "zb_configurator_draft", kind: "localStorage", purpose: ["Guarda el borrador de tu brief mientras lo completas.", "Saves your brief draft while you fill it in."], lasts: ["Hasta enviarlo", "Until sent"] },
  { name: "zb-sound, zb-music-t", kind: "localStorage", purpose: ["Recuerdan si activaste el sonido y por dónde iba la música.", "Remember whether you turned sound on and where the music was."], lasts: ["Hasta que lo borres", "Until you clear it"] },
  { name: "zb-pattern", kind: "localStorage", purpose: ["Número del patrón generado para tu visita.", "Number of the pattern generated for your visit."], lasts: ["Hasta que lo borres", "Until you clear it"] },
  { name: "zb-cookie-notice", kind: "localStorage", purpose: ["Recuerda que ya viste este aviso.", "Remembers you've seen this notice."], lasts: ["Hasta que lo borres", "Until you clear it"] },
  {
    name: "zb-lite",
    kind: "sessionStorage",
    purpose: ["Si tu equipo va justo, recuerda usar efectos más ligeros.", "If your device is struggling, remembers to use lighter effects."],
    lasts: ["Al cerrar la pestaña", "Until you close the tab"],
  },
  { name: "zb-from-zebra", kind: "sessionStorage", purpose: ["Enlaza la intro con la página del estudio.", "Links the intro to the studio page."], lasts: ["Al cerrar la pestaña", "Until you close the tab"] },
];

export default async function CookiesPage() {
  const lang = await getServerLang();
  const es = lang === "es";
  const i = es ? 0 : 1;

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
          <h1 className="mb-1 text-lg font-semibold">{es ? "Política de cookies" : "Cookie policy"}</h1>
          <p className="mb-8 text-sm text-fg-muted">
            {es ? "Última actualización:" : "Last updated:"} {es ? LAST_UPDATED_ES : LAST_UPDATED}
          </p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-fg-muted">
            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">{es ? "Lo esencial" : "The short version"}</h2>
              <p>
                {es
                  ? "No usamos cookies de publicidad ni de analítica de terceros, y no te rastreamos entre sitios. Contamos las visitas y los clics de forma anónima en nuestro propio servidor, sin cookies ni identificadores. Solo guardamos en tu dispositivo lo necesario para que la web funcione y para recordar las preferencias que tú eliges, como el idioma. Por eso no te pedimos consentimiento: la ley (art. 22.2 de la LSSI) lo exime para este tipo de almacenamiento."
                  : "We don't use advertising cookies or third-party analytics, and we don't track you across sites. We count visits and clicks anonymously on our own server, without cookies or identifiers. We only store what the site needs to work and the preferences you choose, such as language. That's why we don't ask for consent: the law (LSSI art. 22.2) exempts this kind of storage."}
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">{es ? "Qué guardamos" : "What we store"}</h2>
              {/* Phones: one card per item instead of a four-column table. */}
              <ul className="flex flex-col gap-3 sm:hidden">
                {ROWS.map((r) => (
                  <li key={r.name} className="rounded-lg border border-border p-3 text-xs">
                    <p className="font-mono text-fg">{r.name}</p>
                    <p className="mt-1">{r.purpose[i]}</p>
                    <p className="mt-1 text-fg-muted">
                      {r.kind} · {r.lasts[i]}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="text-fg">
                      <th className="border-b border-border py-2 pr-3 font-medium">{es ? "Nombre" : "Name"}</th>
                      <th className="border-b border-border py-2 pr-3 font-medium">{es ? "Tipo" : "Type"}</th>
                      <th className="border-b border-border py-2 pr-3 font-medium">{es ? "Para qué" : "Purpose"}</th>
                      <th className="border-b border-border py-2 font-medium">{es ? "Duración" : "Lasts"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r) => (
                      <tr key={r.name} className="align-top">
                        <td className="border-b border-border py-2 pr-3 font-mono text-fg">{r.name}</td>
                        <td className="border-b border-border py-2 pr-3">{r.kind}</td>
                        <td className="border-b border-border py-2 pr-3">{r.purpose[i]}</td>
                        <td className="border-b border-border py-2">{r.lasts[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">{es ? "Servicios de terceros" : "Third-party services"}</h2>
              <p>
                {es
                  ? "Para mostrar la web, tu navegador descarga tipografías de Google Fonts e imágenes de Unsplash, y los casos de estudio incrustan las webs de nuestros proyectos. Estos servicios reciben tu dirección IP para poder servir los archivos. Si pagas online, lo haces en Flutterwave, que aplica su propia política de cookies."
                  : "To show the site, your browser downloads fonts from Google Fonts and images from Unsplash, and the case studies embed the websites of our projects. These services receive your IP address in order to serve the files. If you pay online, you do so on Flutterwave, which applies its own cookie policy."}
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">{es ? "Cómo borrarlo" : "How to remove it"}</h2>
              <p>
                {es
                  ? "Puedes borrar las cookies y el almacenamiento local desde la configuración de tu navegador en cualquier momento. La web seguirá funcionando; solo olvidará tus preferencias."
                  : "You can delete cookies and local storage from your browser settings at any time. The site keeps working; it just forgets your preferences."}{" "}
                {es ? "¿Dudas? Escríbenos a" : "Questions? Write to"}{" "}
                <a href={mailtoUrl} className="text-accent hover:underline">
                  {CONTACT.email}
                </a>
                .
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
