// Refund logic shared between admin route and future auto-triggers.
// Stripe automatically reverses the Guide's transfer if not yet settled.
// If settled, Stripe debits the Guide's Connect balance.

interface RefundResult {
  success: boolean;
  error?: string;
  stripeRefundId?: string;
}

export async function processRefund(
  paymentId: string,
  amountCents?: number,
): Promise<RefundResult> {
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
    const refundParams: { payment_intent: string; amount?: number } = {
      payment_intent: payment.stripePaymentIntentId,
    };
    if (amountCents !== undefined) {
      refundParams.amount = amountCents;
    }
    const refund = await stripe.refunds.create(refundParams);

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

// No-show stubs moved to lib/no-show.ts (Task 9).
