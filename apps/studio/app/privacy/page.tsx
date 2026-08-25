import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy — Zebraish Studio",
  description: "How Zebraish Studio collects, uses, and protects your data.",
};

const LAST_UPDATED = "August 25, 2026";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <Logo />

      <div className="mt-8 w-full max-w-2xl">
        <Card className="prose-sm">
          <h1 className="mb-1 text-lg font-semibold">Privacy Policy</h1>
          <p className="mb-8 text-sm text-fg-muted">Last updated: {LAST_UPDATED}</p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-fg-muted">
            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">1. What we collect</h2>
              <p>
                When you configure a project, apply to collaborate, or send us a message, we collect what you give
                us directly: name, email, phone/WhatsApp number, and project details (the pitch/brief you write,
                pricing selections). When you pay, our payment processor (Flutterwave) handles your card/transfer
                details directly — we never see or store your full card number or banking credentials. We keep a
                record of the transaction (amount, currency, status, a reference ID) to confirm and track your
                payment.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">2. How we use it</h2>
              <p>
                We use your information to scope and deliver your project, process payment, send you updates about
                your project&apos;s status, and — if you&apos;re a collaborator — to track and pay out commission.
                We don&apos;t sell your data, and we don&apos;t use it for advertising to third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">3. Who sees it</h2>
              <p>
                Your data is visible to Zebraish&apos;s admin team (currently a small team) for the purpose of
                running your project. It also passes through the infrastructure providers we rely on to run
                Zebraish: Supabase (database and authentication), Vercel (hosting), Flutterwave (payments), and
                Resend (transactional email, where enabled). Each of these providers processes data under their
                own privacy and security practices.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">4. Collaborator access codes</h2>
              <p>
                Collaborators sign in with a private access code instead of a password-based account. That code is
                stored, hashed where practical, and tied to your commission record — treat it like a password and
                don&apos;t share it. We can reissue a code if it&apos;s ever compromised.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">5. How long we keep it</h2>
              <p>
                We keep project, payment, and commission records for as long as needed for accounting, tax, and
                dispute-resolution purposes, and generally for the life of the client or collaborator relationship
                plus a reasonable period after. You can ask us to delete personal data that isn&apos;t needed for
                those purposes at any time.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">6. Your rights</h2>
              <p>
                You can ask us what data we hold about you, ask us to correct it, or ask us to delete it (subject
                to the accounting/legal retention needs above). Reach out to{" "}
                <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
                  j0shbankole19@gmail.com
                </a>{" "}
                for any of this.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">7. Security</h2>
              <p>
                We use industry-standard measures to protect your data — encrypted connections, access controls
                on our admin systems, rate limiting on public forms, and audit logging of admin actions. No system
                is perfectly secure, but we take reasonable steps to protect what you share with us.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">8. Changes to this policy</h2>
              <p>
                We may update this policy as Zebraish&apos;s services evolve. Material changes will be reflected
                here with an updated date above.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
