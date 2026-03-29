// Post-session page — server component.
// Auth required. Shows session summary, notes, rating form, tip form.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RatingForm from "./RatingForm";
import TipForm from "./TipForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionCompletePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { prisma } = await import("@/lib/prisma");

  const helpSession = await prisma.helpSession.findUnique({
    where: { id },
    select: {
      id: true,
      duration: true,
      amount: true,
      guideEarnings: true,
      makerNotes: true,
      guideNotes: true,
      transcriptProcessedAt: true,
      request: {
        select: {
          userId: true,
          recommendedSession: true,
          user: { select: { name: true } },
        },
      },
      guideProfile: {
        select: {
          id: true,
          userId: true,
          user: { select: { name: true } },
        },
      },
      ratings: {
        select: { raterId: true },
      },
      tips: {
        select: { id: true },
      },
    },
  });

  if (!helpSession) redirect("/");

  const userId = session.user.id;
  const isMaker = helpSession.request.userId === userId;
  const isGuide = helpSession.guideProfile.userId === userId;
  if (!isMaker && !isGuide) redirect("/");

  const sessionLabel =
    helpSession.request.recommendedSession === "15"
      ? "Quick Look (15 min)"
      : "Deep Dive (45 min)";

  const hasRated = helpSession.ratings.some((r) => r.raterId === userId);
  const hasTipped = helpSession.tips.length > 0;
  const notes = isMaker ? helpSession.makerNotes : helpSession.guideNotes;
  const ratedUserId = isMaker
    ? helpSession.guideProfile.userId
    : helpSession.request.userId;
  const guideFirstName = helpSession.guideProfile.user.name?.split(" ")[0] ?? "your Guide";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-bold text-[#1B2A4A]">
        Session Complete
      </h1>

      {/* Session summary */}
      <div className="mt-6 rounded-lg border bg-white p-6 space-y-2">
        <p className="text-sm text-gray-500">{sessionLabel}</p>
        {helpSession.duration && (
          <p className="text-sm text-gray-500">
            Duration: {helpSession.duration} minutes
          </p>
        )}
        {isMaker && (
          <p className="text-sm text-gray-700">
            Amount charged: ${(helpSession.amount / 100).toFixed(2)}
          </p>
        )}
        {isGuide && (
          <p className="text-sm text-gray-700">
            Your take-home: ${(helpSession.guideEarnings / 100).toFixed(2)}
          </p>
        )}
      </div>

      {/* Session notes */}
      <div className="mt-6 rounded-lg border bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-[#1B2A4A]">
          Session Notes
        </h2>
        {notes ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {notes}
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-400">
            {helpSession.transcriptProcessedAt
              ? "No notes available for this session."
              : "Your notes are being prepared. Check back shortly."}
          </p>
        )}
      </div>

      {/* Rating */}
      {!hasRated && (
        <div className="mt-6">
          <RatingForm
            helpSessionId={helpSession.id}
            ratedUserId={ratedUserId}
            role={isMaker ? "maker" : "guide"}
          />
        </div>
      )}

      {/* Tip (Maker only) */}
      {isMaker && !hasTipped && (
        <div className="mt-6">
          <TipForm
            helpSessionId={helpSession.id}
            guideProfileId={helpSession.guideProfile.id}
            guideFirstName={guideFirstName}
          />
        </div>
      )}

      {/* Thank you */}
      {hasRated && (!isMaker || hasTipped) && (
        <div className="mt-8 text-center">
          <p className="text-lg font-serif text-[#1B2A4A]">
            Thank you for your session.
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-sm text-[#C4704F] underline"
          >
            Back to home
          </a>
        </div>
      )}
    </div>
  );
}
