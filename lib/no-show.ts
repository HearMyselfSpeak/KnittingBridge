// No-show detection handlers.
// handleGuideNoShow: refund, credit, demerit, pool suspend, cancel.
// handleMakerNoShow: Guide paid in full, demerit on Maker.

interface NoShowResult {
  success: boolean;
  error?: string;
}

/**
 * Handle Guide no-show.
 * Guide did not join within trigger window (3 min / 7 min).
 * Full refund, Maker credit, 2-weight demerit, pool suspension.
 */
export async function handleGuideNoShow(
  sessionId: string,
): Promise<NoShowResult> {
  try {
    const { prisma } = await import("@/lib/prisma");

    const helpSession = await prisma.helpSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        status: true,
        requestId: true,
        guideProfileId: true,
        payment: {
          select: { id: true, grossAmount: true },
        },
        request: { select: { userId: true } },
        guideProfile: { select: { userId: true } },
      },
    });

    if (!helpSession) return { success: false, error: "Session not found" };

    // Prevent duplicate processing
    if (helpSession.status === "CANCELLED" || helpSession.status === "REFUNDED") {
      return { success: true };
    }

    // 1. Full refund to Maker
    if (helpSession.payment) {
      const { processRefund } = await import("@/lib/refund");
      await processRefund(helpSession.payment.id);
    }

    // 2. Issue Maker credit (14-day, full session amount)
    const grossAmount = helpSession.payment?.grossAmount ?? 0;
    if (grossAmount > 0) {
      const { issueCredit } = await import("@/lib/maker-credit");
      await issueCredit(
        helpSession.request.userId,
        grossAmount,
        sessionId,
      );
    }

    // 3. Demerit on Guide (weight 2)
    const { addDemerit } = await import("@/lib/demerit");
    await addDemerit(
      helpSession.guideProfile.userId,
      "NO_SHOW",
      2,
      sessionId,
      "Guide did not join session within trigger window",
    );

    // 4. Suspend Guide from matching pool
    await prisma.guideProfile.update({
      where: { id: helpSession.guideProfileId },
      data: { isPoolSuspended: true },
    });

    // 5. Cancel session and request
    await prisma.helpSession.update({
      where: { id: sessionId },
      data: { status: "CANCELLED", endedAt: new Date(), endedBy: "SYSTEM" },
    });
    await prisma.request.update({
      where: { id: helpSession.requestId },
      data: { status: "CANCELLED" },
    });

    // 6. Admin notification
    const { sendAdminDemeritAlert } = await import("@/lib/emails-cancellation");
    await sendAdminDemeritAlert({
      userId: helpSession.guideProfile.userId,
      role: "GUIDE",
      totalWeight: 2,
      threshold: 3,
      windowDays: 60,
    }).catch((err: unknown) => console.error("[no-show] Admin email failed:", err));

    // 7. Pusher notification to Maker
    try {
      const { pusher } = await import("@/lib/pusher");
      await pusher.trigger(`session-${sessionId}`, "noshow", {
        party: "guide",
        message:
          "We are so sorry. Your Guide was not able to join this session. " +
          "This is on us to make right, and we are already working on it. " +
          "You will receive a credit for a free session, and someone from " +
          "our team will follow up with you personally. Thank you for being " +
          "here. You are important to us.",
      });
    } catch (err) {
      console.error("[no-show] Pusher notification failed:", err);
    }

    return { success: true };
  } catch (err) {
    console.error("[no-show] handleGuideNoShow failed:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Handle Maker no-show.
 * Maker did not join within trigger window (3 min / 7 min).
 * Guide paid in full, 1-weight demerit on Maker.
 */
export async function handleMakerNoShow(
  sessionId: string,
): Promise<NoShowResult> {
  try {
    const { prisma } = await import("@/lib/prisma");

    const helpSession = await prisma.helpSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        status: true,
        requestId: true,
        request: { select: { userId: true } },
      },
    });

    if (!helpSession) return { success: false, error: "Session not found" };

    if (helpSession.status === "COMPLETED" || helpSession.status === "CANCELLED") {
      return { success: true };
    }

    // 1. Guide gets paid in full (no refund)

    // 2. Demerit on Maker (weight 1)
    const { addDemerit } = await import("@/lib/demerit");
    await addDemerit(
      helpSession.request.userId,
      "NO_SHOW",
      1,
      sessionId,
      "Maker did not join session within trigger window",
    );

    // 3. Mark session completed
    await prisma.helpSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", endedAt: new Date(), endedBy: "SYSTEM" },
    });
    await prisma.request.update({
      where: { id: helpSession.requestId },
      data: { status: "COMPLETED" },
    });

    // 4. Notify Guide via Pusher
    try {
      const { pusher } = await import("@/lib/pusher");
      await pusher.trigger(`session-${sessionId}`, "noshow", {
        party: "maker",
        message:
          "Your Maker was not able to join. You will be paid in full " +
          "for this session. Thank you for being here and ready.",
      });
    } catch (err) {
      console.error("[no-show] Pusher notification failed:", err);
    }

    return { success: true };
  } catch (err) {
    console.error("[no-show] handleMakerNoShow failed:", err);
    return { success: false, error: String(err) };
  }
}
