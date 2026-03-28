// Captures the Stripe PaymentIntent after Guide acceptance.
// Creates a Payment record, transfers Guide earnings, and sends emails.
// Pre-auth PI was created without transfer_data (Guide unknown at step 6),
// so we capture to platform first, then create a separate transfer.

import type Stripe from "stripe";

interface CaptureInput {
  requestId: string;
  guideProfileId: string;
}

interface CaptureResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export async function captureOnAccept(
  input: CaptureInput,
): Promise<CaptureResult> {
  const { prisma } = await import("@/lib/prisma");
  const { stripe } = await import("@/lib/stripe");
  const { getEffectiveFee } = await import("@/lib/fees");

  const helpSession = await prisma.helpSession.findUnique({
    where: { requestId: input.requestId },
    select: {
      id: true, amount: true, stripePaymentIntentId: true,
      request: {
        select: {
          triageSummary: true, recommendedSession: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!helpSession?.stripePaymentIntentId) {
    return { success: false, error: "No PaymentIntent on session" };
  }

  const guide = await prisma.guideProfile.findUnique({
    where: { id: input.guideProfileId },
    select: { stripeAccountId: true, user: { select: { email: true } } },
  });

  if (!guide?.stripeAccountId) {
    return { success: false, error: "Guide has no Stripe account" };
  }

  const feeDecimal = await getEffectiveFee(input.guideProfileId);
  const gross = helpSession.amount;
  const platformFee = Math.floor(gross * feeDecimal);
  const guideNet = gross - platformFee;
  const piId = helpSession.stripePaymentIntentId;

  // Capture then transfer (retry once on failure)
  let captured: Stripe.PaymentIntent | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      captured = await stripe.paymentIntents.capture(piId);
      break;
    } catch (err) {
      console.error(`[capture] Attempt ${attempt + 1} failed:`, err);
      if (attempt === 1) {
        await prisma.helpSession.update({
          where: { id: helpSession.id },
          data: { paid: false },
        });
        return {
          success: false,
          error: "Capture failed after retry. Flagged for admin review.",
        };
      }
    }
  }

  if (!captured) return { success: false, error: "Capture returned null" };

  // Transfer Guide earnings to their Connect account
  let transferId: string | undefined;
  try {
    const chargeId = typeof captured.latest_charge === "string"
      ? captured.latest_charge
      : captured.latest_charge?.id;

    const transfer = await stripe.transfers.create({
      amount: guideNet,
      currency: "usd",
      destination: guide.stripeAccountId,
      source_transaction: chargeId,
    });
    transferId = transfer.id;
  } catch (err) {
    console.error("[capture] Transfer to Guide failed:", err);
    // Capture succeeded but transfer failed. Admin will handle.
  }

  // Create Payment record
  const payment = await prisma.payment.create({
    data: {
      helpSessionId: helpSession.id,
      stripePaymentIntentId: piId,
      grossAmount: gross,
      platformFee,
      guideNet,
      status: "CAPTURED",
      capturedAt: new Date(),
    },
  });

  await prisma.helpSession.update({
    where: { id: helpSession.id },
    data: {
      paid: true, paidAt: new Date(),
      platformFee, guideEarnings: guideNet,
      guideProfileId: input.guideProfileId,
      stripeTransferId: transferId,
    },
  });

  // Send confirmation emails (non-blocking)
  sendEmails({
    makerEmail: helpSession.request.user.email,
    guideEmail: guide.user.email,
    gross, guideNet,
    sessionType: helpSession.request.recommendedSession ?? "45",
    triageSummary: helpSession.request.triageSummary ?? "",
    requestId: input.requestId,
    cardLast4: getCardLast4(captured),
  }).catch((err) => console.error("[capture] Email send failed:", err));

  return { success: true, paymentId: payment.id };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function getCardLast4(pi: Stripe.PaymentIntent): string | undefined {
  const ch = pi.latest_charge;
  if (typeof ch === "object" && ch?.payment_method_details?.card) {
    return ch.payment_method_details.card.last4 ?? undefined;
  }
  return undefined;
}

async function sendEmails(opts: {
  makerEmail: string; guideEmail: string;
  gross: number; guideNet: number; sessionType: string;
  triageSummary: string; requestId: string; cardLast4?: string;
}) {
  const { sendMakerConfirmation, sendGuideConfirmation } = await import(
    "@/lib/emails"
  );
  const label =
    opts.sessionType === "45" ? "Deep Dive (45 min)" : "Quick Look (15 min)";
  const base = process.env.NEXTAUTH_URL ?? "https://knittingbridge.vercel.app";

  await Promise.allSettled([
    sendMakerConfirmation({
      email: opts.makerEmail, sessionLabel: label,
      amountFormatted: `$${(opts.gross / 100).toFixed(2)}`,
      cardLast4: opts.cardLast4,
    }),
    sendGuideConfirmation({
      email: opts.guideEmail, sessionLabel: label,
      takeHomeFormatted: `$${(opts.guideNet / 100).toFixed(2)}`,
      triageSummary: opts.triageSummary,
      requestUrl: `${base}/dashboard/guide/request/${opts.requestId}`,
    }),
  ]);
}
