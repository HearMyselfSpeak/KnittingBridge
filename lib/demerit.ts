// Demerit evaluation logic.
// Guide threshold: weight >= 3 within 60 days -> isPoolSuspended.
// Maker threshold: weight >= 3 within 90 days -> admin notification only.

type DemeritTypeValue = "CANCELLATION" | "NO_SHOW";

const GUIDE_WINDOW_DAYS = 60;
const GUIDE_THRESHOLD = 3;
const MAKER_WINDOW_DAYS = 90;
const MAKER_THRESHOLD = 3;

interface DemeritSummary {
  totalWeight: number;
  demerits: { id: string; type: string; weight: number; createdAt: Date }[];
  thresholdHit: boolean;
}

export async function addDemerit(
  userId: string,
  type: DemeritTypeValue,
  weight: number,
  sessionId: string | null,
  reason?: string,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  await prisma.demerit.create({
    data: { userId, type, weight, sessionId, reason },
  });

  await checkThreshold(userId);
}

export async function checkThreshold(userId: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, guideProfile: { select: { id: true } } },
  });
  if (!user) return;

  const isGuide = user.role === "GUIDE" || !!user.guideProfile;
  const windowDays = isGuide ? GUIDE_WINDOW_DAYS : MAKER_WINDOW_DAYS;
  const threshold = isGuide ? GUIDE_THRESHOLD : MAKER_THRESHOLD;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const demerits = await prisma.demerit.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { weight: true },
  });

  const totalWeight = demerits.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight < threshold) return;

  if (isGuide && user.guideProfile) {
    await prisma.guideProfile.update({
      where: { id: user.guideProfile.id },
      data: { isPoolSuspended: true },
    });
  }

  const { sendAdminDemeritAlert } = await import("@/lib/emails-cancellation");
  await sendAdminDemeritAlert({
    userId,
    role: isGuide ? "GUIDE" : "MAKER",
    totalWeight,
    threshold,
    windowDays,
  });
}

export async function getDemeritSummary(
  userId: string,
): Promise<DemeritSummary> {
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, guideProfile: { select: { id: true } } },
  });

  const isGuide = user?.role === "GUIDE" || !!user?.guideProfile;
  const windowDays = isGuide ? GUIDE_WINDOW_DAYS : MAKER_WINDOW_DAYS;
  const threshold = isGuide ? GUIDE_THRESHOLD : MAKER_THRESHOLD;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const demerits = await prisma.demerit.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { id: true, type: true, weight: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const totalWeight = demerits.reduce((sum, d) => sum + d.weight, 0);

  return { totalWeight, demerits, thresholdHit: totalWeight >= threshold };
}
