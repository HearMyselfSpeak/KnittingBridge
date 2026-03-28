-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "followUpAnswers" TEXT[],
ADD COLUMN     "matchCriteria" TEXT[],
ADD COLUMN     "recommendedSession" TEXT,
ADD COLUMN     "sophisticationScore" INTEGER,
ADD COLUMN     "triageSummary" TEXT;

-- CreateTable
CREATE TABLE "BailOutLog" (
    "id" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "ip" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BailOutLog_pkey" PRIMARY KEY ("id")
);
