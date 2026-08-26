import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Card } from "@/components/ui";
import { getServerLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Terms of Service: Zebraish Studio",
  description: "The terms that govern working with Zebraish Studio.",
};

const LAST_UPDATED = "August 25, 2026";
const LAST_UPDATED_ES = "25 de agosto de 2026";

const SECTIONS_EN: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Who we are",
    body: (
      <p>
        Zebraish Studio (&quot;Zebraish&quot;, &quot;we&quot;, &quot;us&quot;) is a digital product studio that
        designs and builds websites, software, brand, and automation work for clients. Zebraish is based in Nigeria
        and works with clients worldwide. You can reach us at{" "}
        <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
          j0shbankole19@gmail.com
        </a>{" "}
        or{" "}
        <a href="tel:+2348165320780" className="text-accent hover:underline">
          +234 816 532 0780
        </a>
        .
      </p>
    ),
  },
  {
    heading: "2. Scope of work & quotes",
    body: (
      <p>
        Every project starts with a scope and a quoted price, shared with you before any payment is requested. The
        quote is specific to what was discussed. Work outside that scope (new features, extra revisions beyond
        what was agreed, a materially different direction) is treated as new work and quoted separately. Timelines
        communicated to you are estimates, not fixed deadlines, unless confirmed in writing for your project.
      </p>
    ),
  },
  {
    heading: "3. Payment",
    body: (
      <p>
        Payments are processed through Flutterwave. By paying an invoice you agree to Flutterwave&apos;s own terms
        for the transaction in addition to these terms. Prices are quoted in the currency shown at checkout. Work
        on a project begins once payment (or the agreed deposit) is confirmed as received. We don&apos;t start
        building on the strength of a promise to pay.
      </p>
    ),
  },
  {
    heading: "4. Refunds & cancellations",
    body: (
      <p>
        If you cancel before work has started, you&apos;re entitled to a full refund. Once work is underway,
        refunds are prorated to the portion of the scope not yet delivered, at our discretion, minus any payment
        processor fees already incurred. If a project stalls because we can&apos;t reach you for input needed to
        continue, we&apos;ll make reasonable attempts to contact you before treating it as paused; a project paused
        this way for more than 60 days may be closed without a refund for work already completed. See our{" "}
        <a href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </a>{" "}
        for how we handle your data if that happens.
      </p>
    ),
  },
  {
    heading: "5. Ownership & delivery",
    body: (
      <p>
        Ownership of the final deliverables (code, designs, and other work product created specifically for your
        project) transfers to you once the project is paid in full. Zebraish retains the right to reuse
        general-purpose components, patterns, and know-how that aren&apos;t specific to your project in future work
        for other clients. Third-party tools, libraries, and services used in your project remain governed by
        their own licenses.
      </p>
    ),
  },
  {
    heading: "6. Collaborators",
    body: (
      <p>
        People approved as Zebraish collaborators earn commission on projects they refer, at the rate agreed when
        they were approved. Commission is calculated on payments actually received from the referred client, and
        is paid out on the schedule communicated to the collaborator. A collaborator&apos;s access code is personal
        to them and shouldn&apos;t be shared.
      </p>
    ),
  },
  {
    heading: "7. Liability",
    body: (
      <p>
        We build things carefully, but Zebraish&apos;s liability for any claim arising from a project is limited to
        the amount you paid for that project. We&apos;re not liable for indirect or consequential losses (lost
        profits, lost data from your own systems, third-party service outages, and similar).
      </p>
    ),
  },
  {
    heading: "8. Changes to these terms",
    body: (
      <p>
        We may update these terms as Zebraish&apos;s services evolve. Material changes will be reflected here with
        an updated date above; continuing to use our services after a change means you accept the updated terms.
      </p>
    ),
  },
];

const SECTIONS_ES: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Quiénes somos",
    body: (
      <p>
        Zebraish Studio (&quot;Zebraish&quot;, &quot;nosotros&quot;) es un estudio de productos digitales que
        diseña y desarrolla sitios web, software, marca y automatización para clientes. Zebraish tiene su base en
        Nigeria y trabaja con clientes de todo el mundo. Puedes contactarnos en{" "}
        <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
          j0shbankole19@gmail.com
        </a>{" "}
        o al{" "}
        <a href="tel:+2348165320780" className="text-accent hover:underline">
          +234 816 532 0780
        </a>
        .
      </p>
    ),
  },
  {
    heading: "2. Alcance del trabajo y presupuestos",
    body: (
      <p>
        Cada proyecto comienza con un alcance y un precio presupuestado, que se te comparte antes de solicitar
        cualquier pago. El presupuesto es específico a lo acordado. El trabajo fuera de ese alcance (nuevas
        funcionalidades, revisiones adicionales más allá de lo acordado, un cambio de dirección sustancial) se
        trata como trabajo nuevo y se presupuesta por separado. Los plazos que te comunicamos son estimaciones, no
        fechas límite fijas, salvo que se confirmen por escrito para tu proyecto.
      </p>
    ),
  },
  {
    heading: "3. Pago",
    body: (
      <p>
        Los pagos se procesan a través de Flutterwave. Al pagar una factura, aceptas los propios términos de
        Flutterwave para la transacción, además de estos términos. Los precios se presupuestan en la moneda que se
        muestra al pagar. El trabajo en un proyecto comienza una vez que el pago (o el depósito acordado) se
        confirma como recibido. No empezamos a construir basándonos en una promesa de pago.
      </p>
    ),
  },
  {
    heading: "4. Reembolsos y cancelaciones",
    body: (
      <p>
        Si cancelas antes de que el trabajo haya comenzado, tienes derecho a un reembolso completo. Una vez que el
        trabajo está en marcha, los reembolsos se prorratean según la parte del alcance aún no entregada, a nuestra
        discreción, menos las comisiones del procesador de pagos ya incurridas. Si un proyecto se detiene porque no
        podemos contactarte para obtener la información necesaria para continuar, haremos intentos razonables de
        contactarte antes de considerarlo en pausa; un proyecto en esta situación por más de 60 días podrá cerrarse
        sin reembolso por el trabajo ya completado. Consulta nuestra{" "}
        <a href="/privacy" className="text-accent hover:underline">
          Política de Privacidad
        </a>{" "}
        para saber cómo manejamos tus datos si esto ocurre.
      </p>
    ),
  },
  {
    heading: "5. Propiedad y entrega",
    body: (
      <p>
        La propiedad de los entregables finales (código, diseños y otros productos de trabajo creados
        específicamente para tu proyecto) se transfiere a ti una vez que el proyecto esté pagado en su totalidad.
        Zebraish se reserva el derecho de reutilizar componentes, patrones y conocimientos de propósito general que
        no sean específicos de tu proyecto en trabajos futuros para otros clientes. Las herramientas, librerías y
        servicios de terceros utilizados en tu proyecto siguen rigiéndose por sus propias licencias.
      </p>
    ),
  },
  {
    heading: "6. Colaboradores",
    body: (
      <p>
        Las personas aprobadas como colaboradores de Zebraish ganan comisión sobre los proyectos que refieren, a la
        tasa acordada al momento de su aprobación. La comisión se calcula sobre los pagos efectivamente recibidos
        del cliente referido, y se paga según el calendario comunicado al colaborador. El código de acceso de un
        colaborador es personal y no debe compartirse.
      </p>
    ),
  },
  {
    heading: "7. Responsabilidad",
    body: (
      <p>
        Construimos las cosas con cuidado, pero la responsabilidad de Zebraish por cualquier reclamo derivado de un
        proyecto se limita al monto que pagaste por ese proyecto. No somos responsables de pérdidas indirectas o
        consecuentes (pérdida de ganancias, pérdida de datos de tus propios sistemas, interrupciones de servicios
        de terceros, y similares).
      </p>
    ),
  },
  {
    heading: "8. Cambios a estos términos",
    body: (
      <p>
        Podemos actualizar estos términos a medida que evolucionan los servicios de Zebraish. Los cambios
        materiales se reflejarán aquí con una fecha actualizada arriba; continuar usando nuestros servicios después
        de un cambio significa que aceptas los términos actualizados.
      </p>
    ),
  },
];

export default async function TermsPage() {
  const lang = await getServerLang();
  const sections = lang === "es" ? SECTIONS_ES : SECTIONS_EN;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <Logo />
        <LanguageToggle />
      </div>

      <div className="mt-8 w-full max-w-2xl">
        <Card className="prose-sm">
          <h1 className="mb-1 text-lg font-semibold">
            {lang === "es" ? "Términos de Servicio" : "Terms of Service"}
          </h1>
          <p className="mb-8 text-sm text-fg-muted">
            {lang === "es" ? "Última actualización:" : "Last updated:"}{" "}
            {lang === "es" ? LAST_UPDATED_ES : LAST_UPDATED}
          </p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-fg-muted">
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
