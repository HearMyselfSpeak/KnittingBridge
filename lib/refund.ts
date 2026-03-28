// Refund logic shared between admin route and future auto-triggers.
// Stripe automatically reverses the Guide's transfer if not yet settled.
// If settled, Stripe debits the Guide's Connect balance.

interface RefundResult {
  success: boolean;
  error?: string;
  stripeRefundId?: string;
}

export async function processRefund(paymentId: string): Promise<RefundResult> {
  const { prisma } = await import("@/lib/prisma");
  const { stripe } = await import("@/lib/stripe");

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      stripePaymentIntentId: true,
      status: true,
      helpSessionId: true,
    },
  });

  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  if (payment.status === "REFUNDED") {
    return { success: false, error: "Payment already refunded" };
  }

  if (payment.status !== "CAPTURED") {
    return { success: false, error: `Cannot refund payment with status: ${payment.status}` };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          stripeRefundId: refund.id,
        },
      }),
      prisma.helpSession.update({
        where: { id: payment.helpSessionId },
        data: { status: "REFUNDED" },
      }),
    ]);

    return { success: true, stripeRefundId: refund.id };
  } catch (err) {
    console.error("[refund] Stripe refund failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Stripe refund failed",
    };
  }
}

// ─── No-show auto-refund stub ─────────────────────────────────────────────
// Trigger condition: If the Guide has not joined the Daily.co room within
// 10 minutes of the session start time, auto-refund the Maker.
// This cannot fire until Phase 6 builds the session/video infrastructure.
// The Daily.co webhook or a scheduled check will call this function.

export async function handleGuideNoShow(
  _sessionId: string,
): Promise<RefundResult> {
  // TODO (Phase 6): Look up the HelpSession, verify Guide has not joined,
  // find the associated Payment, and call processRefund().
  // For now this is a stub awaiting Daily.co integration.
  return { success: false, error: "No-show detection not yet implemented" };
}
