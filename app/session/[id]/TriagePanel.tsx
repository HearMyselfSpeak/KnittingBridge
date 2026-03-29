"use client";

// Guide-only collapsible triage reference panel.
// Shows the AI triage summary and Maker photos from the request.

import { useState } from "react";

interface Props {
  triageSummary: string;
  imageUrls: string[];
  requestTitle: string;
}

export default function TriagePanel({ triageSummary, imageUrls, requestTitle }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-[#1B2A4A] hover:bg-gray-50"
      >
        <span>Triage Reference</span>
        <span className="text-xs text-gray-400">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">{requestTitle}</p>
          <p className="text-sm text-gray-700">{triageSummary}</p>

          {imageUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {imageUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={url}
                    alt={`Maker photo ${i + 1}`}
                    className="h-16 w-16 rounded object-cover border"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
