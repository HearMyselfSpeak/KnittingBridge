"use client";

import type { StepScenariosData } from "@/lib/guide-application-schema";

const SCENARIOS: {
  key: keyof StepScenariosData;
  prompt: string;
  hint: string;
}[] = [
  {
    key: "scenarioOne",
    prompt: "A Maker says \"I think I ruined this.\" What do you say first?",
    hint: "50–500 characters. Show how you respond with empathy and confidence.",
  },
  {
    key: "scenarioTwo",
    prompt: "When do you recommend starting over instead of fixing?",
    hint: "50–500 characters. Show your judgment and how you set realistic expectations.",
  },
  {
    key: "scenarioThree",
    prompt: "How do you explain a tension issue?",
    hint: "50–500 characters. Show how you communicate technical concepts clearly.",
  },
];

interface Props {
  data: Partial<StepScenariosData>;
  onChange: (data: Partial<StepScenariosData>) => void;
  errors: Record<string, string>;
}

const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function StepScenarioResponses({ data, onChange, errors }: Props) {
  function set(key: keyof StepScenariosData, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Scenario responses
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Three short questions. There are no right answers. We want to hear how you think.
        </p>
      </div>

      {SCENARIOS.map(({ key, prompt, hint }) => {
        const value = data[key] ?? "";
        const nearMax = value.length >= 450;
        return (
          <div key={key} className="space-y-2">
            <p className="text-sm font-medium text-foreground">{prompt}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            <textarea
              value={value}
              onChange={(e) => set(key, e.target.value)}
              maxLength={500}
              rows={4}
              className={textareaClass}
            />
            <div className="flex justify-between items-center">
              {errors[key] ? (
                <p className="text-xs text-destructive">{errors[key]}</p>
              ) : (
                <span />
              )}
              <span
                className={[
                  "text-xs tabular-nums",
                  nearMax ? "text-destructive" : "text-muted-foreground",
                ].join(" ")}
              >
                {value.length}/500
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
