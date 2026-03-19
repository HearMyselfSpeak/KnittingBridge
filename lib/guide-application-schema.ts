import { z } from "zod";

// Step 1 — Identity
export const StepIdentitySchema = z.object({
  fullName: z
    .string()
    .min(1, "We'd love to know your name")
    .max(100, "Please keep your name under 100 characters"),
  email: z
    .string()
    .email("Please share a valid email address so we can stay in touch"),
  location: z
    .string()
    .min(1, "Let us know where you're located")
    .max(100, "Please keep your location under 100 characters"),
  timezone: z
    .string()
    .min(1, "Please pick the timezone that fits you best"),
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
    .array(z.string())
    .min(1, "Please select at least one area you feel confident in"),
});
export type StepExperienceAreasData = z.infer<typeof StepExperienceAreasSchema>;

// Step 3 — Experience Snapshot
export const StepExperienceSnapshotSchema = z.object({
  yearsKnitting: z
    .number()
    .int("Please enter a whole number")
    .min(0, "Please enter a number between 0 and 80")
    .max(80, "Please enter a number between 0 and 80"),
  projectTypes: z
    .string()
    .min(10, "Tell us a little more about the projects you've completed")
    .max(200, "That's wonderfully detailed. Please keep it to 200 characters or less."),
  helpContext: z
    .string()
    .min(20, "We'd love a little more detail about where you help others")
    .max(300, "Please keep this to 300 characters or less"),
});
export type StepExperienceSnapshotData = z.infer<typeof StepExperienceSnapshotSchema>;

// Step 4 — Sample Work (file objects held client-side; captions validated here)
export const SampleCaptionSchema = z
  .string()
  .min(20, "Please tell us a little about this project. At least 20 characters.")
  .max(500, "Please keep your description to 500 characters or less");

export type SampleImageData = {
  file: File;
  previewUrl: string;
  caption: string;
};

// Step 5 — Scenario Responses
export const StepScenariosSchema = z.object({
  scenarioOne:   z.string().min(50, "Please share a bit more. At least 50 characters.").max(500, "Please keep your response to 500 characters or less"),
  scenarioTwo:   z.string().min(50, "Please share a bit more. At least 50 characters.").max(500, "Please keep your response to 500 characters or less"),
  scenarioThree: z.string().min(50, "Please share a bit more. At least 50 characters.").max(500, "Please keep your response to 500 characters or less"),
});
export type StepScenariosData = z.infer<typeof StepScenariosSchema>;

// Step 6 — Availability
export const WEEKLY_HOURS_OPTIONS = ["5–10", "10–15", "15–20", "20+"] as const;
export type WeeklyHoursOption = (typeof WEEKLY_HOURS_OPTIONS)[number];

export const StepAvailabilitySchema = z
  .object({
    availabilityType: z.enum(["async", "both"], {
      error: "Please let us know how you'd like to work with Makers",
    }),
    weeklyHours: z.enum(WEEKLY_HOURS_OPTIONS).optional(),
  })
  .refine(
    (d) => d.availabilityType !== "both" || !!d.weeklyHours,
    { message: "Please select how many hours per week you're available", path: ["weeklyHours"] }
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
