"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./ProgressBar";
import { StepIdentity } from "./StepIdentity";
import { StepExperienceAreas } from "./StepExperienceAreas";
import { StepExperienceSnapshot } from "./StepExperienceSnapshot";
import { StepSampleWork } from "./StepSampleWork";
import { StepScenarioResponses } from "./StepScenarioResponses";
import { StepAvailability } from "./StepAvailability";
import { StepReview } from "./StepReview";
import { StepAgreementsSchema, type ApplicationFormData } from "@/lib/guide-application-schema";
import { validateStep, buildSubmitError } from "@/lib/guide-application-validate";

const TOTAL_STEPS = 7;
const SESSION_KEY = "kb_guide_application";

const EMPTY: ApplicationFormData = {
  identity:           {},
  experienceAreas:    {},
  experienceSnapshot: {},
  sampleWork:         [],
  scenarios:          {},
  availability:       {},
  agreements:         {},
};

function stepFromUrl() {
  const s = parseInt(new URLSearchParams(window.location.search).get("step") ?? "1", 10);
  return s >= 1 && s <= TOTAL_STEPS ? s : 1;
}

function loadFromSession(): ApplicationFormData {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return { ...EMPTY, ...JSON.parse(saved), sampleWork: [], agreements: {} };
  } catch { /* ignore */ }
  return EMPTY;
}

function saveToSession(d: ApplicationFormData) {
  try {
    const { sampleWork: _s, agreements: _a, ...serializable } = d;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable));
  } catch { /* ignore */ }
}

const clearSession = () => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } };

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ApplicationFormData>(loadFromSession);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviewEditMode, setReviewEditMode] = useState(false);

  const navStep = (s: number) => { window.history.pushState({ step: s }, "", `?step=${s}`); setStep(s); };

  useEffect(() => {
    const s = stepFromUrl();
    setStep(s);
    window.history.replaceState({ step: s }, "", `?step=${s}`);
    const onPop = () => { setStep(stepFromUrl()); setReviewEditMode(false); setErrors({}); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
        console.error("[apply] submission failed", {
          status: res.status, error: json.error, issues: json.issues ?? [],
        });
        setSubmitError(buildSubmitError(json));
      } else {
        clearSession();
        router.push(
          `/guides/apply/confirmation?id=${json.profileId}&email=${encodeURIComponent(data.identity.email ?? "")}`
        );
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
    saveToSession(data);
    if (reviewEditMode) { setReviewEditMode(false); navStep(7); }
    else if (step < TOTAL_STEPS) { navStep(step + 1); }
    else { handleSubmit(); }
  }

  function handleBack() {
    setErrors({});
    if (reviewEditMode) { setReviewEditMode(false); navStep(7); }
    else { window.history.back(); }
  }

  function handleEdit(targetStep: number) {
    setErrors({});
    setReviewEditMode(true);
    navStep(targetStep);
  }

  const agreementsValid = StepAgreementsSchema.safeParse(data.agreements).success;

  const reviewStepErrors: Record<number, Record<string, string>> = step === 7
    ? { 1: validateStep(1, data), 2: validateStep(2, data), 3: validateStep(3, data), 4: validateStep(4, data), 5: validateStep(5, data), 6: validateStep(6, data) }
    : {};

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
        {step === 7 && (
          <StepReview
            data={data}
            agreements={data.agreements}
            onAgreementsChange={(d) => handleChange({ ...data, agreements: d })}
            onEdit={handleEdit}
            stepErrors={reviewStepErrors}
          />
        )}

        <div className="mt-8 pt-6 border-t border-border space-y-3">
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          {step === 3 && Object.keys(errors).length > 0 && (
            <p className="text-sm text-destructive">
              Please complete all fields above before continuing.
            </p>
          )}
          {step === 4 && Object.keys(errors).some((k) => k.startsWith("caption_")) && (
            <p className="text-sm text-destructive">
              Please complete the description for each image before continuing.
            </p>
          )}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || submitting}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 disabled:pointer-events-none transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting || (step === TOTAL_STEPS && !agreementsValid)}
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting..." : step === TOTAL_STEPS ? "Submit Application" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
