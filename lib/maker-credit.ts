// MakerCredit issuance and redemption.
// Credits expire 14 days after issue. Use soonest-expiring first.

const CREDIT_EXPIRY_DAYS = 14;

export async function issueCredit(
  makerId: string,
  amountCents: number,
  sourceSessionId: string,
): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  const expiresAt = new Date(
    Date.now() + CREDIT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  const credit = await prisma.makerCredit.create({
    data: { makerId, amountCents, sourceSessionId, expiresAt },
  });

  return credit.id;
}

// Phase 7: used in admin/maker dashboard
export async function getAvailableCredits(
  makerId: string,
): Promise<{ id: string; amountCents: number; expiresAt: Date }[]> {
  const { prisma } = await import("@/lib/prisma");

  return prisma.makerCredit.findMany({
    where: {
      makerId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, amountCents: true, expiresAt: true },
    orderBy: { expiresAt: "asc" },
  });
}

// Phase 7: used in admin/maker dashboard
export async function applyCredit(
  creditId: string,
  sessionId: string,
  makerId: string,
): Promise<{ success: boolean; error?: string }> {
  const { prisma } = await import("@/lib/prisma");

  const credit = await prisma.makerCredit.findUnique({
    where: { id: creditId },
    select: { makerId: true, usedAt: true, expiresAt: true },
  });

  if (!credit) return { success: false, error: "Credit not found" };
  if (credit.makerId !== makerId) {
    return { success: false, error: "Credit does not belong to this Maker" };
  }
  if (credit.usedAt) return { success: false, error: "Credit already used" };
  if (credit.expiresAt < new Date()) {
    return { success: false, error: "Credit has expired" };
  }

  await prisma.makerCredit.update({
    where: { id: creditId },
    data: { usedAt: new Date(), usedSessionId: sessionId },
  });

  return { success: true };
}
