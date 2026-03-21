import { z } from "zod";

// Step 1 — Identity
// z.string({ error }) sets the message when the value is undefined/non-string (Zod v4).
// .min(1, ...) sets the message when the value is an empty string.
export const StepIdentitySchema = z.object({
  fullName: z
    .string({ error: "Please enter your full name" })
    .min(1, "Please enter your full name")
    .max(100, "Name must be 100 characters or fewer")
    .refine(
      (val) => {
        const parts = val.trim().split(/\s+/);
        return parts.length >= 2 && parts[parts.length - 1].length >= 2;
      },
      "Please enter your first and last name (last name must be at least 2 characters)"
    ),
  email: z
    .string({ error: "Please enter a valid email address" })
    .email("Please enter a valid email address"),
  location: z
    .string({ error: "Please enter your city or region" })
    .min(1, "Please enter your city or region")
    .max(100, "City or region must be 100 characters or fewer"),
  timezone: z
    .string({ error: "Please select a timezone" })
    .min(1, "Please select a timezone"),
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
  areas: z
    .array(z.string(), { error: "Please select at least one area" })
    .min(1, "Please select at least one area"),
});
export type StepExperienceAreasData = z.infer<typeof StepExperienceAreasSchema>;

// Step 3 — Experience Snapshot
export const StepExperienceSnapshotSchema = z.object({
  yearsKnitting: z
    .number({ error: "Please enter your years of knitting experience" })
    .int("Please enter a whole number")
    .min(0, "Please enter a number between 0 and 80")
    .max(80, "Please enter a number between 0 and 80"),
  projectTypes: z
    .string({ error: "Please enter at least 10 characters" })
    .min(10, "Please enter at least 10 characters")
    .max(200, "Please keep this to 200 characters or fewer"),
  helpContext: z
    .array(z.string(), { error: "Please select at least one" })
    .min(1, "Please select at least one"),
});
export type StepExperienceSnapshotData = z.infer<typeof StepExperienceSnapshotSchema>;

// Step 4 — Sample Work (file objects held client-side; captions validated here)
export const SampleCaptionSchema = z
  .string({ error: "Please add a description for this image (at least 20 characters)" })
  .min(20, "Please add a description for this image (at least 20 characters)")
  .max(500, "Please keep your description to 500 characters or fewer");

export type SampleImageData = {
  file: File;
  previewUrl: string;
  caption: string;
};

// Step 5 — Scenario Responses
const scenarioField = z
  .string({ error: "Please enter a response (at least 50 characters)" })
  .min(50, "Please enter at least 50 characters")
  .max(500, "Please keep your response to 500 characters or fewer");

export const StepScenariosSchema = z.object({
  scenarioOne:   scenarioField,
  scenarioTwo:   scenarioField,
  scenarioThree: scenarioField,
});
export type StepScenariosData = z.infer<typeof StepScenariosSchema>;

// Step 6 — Availability
export const WEEKLY_HOURS_OPTIONS = ["5–10", "10–15", "15–20", "20+"] as const;
export type WeeklyHoursOption = (typeof WEEKLY_HOURS_OPTIONS)[number];

export const StepAvailabilitySchema = z
  .object({
    availabilityType: z.enum(["async", "both"], {
      error: "Please select an availability option",
    }),
    weeklyHours: z.enum(WEEKLY_HOURS_OPTIONS).optional(),
  })
  .refine(
    (d) => d.availabilityType !== "both" || !!d.weeklyHours,
    { message: "Please select your weekly availability", path: ["weeklyHours"] }
  );
export type StepAvailabilityData = z.infer<typeof StepAvailabilitySchema>;

// Step 7 — Agreements
export const StepAgreementsSchema = z.object({
  agreeStandards:       z.literal(true),
  agreePaidWork:        z.literal(true),
  agreeAgreement:       z.literal(true),
  agreeNoSolicitation:  z.literal(true),
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
