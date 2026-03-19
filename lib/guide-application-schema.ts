import { z } from "zod";

// Step 1 — Identity
export const StepIdentitySchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  email: z.string().email("Enter a valid email address"),
  location: z.string().min(1, "Location is required").max(100, "Max 100 characters"),
  timezone: z.string().min(1, "Timezone is required"),
});
export type StepIdentityData = z.infer<typeof StepIdentitySchema>;

// Step 2 — Experience Areas
export const EXPERIENCE_AREAS = [
  { id: "garments",   label: "Garments" },
  { id: "fitSizing",  label: "Fit & Sizing" },
  { id: "socks",      label: "Socks" },
  { id: "lace",       label: "Lace" },
  { id: "colorwork",  label: "Colorwork" },
  { id: "cables",     label: "Cables" },
  { id: "patternMod", label: "Pattern Modification" },
  { id: "yarnSub",    label: "Yarn Substitution" },
  { id: "repair",     label: "Repair/Rescue" },
  { id: "machine",    label: "Machine Knitting" },
] as const;
export type ExperienceAreaId = (typeof EXPERIENCE_AREAS)[number]["id"];

export const StepExperienceAreasSchema = z.object({
  areas: z.array(z.string()).min(1, "Select at least one area"),
});
export type StepExperienceAreasData = z.infer<typeof StepExperienceAreasSchema>;

// Step 3 — Experience Snapshot
export const StepExperienceSnapshotSchema = z.object({
  yearsKnitting: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be 0 or more")
    .max(80, "Max 80 years"),
  projectTypes: z
    .string()
    .min(10, "At least 10 characters")
    .max(200, "Max 200 characters"),
  helpContext: z
    .string()
    .min(20, "At least 20 characters")
    .max(300, "Max 300 characters"),
});
export type StepExperienceSnapshotData = z.infer<typeof StepExperienceSnapshotSchema>;

// Step 4 — Sample Work (file objects held client-side; captions validated here)
export const SampleCaptionSchema = z
  .string()
  .min(20, "At least 20 characters")
  .max(500, "Max 500 characters");

export type SampleImageData = {
  file: File;
  previewUrl: string;
  caption: string;
};

// Step 5 — Scenario Responses
export const StepScenariosSchema = z.object({
  scenarioOne:   z.string().min(50, "At least 50 characters").max(500, "Max 500 characters"),
  scenarioTwo:   z.string().min(50, "At least 50 characters").max(500, "Max 500 characters"),
  scenarioThree: z.string().min(50, "At least 50 characters").max(500, "Max 500 characters"),
});
export type StepScenariosData = z.infer<typeof StepScenariosSchema>;

// Step 6 — Availability
export const WEEKLY_HOURS_OPTIONS = ["5–10", "10–15", "15–20", "20+"] as const;
export type WeeklyHoursOption = (typeof WEEKLY_HOURS_OPTIONS)[number];

export const StepAvailabilitySchema = z
  .object({
    availabilityType: z.enum(["async", "both"], {
      error: "Select an option",
    }),
    weeklyHours: z.enum(WEEKLY_HOURS_OPTIONS).optional(),
  })
  .refine(
    (d) => d.availabilityType !== "both" || !!d.weeklyHours,
    { message: "Select your weekly availability", path: ["weeklyHours"] }
  );
export type StepAvailabilityData = z.infer<typeof StepAvailabilitySchema>;

// Step 7 — Agreements
export const StepAgreementsSchema = z.object({
  agreeStandards:      z.literal(true),
  agreePaidWork:       z.literal(true),
  agreeAgreement:      z.literal(true),
  agreeNoSolicitation: z.literal(true),
  agreeSampleOwnership: z.literal(true),
});
export type StepAgreementsData = z.infer<typeof StepAgreementsSchema>;

// Combined form data held by ApplicationForm
export type ApplicationFormData = {
  identity:           Partial<StepIdentityData>;
  experienceAreas:    Partial<StepExperienceAreasData>;
  experienceSnapshot: Partial<StepExperienceSnapshotData>;
  sampleWork:         SampleImageData[];
  scenarios:          Partial<StepScenariosData>;
  availability:       Partial<StepAvailabilityData>;
  agreements:         Partial<Record<keyof StepAgreementsData, boolean>>;
};
