import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | KnittingBridge",
};

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Legal</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: January 1, 2025
        </p>
      </div>

      <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            1. Acceptance
          </h2>
          <p>
            By accessing or using KnittingBridge (the &ldquo;Platform&rdquo;), you agree to
            be bound by these Terms of Service. If you do not agree, do not
            use the Platform. These terms apply to all users, including Makers
            (those who request help) and Guides (those who provide help).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            2. The Platform
          </h2>
          <p className="mb-3">
            KnittingBridge is a marketplace that connects Makers with Guides
            for short, paid sessions focused on knitting and crochet guidance.
            The Platform also provides a Color Preview Tool for visualizing
            garment color changes.
          </p>
          <p>
            KnittingBridge does not provide knitting guidance itself. Guides
            are independent contractors, not employees of KnittingBridge.
            KnittingBridge facilitates the connection and transaction, not the
            advice itself.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            3. Accounts
          </h2>
          <p className="mb-3">
            You must create an account to submit a request or apply as a Guide.
            You are responsible for maintaining the security of your account
            credentials. You may not share your account with others.
          </p>
          <p>
            You agree to provide accurate information when creating your
            account. KnittingBridge may suspend or terminate accounts found
            to contain false information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            4. Maker terms
          </h2>
          <p className="mb-3">
            Makers pay for sessions at the time of submission. Payment is
            authorized when a request is submitted and captured only when a
            Guide accepts. If no Guide accepts within the offer window, nothing
            is charged.
          </p>
          <p className="mb-3">
            Sessions are scoped to the question submitted. Makers are not
            entitled to extended guidance beyond the agreed session. See the
            Refund Policy for cancellation terms.
          </p>
          <p>
            Makers may not contact Guides outside the Platform for the purpose
            of continuing a session or establishing a direct relationship. This
            protects both parties and the integrity of the matching system.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            5. Guide terms
          </h2>
          <p className="mb-3">
            Guides are independent contractors. Accepting a session constitutes
            an agreement to provide focused, professional guidance within the
            session scope. Guides receive 75% of the session fee upon
            completion.
          </p>
          <p>
            Guides may not solicit Makers to continue working outside the
            Platform. Guides who violate this term will have their access
            suspended. See the Guide Agreement for full terms applicable to
            Guides.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            6. Prohibited conduct
          </h2>
          <p className="mb-3">The following are prohibited on the Platform:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Posting false, misleading, or defamatory content",
              "Using the Platform to facilitate off-platform transactions",
              "Harassing, threatening, or abusing other users",
              "Attempting to circumvent the matching system",
              "Submitting fraudulent payment information",
              "Scraping, crawling, or accessing the Platform by automated means",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent/60 shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            7. Content and intellectual property
          </h2>
          <p className="mb-3">
            Images, text, and other content you upload to the Platform remain
            yours. By uploading content, you grant KnittingBridge a limited,
            non-exclusive license to use that content to operate the Platform,
            including processing it through AI services to provide the Color
            Preview Tool and session support.
          </p>
          <p>
            You may only upload content you have the right to share. Do not
            upload copyrighted pattern images without permission from the
            copyright holder.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            8. Limitation of liability
          </h2>
          <p className="mb-3">
            KnittingBridge is provided &ldquo;as is.&rdquo; To the fullest extent
            permitted by law, KnittingBridge disclaims all warranties, express
            or implied.
          </p>
          <p>
            KnittingBridge is not liable for the accuracy of guidance provided
            by Guides, outcomes resulting from session advice, or any damages
            arising from your use of the Platform. In no event shall
            KnittingBridge&apos;s total liability exceed the amount you paid for
            the session at issue.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            9. Changes
          </h2>
          <p>
            KnittingBridge may update these terms. Continued use of the
            Platform after a change constitutes acceptance. Material changes
            will be communicated by email.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            10. Contact
          </h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a
              href="mailto:legal@knittingbridge.com"
              className="text-primary hover:underline"
            >
              legal@knittingbridge.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
