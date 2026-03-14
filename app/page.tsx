import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Color Preview Tool — above the fold */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              Color Preview Tool
            </p>
            <h1
              className="text-4xl md:text-5xl font-semibold text-primary leading-tight mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              See it in a new color before you commit.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Upload a photo of any knitted or crocheted garment. Describe new
              colors, name a palette theme, or show us your yarn. We&apos;ll
              generate a preview that changes only the colors — never the
              structure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/color-preview"
                className="inline-flex items-center justify-center bg-accent text-accent-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                Try the color preview
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center text-sm font-medium text-primary border border-primary/30 px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                How it works
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Free to use. No account required.
            </p>
          </div>
        </div>
      </section>

      {/* Color preview feature details */}
      <section className="bg-secondary/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p
                className="font-serif text-base font-semibold text-primary mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Upload your garment
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A screenshot from a pattern page, a project photo, a blog post.
                Any image of a finished knitted or crocheted piece.
              </p>
            </div>
            <div>
              <p
                className="font-serif text-base font-semibold text-primary mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Describe your colors
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Name specific shades, describe a palette theme, or upload photos
                of yarn you already own. Mix approaches.
              </p>
            </div>
            <div>
              <p
                className="font-serif text-base font-semibold text-primary mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                See the result
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One preview at a time. The structure and proportions are
                preserved exactly. Only the yarn colors change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace intro */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              Expert Sessions
            </p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-primary leading-tight mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Stuck on a project? Talk to someone who has been there.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Most knitters do not need lessons. They need one experienced
              person to look at their work for twenty minutes and say: this is
              fixable, here is how. That is what KnittingBridge is for.
            </p>
            <Link
              href="/get-help"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Describe your problem
            </Link>
          </div>
        </div>
      </section>

      {/* How sessions work */}
      <section className="bg-secondary/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h3
            className="text-xl font-semibold text-primary mb-10"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <span className="text-2xl font-serif font-light text-accent/60 tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                01
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Describe what you need
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Write out your question. Upload a photo if that helps. Our
                  system reads it and determines whether a Guide is needed.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl font-serif font-light text-accent/60 tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                02
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  The right Guide accepts
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The system matches your request to Guides with the right
                  skills and temperament. You do not choose — the match is made
                  for you.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl font-serif font-light text-accent/60 tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                03
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Get your answer
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A short, scoped session — text, photos, or live video. No
                  external apps. No upselling. Just the help you came for.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-primary hover:underline"
            >
              Read the full overview
            </Link>
          </div>
        </div>
      </section>

      {/* Guide recruitment */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-xl">
            <h2
              className="text-2xl md:text-3xl font-semibold leading-snug mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Are you the person people ask about knitting?
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6">
              Guides are experienced knitters who get paid for short, scoped
              sessions. No lesson plans. No marketing. Accept the requests that
              fit your schedule.
            </p>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center bg-primary-foreground text-primary text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Learn about becoming a Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
