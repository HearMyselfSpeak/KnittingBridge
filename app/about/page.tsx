import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — KnittingBridge",
  description:
    "Why KnittingBridge exists, what it is, and what it is not.",
};

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          About
        </p>
        <h1
          className="text-4xl font-semibold text-primary mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          A bridge does not cheer. It holds.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          That is the idea behind this platform. Not celebration. Not
          community theater. Just the practical thing — getting from stuck to
          moving again.
        </p>
      </div>

      <div className="prose-like space-y-8 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2
            className="text-xl font-semibold text-primary mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The problem
          </h2>
          <p className="mb-3">
            Knitters get stuck. The pattern has an error. The tension is off.
            The colorwork looks wrong but you cannot figure out why. The sleeve
            cap does not fit and you have no idea which measurement is wrong.
          </p>
          <p className="mb-3">
            The existing options are slow, imprecise, or emotionally costly.
            Forums take days and rarely get to the specific issue. YouTube has
            thousands of videos but none of them are looking at your sweater.
            Asking a friend feels like imposing.
          </p>
          <p>
            Most knitters do not need lessons. They need one experienced person
            to look at their work for twenty minutes and say: this is fixable,
            here is how. That moment of clarity is what KnittingBridge exists to
            provide.
          </p>
        </div>

        <div className="border-t border-border pt-8">
          <h2
            className="text-xl font-semibold text-primary mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What KnittingBridge is
          </h2>
          <p className="mb-3">
            A two-sided platform. Makers — knitters who are stuck — submit
            requests describing their problem. Guides — experienced knitters who
            have seen this kind of problem before — respond with focused
            guidance through a short, paid session.
          </p>
          <p className="mb-3">
            The matching is not self-selection. Makers do not browse Guide
            profiles. The system reads the request, understands what kind of
            expertise and communication style the situation calls for, and routes
            it to the right Guide. This produces better results than a
            marketplace where people choose based on a profile photo and a star
            rating.
          </p>
          <p>
            Sessions are scoped. A session is not a coaching relationship or a
            subscription. It is a single interaction with a clear question and a
            specific answer. Short, purposeful, complete.
          </p>
        </div>

        <div className="border-t border-border pt-8">
          <h2
            className="text-xl font-semibold text-primary mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What it is not
          </h2>
          <p className="mb-3">
            It is not a community. There are no feeds, no follower counts, no
            public Guide profiles, no way to browse or compare Guides. Those
            features exist elsewhere. They are not part of this.
          </p>
          <p className="mb-3">
            It is not coaching, tutoring, or instruction. Guides are not
            teachers. They are experienced practitioners who can look at a
            specific situation and offer a specific answer. The goal is
            resolution, not education — unless the Maker wants to understand
            the reason, in which case a good Guide will explain it.
          </p>
          <p>
            It is not a search engine for knitting advice. It is a platform
            for a particular kind of moment: when you are mid-project, time
            matters, and you need someone with real hands-on knowledge.
          </p>
        </div>

        <div className="border-t border-border pt-8">
          <h2
            className="text-xl font-semibold text-primary mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The Color Preview Tool
          </h2>
          <p className="mb-3">
            Before you begin a project, or before you frog what you have and
            start over in different yarn, it helps to see it. The Color Preview
            Tool lets you upload a photo of any finished knitted garment and
            preview it in new colors — before you buy anything.
          </p>
          <p>
            The tool does one thing only: it changes yarn colors. It does not
            redesign the garment, move the motifs, or suggest structural
            changes. It is for the moment when you like the pattern but are not
            sure about the colorway.
          </p>
        </div>

        <div className="border-t border-border pt-8">
          <h2
            className="text-xl font-semibold text-primary mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The people behind it
          </h2>
          <p>
            KnittingBridge is built by people who have watched knitters struggle
            with questions that could be resolved in twenty minutes if the right
            person were in the room. We think that experience is worth paying
            for, and that Guides who provide it should be compensated fairly and
            directly. That is the entire premise.
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-col sm:flex-row gap-3">
        <Link
          href="/get-help"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Get help now
        </Link>
        <Link
          href="/guides"
          className="inline-flex items-center justify-center border border-primary/30 text-primary text-sm font-medium px-6 py-3 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Become a Guide
        </Link>
      </div>
    </div>
  );
}
