import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | KnittingBridge",
  description:
    "How KnittingBridge connects knitters who are stuck with experienced Guides for short, paid sessions.",
};

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Platform overview
        </p>
        <h1
          className="text-4xl font-semibold text-primary mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How KnittingBridge works
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Two things happen here: you can preview your garment in new colors,
          and you can get help from an experienced knitter when you are stuck.
          Both are independent. Neither requires the other.
        </p>
      </div>

      {/* Color Preview Tool */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          The Color Preview Tool
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Free, anonymous, and self-service. No account required.
        </p>

        <div className="space-y-8">
          {[
            {
              step: "01",
              title: "Upload a garment photo",
              body: "A screenshot from a pattern page, a photo of your own work, a blog post image. Any image of a finished knitted or crocheted piece works. Close-up colorwork photos help the tool identify stitch regions more precisely.",
            },
            {
              step: "02",
              title: "Describe your new colors",
              body: "You have three options: describe specific shades in plain language, name a palette theme (forest, coastal, jewel tones, aurora), or upload photos of yarn you already own. You can mix approaches: describe one color and upload a photo for another.",
            },
            {
              step: "03",
              title: "Review what the tool detected",
              body: "Before generating anything, the tool shows you a summary of what it found: yarn colors by region, which areas share the same yarn, and any ambiguities that need clarifying. You confirm or correct this before proceeding.",
            },
            {
              step: "04",
              title: "See the preview",
              body: "One image. The garment structure, silhouette, and motif placement are unchanged. Only the yarn colors are replaced. After seeing it, you can refine: shift warmer, increase contrast, try a different palette. As many times as you like.",
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

        <div className="mt-8">
          <Link
            href="/color-preview"
            className="inline-flex items-center justify-center bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Try the color preview
          </Link>
        </div>
      </section>

      <div className="border-t border-border my-12" />

      {/* Maker flow */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Getting help as a Maker
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          A Maker is anyone who is working on a knitting or crochet project and
          needs a second opinion. Sessions are short, scoped, and paid.
        </p>

        <div className="space-y-8">
          {[
            {
              step: "01",
              title: "Describe your project",
              body: "Write out what you are stuck on. Upload a photo of your work if it helps. Include a pattern link if there is one. The more specific you are, the better the match.",
            },
            {
              step: "02",
              title: "The system triages your request",
              body: "An AI reads your submission to understand the issue type, skills needed, and urgency. Simple questions may be answered directly. For anything requiring human judgment, the system identifies the right kind of Guide.",
            },
            {
              step: "03",
              title: "A Guide accepts",
              body: "Qualified Guides are notified of your request. The first one to accept takes it. You do not choose your Guide. The system matches based on technical skills and how they communicate. The match is intentional.",
            },
            {
              step: "04",
              title: "The session",
              body: "Async sessions happen through text and photos, typically resolved within a few hours. Live sessions are short video calls (20 to 40 minutes) embedded in the platform. No Zoom, no external links.",
            },
            {
              step: "05",
              title: "Done",
              body: "You receive a session summary. Payment is captured only when a Guide accepts. If no Guide accepts, nothing is charged.",
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

        <div className="mt-8">
          <Link
            href="/get-help"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Describe your project
          </Link>
        </div>
      </section>

      <div className="border-t border-border my-12" />

      {/* Guide flow */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Working as a Guide
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Guides are experienced knitters who get paid for short sessions. There
          are no lesson plans, no client relationships to manage, no marketing.
        </p>

        <div className="space-y-8">
          {[
            {
              step: "01",
              title: "Apply",
              body: "Fill out a structured application that covers your skill areas, experience, and communication style. All applications are reviewed manually. Approval is not automatic.",
            },
            {
              step: "02",
              title: "Receive matched requests",
              body: "When a Maker submits a request that fits your profile, you receive a notification. You see a summary: the issue, estimated session length, and payment amount. You have five minutes to accept or decline.",
            },
            {
              step: "03",
              title: "Run the session",
              body: "Async sessions are text-based, flexible, resolved on your schedule. Live sessions are short video calls through the platform. You set your availability and session types when you apply.",
            },
            {
              step: "04",
              title: "Get paid",
              body: "When the session completes, 75% of the session fee is transferred to your Stripe account. Payouts are automatic. There is nothing to invoice.",
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

        <div className="mt-8">
          <Link
            href="/guides"
            className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Learn about becoming a Guide
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2
          className="text-2xl font-semibold text-primary mb-8"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Common questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Do I choose my Guide?",
              a: "No. The system selects the match based on what your request needs and how you communicate. You will not see a list of Guides, browse profiles, or choose by name. This is intentional. It produces better results than self-selection.",
            },
            {
              q: "What skill levels can Makers have?",
              a: "Any level. The system matches based on complexity range as well as skill type, so a beginner's question about gauge goes to a different kind of Guide than an advanced question about steeking.",
            },
            {
              q: "How long does a session take?",
              a: "Async sessions (text and photo review) typically resolve within a few hours. Live sessions run 20 to 40 minutes. Complex consultations are scoped before starting.",
            },
            {
              q: "What if I'm not satisfied?",
              a: "See the refund policy for details on cancellations and disputes. Sessions must be scoped. If the issue turns out to need substantially more work than described, you and your Guide discuss how to proceed.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-t border-border pt-5">
              <p className="text-sm font-semibold text-foreground mb-2">{q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
