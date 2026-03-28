// Maker-facing cancellation copy.
// No logic here, just string functions. No em dashes. No emojis.
// Never use the word "problem."

export function makerCancelledFullRefund(): string {
  return "You cancelled your session and a full refund has been applied to your card. We know plans change and we are glad you let us know early.";
}

export function makerCancelledNoRefund(): string {
  return "You cancelled your session. Sessions cancelled with less than 24 hours notice are not eligible for a refund. The full session fee goes to the Guide who reserved time for you. You are important to us and we hope to see you again soon.";
}

export function guideNoShowMakerMessage(): string {
  return "It looks like your Guide has not joined yet. We are looking into this and will follow up with you shortly.";
}

export function guideCancelledMakerEmail(): string {
  return "Your Guide had to cancel your session. A full refund has been applied to your card. You are important to us and we hope to connect you with a Guide again soon.";
}
