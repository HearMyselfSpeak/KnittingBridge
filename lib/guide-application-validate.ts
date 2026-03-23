import {
  StepIdentitySchema,
  StepExperienceAreasSchema,
  StepExperienceSnapshotSchema,
  StepScenariosSchema,
  StepAvailabilitySchema,
  StepAgreementsSchema,
  SampleCaptionSchema,
  type ApplicationFormData,
} from "@/lib/guide-application-schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function collectZodErrors(result: any, out: Record<string, string>) {
  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.error.issues ?? result.error.errors ?? []).forEach((e: any) => {
      const key = String(e.path[0] ?? "");
      if (key && !out[key]) out[key] = e.message;
    });
  }
}

export function validateStep(
  step: number,
  data: ApplicationFormData
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 1) collectZodErrors(StepIdentitySchema.safeParse(data.identity), errors);
  if (step === 2) collectZodErrors(StepExperienceAreasSchema.safeParse(data.experienceAreas), errors);
  if (step === 3) collectZodErrors(StepExperienceSnapshotSchema.safeParse(data.experienceSnapshot), errors);
  if (step === 4) {
    if (data.sampleWork.length < 1) errors.images = "Please add at least one photo.";
    data.sampleWork.forEach((img, i) => {
      const r = SampleCaptionSchema.safeParse(img.caption);
      if (!r.success) errors[`caption_${i}`] = r.error.issues[0].message;
    });
  }
  if (step === 5) collectZodErrors(StepScenariosSchema.safeParse(data.scenarios), errors);
  if (step === 6) collectZodErrors(StepAvailabilitySchema.safeParse(data.availability), errors);
  if (step === 7) collectZodErrors(StepAgreementsSchema.safeParse(data.agreements), errors);
  return errors;
}

export const FIELD_LABELS: Record<string, string> = {
  fullName:         "Full name",
  email:            "Email address",
  location:         "Location",
  timezone:         "Timezone",
  areas:            "Experience areas",
  yearsKnitting:    "Years of knitting experience",
  projectTypes:     "Project types",
  helpContext:      "Where you help others",
  imageCount:       "Sample photos",
  scenarioOne:      "Scenario response 1",
  scenarioTwo:      "Scenario response 2",
  scenarioThree:    "Scenario response 3",
  availabilityType: "Availability",
  weeklyHours:      "Weekly hours",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSubmitError(json: any): string {
  const issues: { path: (string | number)[]; message: string }[] = json.issues ?? [];
  if (issues.length === 0) return json.error ?? "Submission failed. Please try again.";
  const fields = [
    ...new Set(
      issues
        .map((i) => String(i.path[0] ?? ""))
        .filter(Boolean)
        .map((f) => FIELD_LABELS[f] ?? f)
    ),
  ];
  if (fields.length === 0) return issues[0].message ?? "Submission failed. Please try again.";
  return `Please go back and review: ${fields.join(", ")}.`;
}
