"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  EXPERIENCE_AREAS,
  type ApplicationFormData,
  type StepAgreementsData,
  type StepScenariosData,
} from "@/lib/guide-application-schema";

const lk = "underline text-primary hover:text-primary/70 transition-colors";

const AGREEMENTS: { key: keyof StepAgreementsData; label: ReactNode }[] = [
  {
    key: "agreeStandards",
    label: <>I understand and agree to the{" "}
      <Link href="/guides/standards" target="_blank" rel="noopener noreferrer" className={lk}>KnittingBridge Guide Standards</Link>.</>,
  },
  {
    key: "agreePaidWork",
    label: "I confirm this is paid, scoped work and I am available to deliver professional service.",
  },
  {
    key: "agreeAgreement",
    label: <>I have read and understood the{" "}
      <Link href="/legal/guide-agreement" target="_blank" rel="noopener noreferrer" className={lk}>Guide Agreement</Link>
      {" "}and{" "}
      <Link href="/guides/compensation" target="_blank" rel="noopener noreferrer" className={lk}>compensation structure</Link>.</>,
  },
  {
    key: "agreeNoSolicitation",
    label: "I acknowledge that I will not solicit Makers off-platform or circumvent the Marketplace.",
  },
  {
    key: "agreeSampleOwnership",
    label: "I certify that the sample work submitted is my own, or I have explicit permission to share it.",
  },
];

const AVAILABILITY_LABELS: Record<string, string> = {
  async: "Messaging only (no video calls)",
  both:  "Messaging and video calls",
};

const SCENARIO_ENTRIES: { key: keyof StepScenariosData; prompt: string }[] = [
  { key: "scenarioOne",   prompt: "A Maker says \"I think I ruined this.\" What do you say first?" },
  { key: "scenarioTwo",   prompt: "When do you recommend starting over instead of fixing?" },
  { key: "scenarioThree", prompt: "How do you explain a tension issue?" },
];

interface Props {
  data: ApplicationFormData;
  agreements: Partial<Record<keyof StepAgreementsData, boolean>>;
  onAgreementsChange: (d: Partial<Record<keyof StepAgreementsData, boolean>>) => void;
  onEdit: (step: number) => void;
  stepErrors: Record<number, Record<string, string>>;
}

function Section({ title, step, onEdit, hasErrors, children }: {
  title: string; step: number; onEdit: (n: number) => void; hasErrors: boolean; children: ReactNode;
}) {
  return (
    <div className="space-y-2 py-4 border-b border-border last:border-0">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <button type="button" onClick={() => onEdit(step)}
          className="text-xs font-medium text-primary hover:underline">Edit</button>
      </div>
      {hasErrors && (
        <p className="text-xs text-destructive">
          This section has incomplete information. Please edit and complete it before submitting.
        </p>
      )}
      <div className="space-y-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export function StepReview({ data, agreements, onAgreementsChange, onEdit, stepErrors }: Props) {
  const { identity, experienceAreas, experienceSnapshot, sampleWork, scenarios, availability } = data;

  const areaLabels = (experienceAreas.areas ?? [])
    .map((id) => EXPERIENCE_AREAS.find((a) => a.id === id)?.label ?? id)
    .join(", ");

  return (
    <div className="space-y-1">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Review your application</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your answers before submitting. Use Edit to update any section.
        </p>
      </div>

      <div className="mt-4">
        <Section title="Identity" step={1} onEdit={onEdit} hasErrors={Object.keys(stepErrors[1] ?? {}).length > 0}>
          {identity.fullName  && <p><span className="text-muted-foreground">Name: </span>{identity.fullName}</p>}
          {identity.email     && <p><span className="text-muted-foreground">Email: </span>{identity.email}</p>}
          {identity.location  && <p><span className="text-muted-foreground">Location: </span>{identity.location}</p>}
          {identity.timezone  && <p><span className="text-muted-foreground">Timezone: </span>{identity.timezone}</p>}
        </Section>

        <Section title="Skills" step={2} onEdit={onEdit} hasErrors={Object.keys(stepErrors[2] ?? {}).length > 0}>
          {areaLabels ? <p>{areaLabels}</p> : <p className="text-muted-foreground">No areas selected.</p>}
        </Section>

        <Section title="Experience" step={3} onEdit={onEdit} hasErrors={Object.keys(stepErrors[3] ?? {}).length > 0}>
          {experienceSnapshot.yearsKnitting !== undefined && (
            <p><span className="text-muted-foreground">Years knitting: </span>{experienceSnapshot.yearsKnitting}</p>
          )}
          {experienceSnapshot.projectTypes && (
            <p><span className="text-muted-foreground">Projects: </span>{experienceSnapshot.projectTypes}</p>
          )}
          {(experienceSnapshot.helpContext ?? []).length > 0 && (
            <p><span className="text-muted-foreground">Where you help: </span>{(experienceSnapshot.helpContext ?? []).join(", ")}</p>
          )}
        </Section>

        <Section title="Sample Work" step={4} onEdit={onEdit} hasErrors={Object.keys(stepErrors[4] ?? {}).length > 0}>
          {sampleWork.length === 0 ? <p className="text-muted-foreground">No photos added.</p> : (
            <div className="grid grid-cols-2 gap-3 mt-1">
              {sampleWork.map((img, i) => (
                <div key={i} className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.previewUrl} alt={img.caption || `Sample ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-md border border-border" />
                  <p className="text-xs text-muted-foreground line-clamp-2">{img.caption}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Scenarios" step={5} onEdit={onEdit} hasErrors={Object.keys(stepErrors[5] ?? {}).length > 0}>
          <div className="space-y-3">
            {SCENARIO_ENTRIES.map(({ key, prompt }) => (
              <div key={key} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{prompt}</p>
                {scenarios[key]
                  ? <p>{scenarios[key]}</p>
                  : <p className="italic text-muted-foreground">No response entered.</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Availability" step={6} onEdit={onEdit} hasErrors={Object.keys(stepErrors[6] ?? {}).length > 0}>
          {availability.availabilityType && (
            <p><span className="text-muted-foreground">Session type: </span>
              {AVAILABILITY_LABELS[availability.availabilityType]}</p>
          )}
          {availability.availabilityType === "both" && availability.weeklyHours && (
            <p><span className="text-muted-foreground">Weekly hours: </span>{availability.weeklyHours}</p>
          )}
        </Section>
      </div>

      <div className="space-y-4 pt-6 border-t border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Before you submit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Please read and acknowledge each item.</p>
        </div>
        <div className="space-y-3">
          {AGREEMENTS.map(({ key, label }) => {
            const checked = !!agreements[key];
            return (
              <label key={key}
                className={["flex gap-3 items-start p-4 rounded-lg border cursor-pointer transition-colors",
                  checked ? "border-primary/30 bg-primary/5" : "border-border"].join(" ")}>
                <input type="checkbox" checked={checked}
                  onChange={() => onAgreementsChange({ ...agreements, [key]: !checked })}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer flex-shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
