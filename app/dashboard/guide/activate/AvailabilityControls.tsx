"use client";

type Mode = "scheduled" | "impulse" | null;

export function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  return (
    <section>
      <SectionHeading>Your timezone</SectionHeading>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border rounded-md px-3 py-2 text-sm
                   bg-background text-foreground max-w-xs w-full"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </section>
  );
}

export function ModeSelector({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const base =
    "flex-1 rounded-md border p-4 text-left cursor-pointer transition-colors";
  const active = "border-primary bg-primary/5";
  const inactive = "border-border hover:border-primary/40";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        className={`${base} ${mode === "scheduled" ? active : inactive}`}
        onClick={() => onChange("scheduled")}
      >
        <p className="font-medium text-foreground mb-1">
          I have regular hours
        </p>
        <p className="text-muted-foreground text-xs">
          Set a weekly schedule so Makers can book during your available times. You can always go online for extra sessions anytime.
        </p>
      </button>
      <button
        className={`${base} ${mode === "impulse" ? active : inactive}`}
        onClick={() => onChange("impulse")}
      >
        <p className="font-medium text-foreground mb-1">
          Just the online toggle
        </p>
        <p className="text-muted-foreground text-xs">
          No fixed schedule. Go online from your dashboard whenever you want to pick up sessions.
        </p>
      </button>
    </div>
  );
}

export function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className="text-lg font-semibold text-primary mb-3"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </h2>
  );
}

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Rome",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];
