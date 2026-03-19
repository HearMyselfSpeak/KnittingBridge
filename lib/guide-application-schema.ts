import { z } from "zod";

// Step 1 — Identity
// z.string({ error }) sets the message when the value is undefined/non-string (Zod v4).
// .min(1, ...) sets the message when the value is an empty string.
export const StepIdentitySchema = z.object({
  fullName: z
    .string({ error: "We'd love to know your name" })
    .min(1, "We'd love to know your name")
    .max(100, "Please keep your name under 100 characters"),
  email: z
    .string({ error: "Please share a valid email address so we can stay in touch" })
    .email("Please share a valid email address so we can stay in touch"),
  location: z
    .string({ error: "Let us know where you're located" })
    .min(1, "Let us know where you're located")
    .max(100, "Please keep your location under 100 characters"),
  timezone: z
    .string({ error: "Please pick the timezone that fits you best" })
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
    .array(z.string(), { error: "Please select at least one area you feel confident in" })
    .min(1, "Please select at least one area you feel confident in"),
});
export type StepExperienceAreasData = z.infer<typeof StepExperienceAreasSchema>;

// Step 3 — Experience Snapshot
export const StepExperienceSnapshotSchema = z.object({
  yearsKnitting: z
    .number({ error: "Please let us know how many years you've been knitting" })
    .int("Please enter a whole number")
    .min(0, "Please enter a number between 0 and 80")
    .max(80, "Please enter a number between 0 and 80"),
  projectTypes: z
    .string({ error: "Tell us a little more about the projects you've completed" })
    .min(10, "Tell us a little more about the projects you've completed")
    .max(200, "That's wonderfully detailed. Please keep it to 200 characters or less."),
  helpContext: z
    .string({ error: "We'd love a little more detail about where you help others" })
    .min(20, "We'd love a little more detail about where you help others")
    .max(300, "Please keep this to 300 characters or less"),
});
export type StepExperienceSnapshotData = z.infer<typeof StepExperienceSnapshotSchema>;

// Step 4 — Sample Work (file objects held client-side; captions validated here)
export const SampleCaptionSchema = z
  .string({ error: "Please tell us a little about this project. At least 20 characters." })
  .min(20, "Please tell us a little about this project. At least 20 characters.")
  .max(500, "Please keep your description to 500 characters or less");

export type SampleImageData = {
  file: File;
  previewUrl: string;
  caption: string;
};

// Step 5 — Scenario Responses
const scenarioField = z
  .string({ error: "Please share a bit more. At least 50 characters." })
  .min(50, "Please share a bit more. At least 50 characters.")
  .max(500, "Please keep your response to 500 characters or less");

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
