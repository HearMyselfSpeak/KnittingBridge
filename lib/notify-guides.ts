// Notify Guides — orchestrates matching + packing + notification + push.
// Called after a Maker submits a request.

import type { MatchingInput } from "@/lib/matching-v1";
import type { SessionLength } from "@/lib/session-packing";

interface NotifyInput {
  requestId: string;
  matchingInput: MatchingInput;
  sessionLength: SessionLength;
}

interface NotifyResult {
  notifiedCount: number;
  hasAlternatives: boolean;
  hasMoreOutsideReasonableHours: boolean;
}

export async function notifyMatchedGuides(
  opts: NotifyInput,
): Promise<NotifyResult> {
  const { rankGuides } = await import("@/lib/matching-v1");
  const { findAvailableSlots } = await import("@/lib/session-packing");
  const { prisma } = await import("@/lib/prisma");

  // 1. Score all eligible Guides
  const matchResults = await rankGuides(opts.matchingInput);

  // 2. Filter by block availability (Mode 1: "now")
  const packing = await findAvailableSlots(
    matchResults,
    opts.sessionLength,
    "now",
  );

  const candidates = packing.candidates;

  // 3. Create GuideNotifications for each candidate
  if (candidates.length > 0) {
    await prisma.guideNotification.createMany({
      data: candidates.map((c) => ({
        guideProfileId: c.guideId,
        requestId: opts.requestId,
        status: "PENDING" as const,
      })),
    });

    // 4. Send push notifications to all candidate Guides
    await notifyCandidates(candidates, opts.requestId, opts.sessionLength);
  }

  return {
    notifiedCount: candidates.length,
    hasAlternatives: packing.alternatives.length > 0,
    hasMoreOutsideReasonableHours: packing.hasMoreOutsideReasonableHours,
  };
}

// ─── Push notification helper ─────────────────────────────────────────────

async function notifyCandidates(
  candidates: Array<{ guideId: string }>,
  requestId: string,
  sessionLength: SessionLength,
): Promise<void> {
  const { sendPushNotification } = await import("@/lib/push");
  const { prisma } = await import("@/lib/prisma");

  // Look up userId for each Guide profile
  const profiles = await prisma.guideProfile.findMany({
    where: { id: { in: candidates.map((c) => c.guideId) } },
    select: { id: true, userId: true },
  });

  const fee = 0.18;
  const gross = sessionLength === 45 ? 60 : 30;
  const takeHome = (gross * (1 - fee)).toFixed(2);
  const label = sessionLength === 45 ? "Deep Dive (45 min)" : "Quick Look (15 min)";

  await Promise.allSettled(
    profiles.map((p) =>
      sendPushNotification(p.userId, {
        title: "New request available",
        body: `${label} -- your take-home: $${takeHome}. You have 5 minutes to respond.`,
        url: `/dashboard/guide/request/${requestId}`,
      }),
    ),
  );
}
