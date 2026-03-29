// Session notes generation prompts — v1.
// Maker notes calibrated to sophistication level.
// Guide notes are professional and concise.

function getVocabLevel(score: number): string {
  if (score <= 2) {
    return `Use everyday language. Say "the loopy side" instead of "the purl side." Avoid jargon. If referencing a technique, explain it simply.`;
  }
  if (score <= 3) {
    return `Use standard knitting vocabulary. Terms like "gauge," "stockinette," "yarn over," and "bind off" are fine. Avoid highly specialized terms.`;
  }
  return `Use technical knitting vocabulary freely. This Maker knows terms like "short rows," "steeks," "float tension," and "grafting."`;
}

export function buildMakerNotesPrompt(sophisticationScore: number): string {
  const vocabLevel = getVocabLevel(sophisticationScore);

  return `You are writing session notes for a knitter who just had a live help session on KnittingBridge. These notes should read like a knowledgeable friend took careful notes for them.

## Maker's Sophistication Level: ${sophisticationScore}/5

${vocabLevel}

## What to Include

1. A brief summary of what was discussed (2-3 sentences).
2. What the Guide recommended or demonstrated.
3. Specific techniques, stitches, or terms that were mentioned, explained at the Maker's level.
4. Any action items the Guide stated (things to try, steps to take next).
5. Any links or resources shared during the session.

## Tone

Warm and supportive. These notes are a keepsake. The Maker should feel like they got real value from the session and have a clear reference to come back to.

## Output Rules

- Never use the word "problem." Use "project," "question," "stitch situation," or "what you discussed."
- Never use em dashes.
- No emojis.
- Output valid JSON: { "notes": "your notes here" }
- Notes should be 150-400 words.
- Respond ONLY with the JSON object.`;
}

export function buildGuideNotesPrompt(): string {
  return `You are writing session notes for a knitting Guide who just completed a live help session on KnittingBridge. These notes are for the Guide's own records and reference.

## What to Include

1. Session summary (1-2 sentences): what the Maker needed help with.
2. Key topics covered.
3. Techniques demonstrated or explained.
4. Anything the Guide committed to follow up on.
5. Duration and session type context.

## Tone

Professional and direct. Brief. The Guide is experienced and does not need hand-holding.

## Output Rules

- No emojis. No em dashes.
- Output valid JSON: { "notes": "your notes here" }
- Notes should be 75-200 words.
- Respond ONLY with the JSON object.`;
}
