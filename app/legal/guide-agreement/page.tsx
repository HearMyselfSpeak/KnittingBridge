import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide Agreement — KnittingBridge",
};

export default function GuideAgreement() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Legal</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Guide Agreement
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: January 1, 2025. Applies to all approved Guides.
        </p>
      </div>

      <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            1. Independent contractor status
          </h2>
          <p className="mb-3">
            Guides are independent contractors, not employees, agents, or
            partners of KnittingBridge. This Agreement does not create an
            employment relationship. Guides are responsible for their own taxes,
            professional obligations, and compliance with applicable law.
          </p>
          <p>
            KnittingBridge does not control how Guides provide guidance within
            a session. Guides use their professional judgment. The Platform
            manages intake, matching, payment processing, and communication
            infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            2. Session obligations
          </h2>
          <p className="mb-3">
            By accepting a request, a Guide agrees to:
          </p>
          <ul className="space-y-2 pl-4 mb-3">
            {[
              "Provide focused, honest guidance within the scope of the request",
              "Complete the session within a reasonable time for the session type",
              "Communicate clearly if the request requires scope adjustment",
              "Maintain professional conduct throughout the session",
              "Not abandon an accepted session without cause",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent/60 shrink-0">—</span>
                {item}
              </li>
            ))}
          </ul>
          <p>
            Guides who repeatedly abandon accepted sessions or deliver
            substantially below the standard described in their application
            will be reviewed and may be suspended.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            3. Compensation
          </h2>
          <p className="mb-3">
            Guides receive 75% of the session fee. Payments are processed
            through Stripe Connect. KnittingBridge retains 25% to cover
            payment processing, infrastructure, and platform operations.
          </p>
          <p className="mb-3">
            Payment is transferred automatically when a session is marked
            complete. Guides must maintain an active, valid Stripe Connect
            account to receive payment. KnittingBridge is not responsible for
            delays caused by issues with a Guide&apos;s Stripe account.
          </p>
          <p>
            In the event of a dispute or refund, Guide earnings may be reversed
            in part or in full depending on the outcome. See the Refund Policy
            for the applicable rules.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            4. Off-platform prohibition
          </h2>
          <p className="mb-3">
            Guides may not, during or after a session, solicit Makers for
            direct engagement outside the Platform. This includes but is not
            limited to:
          </p>
          <ul className="space-y-2 pl-4 mb-3">
            {[
              "Sharing personal contact information (email, phone, social media handle)",
              "Directing Makers to a personal website, Etsy shop, or teaching service",
              "Suggesting that the Maker contact you directly for follow-up",
              "Accepting contact from a Maker who has been connected with you through the Platform",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent/60 shrink-0">—</span>
                {item}
              </li>
            ))}
          </ul>
          <p>
            Violation of this term will result in immediate suspension. There
            is no warning issued for a first offense of direct solicitation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            5. Confidentiality
          </h2>
          <p>
            Guides agree not to share the content of sessions — the Maker&apos;s
            question, photos, project details, or any identifying information
            — outside the Platform. This includes posting about sessions on
            social media, even without naming the Maker. Sessions are private
            between the parties and the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            6. Accuracy and limitations
          </h2>
          <p className="mb-3">
            Guides provide guidance to the best of their knowledge. Knitting
            involves many variables. A Guide&apos;s assessment of a problem is an
            informed opinion, not a guarantee. KnittingBridge and Guides are not
            liable for outcomes that result from following session guidance.
          </p>
          <p>
            Guides should decline or flag sessions where a question falls
            outside their actual skill areas. Accepting sessions beyond your
            competence does not benefit Makers and may result in dispute.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            7. Termination
          </h2>
          <p className="mb-3">
            Either party may terminate this agreement at any time. Guides may
            close their account from the dashboard. KnittingBridge may suspend
            or terminate Guide access for violations of this Agreement or the
            Terms of Service.
          </p>
          <p>
            Termination does not affect obligations for sessions accepted before
            the termination date. Pending earnings will be disbursed for
            completed sessions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            8. Governing law
          </h2>
          <p>
            This Agreement is governed by the laws of the state of Delaware.
            Disputes will be resolved through binding arbitration rather than
            litigation, except where prohibited by law.
          </p>
        </section>
      </div>
    </div>
  );
}
