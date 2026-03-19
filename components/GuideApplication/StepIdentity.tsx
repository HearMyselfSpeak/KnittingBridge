"use client";

import type { StepIdentityData } from "@/lib/guide-application-schema";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Athens",
  "Europe/Moscow",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Africa/Johannesburg",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

interface Props {
  data: Partial<StepIdentityData>;
  onChange: (data: Partial<StepIdentityData>) => void;
  errors: Record<string, string>;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function StepIdentity({ data, onChange, errors }: Props) {
  function set(key: keyof StepIdentityData, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">About you</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic contact information. This is never shown publicly.
        </p>
      </div>

      <Field label="Full name" error={errors.fullName}>
        <input
          type="text"
          value={data.fullName ?? ""}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Jane Smith"
          className={inputClass}
          maxLength={100}
          autoComplete="name"
        />
      </Field>

      <Field label="Email address" error={errors.email}>
        <input
          type="email"
          value={data.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@example.com"
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field label="City or region" error={errors.location}>
        <input
          type="text"
          value={data.location ?? ""}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Portland, OR"
          className={inputClass}
          maxLength={100}
        />
      </Field>

      <Field label="Timezone" error={errors.timezone}>
        <select
          value={data.timezone ?? ""}
          onChange={(e) => set("timezone", e.target.value)}
          className={inputClass}
        >
          <option value="">Select a timezone</option>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
