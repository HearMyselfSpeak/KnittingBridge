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

export const TIME_BLOCKS = [
  { id: "morning", label: "Morning (8 am - 12 pm)" },
  { id: "afternoon", label: "Afternoon (12 pm - 5 pm)" },
  { id: "evening", label: "Evening (5 pm - 9 pm)" },
] as const;

export const SESSION_LENGTHS = [
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
] as const;

export type DayName = (typeof DAYS)[number];
export type BlockId = (typeof TIME_BLOCKS)[number]["id"];

const BLOCK_IDS: readonly string[] = TIME_BLOCKS.map((b) => b.id);

export function filterBlocks(
  raw: Record<string, string[]> | null
): Record<string, BlockId[]> {
  if (!raw) return {};
  const out: Record<string, BlockId[]> = {};
  for (const [day, ids] of Object.entries(raw)) {
    out[day] = ids.filter((id): id is BlockId => BLOCK_IDS.includes(id));
  }
  return out;
}

export default function DayBlockRow({
  day,
  selected,
  onToggle,
}: {
  day: string;
  selected: BlockId[];
  onToggle: (blockId: BlockId) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-foreground font-medium shrink-0">{day}</span>
      <div className="flex flex-wrap gap-2">
        {TIME_BLOCKS.map((block) => (
          <button
            key={block.id}
            onClick={() => onToggle(block.id)}
            className={`px-3 py-1.5 rounded-md border text-xs transition-colors ${
              selected.includes(block.id)
                ? "bg-accent/10 text-accent border-accent/40"
                : "bg-background text-muted-foreground border-border hover:border-accent/30"
            }`}
          >
            {block.label}
          </button>
        ))}
      </div>
    </div>
  );
}
