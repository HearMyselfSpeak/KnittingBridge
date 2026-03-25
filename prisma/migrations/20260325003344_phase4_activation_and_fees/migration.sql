-- AlterTable
ALTER TABLE "GuideProfile" ADD COLUMN     "activationComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "availableDays" JSONB,
ADD COLUMN     "icAgreementAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "icAgreementAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "maxSessionMinutes" INTEGER,
ADD COLUMN     "platformFeeOverride" DOUBLE PRECISION,
ADD COLUMN     "timeBlocks" JSONB;

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConfig_key_key" ON "PlatformConfig"("key");
