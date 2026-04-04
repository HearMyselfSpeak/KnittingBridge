// Centralized session pricing constants.
// All amounts in cents. No floats for money.

export const SESSION_PRICES: Record<string, number> = {
  "15": 3000, // $30 -- Quick Look
  "45": 6000, // $60 -- Deep Dive
};

export const SESSION_LABELS: Record<string, string> = {
  "15": "Quick Look (15 min)",
  "45": "Deep Dive (45 min)",
};

/** Resolve session price in cents. Falls back to 15-min price. */
export function getSessionPrice(sessionType: string): number {
  return SESSION_PRICES[sessionType] ?? SESSION_PRICES["15"];
}
