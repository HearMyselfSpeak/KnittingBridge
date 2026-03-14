import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide Compensation — KnittingBridge",
  description:
    "How Guide earnings work on KnittingBridge: session rates, the 75/25 split, and payout structure.",
};

export default function GuidesCompensation() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Guide compensation
        </p>
        <h1
          className="text-4xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          What Guides earn
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          75% of every session fee goes directly to the Guide. The platform
          keeps 25% to cover payment processing, infrastructure, and matching.
          There are no subscription fees, monthly minimums, or platform charges.
        </p>
      </div>

      {/* Rate table */}
      <section className="mb-14">
        <h2
          className="text-xl font-semibold text-primary mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Session rates
        </h2>

        <div className="border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-3 bg-secondary/40 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div>Session type</div>
            <div>Typical total</div>
            <div>Your earnings (75%)</div>
          </div>
          {[
            {
              type: "Async",
              desc: "Written guidance, photo review",
              total: "$25–$45",
              earnings: "$19–$34",
            },
            {
              type: "Live",
              desc: "20–40 min video session",
              total: "$60–$90",
              earnings: "$45–$68",
            },
            {
              type: "Complex consult",
              desc: "Extended, scoped session",
              total: "$100+",
              earnings: "$75+",
            },
          ].map(({ type, desc, total, earnings }) => (
            <div
              key={type}
              className="grid grid-cols-3 px-4 py-4 border-t border-border text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className="text-muted-foreground self-center">{total}</div>
              <div className="font-medium text-foreground self-center">
                {earnings}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Rates shown are current platform guidance. Actual session fees may
          vary based on complexity, duration, and platform pricing adjustments.
        </p>
      </section>

      {/* How payout works */}
      <section className="mb-14">
        <h2
          className="text-xl font-semibold text-primary mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How payout works
        </h2>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              Earnings are transferred automatically when a session completes.
              You do not request payment or submit invoices.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              Payments are processed through Stripe Connect. You need to
              complete Stripe onboarding as part of Guide setup after your
              application is approved. This takes a few minutes.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              Payout timing follows Stripe&apos;s standard schedule for your
              country — typically 2 business days for US accounts. You can
              review your payout schedule and history from your Guide dashboard.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              If a session is disputed or refunded before completion, the
              transfer may be reversed. See the{" "}
              <Link href="/legal/refund-policy" className="text-primary hover:underline">
                refund policy
              </Link>{" "}
              for the specifics.
            </p>
          </div>
        </div>
      </section>

      {/* The split */}
      <section className="mb-14 bg-secondary/40 rounded-md border border-border p-6">
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Why 75 / 25
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The 25% platform share covers Stripe payment processing fees (roughly
          2.9% + $0.30 per transaction), infrastructure, video hosting, the AI
          triage and matching system, and ongoing platform development.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          75% is the share we believe is fair for the person doing the actual
          work. Other platforms take significantly more. This model only works
          if Guides find it worth their time, and we have tried to make the
          math reflect that.
        </p>
      </section>

      {/* Earnings dashboard */}
      <section className="mb-14">
        <h2
          className="text-xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Tracking your earnings
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your Guide dashboard shows your earnings per session, running totals,
          payout history, and Stripe account status. Private feedback from
          completed sessions is also available there — visible only to you, not
          to other Guides or to Makers.
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
          href="/guides/standards"
          className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Guide standards
        </Link>
      </div>
    </div>
  );
}
