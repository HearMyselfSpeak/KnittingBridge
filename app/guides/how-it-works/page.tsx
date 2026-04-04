import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide Flow | KnittingBridge",
  description:
    "How the Guide experience works on KnittingBridge, from application to payout.",
};

export default function GuidesHowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Guide overview
        </p>
        <h1
          className="text-4xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How being a Guide works
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          From the application to a completed session, here is what to expect
          at each stage.
        </p>
      </div>

      {/* Application flow */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-8"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Applying
        </h2>

        <div className="space-y-8">
          {[
            {
              step: "01",
              title: "Identity and location",
              body: "Name, email, location, and timezone. We use timezone to match you with Makers who are active when you are available.",
            },
            {
              step: "02",
              title: "Skill areas",
              body: "Select the areas where you have genuine depth: garment construction, fit and sizing, socks, lace, colorwork, cables, pattern modification, yarn substitution, repair and rescue, or machine knitting. You can select multiple areas.",
            },
            {
              step: "03",
              title: "Experience snapshot",
              body: "How long you have been knitting, what types of projects you typically make, and where you most often help other knitters. This informs the matching algorithm.",
            },
            {
              step: "04",
              title: "Sample work",
              body: "Upload two or three photos of finished projects, or a pattern alongside an explanation of a fix you made for someone. This shows the review team what your experience looks like in practice.",
            },
            {
              step: "05",
              title: "Scenario responses",
              body: "Three short written responses to scenarios we give you. For example,, how you approach a frustrated Maker, when you recommend starting over, and how you explain a tension issue. These assess how you communicate, not just what you know.",
            },
            {
              step: "06",
              title: "Availability",
              body: "Messaging only, or messaging and video calls. Weekly availability range. You can update this later from your dashboard.",
            },
            {
              step: "07",
              title: "Agreements",
              body: "Acknowledgment of the Guide standards, confirmation that sessions are paid and scoped, and agreement not to solicit Makers to continue outside the platform.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-6">
              <span
                className="text-3xl font-light text-accent/40 tabular-nums shrink-0 w-10"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step}
              </span>
              <div>
                <p className="text-base font-semibold text-foreground mb-1">
                  {title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-secondary/40 rounded-md border border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            All applications are reviewed manually. We do not auto-approve. If
            your application is approved, you will receive an email with
            instructions to complete your Stripe Connect setup and set your
            availability.
          </p>
        </div>
      </section>

      <div className="border-t border-border my-12" />

      {/* Receiving requests */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-8"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Receiving and accepting requests
        </h2>

        <div className="space-y-8">
          {[
            {
              step: "01",
              title: "You are notified",
              body: "When a Maker submits a request that the system matches to your profile, you receive a notification in the platform. You see: the issue summary, the skills needed, the estimated session length, and the payment amount.",
            },
            {
              step: "02",
              title: "Five-minute window",
              body: "You have five minutes to accept or decline. If you do not respond, the request expands to other qualified Guides. There is no penalty for declining. The system learns your preferences over time.",
            },
            {
              step: "03",
              title: "First to accept gets it",
              body: "Multiple Guides may be notified. The first one to accept takes the session. Once you accept, the Maker's payment is captured and the session begins.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-6">
              <span
                className="text-3xl font-light text-accent/40 tabular-nums shrink-0 w-10"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step}
              </span>
              <div>
                <p className="text-base font-semibold text-foreground mb-1">
                  {title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-border my-12" />

      {/* Running sessions */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Running a session
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Two session types are available. You specify which you offer when you
          apply and can update this from your dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-border rounded-md p-6">
            <p
              className="font-serif font-semibold text-primary mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Async
            </p>
            <p className="text-xs text-muted-foreground mb-3">$25–$45 typical</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Written guidance and photo review, conducted through the platform
              message thread. Resolved on your schedule, typically within a few
              hours. Well-suited for pattern clarification, yarn substitution
              advice, and technique questions with photos.
            </p>
          </div>
          <div className="border border-border rounded-md p-6">
            <p
              className="font-serif font-semibold text-primary mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Live
            </p>
            <p className="text-xs text-muted-foreground mb-3">$60–$90 typical</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A video call embedded in the platform. No external apps, no
              Zoom, no leaving the site. 20 to 40 minutes. Better for complex
              fit issues, technique demonstration, and anything where seeing
              the actual work in real time makes the difference.
            </p>
          </div>
        </div>

        <div className="border border-border rounded-md p-6">
          <p
            className="font-serif font-semibold text-primary mb-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Complex consult
          </p>
          <p className="text-xs text-muted-foreground mb-3">$100+ typical</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For pattern modification, full fit adjustment, or rescue operations
            that require extended back-and-forth. Scope is agreed before the
            session starts.
          </p>
        </div>
      </section>

      <div className="border-t border-border my-12" />

      {/* Payout */}
      <section className="mb-14">
        <h2
          className="text-2xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Getting paid
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            When a session completes, the platform automatically transfers 75%
            of the session fee to your connected Stripe account. You will need
            to complete Stripe Connect onboarding as part of the Guide setup
            process after approval.
          </p>
          <p>
            Stripe handles the transfer. Standard Stripe payout schedules
            apply based on your account country and settings. You do not invoice
            the platform, and the platform does not hold earnings.
          </p>
          <p>
            If a session is disputed or refunded, see the{" "}
            <Link href="/legal/refund-policy" className="text-primary hover:underline">
              refund policy
            </Link>{" "}
            for how disputes are handled and how that affects Guide earnings.
          </p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/guides/apply"
          className="inline-flex items-center justify-center bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Apply to become a Guide
        </Link>
        <Link
          href="/guides/compensation"
          className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Compensation details
        </Link>
      </div>
    </div>
  );
}
