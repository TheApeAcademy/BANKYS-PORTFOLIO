import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";
import { getServerLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Privacy Policy: Zebraish Studio",
  description: "How Zebraish Studio collects, uses, and protects your data.",
};

const LAST_UPDATED = "August 25, 2026";
const LAST_UPDATED_ES = "25 de agosto de 2026";

const SECTIONS_EN: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. What we collect",
    body: (
      <p>
        When you configure a project, apply to collaborate, or send us a message, we collect what you give us
        directly: name, email, phone/WhatsApp number, and project details (the pitch/brief you write, pricing
        selections). When you pay, our payment processor (Flutterwave) handles your card/transfer details directly.
        We never see or store your full card number or banking credentials. We keep a record of the transaction
        (amount, currency, status, a reference ID) to confirm and track your payment.
      </p>
    ),
  },
  {
    heading: "2. How we use it",
    body: (
      <p>
        We use your information to scope and deliver your project, process payment, send you updates about your
        project&apos;s status, and, if you&apos;re a collaborator, to track and pay out commission. We
        don&apos;t sell your data, and we don&apos;t use it for advertising to third parties.
      </p>
    ),
  },
  {
    heading: "3. Who sees it",
    body: (
      <p>
        Your data is visible to Zebraish&apos;s admin team (currently a small team) for the purpose of running
        your project. It also passes through the infrastructure providers we rely on to run Zebraish: Supabase
        (database and authentication), Vercel (hosting), Flutterwave (payments), and Resend (transactional email,
        where enabled). Each of these providers processes data under their own privacy and security practices.
      </p>
    ),
  },
  {
    heading: "4. Collaborator access codes",
    body: (
      <p>
        Collaborators sign in with a private access code instead of a password-based account. That code is stored,
        hashed where practical, and tied to your commission record. Treat it like a password and don&apos;t share
        it. We can reissue a code if it&apos;s ever compromised.
      </p>
    ),
  },
  {
    heading: "5. How long we keep it",
    body: (
      <p>
        We keep project, payment, and commission records for as long as needed for accounting, tax, and
        dispute-resolution purposes, and generally for the life of the client or collaborator relationship plus a
        reasonable period after. You can ask us to delete personal data that isn&apos;t needed for those purposes
        at any time.
      </p>
    ),
  },
  {
    heading: "6. Your rights",
    body: (
      <p>
        You can ask us what data we hold about you, ask us to correct it, or ask us to delete it (subject to the
        accounting/legal retention needs above). Reach out to{" "}
        <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
          j0shbankole19@gmail.com
        </a>{" "}
        for any of this.
      </p>
    ),
  },
  {
    heading: "7. Security",
    body: (
      <p>
        We use industry-standard measures to protect your data: encrypted connections, access controls on our
        admin systems, rate limiting on public forms, and audit logging of admin actions. No system is perfectly
        secure, but we take reasonable steps to protect what you share with us.
      </p>
    ),
  },
  {
    heading: "8. Changes to this policy",
    body: (
      <p>
        We may update this policy as Zebraish&apos;s services evolve. Material changes will be reflected here with
        an updated date above.
      </p>
    ),
  },
];

const SECTIONS_ES: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Qué recopilamos",
    body: (
      <p>
        Cuando configuras un proyecto, solicitas colaborar, o nos envías un mensaje, recopilamos lo que nos das
        directamente: nombre, correo electrónico, número de teléfono/WhatsApp, y detalles del proyecto (la
        propuesta/brief que escribes, las selecciones de precio). Cuando pagas, nuestro procesador de pagos
        (Flutterwave) maneja directamente los datos de tu tarjeta/transferencia. Nunca vemos ni almacenamos tu
        número de tarjeta completo ni tus credenciales bancarias. Guardamos un registro de la transacción (monto,
        moneda, estado, un ID de referencia) para confirmar y hacer seguimiento de tu pago.
      </p>
    ),
  },
  {
    heading: "2. Cómo lo usamos",
    body: (
      <p>
        Usamos tu información para definir el alcance y entregar tu proyecto, procesar el pago, enviarte
        actualizaciones sobre el estado de tu proyecto y, si eres colaborador, para hacer seguimiento y pagar tu
        comisión. No vendemos tus datos, ni los usamos para publicidad a terceros.
      </p>
    ),
  },
  {
    heading: "3. Quién lo ve",
    body: (
      <p>
        Tus datos son visibles para el equipo administrativo de Zebraish (actualmente un equipo pequeño) con el
        propósito de gestionar tu proyecto. También pasan por los proveedores de infraestructura de los que
        dependemos para operar Zebraish: Supabase (base de datos y autenticación), Vercel (alojamiento),
        Flutterwave (pagos) y Resend (correo transaccional, donde esté habilitado). Cada uno de estos proveedores
        procesa los datos bajo sus propias prácticas de privacidad y seguridad.
      </p>
    ),
  },
  {
    heading: "4. Códigos de acceso de colaboradores",
    body: (
      <p>
        Los colaboradores inician sesión con un código de acceso privado en lugar de una cuenta con contraseña. Ese
        código se almacena, cifrado cuando es posible, y está vinculado a tu registro de comisión. Trátalo como
        una contraseña y no lo compartas. Podemos reemitir un código si alguna vez se ve comprometido.
      </p>
    ),
  },
  {
    heading: "5. Cuánto tiempo lo conservamos",
    body: (
      <p>
        Conservamos los registros de proyectos, pagos y comisiones durante el tiempo necesario para fines
        contables, fiscales y de resolución de disputas, y generalmente durante la vigencia de la relación con el
        cliente o colaborador más un período razonable después. Puedes pedirnos que eliminemos los datos
        personales que no sean necesarios para esos fines en cualquier momento.
      </p>
    ),
  },
  {
    heading: "6. Tus derechos",
    body: (
      <p>
        Puedes preguntarnos qué datos tenemos sobre ti, pedirnos que los corrijamos, o pedirnos que los eliminemos
        (sujeto a las necesidades de retención contable/legal mencionadas arriba). Escríbenos a{" "}
        <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
          j0shbankole19@gmail.com
        </a>{" "}
        para cualquiera de estas solicitudes.
      </p>
    ),
  },
  {
    heading: "7. Seguridad",
    body: (
      <p>
        Usamos medidas estándar de la industria para proteger tus datos: conexiones cifradas, controles de acceso
        en nuestros sistemas administrativos, limitación de intentos en los formularios públicos, y registro de
        auditoría de las acciones administrativas. Ningún sistema es perfectamente seguro, pero tomamos medidas
        razonables para proteger lo que compartes con nosotros.
      </p>
    ),
  },
  {
    heading: "8. Cambios a esta política",
    body: (
      <p>
        Podemos actualizar esta política a medida que evolucionan los servicios de Zebraish. Los cambios materiales
        se reflejarán aquí con una fecha actualizada arriba.
      </p>
    ),
  },
];

export default async function PrivacyPage() {
  const lang = await getServerLang();
  const sections = lang === "es" ? SECTIONS_ES : SECTIONS_EN;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <Logo />

      <div className="mt-8 w-full max-w-2xl">
        <Card className="prose-sm">
          <h1 className="mb-1 text-lg font-semibold">
            {lang === "es" ? "Política de Privacidad" : "Privacy Policy"}
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
