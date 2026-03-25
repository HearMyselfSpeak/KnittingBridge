// Guide Agreement sections 8–13.

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

export default function GuideAgreementPart2() {
  return (
    <>
      <Section number={8} title="Intellectual property">
        <p className="mb-3">
          You retain full ownership of your knowledge, methods, and expertise.
          Nothing in this Agreement transfers any intellectual property rights
          from you to KnittingBridge.
        </p>
        <p className="mb-3">
          By providing sessions through the Platform, you grant KnittingBridge
          a limited, non-exclusive, royalty-free license to use session content
          solely to operate the Platform, including storing transcripts and
          summaries for dispute resolution and quality review.
        </p>
        <p>
          KnittingBridge may use anonymized, aggregated data derived from
          sessions to improve its AI systems and platform services. No
          identifying information about you or Makers will be included in
          any such use without separate written consent.
        </p>
      </Section>

      <Section number={9} title="Confidentiality">
        <p className="mb-3">
          You agree not to disclose the content of any session outside the
          Platform. This includes the Maker&apos;s question, project photos,
          personal details, or any identifying information, whether the
          disclosure is direct or indirect.
        </p>
        <p>
          This obligation applies during the term of this Agreement and after
          termination. Posting about sessions on social media, even without
          naming the Maker, constitutes a violation of this section.
        </p>
      </Section>

      <Section number={10} title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless KnittingBridge
          and its officers, directors, employees, and agents from any claims,
          damages, losses, liabilities, and expenses (including reasonable
          legal fees) arising out of or related to: (a) your performance of
          services under this Agreement; (b) your violation of any provision
          of this Agreement; or (c) any claim that your guidance caused harm
          to a Maker or third party.
        </p>
      </Section>

      <Section number={11} title="Dispute resolution">
        <p className="mb-3">
          Any dispute, claim, or controversy arising out of or relating to this
          Agreement or your use of the Platform will be resolved by binding
          individual arbitration, not in court. You waive any right to
          participate in a class action lawsuit or class-wide arbitration
          against KnittingBridge.
        </p>
        <p>
          The governing state for this Agreement will be designated in writing
          by KnittingBridge prior to the commencement of any arbitration
          proceeding. Nothing in this section prevents either party from
          seeking emergency injunctive relief in a court of competent
          jurisdiction to prevent irreparable harm.
        </p>
      </Section>

      <Section number={12} title="Modifications">
        <p className="mb-3">
          KnittingBridge may update the terms of this Agreement with reasonable
          advance notice. Non-material changes will be communicated by email
          and will take effect on the date specified in the notice.
        </p>
        <p>
          Material changes, including changes to the compensation structure or
          dispute resolution terms, require your affirmative consent before
          taking effect. Continued use of the Platform after a material change
          without confirming consent will result in suspension of Guide access
          until consent is provided.
        </p>
      </Section>

      <Section number={13} title="Entire agreement">
        <p>
          This Agreement, together with the Platform Terms of Service, Guide
          Standards, and Refund Policy, constitutes the entire agreement
          between you and KnittingBridge with respect to your role as a Guide.
          It supersedes any prior agreements, representations, or
          understandings, whether oral or written. Section headings are for
          convenience only and do not affect interpretation.
        </p>
      </Section>
    </>
  );
}
