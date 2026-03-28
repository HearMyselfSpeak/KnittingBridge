// Session Packing Engine
// Determines if a session fits in a Guide's 1-hour availability blocks.
// No AI calls. Pure scheduling math.

import { searchAlternatives } from "@/lib/packing-alternatives";

export type SessionLength = 15 | 45;

interface BlockOccupancy {
  fifteenMinCount: number;
  hasFortyFive: boolean;
}

export interface SlotCandidate {
  guideId: string;
  score: number;
  blockStart: Date;
}

export interface PackingResult {
  candidates: SlotCandidate[];
  alternatives: SlotCandidate[];
  hasMoreOutsideReasonableHours: boolean;
}

// ─── Core fit logic ───────────────────────────────────────────────────────

function canFit(occ: BlockOccupancy, len: SessionLength): boolean {
  if (occ.hasFortyFive) return false;
  if (len === 45) return occ.fifteenMinCount === 0;
  return occ.fifteenMinCount < 2;
}

export function blockStartFor(time: Date): Date {
  const d = new Date(time);
  d.setMinutes(0, 0, 0);
  return d;
}

// ─── DB: block occupancy ──────────────────────────────────────────────────

const BOOKED: Array<"GUIDE_ACCEPTED" | "WAITING_ROOM" | "IN_PROGRESS"> = [
  "GUIDE_ACCEPTED", "WAITING_ROOM", "IN_PROGRESS",
];

async function getBlockOccupancy(
  guideId: string,
  blockStart: Date,
): Promise<BlockOccupancy> {
  const { prisma } = await import("@/lib/prisma");
  const blockEnd = new Date(blockStart.getTime() + 3_600_000);

  const sessions = await prisma.helpSession.findMany({
    where: {
      guideProfileId: guideId,
      status: { in: BOOKED },
      OR: [
        { startedAt: { gte: blockStart, lt: blockEnd } },
        { startedAt: null, createdAt: { gte: blockStart, lt: blockEnd } },
      ],
    },
    select: { amount: true, duration: true },
  });

  let fifteenMinCount = 0;
  let hasFortyFive = false;
  for (const s of sessions) {
    const dur = s.duration ?? (s.amount >= 6000 ? 45 : 15);
    if (dur >= 45) hasFortyFive = true;
    else fifteenMinCount++;
  }
  return { fifteenMinCount, hasFortyFive };
}

// ─── Public: check single block ───────────────────────────────────────────

export async function checkBlockAvailability(
  guideId: string,
  blockStart: Date,
  sessionLength: SessionLength,
): Promise<boolean> {
  const occ = await getBlockOccupancy(guideId, blockStart);
  return canFit(occ, sessionLength);
}

// ─── Timezone helpers (exported for packing-alternatives) ─────────────────

export function getDayName(date: Date, tz?: string): string {
  if (tz) {
    return date.toLocaleDateString("en-US", {
      weekday: "long", timeZone: tz,
    });
  }
  const names = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];
  return names[date.getUTCDay()];
}

export function getHourInTz(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", hour12: false, timeZone: tz,
  }).formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  return parseInt(hourPart?.value ?? "0", 10);
}

export function guideHasHour(
  timeBlocks: Record<string, number[]> | null,
  day: string,
  hour: number,
): boolean {
  if (!timeBlocks) return false;
  return timeBlocks[day]?.includes(hour) ?? false;
}

// ─── Public: find available slots ─────────────────────────────────────────

export async function findAvailableSlots(
  matchResults: Array<{ guideId: string; score: number }>,
  sessionLength: SessionLength,
  mode: "now" | "specific",
  requestedTime?: Date,
  makerTimezone?: string,
): Promise<PackingResult> {
  const { prisma } = await import("@/lib/prisma");
  const now = new Date();
  const targetTime = mode === "now" ? now : (requestedTime ?? now);
  const targetBlock = blockStartFor(targetTime);
  const tz = makerTimezone ?? "America/New_York";

  const guideIds = matchResults.map((r) => r.guideId);
  const profiles = await prisma.guideProfile.findMany({
    where: { id: { in: guideIds } },
    select: { id: true, isOnline: true, timezone: true, timeBlocks: true },
  });
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const scoreMap = new Map(matchResults.map((r) => [r.guideId, r.score]));

  // ── Mode 1 & 2: check target block ────────────────────────────────────
  const candidates: SlotCandidate[] = [];

  for (const { guideId } of matchResults) {
    const p = profileMap.get(guideId);
    if (!p) continue;
    if (mode === "now" && !p.isOnline) continue;
    if (mode === "specific" && !p.isOnline) {
      const gTz = p.timezone ?? "America/New_York";
      const day = getDayName(targetBlock, gTz);
      const hour = getHourInTz(targetBlock, gTz);
      const blocks = p.timeBlocks as Record<string, number[]> | null;
      if (!guideHasHour(blocks, day, hour)) continue;
    }

    const fits = await checkBlockAvailability(guideId, targetBlock, sessionLength);
    if (fits) {
      candidates.push({
        guideId, score: scoreMap.get(guideId) ?? 0, blockStart: targetBlock,
      });
    }
  }

  if (candidates.length > 0) {
    return {
      candidates: candidates.sort((a, b) => b.score - a.score),
      alternatives: [],
      hasMoreOutsideReasonableHours: false,
    };
  }

  // ── Mode 3: search alternatives ───────────────────────────────────────
  return searchAlternatives(
    matchResults, profileMap, scoreMap, sessionLength, targetTime, tz,
  );
}
