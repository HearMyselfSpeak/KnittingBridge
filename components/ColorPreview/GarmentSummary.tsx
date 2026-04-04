"use client";

import type { GarmentAnalysisResult, GarmentRegion } from "@/lib/types";

interface Props {
  analysis: GarmentAnalysisResult;
}

function ColorSwatch({ hex }: { hex?: string }) {
  if (!hex) return null;
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm border border-black/10 shrink-0"
      style={{ backgroundColor: hex }}
    />
  );
}

function RegionRow({ region }: { region: GarmentRegion }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <ColorSwatch hex={region.hex} />
      <div className="min-w-0">
        <span className="text-sm font-medium text-foreground">{region.label}</span>
        <span className="text-sm text-muted-foreground">
          {": "}{region.originalColorDescription}
        </span>
      </div>
    </div>
  );
}

export function GarmentSummary({ analysis }: Props) {
  return (
    <div className="space-y-3">
      <div className="divide-y divide-border">
        {analysis.regions.map((r) => (
          <RegionRow key={r.id} region={r} />
        ))}
      </div>

      {analysis.linkedRegions.length > 0 && (
        <div className="pt-1">
          {analysis.linkedRegions.map((group, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">
              Shared yarn: {group.yarnDescription}
              {" ("}
              {group.regionIds.join(", ")}
              {")"}
            </p>
          ))}
        </div>
      )}

      {analysis.ambiguities.length > 0 && (
        <div className="rounded-md border border-border bg-secondary/40 px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            Needs clarification
          </p>
          <ul className="space-y-1">
            {analysis.ambiguities.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {": "}{a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.colorworkType !== "none" && (
        <p className="text-xs text-muted-foreground">
          Pattern type detected:{" "}
          <span className="font-medium text-foreground">
            {analysis.colorworkType}
          </span>
        </p>
      )}
    </div>
  );
}
