import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of Service — Zebraish Studio",
  description: "The terms that govern working with Zebraish Studio.",
};

const LAST_UPDATED = "August 25, 2026";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16 bg-bg text-fg">
      <Logo />

      <div className="mt-8 w-full max-w-2xl">
        <Card className="prose-sm">
          <h1 className="mb-1 text-lg font-semibold">Terms of Service</h1>
          <p className="mb-8 text-sm text-fg-muted">Last updated: {LAST_UPDATED}</p>

          <div className="flex flex-col gap-6 text-sm leading-relaxed text-fg-muted">
            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">1. Who we are</h2>
              <p>
                Zebraish Studio (&quot;Zebraish&quot;, &quot;we&quot;, &quot;us&quot;) is a digital product studio
                that designs and builds websites, software, brand, and automation work for clients. Zebraish is
                based in Nigeria and works with clients worldwide. You can reach us at{" "}
                <a href="mailto:j0shbankole19@gmail.com" className="text-accent hover:underline">
                  j0shbankole19@gmail.com
                </a>{" "}
                or{" "}
                <a href="tel:+2348165320780" className="text-accent hover:underline">
                  +234 816 532 0780
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">2. Scope of work &amp; quotes</h2>
              <p>
                Every project starts with a scope and a quoted price, shared with you before any payment is
                requested. The quote is specific to what was discussed — work outside that scope (new features,
                extra revisions beyond what was agreed, a materially different direction) is treated as new work
                and quoted separately. Timelines communicated to you are estimates, not fixed deadlines, unless
                confirmed in writing for your project.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">3. Payment</h2>
              <p>
                Payments are processed through Flutterwave. By paying an invoice you agree to Flutterwave&apos;s
                own terms for the transaction in addition to these terms. Prices are quoted in the currency shown
                at checkout. Work on a project begins once payment (or the agreed deposit) is confirmed as
                received — we don&apos;t start building on the strength of a promise to pay.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">4. Refunds &amp; cancellations</h2>
              <p>
                If you cancel before work has started, you&apos;re entitled to a full refund. Once work is
                underway, refunds are prorated to the portion of the scope not yet delivered, at our discretion,
                minus any payment processor fees already incurred. If a project stalls because we can&apos;t reach
                you for input needed to continue, we&apos;ll make reasonable attempts to contact you before
                treating it as paused; a project paused this way for more than 60 days may be closed without a
                refund for work already completed. See our{" "}
                <a href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </a>{" "}
                for how we handle your data if that happens.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">5. Ownership &amp; delivery</h2>
              <p>
                Ownership of the final deliverables (code, designs, and other work product created specifically
                for your project) transfers to you once the project is paid in full. Zebraish retains the right
                to reuse general-purpose components, patterns, and know-how that aren&apos;t specific to your
                project in future work for other clients. Third-party tools, libraries, and services used in your
                project remain governed by their own licenses.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">6. Collaborators</h2>
              <p>
                People approved as Zebraish collaborators earn commission on projects they refer, at the rate
                agreed when they were approved. Commission is calculated on payments actually received from the
                referred client, and is paid out on the schedule communicated to the collaborator. A
                collaborator&apos;s access code is personal to them and shouldn&apos;t be shared.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">7. Liability</h2>
              <p>
                We build things carefully, but Zebraish&apos;s liability for any claim arising from a project is
                limited to the amount you paid for that project. We&apos;re not liable for indirect or
                consequential losses (lost profits, lost data from your own systems, third-party service outages,
                and similar).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-fg">8. Changes to these terms</h2>
              <p>
                We may update these terms as Zebraish&apos;s services evolve. Material changes will be reflected
                here with an updated date above; continuing to use our services after a change means you accept
                the updated terms.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
