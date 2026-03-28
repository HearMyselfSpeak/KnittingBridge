// Session Packing — Mode 3: Alternative slot search (+/- 24 hours)
// Split from session-packing.ts to stay under 200-line cap.

import {
  type SessionLength,
  type SlotCandidate,
  type PackingResult,
  blockStartFor,
  checkBlockAvailability,
  getDayName,
  getHourInTz,
  guideHasHour,
} from "@/lib/session-packing";

export type GuideProfileSlim = {
  id: string;
  isOnline: boolean;
  timezone: string | null;
  timeBlocks: unknown;
};

export async function searchAlternatives(
  matchResults: Array<{ guideId: string; score: number }>,
  profileMap: Map<string, GuideProfileSlim>,
  scoreMap: Map<string, number>,
  sessionLength: SessionLength,
  targetTime: Date,
  makerTz: string,
): Promise<PackingResult> {
  const now = new Date();
  const searchStart = new Date(targetTime.getTime() - 24 * 3_600_000);
  const reasonable: SlotCandidate[] = [];
  const outside: SlotCandidate[] = [];

  for (const { guideId } of matchResults) {
    const p = profileMap.get(guideId);
    if (!p) continue;
    const gTz = p.timezone ?? "America/New_York";
    const blocks = p.timeBlocks as Record<string, number[]> | null;

    for (let h = 0; h < 48; h++) {
      const slotTime = new Date(searchStart.getTime() + h * 3_600_000);
      if (slotTime <= now) continue;

      const slotBlock = blockStartFor(slotTime);
      const day = getDayName(slotBlock, gTz);
      const hour = getHourInTz(slotBlock, gTz);
      if (!guideHasHour(blocks, day, hour)) continue;

      const fits = await checkBlockAvailability(
        guideId, slotBlock, sessionLength,
      );
      if (!fits) continue;

      const makerHour = getHourInTz(slotBlock, makerTz);
      const slot: SlotCandidate = {
        guideId,
        score: scoreMap.get(guideId) ?? 0,
        blockStart: slotBlock,
      };

      if (makerHour >= 7 && makerHour < 22) {
        reasonable.push(slot);
      } else {
        outside.push(slot);
      }
    }
  }

  reasonable.sort((a, b) => b.score - a.score);
  const top3 = reasonable.slice(0, 3);

  return {
    candidates: [],
    alternatives: top3,
    hasMoreOutsideReasonableHours: top3.length < 3 && outside.length > 0,
  };
}
