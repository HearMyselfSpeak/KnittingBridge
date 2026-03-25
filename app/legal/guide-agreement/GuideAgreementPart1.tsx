// Guide Agreement sections 1–7.

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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-4 mb-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-accent/60 shrink-0">-</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function GuideAgreementPart1() {
  return (
    <>
      <Section number={1} title="Relationship of the parties">
        <p className="mb-3">
          You are an independent contractor. This Agreement does not create an
          employment, agency, partnership, or joint venture relationship between
          you and KnittingBridge. KnittingBridge does not direct or control how
          you provide guidance within a session. You use your own professional
          judgment and are free to provide services to others outside the
          Platform.
        </p>
        <p>
          KnittingBridge manages intake, matching, payment processing, and
          communication infrastructure. It does not supervise, instruct, or
          evaluate the substance of your guidance.
        </p>
      </Section>

      <Section number={2} title="Services">
        <p className="mb-3">
          By accepting a session request, you agree to provide focused, scoped
          knitting or crochet guidance through the KnittingBridge platform.
          Services are limited to the question or project described in the
          accepted request. You supply your own tools, equipment, and internet
          connection.
        </p>
        <p className="mb-3">You agree to:</p>
        <BulletList
          items={[
            "Provide honest, good-faith guidance within the scope of the request",
            "Complete the session within a reasonable time for the session type",
            "Communicate clearly if a request requires scope adjustment before proceeding",
            "Decline requests that fall outside your actual areas of expertise",
            "Maintain professional conduct throughout every session",
          ]}
        />
      </Section>

      <Section number={3} title="Compensation">
        <p className="mb-3">
          Guides receive 82% of the session fee. KnittingBridge retains 18%
          to cover payment processing, infrastructure, and platform operations.
          All payments are processed through Stripe Connect. You must maintain
          an active, fully onboarded Stripe Connect account to receive payment.
          KnittingBridge is not responsible for delays caused by issues with
          your Stripe account or bank.
        </p>
        <p>
          In the event of a dispute or refund, Guide earnings may be reversed
          in part or in full depending on the outcome. See the Refund Policy
          for applicable rules.
        </p>
      </Section>

      <Section number={4} title="Taxes">
        <p className="mb-3">
          You are solely responsible for all taxes arising from compensation
          received under this Agreement, including income tax and
          self-employment tax in your jurisdiction. KnittingBridge will not
          withhold taxes from your earnings. KnittingBridge will report
          your earnings to applicable tax authorities as required by law.
        </p>
        <p>
          For US-based Guides, Stripe may issue a Form 1099-K if your earnings
          meet applicable IRS reporting thresholds. You are responsible for
          maintaining accurate records and consulting a tax professional
          regarding your obligations.
        </p>
      </Section>

      <Section number={5} title="No benefits">
        <p>
          As an independent contractor, you are not entitled to any employee
          benefits from KnittingBridge, including health insurance, retirement
          plans, paid time off, sick leave, workers compensation coverage, or
          unemployment insurance. KnittingBridge will not make any
          employer-side contributions on your behalf.
        </p>
      </Section>

      <Section number={6} title="Platform standards">
        <p className="mb-3">
          Guides are expected to meet the standards described in the Guide
          Standards document, incorporated by reference. Those standards
          include:
        </p>
        <BulletList
          items={[
            "Providing accurate, good-faith guidance within your actual skill areas",
            "Completing accepted sessions without abandonment",
            "Communicating professionally with Makers at all times",
            "Not directing Makers to any off-platform service or contact",
          ]}
        />
        <p>
          Repeated failure to meet these standards may result in suspension
          or termination of your Guide account.
        </p>
      </Section>

      <Section number={7} title="Termination">
        <p className="mb-3">
          Either party may terminate this Agreement at any time, with or
          without cause. You may close your Guide account from your dashboard
          settings. KnittingBridge may suspend or terminate your access for
          any violation of this Agreement or the Platform Terms of Service.
        </p>
        <p>
          Termination does not affect obligations for sessions accepted before
          the termination date. Pending earnings for completed sessions will
          be disbursed according to the standard payment schedule.
        </p>
      </Section>
    </>
  );
}
