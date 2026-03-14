"use client";

import { KnittingWords } from "./KnittingWords";

export interface PreviewFrame {
  imageUrl: string;
  label: string;
}

interface Props {
  originalImageUrl: string | null;
  frames: PreviewFrame[];
  isLoading: boolean;
  regionLabels?: string[];
  selectedBaseline?: string | null;
  onBaselineSelect?: (imageUrl: string) => void;
}

// w-full fills the grid column; object-contain keeps aspect ratio intact
const THUMB = "w-full h-56 object-contain rounded-lg border border-border";
const THUMB_SEL = "w-full h-56 object-contain rounded-lg border border-border ring-2 ring-accent/80 ring-offset-1";

function labelToFilename(label: string): string {
  return (
    "knittingbridge-" +
    label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) +
    ".png"
  );
}

async function downloadFrame(imageUrl: string, label: string): Promise<void> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = labelToFilename(label);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

const DownloadIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 1v7M3 6l3 3 3-3" />
    <path d="M1 10h10" />
  </svg>
);

export function PreviewCanvas({ originalImageUrl, frames, isLoading, regionLabels, selectedBaseline, onBaselineSelect }: Props) {
  // Standalone block: first generation, nothing anchored yet
  if (isLoading && !originalImageUrl && frames.length === 0) {
    return (
      <div className="aspect-square w-full max-w-lg mx-auto rounded-lg border border-border bg-secondary/40 flex items-center justify-center">
        <KnittingWords size="lg" regionLabels={regionLabels} />
      </div>
    );
  }

  if (!originalImageUrl && frames.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Three-column wrapping grid — fourth frame wraps to a new row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Original — always first cell */}
        {originalImageUrl && (
          <div
            className="flex flex-col gap-1.5 cursor-pointer"
            onClick={() => onBaselineSelect?.(originalImageUrl)}
          >
            <img
              src={originalImageUrl}
              alt="Original garment"
              className={selectedBaseline === originalImageUrl ? THUMB_SEL : THUMB}
            />
            <p className="text-xs text-muted-foreground text-center">Original</p>
            {selectedBaseline === originalImageUrl && (
              <p className="text-xs text-accent text-center -mt-0.5">Refining from this</p>
            )}
          </div>
        )}

        {/* Generated frames in order */}
        {frames.map((frame, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 cursor-pointer"
            onClick={() => onBaselineSelect?.(frame.imageUrl)}
          >
            <img
              src={frame.imageUrl}
              alt={frame.label}
              className={selectedBaseline === frame.imageUrl ? THUMB_SEL : THUMB}
            />
            <div className="flex items-start gap-1.5">
              <p className="text-xs text-muted-foreground flex-1 text-center leading-snug">
                {frame.label}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); void downloadFrame(frame.imageUrl, frame.label); }}
                title="Download this preview"
                className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <DownloadIcon />
              </button>
            </div>
            {selectedBaseline === frame.imageUrl && (
              <p className="text-xs text-accent text-center -mt-0.5">Refining from this</p>
            )}
          </div>
        ))}

        {/* Loading placeholder — occupies the next grid cell */}
        {isLoading && (
          <div className="w-full h-56 rounded-lg border border-border bg-secondary/40 flex items-center justify-center">
            <KnittingWords size="sm" regionLabels={regionLabels} />
          </div>
        )}
      </div>

      {/* Footer: caption left, download all right */}
      <div className="flex items-center justify-between">
        {frames.length > 0 ? (
          <p className="text-xs text-muted-foreground">Only yarn colors were changed.</p>
        ) : (
          <span />
        )}
        {frames.length >= 2 && (
          <button
            onClick={() => {
              void (async () => {
                for (const frame of frames) {
                  await downloadFrame(frame.imageUrl, frame.label);
                }
              })();
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <DownloadIcon />
            Download all
          </button>
        )}
      </div>
    </div>
  );
}
