import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become a Guide — KnittingBridge",
  description:
    "Experienced knitters: get paid for short, scoped sessions helping other knitters get unstuck.",
};

export default function GuidesLanding() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              For Guides
            </p>
            <h1
              className="text-4xl md:text-5xl font-semibold text-primary leading-tight mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Are you the person people ask about knitting?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              KnittingBridge connects experienced knitters with Makers who need
              a second opinion. Short sessions. Flexible schedule. No client
              management. Direct payout.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/guides/apply"
                className="inline-flex items-center justify-center bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                Apply to become a Guide
              </Link>
              <Link
                href="/guides/how-it-works"
                className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Guides do */}
      <section className="bg-secondary/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2
            className="text-xl font-semibold text-primary mb-8"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What Guides actually do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Focused sessions",
                body: "Each session addresses one specific problem. A Maker submits a request describing their issue. You respond to requests that match your skills. No long-form teaching, no lesson plans.",
              },
              {
                title: "Flexible format",
                body: "Async sessions are text and photo-based, resolved on your schedule. Live sessions are 20–40 minute video calls through the platform. You set which formats you are available for.",
              },
              {
                title: "Direct payment",
                body: "You earn 75% of the session fee. When a session completes, the platform transfers your share automatically via Stripe. There is nothing to invoice and no waiting for payment.",
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <p
                  className="font-serif text-base font-semibold text-primary mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Guides are */}
      <section className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2
            className="text-2xl font-semibold text-primary mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Guides are not instructors. They are practitioners.
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              The distinction matters. An instructor teaches a structured
              curriculum. A Guide is someone who has made enough things, fixed
              enough mistakes, and learned enough from both that they can look
              at another knitter&apos;s problem and see what is happening.
            </p>
            <p>
              You do not need teaching experience. You need hands-on experience.
              You need to have knitted enough garments, socks, shawls, or
              colorwork pieces that the common failure modes are familiar to
              you. You need to be able to explain what you see without
              condescension.
            </p>
            <p>
              Guides come from every background. Some are designers. Some are
              shop staff. Some are just the person in their local knitting group
              who everyone brings their problems to. What they share is depth
              of experience in specific areas and an ability to communicate it.
            </p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-secondary/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2
            className="text-xl font-semibold text-primary mb-8"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Skill areas we match on
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              "Garment construction",
              "Fit and sizing",
              "Socks",
              "Lace",
              "Colorwork",
              "Cables",
              "Pattern modification",
              "Yarn substitution",
              "Repair and rescue",
              "Machine knitting",
            ].map((skill) => (
              <div
                key={skill}
                className="border border-border rounded-md px-3 py-2 text-xs text-muted-foreground bg-background"
              >
                {skill}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            You do not need expertise in all areas. Guides are matched to
            requests based on the specific skills a request requires.
          </p>
        </div>
      </section>

      {/* Why KnittingBridge */}
      <section className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2
            className="text-2xl font-semibold text-primary mb-8"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Why KnittingBridge over everything else
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "No marketing required",
                body: "You do not maintain a social presence, build an audience, or compete on visibility. Requests come to you based on what your skills are. You accept or decline.",
              },
              {
                title: "No client relationships",
                body: "Each session is complete in itself. You are not managing ongoing clients, following up, or building a practice. You show up for a session, deliver the guidance, and move on.",
              },
              {
                title: "No schedule management",
                body: "You set your availability and session types. When you are available, you receive matched requests. When you are not, you do not.",
              },
              {
                title: "Fair compensation",
                body: "75% of the session fee goes to you. The platform keeps 25% to cover infrastructure, payment processing, and matching. There is no subscription fee for Guides.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="max-w-xl">
            <h2
              className="text-2xl font-semibold leading-snug mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Ready to apply?
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6">
              The application covers your skill areas, experience, and
              communication style. All applications are reviewed by hand.
              Approval is not automatic — this protects the quality of every
              session for Makers and Guides alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/guides/apply"
                className="inline-flex items-center justify-center bg-primary-foreground text-primary text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                Apply to become a Guide
              </Link>
              <Link
                href="/guides/how-it-works"
                className="inline-flex items-center justify-center border border-primary-foreground/30 text-primary-foreground text-sm font-medium px-6 py-3 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                Read the full overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
