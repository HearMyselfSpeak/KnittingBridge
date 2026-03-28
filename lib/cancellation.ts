// Core cancellation logic for Maker and Guide cancellations.
import { makerCancelledFullRefund, makerCancelledNoRefund, guideCancelledMakerEmail } from "@/lib/cancellation-copy";

interface CancelResult {
  success: boolean;
  refundAmountCents: number;
  copy: string;
  error?: string;
}

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export async function cancelByMaker(
  sessionId: string,
  userId: string,
  reason?: string,
): Promise<CancelResult> {
  const { prisma } = await import("@/lib/prisma");

  const session = await prisma.helpSession.findUnique({
    where: { id: sessionId },
    include: {
      request: { select: { id: true, userId: true, status: true } },
      payment: { select: { id: true, grossAmount: true, status: true } },
      guideProfile: { select: { userId: true, user: { select: { email: true, name: true } } } },
    },
  });

  if (!session) return fail("Session not found");
  if (session.request.userId !== userId) return fail("Not your session");

  const reqStatus = session.request.status;
  if (reqStatus === "CANCELLED" || reqStatus === "COMPLETED") {
    return fail("Session already cancelled or completed");
  }

  // Withdrawal (pre-match): release pre-auth, no demerit, no record
  // Request stays SUBMITTED while session is in NOTIFYING_GUIDES state.
  if (reqStatus === "SUBMITTED") {
    await releasePreAuth(session.stripePaymentIntentId);
    await prisma.request.update({
      where: { id: session.request.id },
      data: { status: "CANCELLED" },
    });
    await prisma.helpSession.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
    });
    return { success: true, refundAmountCents: 0, copy: makerCancelledFullRefund() };
  }

  // Post-match cancellation
  if (!session.payment || session.payment.status !== "CAPTURED") {
    return fail("No captured payment found for this session");
  }

  const grossAmount = session.payment.grossAmount;
  const sessionStart = session.startedAt ?? session.createdAt;
  const hoursUntilStart = (sessionStart.getTime() - Date.now()) / HOURS_24_MS * 24;

  let refundAmountCents = 0;
  let copy: string;

  if (hoursUntilStart >= 24) {
    // 24+ hours out: full refund
    const { processRefund } = await import("@/lib/refund");
    const result = await processRefund(session.payment.id);
    if (!result.success) return fail(result.error ?? "Refund failed");
    refundAmountCents = grossAmount;
    copy = makerCancelledFullRefund();
  } else {
    // Under 24 hours: no refund, Guide keeps payment
    copy = makerCancelledNoRefund();

    // Demerit for late cancellation
    const { addDemerit } = await import("@/lib/demerit");
    await addDemerit(userId, "CANCELLATION", 1, sessionId, reason);
  }

  // CancellationRecord
  await prisma.cancellationRecord.create({
    data: {
      sessionId,
      cancelledBy: "MAKER",
      refundAmountCents,
      reason,
    },
  });

  // Update statuses
  await prisma.request.update({
    where: { id: session.request.id },
    data: { status: "CANCELLED" },
  });
  if (refundAmountCents === 0) {
    await prisma.helpSession.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
    });
  }

  // Notify Guide
  const sessionLabel = session.type === "LIVE" ? "live" : "async";
  const guideUser = session.guideProfile.user;
  const { sendGuideCancellationEmail } = await import("@/lib/emails-cancellation");
  const maker = await getMakerInfo(prisma, userId);
  await sendGuideCancellationEmail(
    guideUser.email, guideUser.name ?? "Guide", maker.firstName ?? "A Maker", sessionLabel,
  );

  return { success: true, refundAmountCents, copy };
}
export async function cancelByGuide(
  sessionId: string,
  userId: string,
  reason?: string,
): Promise<CancelResult> {
  const { prisma } = await import("@/lib/prisma");

  const session = await prisma.helpSession.findUnique({
    where: { id: sessionId },
    include: {
      request: { select: { id: true, userId: true, status: true } },
      payment: { select: { id: true, grossAmount: true, status: true } },
      guideProfile: { select: { id: true, userId: true } },
    },
  });

  if (!session) return fail("Session not found");
  if (session.guideProfile.userId !== userId) return fail("Not your session");

  const reqStatus = session.request.status;
  if (reqStatus === "CANCELLED" || reqStatus === "COMPLETED") {
    return fail("Session already cancelled or completed");
  }

  if (!session.payment || session.payment.status !== "CAPTURED") {
    return fail("No captured payment found for this session");
  }

  // Full refund always
  const { processRefund } = await import("@/lib/refund");
  const result = await processRefund(session.payment.id);
  if (!result.success) return fail(result.error ?? "Refund failed");

  const grossAmount = session.payment.grossAmount;
  const copy = guideCancelledMakerEmail();

  // CancellationRecord
  await prisma.cancellationRecord.create({
    data: {
      sessionId,
      cancelledBy: "GUIDE",
      refundAmountCents: grossAmount,
      reason,
    },
  });

  // Demerit for Guide
  const { addDemerit } = await import("@/lib/demerit");
  await addDemerit(userId, "CANCELLATION", 1, sessionId, reason);

  // Update statuses
  await prisma.request.update({
    where: { id: session.request.id },
    data: { status: "CANCELLED" },
  });

  // Notify Maker
  const maker = await getMakerInfo(prisma, session.request.userId);
  if (maker.email) {
    const { sendMakerCancellationEmail } = await import("@/lib/emails-cancellation");
    await sendMakerCancellationEmail(maker.email, maker.firstName ?? "there", copy);
  }

  return { success: true, refundAmountCents: grossAmount, copy };
}
function fail(error: string): CancelResult {
  return { success: false, refundAmountCents: 0, copy: "", error };
}

async function releasePreAuth(piId: string | null): Promise<void> {
  if (!piId) return;
  try {
    const { stripe } = await import("@/lib/stripe");
    await stripe.paymentIntents.cancel(piId);
  } catch (err) {
    console.error("[cancellation] Failed to release pre-auth:", err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMakerInfo(prisma: any, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  const first = user?.name ? user.name.split(" ")[0] : null;
  return { email: user?.email ?? null, firstName: first };
}
