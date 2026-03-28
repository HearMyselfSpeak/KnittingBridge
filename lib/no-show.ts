// No-show detection stubs. Cannot activate until Phase 6 builds Daily.co rooms.
// All supporting logic and data models are in place; these functions await triggers.

interface NoShowResult {
  success: boolean;
  error?: string;
}

/**
 * Handle Guide no-show.
 *
 * Trigger condition (Phase 6):
 * Guide has not joined the Daily.co session room at:
 * - 3 minutes for a 15-minute session
 * - 7 minutes for a 45-minute session
 *
 * When activated, this function will:
 * 1. Full refund to Maker via processRefund().
 * 2. Create MakerCredit: amountCents = grossAmount, expiresAt = 14 days, sourceSessionId.
 * 3. Create Demerit on Guide with type NO_SHOW, weight 2.
 * 4. Set isPoolSuspended = true on GuideProfile.
 * 5. Set Request status CANCELLED.
 * 6. Send admin notification for personal outreach to both Maker and Guide.
 * 7. Maker in-session message (Phase 6 UI):
 *    "It looks like your Guide has not joined yet. We are looking into
 *     this and will follow up with you shortly."
 */
export async function handleGuideNoShow(
  _sessionId: string,
): Promise<NoShowResult> {
  // TODO (Phase 6): Implement with Daily.co session room join tracking.
  // See lib/cancellation.ts, lib/demerit.ts, lib/maker-credit.ts,
  // lib/refund.ts, and lib/emails-cancellation.ts for supporting logic.
  console.warn("[no-show] handleGuideNoShow stub called for", _sessionId);
  return { success: false, error: "No-show detection not yet implemented" };
}

/**
 * Handle Maker no-show.
 *
 * Trigger condition (Phase 6):
 * Maker has not joined the Daily.co session room at:
 * - 3 minutes for a 15-minute session
 * - 7 minutes for a 45-minute session
 *
 * When activated:
 * 1. Guide gets paid in full. No refund.
 * 2. Create Demerit on Maker with type NO_SHOW, weight 1.
 * 3. Check Maker demerit threshold.
 */
export async function handleMakerNoShow(
  _sessionId: string,
): Promise<NoShowResult> {
  // TODO (Phase 6): Implement with Daily.co session room join tracking.
  // See lib/demerit.ts for addDemerit() and threshold checking.
  console.warn("[no-show] handleMakerNoShow stub called for", _sessionId);
  return { success: false, error: "No-show detection not yet implemented" };
}
