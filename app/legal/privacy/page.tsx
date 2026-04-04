import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | KnittingBridge",
};

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Legal</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: January 1, 2025
        </p>
      </div>

      <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            1. What we collect
          </h2>
          <p className="mb-3">
            <span className="font-medium text-foreground">Account data:</span>{" "}
            Name, email address, and profile image (when signing in with
            Google). Password hashes if using email sign-in.
          </p>
          <p className="mb-3">
            <span className="font-medium text-foreground">Session data:</span>{" "}
            Descriptions of knitting questions, uploaded photos, message
            transcripts, session durations, and Maker feedback.
          </p>
          <p className="mb-3">
            <span className="font-medium text-foreground">
              Color Preview Tool data:
            </span>{" "}
            Uploaded garment photos, yarn photos, and color descriptions
            associated with a color preview session.
          </p>
          <p className="mb-3">
            <span className="font-medium text-foreground">Payment data:</span>{" "}
            Stripe processes payments. KnittingBridge stores transaction
            identifiers and amounts, not card numbers or banking details.
          </p>
          <p>
            <span className="font-medium text-foreground">Usage data:</span>{" "}
            Standard server logs including IP address, browser type, pages
            visited, and timestamps.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            2. How we use it
          </h2>
          <ul className="space-y-2 pl-4">
            {[
              "Operating the Platform: matching requests to Guides, running sessions, processing payments",
              "Improving the matching algorithm: session outcomes and feedback inform future matches",
              "Running the Color Preview Tool: garment and yarn images are sent to AI vision models to generate analysis and previews",
              "Sending transactional email: session confirmations, payout notifications, application status updates",
              "Detecting abuse and enforcing the Terms of Service",
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
            3. AI processing
          </h2>
          <p className="mb-3">
            KnittingBridge uses OpenRouter to route requests to third-party AI
            models for garment analysis, yarn color interpretation, request
            triage, and session support. Images and text you submit for these
            features are sent to these services.
          </p>
          <p>
            We do not use your content to train AI models. Third-party AI
            providers may have their own data handling practices. We use
            providers whose terms permit commercial use and restrict training
            on user data.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            4. Sharing
          </h2>
          <p className="mb-3">
            We do not sell personal data. We share data only as follows:
          </p>
          <ul className="space-y-2 pl-4">
            {[
              "Guides see the content of requests matched to them: the description, photos, and relevant context",
              "Stripe receives payment information to process transactions",
              "Supabase stores data on our behalf (cloud infrastructure provider)",
              "AI providers receive uploaded content to perform analysis as described above",
              "Legal requirements: we may disclose data when required by law",
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
            5. Retention
          </h2>
          <p className="mb-3">
            Account data is retained while your account is active. Uploaded
            images for Color Preview sessions are retained for 90 days after
            the session, then deleted. Session transcripts are retained for 2
            years for dispute resolution purposes.
          </p>
          <p>
            You may request deletion of your account and associated data by
            emailing{" "}
            <a
              href="mailto:privacy@knittingbridge.com"
              className="text-primary hover:underline"
            >
              privacy@knittingbridge.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            6. Security
          </h2>
          <p>
            We use HTTPS throughout the Platform. Passwords are not stored in
            plaintext. Payment data is handled entirely by Stripe and never
            passes through our servers. We use access controls to limit who can
            query production data.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            7. Your rights
          </h2>
          <p className="mb-3">
            Depending on your jurisdiction, you may have rights to access,
            correct, or delete personal data we hold about you. To exercise
            these rights, contact{" "}
            <a
              href="mailto:privacy@knittingbridge.com"
              className="text-primary hover:underline"
            >
              privacy@knittingbridge.com
            </a>
            .
          </p>
          <p>
            For California residents (CCPA) and European users (GDPR):
            KnittingBridge complies with applicable data protection laws. If
            you have a specific request or complaint, email the address above
            and we will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            8. Changes
          </h2>
          <p>
            We may update this policy. Continued use of the Platform after a
            change constitutes acceptance. Material changes will be communicated
            by email.
          </p>
        </section>
      </div>
    </div>
  );
}
