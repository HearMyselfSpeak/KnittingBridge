import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide Standards | KnittingBridge",
  description:
    "What KnittingBridge expects from Guides: role clarity, communication standards, and conduct.",
};

export default function GuidesStandards() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Guide standards
        </p>
        <h1
          className="text-4xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          What this role asks of you
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are not aspirational guidelines. They describe what Guides on
          this platform do and do not do. If they do not fit how you work, this
          is not the right fit.
        </p>
      </div>

      {/* Role clarity */}
      <section className="mb-14">
        <h2
          className="text-2xl font-semibold text-primary mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Role clarity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-md p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              A Guide does
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              {[
                "Answer one specific question clearly",
                "Look at the actual work and say what they see",
                "Offer a path forward without overcomplicating it",
                "Know when a question is simple and say so directly",
                "Explain the reason, if the Maker wants to understand it",
                "Complete a session within the agreed scope",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-accent shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-border rounded-md p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              A Guide does not
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              {[
                "Build ongoing coaching relationships",
                "Offer open-ended instruction beyond the session scope",
                "Solicit Makers to continue off-platform",
                "Share contact details for direct engagement",
                "Accept sessions outside their actual skill areas",
                "Dismiss a Maker's frustration as unimportant",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-accent shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Communication standards */}
      <section className="mb-14">
        <h2
          className="text-2xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Communication
        </h2>
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Makers who submit requests are often frustrated, uncertain, or
            mid-project with a deadline in mind. That emotional state is
            information. A Guide who can read it and adjust their tone
            accordingly produces better outcomes than one who delivers
            technically correct advice in a way that makes the Maker feel
            stupid.
          </p>
          <p>
            This does not mean being effusive or reassuring at the expense of
            accuracy. It means meeting people where they are. If a Maker is
            frustrated, acknowledge it briefly and get to the answer. If they
            are uncertain, build confidence alongside the technical guidance. If
            they just want the answer without the explanation, give it to them.
          </p>
          <p>
            There is no right tone universally. The system matches Guide
            communication style to what a Maker&apos;s situation calls for.
            What it screens for is the ability to vary approach, not the ability
            to perform warmth.
          </p>
        </div>
      </section>

      {/* Session scope */}
      <section className="mb-14">
        <h2
          className="text-2xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Session scope
        </h2>
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Sessions are scoped. That means when a Maker submits a request
            about tension on the yoke of a sweater, the session is about that.
            If during the session it becomes clear that the sweater has other
            issues, you can note them, but you are not obligated to address
            them in the same session, and the Maker has not paid for them.
          </p>
          <p>
            If a session turns out to require substantially more work than the
            request described, the Guide is expected to communicate that clearly
            and agree with the Maker on how to proceed, whether that means a
            second session, a different session type, or a focused answer to
            the original question only.
          </p>
          <p>
            Guides who regularly expand sessions beyond the agreed scope, in
            either direction, over-delivering or under-delivering, will be
            reviewed. The goal is a consistently scoped, predictably useful
            experience.
          </p>
        </div>
      </section>

      {/* Off-platform prohibition */}
      <section className="mb-14 bg-secondary/40 rounded-md border border-border p-6">
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Off-platform contact
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Guides may not solicit Makers to continue working together outside the
          platform. This means no exchanging contact details during sessions, no
          suggesting that the Maker reach out directly, and no referencing
          outside services you offer.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is not about control. It is about trust. Makers come to the
          platform because the matching system provides a consistent, safe
          experience. Circumventing it breaks that trust for everyone. Guides
          found to be soliciting off-platform relationships will have their
          accounts suspended.
        </p>
      </section>

      {/* Accountability */}
      <section className="mb-14">
        <h2
          className="text-2xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Feedback and accountability
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          After each session, Makers provide private feedback. This is not a
          public rating. It is not visible to other Makers, other Guides, or
          anywhere on the platform. It is used internally to calibrate matching
          and to identify Guides who may need support or review.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Guides can see their own feedback from their dashboard. Persistent
          patterns of low satisfaction, scope violations, or conduct complaints
          will result in review and potentially suspension. This protects the
          experience for Makers and for the Guides who are doing the work well.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/guides/apply"
          className="inline-flex items-center justify-center bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Apply to become a Guide
        </Link>
        <Link
          href="/legal/guide-agreement"
          className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Read the Guide agreement
        </Link>
      </div>
    </div>
  );
}
