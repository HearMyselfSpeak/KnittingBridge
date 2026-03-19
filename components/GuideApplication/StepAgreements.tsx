"use client";

import type { StepAgreementsData } from "@/lib/guide-application-schema";

const AGREEMENTS: {
  key: keyof StepAgreementsData;
  text: string;
}[] = [
  {
    key: "agreeStandards",
    text: "I understand and agree to the KnittingBridge Guide Standards.",
  },
  {
    key: "agreePaidWork",
    text: "I confirm this is paid, scoped work and I am available to deliver professional service.",
  },
  {
    key: "agreeAgreement",
    text: "I have read and understood the Guide Agreement and compensation structure.",
  },
  {
    key: "agreeNoSolicitation",
    text: "I acknowledge that I will not solicit Makers off-platform or circumvent the Marketplace.",
  },
  {
    key: "agreeSampleOwnership",
    text: "I certify that the sample work submitted is my own, or I have explicit permission to share it.",
  },
];

interface Props {
  data: Partial<Record<keyof StepAgreementsData, boolean>>;
  onChange: (data: Partial<Record<keyof StepAgreementsData, boolean>>) => void;
  errors: Record<string, string>;
}

export function StepAgreements({ data, onChange, errors }: Props) {
  function toggle(key: keyof StepAgreementsData) {
    onChange({ ...data, [key]: !data[key] });
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Agreements</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please read and acknowledge each item below.
        </p>
      </div>

      <div className="space-y-3">
        {AGREEMENTS.map(({ key, text }) => {
          const checked = !!data[key];
          const hasError = !!errors[key];
          return (
            <label
              key={key}
              className={[
                "flex gap-3 items-start p-4 rounded-lg border cursor-pointer transition-colors",
                checked ? "border-primary/30 bg-primary/5" : "border-border",
                hasError ? "border-destructive bg-destructive/5" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(key)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-foreground leading-relaxed">{text}</span>
            </label>
          );
        })}
      </div>

      {hasErrors && (
        <p className="text-sm text-destructive">
          Please acknowledge all items to continue.
        </p>
      )}
    </div>
  );
}
