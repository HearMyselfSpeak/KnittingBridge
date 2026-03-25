// Fee utilities — lazy loads Prisma, never imported at module top level in routes.
//
// Fees are stored as percentage points (e.g. 18 = 18%) in both PlatformConfig
// and GuideProfile.platformFeeOverride. All functions return a decimal (0–1)
// ready for use with createPaymentIntent's platformFeePercent parameter.

// Return the effective platform fee for a Guide as a decimal (e.g. 0.18).
// Checks GuideProfile.platformFeeOverride first; falls back to the
// PlatformConfig 'platformFeePercent' value; falls back to 0.18 if neither exists.
export async function getEffectiveFee(guideProfileId: string): Promise<number> {
  const { prisma } = await import("@/lib/prisma");

  const [guide, config] = await Promise.all([
    prisma.guideProfile.findUnique({
      where: { id: guideProfileId },
      select: { platformFeeOverride: true },
    }),
    prisma.platformConfig.findUnique({
      where: { key: "platformFeePercent" },
      select: { value: true },
    }),
  ]);

  if (guide?.platformFeeOverride != null) {
    return guide.platformFeeOverride / 100;
  }

  if (config?.value != null) {
    const parsed = parseFloat(config.value);
    if (!isNaN(parsed)) return parsed / 100;
  }

  return 0.18;
}

// Return the platform default fee as a decimal without a Guide context.
// Used where no guideProfileId is available (e.g. admin displays).
export async function getDefaultFee(): Promise<number> {
  const { prisma } = await import("@/lib/prisma");

  const config = await prisma.platformConfig.findUnique({
    where: { key: "platformFeePercent" },
    select: { value: true },
  });

  if (config?.value != null) {
    const parsed = parseFloat(config.value);
    if (!isNaN(parsed)) return parsed / 100;
  }

  return 0.18;
}
