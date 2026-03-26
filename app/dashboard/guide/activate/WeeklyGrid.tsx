"use client";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];

// Hours from 8am to 9pm (last block is 9pm-10pm).
export const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

interface WeeklyGridProps {
  selected: Record<string, number[]>;
  onToggle: (day: DayName, hour: number) => void;
}

export default function WeeklyGrid({ selected, onToggle }: WeeklyGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs w-full">
        <thead>
          <tr>
            <th className="w-20" />
            {HOURS.map((h) => (
              <th
                key={h}
                className="px-0.5 py-1 font-medium text-muted-foreground text-center"
              >
                {formatHour(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => {
            const dayHours = selected[day] ?? [];
            return (
              <tr key={day}>
                <td className="pr-2 py-1 font-medium text-foreground text-right whitespace-nowrap text-xs">
                  {day.slice(0, 3)}
                </td>
                {HOURS.map((h) => {
                  const active = dayHours.includes(h);
                  return (
                    <td key={h} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => onToggle(day, h)}
                        aria-label={`${day} ${formatHour(h)}`}
                        className={`w-full aspect-square min-w-[24px] rounded-sm transition-colors ${
                          active
                            ? "bg-primary"
                            : "bg-muted hover:bg-primary/20"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
