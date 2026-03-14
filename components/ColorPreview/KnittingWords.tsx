"use client";

import { useState, useEffect, useRef } from "react";

const WORDS = [
  "Cast On",
  "Gauge",
  "Knit",
  "Purl",
  "Yarn Over",
  "Increase",
  "Intarsia",
  "Fair Isle",
  "Bind Off",
  "Blocking",
];

const ENCOURAGEMENTS = [
  "Almost there",
  "Hang in there",
  "Worth the wait",
  "Looking good",
  "Patience pays off",
  "It's rocket science",
];

const FADE_MS = 400;
const HOLD_MS = 3000;
const PAUSE_MS = 1000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a mixed word list: knitting terms + region labels, with encouragements
 *  interleaved every 2 items — guarantees no two encouragements are adjacent. */
function buildWordList(regionLabels: string[]): string[] {
  const knitting = shuffle([...WORDS, ...regionLabels]);
  const enc = shuffle([...ENCOURAGEMENTS]);
  const result: string[] = [];
  let ei = 0;
  knitting.forEach((word, i) => {
    result.push(word);
    if ((i + 1) % 2 === 0 && ei < enc.length) result.push(enc[ei++]);
  });
  return result;
}

interface Props {
  /** "lg" for the full-height standalone block; "sm" for the row placeholder */
  size?: "lg" | "sm";
  /** Garment region labels to weave into the cycling word list */
  regionLabels?: string[];
}

export function KnittingWords({ size = "lg", regionLabels }: Props) {
  const wordListRef = useRef<string[] | null>(null);
  if (!wordListRef.current) {
    wordListRef.current = buildWordList(regionLabels ?? []);
  }

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let live = true;

    function wait(ms: number) {
      return new Promise<void>((res) => setTimeout(res, ms));
    }

    async function run() {
      while (live) {
        setVisible(true);
        await wait(FADE_MS + HOLD_MS);
        if (!live) break;
        setVisible(false);
        await wait(FADE_MS + PAUSE_MS);
        if (!live) break;
        setIndex((i) => (i + 1) % wordListRef.current!.length);
      }
    }

    void run();
    return () => {
      live = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const word = wordListRef.current[index];

  if (size === "sm") {
    return (
      <div className="flex flex-col items-center gap-1.5 px-3">
        <p
          className="transition-opacity text-sm text-foreground text-center leading-snug"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
            fontFamily: "var(--font-serif)",
          }}
        >
          {word}
        </p>
        <p className="text-xs text-muted-foreground">Generating...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="transition-opacity text-2xl font-medium text-foreground text-center"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
          fontFamily: "var(--font-serif)",
        }}
      >
        {word}
      </p>
      <p className="text-sm text-muted-foreground">Generating your preview...</p>
      <p className="text-xs text-muted-foreground/60 max-w-xs text-center">
        This takes about 15–30 seconds. The structure of the garment is preserved exactly.
      </p>
    </div>
  );
}
