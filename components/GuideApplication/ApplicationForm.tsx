"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./ProgressBar";
import { StepIdentity } from "./StepIdentity";
import { StepExperienceAreas } from "./StepExperienceAreas";
import { StepExperienceSnapshot } from "./StepExperienceSnapshot";
import { StepSampleWork } from "./StepSampleWork";
import { StepScenarioResponses } from "./StepScenarioResponses";
import { StepAvailability } from "./StepAvailability";
import { StepAgreements } from "./StepAgreements";
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

const TOTAL_STEPS = 7;

const EMPTY: ApplicationFormData = {
  identity:           {},
  experienceAreas:    {},
  experienceSnapshot: {},
  sampleWork:         [],
  scenarios:          {},
  availability:       {},
  agreements:         {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectZodErrors(result: any, out: Record<string, string>) {
  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.error.issues ?? result.error.errors ?? []).forEach((e: any) => {
      const key = String(e.path[0] ?? "");
      if (key && !out[key]) out[key] = e.message;
    });
  }
}

function validateStep(step: number, data: ApplicationFormData): Record<string, string> {
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

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplicationFormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      data.sampleWork.forEach((img, i) => {
        fd.append(`image_${i}`, img.file, img.file.name);
        fd.append(`caption_${i}`, img.caption);
      });
      fd.append("payload", JSON.stringify({
        ...data.identity, ...data.experienceAreas, ...data.experienceSnapshot,
        imageCount: data.sampleWork.length, ...data.scenarios, ...data.availability,
      }));
      const res = await fetch("/api/guides/apply", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? "Submission failed. Please try again.");
      } else {
        router.push(`/guides/apply/confirmation?id=${json.profileId}&email=${encodeURIComponent(data.identity.email ?? "")}`);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Update data and immediately clear any errors that the new value resolves.
  // Never adds new errors on change — only removes resolved ones.
  function handleChange(newData: ApplicationFormData) {
    setData(newData);
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const stillFailing = validateStep(step, newData);
      const next: Record<string, string> = {};
      for (const key of Object.keys(prev)) {
        if (stillFailing[key]) next[key] = prev[key];
      }
      return next;
    });
  }

  function handleNext() {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else handleSubmit();
  }

  function handleBack() { setErrors({}); setStep((s) => Math.max(1, s - 1)); }

  return (
    <div className="w-full max-w-xl mx-auto">
      <ProgressBar current={step} />
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        {step === 1 && <StepIdentity data={data.identity} onChange={(d) => handleChange({ ...data, identity: d })} errors={errors} />}
        {step === 2 && <StepExperienceAreas data={data.experienceAreas} onChange={(d) => handleChange({ ...data, experienceAreas: d })} errors={errors} />}
        {step === 3 && <StepExperienceSnapshot data={data.experienceSnapshot} onChange={(d) => handleChange({ ...data, experienceSnapshot: d })} errors={errors} />}
        {step === 4 && <StepSampleWork images={data.sampleWork} onChange={(imgs) => handleChange({ ...data, sampleWork: imgs })} errors={errors} />}
        {step === 5 && <StepScenarioResponses data={data.scenarios} onChange={(d) => handleChange({ ...data, scenarios: d })} errors={errors} />}
        {step === 6 && <StepAvailability data={data.availability} onChange={(d) => handleChange({ ...data, availability: d })} errors={errors} />}
        {step === 7 && <StepAgreements data={data.agreements} onChange={(d) => handleChange({ ...data, agreements: d })} errors={errors} />}

        <div className="mt-8 pt-6 border-t border-border space-y-3">
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          {step === 4 && Object.keys(errors).some((k) => k.startsWith("caption_")) && (
            <p className="text-sm text-destructive">
              Please complete the description for each image before continuing.
            </p>
          )}
          <div className="flex justify-between items-center">
            <button type="button" onClick={handleBack} disabled={step === 1 || submitting}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 disabled:pointer-events-none transition-colors">
              Back
            </button>
            <button type="button" onClick={handleNext} disabled={submitting}
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-75 transition-colors">
              {submitting ? "Submitting..." : step === TOTAL_STEPS ? "Submit application" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
