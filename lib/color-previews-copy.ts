// All user-facing Color Previews gating copy. No logic.
// No em dashes. No emojis. Never use "problem."

export function weekOneComplete(): string {
  return "To keep Color Previews free for everyone, we ask for a confirmed email starting your second week. It takes 30 seconds and helps us keep the lights on for the knitting community.";
}

export function recolorsExhaustedFree(daysUntilReset: number): string {
  return `You have used your free recolors for this week. We hope you love what you saw. Fresh recolors arrive in ${daysUntilReset} day${daysUntilReset === 1 ? "" : "s"}.`;
}

export function recolorsExhaustedPurchased(): string {
  return "You have used all your recolors.";
}

export function recolorsRemaining(count: number, tier: "free" | "purchased"): string {
  if (tier === "free") return `${count} recolor${count === 1 ? "" : "s"} remaining this week`;
  return `${count} recolor${count === 1 ? "" : "s"} remaining`;
}

export function projectLimitReached(): string {
  return "You have used your free project for this week. Come back next week or talk to a Guide about your project.";
}
