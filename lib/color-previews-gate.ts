// Color Previews tier gating logic.
// Tracks recolor/project usage per cookie, enforces weekly limits by tier.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const FREE_RECOLORS = 3;
const FREE_PROJECTS = 1;

export interface AccessResult {
  allowed: boolean;
  tier: "anonymous" | "returning" | "free" | "purchased";
  remaining: number;
  daysUntilReset?: number;
  message?: string;
}

export async function checkRecolorAccess(
  cookieId: string,
  userId?: string | null,
): Promise<AccessResult> {
  const { prisma } = await import("@/lib/prisma");

  let usage = await prisma.colorPreviewsUsage.findUnique({
    where: { cookieId },
  });

  // First visit: create record
  if (!usage) {
    usage = await prisma.colorPreviewsUsage.create({
      data: { cookieId, userId: userId ?? null },
    });
    return { allowed: true, tier: "anonymous", remaining: FREE_RECOLORS };
  }

  // Returning anonymous (week 2+, no account)
  if (!usage.userId && !userId) {
    const age = Date.now() - usage.firstSeenAt.getTime();
    if (age > WEEK_MS) {
      return { allowed: false, tier: "returning", remaining: 0 };
    }
    // Still in week 1
    const reset = maybeResetWeek(usage);
    const rem = FREE_RECOLORS - reset.recolorsUsedThisWeek;
    return {
      allowed: rem > 0,
      tier: "anonymous",
      remaining: Math.max(0, rem),
      daysUntilReset: daysUntil(reset.weekStartedAt),
    };
  }

  // Authenticated user: link cookie if needed
  const effectiveUserId = userId ?? usage.userId;
  if (userId && !usage.userId) {
    await prisma.colorPreviewsUsage.update({
      where: { id: usage.id },
      data: { userId },
    });
  }

  // Check purchased tier
  if (effectiveUserId) {
    const balance = await prisma.recolorBalance.findUnique({
      where: { userId: effectiveUserId },
      select: { balance: true },
    });
    if (balance && balance.balance > 0) {
      return { allowed: true, tier: "purchased", remaining: balance.balance };
    }
  }

  // Free tier: check weekly usage
  const reset = maybeResetWeek(usage);
  if (needsDbReset(usage, reset)) {
    await prisma.colorPreviewsUsage.update({
      where: { id: usage.id },
      data: {
        recolorsUsedThisWeek: 0,
        projectsUsedThisWeek: 0,
        projectIdsThisWeek: [],
        weekStartedAt: new Date(),
      },
    });
  }
  const rem = FREE_RECOLORS - reset.recolorsUsedThisWeek;
  return {
    allowed: rem > 0,
    tier: "free",
    remaining: Math.max(0, rem),
    daysUntilReset: daysUntil(reset.weekStartedAt),
  };
}

export async function recordRecolorUsage(
  cookieId: string,
  projectId: string,
  userId?: string | null,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  // Check purchased balance first
  const effectiveUserId = userId ?? null;
  if (effectiveUserId) {
    const balance = await prisma.recolorBalance.findUnique({
      where: { userId: effectiveUserId },
    });
    if (balance && balance.balance > 0) {
      await prisma.recolorBalance.update({
        where: { userId: effectiveUserId },
        data: { balance: { decrement: 1 } },
      });
      return;
    }
  }

  // Free/anonymous: increment weekly counter
  const usage = await prisma.colorPreviewsUsage.findUnique({
    where: { cookieId },
  });
  if (!usage) return;

  const isNewProject = !usage.projectIdsThisWeek.includes(projectId);
  await prisma.colorPreviewsUsage.update({
    where: { id: usage.id },
    data: {
      recolorsUsedThisWeek: { increment: 1 },
      ...(isNewProject
        ? {
            projectsUsedThisWeek: { increment: 1 },
            projectIdsThisWeek: { push: projectId },
          }
        : {}),
    },
  });
}

export async function linkCookieToUser(
  cookieId: string,
  userId: string,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  await prisma.colorPreviewsUsage
    .update({ where: { cookieId }, data: { userId } })
    .catch(() => {});
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function maybeResetWeek(usage: { weekStartedAt: Date; recolorsUsedThisWeek: number; projectsUsedThisWeek: number }) {
  const elapsed = Date.now() - usage.weekStartedAt.getTime();
  if (elapsed > WEEK_MS) {
    return { ...usage, recolorsUsedThisWeek: 0, projectsUsedThisWeek: 0, weekStartedAt: new Date() };
  }
  return usage;
}

function needsDbReset(
  original: { weekStartedAt: Date },
  reset: { weekStartedAt: Date },
) {
  return original.weekStartedAt.getTime() !== reset.weekStartedAt.getTime();
}

function daysUntil(weekStartedAt: Date): number {
  const resetAt = weekStartedAt.getTime() + WEEK_MS;
  return Math.max(1, Math.ceil((resetAt - Date.now()) / (24 * 60 * 60 * 1000)));
}
