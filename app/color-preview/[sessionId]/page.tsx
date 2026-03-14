export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPublicUrl } from "@/lib/storage";
import { ChatInterface } from "@/components/ColorPreview/ChatInterface";
import type {
  ColorSessionStatus,
  GarmentAnalysisResult,
  PaletteAssignmentInput,
  UploadedAssetView,
} from "@/lib/types";

export default async function ColorPreviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { prisma } = await import("@/lib/prisma");

  const session = await prisma.colorPreviewSession.findUnique({
    where: { id: sessionId },
    include: {
      uploadedAssets: { orderBy: { createdAt: "asc" } },
      garmentAnalysis: true,
      paletteAssignments: { orderBy: { createdAt: "asc" } },
      previews: { orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });

  if (!session) notFound();

  const initialAssets: UploadedAssetView[] = session.uploadedAssets.map((a) => ({
    id: a.id,
    kind: a.kind as UploadedAssetView["kind"],
    fileName: a.storageKey.split("/").pop() ?? a.id,
    publicUrl: getPublicUrl(a.storageKey),
    mimeType: a.mimeType,
  }));

  const initialAnalysis: GarmentAnalysisResult | null = session.garmentAnalysis
    ? (session.garmentAnalysis.rawAnalysisJson as unknown as GarmentAnalysisResult)
    : null;

  const initialAssignments: PaletteAssignmentInput[] = session.paletteAssignments.map((a) => ({
    regionId: a.regionId,
    regionLabel: a.regionLabel,
    targetColorDescription: a.targetColorDescription,
    source: a.source as PaletteAssignmentInput["source"],
    sourceAssetId: a.sourceAssetId ?? undefined,
  }));

  const initialPreviewUrl = session.previews[0]?.imageUrl ?? null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Color Preview Tool
        </p>
        <h1
          className="text-2xl font-semibold text-primary"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Color your garment
        </h1>
      </div>
      <ChatInterface
        sessionId={sessionId}
        initialStatus={session.status as ColorSessionStatus}
        initialAssets={initialAssets}
        initialAnalysis={initialAnalysis}
        initialAssignments={initialAssignments}
        initialPreviewUrl={initialPreviewUrl}
      />
    </div>
  );
}
