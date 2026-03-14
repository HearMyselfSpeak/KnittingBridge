// Shared TypeScript types and interfaces.
// Populated incrementally as features are built.

export type UserRole = "MAKER" | "GUIDE" | "ADMIN";

export type ColorSessionStatus =
  | "AWAITING_GARMENT_UPLOAD"
  | "ANALYZING_GARMENT"
  | "AWAITING_COLOR_DIRECTION"
  | "AWAITING_MORE_YARN_INFO"
  | "AWAITING_REGION_MAPPING"
  | "READY_FOR_PREVIEW"
  | "GENERATING_PREVIEW"
  | "PREVIEW_READY"
  | "CORRECTION_REQUESTED"
  | "FAILED";

export interface GarmentRegion {
  id: string;
  label: string;
  description: string;
  originalColorDescription: string;
  hex?: string;
  confidence: number;
}

export interface LinkedRegion {
  regionIds: string[];
  yarnDescription: string;
}

export interface GarmentAnalysisResult {
  regions: GarmentRegion[];
  linkedRegions: LinkedRegion[];
  colorworkType:
    | "none"
    | "stripes"
    | "fair-isle"
    | "nordic"
    | "colorblock"
    | "intarsia";
  ambiguities: string[];
  garmentNotes: string;
}

export interface YarnAnalysisResult {
  dominantColor: { description: string; hex: string };
  isVariegated: boolean;
  variationType:
    | "marled"
    | "heathered"
    | "speckled"
    | "gradient"
    | "self-striping"
    | "solid";
  confidence: number;
  notes: string;
}

// ─── Color Preview Tool — client-facing view types ───────────────────────────

export interface UploadedAssetView {
  id: string;
  kind: "GARMENT_SCREENSHOT" | "GARMENT_CLOSEUP" | "YARN_PHOTO";
  fileName: string;
  publicUrl: string;
  mimeType: string;
}

export interface PaletteAssignmentInput {
  regionId: string;
  regionLabel: string;
  targetColorDescription: string;
  source: "DESCRIBED" | "YARN_PHOTO" | "THEME" | "AUTO_FILLED";
  sourceAssetId?: string;
}

export interface ColorPreviewView {
  id: string;
  imageUrl: string;
  refinementOf?: string | null;
  generatedAt: string;
}

export interface ColorPreviewSessionView {
  id: string;
  status: ColorSessionStatus;
  uploadedAssets: UploadedAssetView[];
  analysis: GarmentAnalysisResult | null;
  assignments: PaletteAssignmentInput[];
  previews: ColorPreviewView[];
}

export interface ReadinessCheckResult {
  ready: boolean;
  missingConditions: string[];
  clarifyingQuestion?: string;
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export interface TriageResult {
  canAIResolve: boolean;
  aiGuidance?: string;
  issueType:
    | "gauge"
    | "fit"
    | "technique"
    | "pattern-reading"
    | "yarn-choice"
    | "repair"
    | "colorwork"
    | "construction"
    | "other";
  skillsRequired: string[];
  urgency: "low" | "medium" | "high";
  sessionType: "async" | "live";
  makerState: {
    frustration: number;
    confidence: number;
    prefersDirectness: boolean;
    wantsEducation: boolean;
    needsEncouragement: boolean;
  };
}
