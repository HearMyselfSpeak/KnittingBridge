import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — KnittingBridge",
};

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Legal</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Refund Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: January 1, 2025
        </p>
      </div>

      <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            When you are not charged
          </h2>
          <p className="mb-3">
            Payment is authorized when a Maker submits a request, but is not
            captured until a Guide accepts. If no Guide accepts within the offer
            window, the authorization is released and you are not charged.
          </p>
          <p>
            If you cancel a request before a Guide accepts, the authorization
            is released and you are not charged.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Cancellations after acceptance
          </h2>
          <p className="mb-3">
            Once a Guide accepts a request, payment is captured. At that point,
            the following applies:
          </p>
          <ul className="space-y-3 pl-4">
            {[
              {
                label: "Cancelled within 15 minutes of acceptance",
                desc: "If you cancel within 15 minutes of a Guide accepting and no session work has begun, you are eligible for a full refund.",
              },
              {
                label: "Async sessions not yet started",
                desc: "If the Guide has accepted but not yet responded, you may cancel for a full refund within 2 hours of acceptance.",
              },
              {
                label: "Session in progress",
                desc: "No refund is available once an async session has begun (Guide has sent at least one response) or a live session has started.",
              },
              {
                label: "Guide no-show",
                desc: "If a Guide accepts a live session but does not join within 10 minutes of the scheduled start, you are entitled to a full refund.",
              },
            ].map(({ label, desc }) => (
              <li key={label} className="flex gap-2">
                <span className="text-accent/60 shrink-0 mt-0.5">—</span>
                <div>
                  <p className="font-medium text-foreground mb-0.5">{label}</p>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Disputes
          </h2>
          <p className="mb-3">
            If you believe a session did not meet reasonable expectations, you
            may open a dispute within 48 hours of the session ending. Disputes
            are reviewed by the KnittingBridge team, not by an automated system.
          </p>
          <p className="mb-3">
            We will contact both the Maker and the Guide to understand what
            happened. Resolution may include a partial refund, a full refund,
            or a finding that the session was completed as agreed.
          </p>
          <p>
            Disputes based on preference (&ldquo;I did not like the advice&rdquo;) are
            generally not eligible for refund. Disputes based on scope failure
            (&ldquo;the Guide did not address the question I submitted&rdquo;) or Guide
            conduct are reviewed on their merits.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            How to request a refund or open a dispute
          </h2>
          <p>
            Email{" "}
            <a
              href="mailto:support@knittingbridge.com"
              className="text-primary hover:underline"
            >
              support@knittingbridge.com
            </a>{" "}
            with your session ID and a brief description of the issue. We aim
            to respond within 2 business days.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Guide earnings and refunds
          </h2>
          <p className="mb-3">
            When a refund is issued before a session completes, Guide earnings
            for that session are not transferred.
          </p>
          <p>
            For dispute resolutions resulting in a refund after session
            completion, the platform will review earnings on a case-by-case
            basis. Guides who are found to have failed to deliver the agreed
            session scope will have their earnings reversed. Guides acting in
            good faith who encounter genuine scope disagreements are treated
            fairly in this process.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Processing time
          </h2>
          <p>
            Approved refunds are processed within 5 to 10 business days,
            depending on your card issuer. KnittingBridge does not control
            when your bank applies the credit to your account.
          </p>
        </section>
      </div>
    </div>
  );
}
