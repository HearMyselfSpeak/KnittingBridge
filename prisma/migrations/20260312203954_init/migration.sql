-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MAKER', 'GUIDE', 'ADMIN');

-- CreateEnum
CREATE TYPE "GuideStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('SUBMITTED', 'TRIAGING', 'AI_RESOLVED', 'MATCHED', 'IN_SESSION', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ASYNC', 'LIVE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING_PAYMENT', 'QUEUED', 'NOTIFYING_GUIDES', 'GUIDE_ACCEPTED', 'WAITING_ROOM', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ColorSessionStatus" AS ENUM ('AWAITING_GARMENT_UPLOAD', 'ANALYZING_GARMENT', 'AWAITING_COLOR_DIRECTION', 'AWAITING_MORE_YARN_INFO', 'AWAITING_REGION_MAPPING', 'READY_FOR_PREVIEW', 'GENERATING_PREVIEW', 'PREVIEW_READY', 'CORRECTION_REQUESTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('GARMENT_SCREENSHOT', 'GARMENT_CLOSEUP', 'YARN_PHOTO');

-- CreateEnum
CREATE TYPE "PaletteSource" AS ENUM ('DESCRIBED', 'YARN_PHOTO', 'THEME', 'AUTO_FILLED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MAKER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "GuideStatus" NOT NULL DEFAULT 'PENDING',
    "garments" BOOLEAN NOT NULL DEFAULT false,
    "fitSizing" BOOLEAN NOT NULL DEFAULT false,
    "socks" BOOLEAN NOT NULL DEFAULT false,
    "lace" BOOLEAN NOT NULL DEFAULT false,
    "colorwork" BOOLEAN NOT NULL DEFAULT false,
    "cables" BOOLEAN NOT NULL DEFAULT false,
    "patternMod" BOOLEAN NOT NULL DEFAULT false,
    "yarnSub" BOOLEAN NOT NULL DEFAULT false,
    "repair" BOOLEAN NOT NULL DEFAULT false,
    "machine" BOOLEAN NOT NULL DEFAULT false,
    "directnessScore" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "technicality" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "verbosity" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "empathy" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "patience" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "encouragement" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "questionBased" BOOLEAN NOT NULL DEFAULT false,
    "processOriented" BOOLEAN NOT NULL DEFAULT false,
    "fixVsTeach" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "asyncOnly" BOOLEAN NOT NULL DEFAULT false,
    "weeklyHours" INTEGER,
    "stripeAccountId" TEXT,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),
    "currentCapacity" INTEGER NOT NULL DEFAULT 3,
    "activeSessions" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "sampleUrls" TEXT[],
    "scenarioResponses" JSONB,
    "yearsExperience" INTEGER,
    "location" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "patternUrl" TEXT,
    "issueType" TEXT,
    "skillsRequired" TEXT[],
    "urgency" TEXT,
    "aiGuidance" TEXT,
    "frustrationScore" INTEGER,
    "confidenceScore" INTEGER,
    "prefersDirectness" BOOLEAN,
    "wantsEducation" BOOLEAN,
    "needsEncouragement" BOOLEAN,
    "matchedGuideId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpSession" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "videoRoomUrl" TEXT,
    "videoRoomName" TEXT,
    "videoStartedAt" TIMESTAMP(3),
    "videoEndedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "guideEarnings" INTEGER NOT NULL DEFAULT 0,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "transcript" JSONB,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideNotification" (
    "id" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "GuideNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MakerSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "MakerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "privateNotes" TEXT,

    CONSTRAINT "GuideSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorPreviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ColorSessionStatus" NOT NULL DEFAULT 'AWAITING_GARMENT_UPLOAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColorPreviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedAsset" (
    "id" TEXT NOT NULL,
    "colorSessionId" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storageKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarmentAnalysis" (
    "id" TEXT NOT NULL,
    "colorSessionId" TEXT NOT NULL,
    "rawAnalysisJson" JSONB NOT NULL,
    "regions" JSONB NOT NULL,
    "detectedColors" JSONB NOT NULL,
    "linkedRegions" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GarmentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaletteAssignment" (
    "id" TEXT NOT NULL,
    "colorSessionId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "regionLabel" TEXT NOT NULL,
    "targetColorDescription" TEXT NOT NULL,
    "source" "PaletteSource" NOT NULL,
    "sourceAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaletteAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorPreview" (
    "id" TEXT NOT NULL,
    "colorSessionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refinementOf" TEXT,

    CONSTRAINT "ColorPreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GuideProfile_userId_key" ON "GuideProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpSession_requestId_key" ON "HelpSession"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "MakerSession_sessionId_key" ON "MakerSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideSession_sessionId_key" ON "GuideSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "GarmentAnalysis_colorSessionId_key" ON "GarmentAnalysis"("colorSessionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideProfile" ADD CONSTRAINT "GuideProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpSession" ADD CONSTRAINT "HelpSession_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpSession" ADD CONSTRAINT "HelpSession_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideNotification" ADD CONSTRAINT "GuideNotification_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideNotification" ADD CONSTRAINT "GuideNotification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "HelpSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MakerSession" ADD CONSTRAINT "MakerSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "HelpSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MakerSession" ADD CONSTRAINT "MakerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideSession" ADD CONSTRAINT "GuideSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "HelpSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideSession" ADD CONSTRAINT "GuideSession_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideSession" ADD CONSTRAINT "GuideSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorPreviewSession" ADD CONSTRAINT "ColorPreviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedAsset" ADD CONSTRAINT "UploadedAsset_colorSessionId_fkey" FOREIGN KEY ("colorSessionId") REFERENCES "ColorPreviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarmentAnalysis" ADD CONSTRAINT "GarmentAnalysis_colorSessionId_fkey" FOREIGN KEY ("colorSessionId") REFERENCES "ColorPreviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteAssignment" ADD CONSTRAINT "PaletteAssignment_colorSessionId_fkey" FOREIGN KEY ("colorSessionId") REFERENCES "ColorPreviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteAssignment" ADD CONSTRAINT "PaletteAssignment_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "UploadedAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorPreview" ADD CONSTRAINT "ColorPreview_colorSessionId_fkey" FOREIGN KEY ("colorSessionId") REFERENCES "ColorPreviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
