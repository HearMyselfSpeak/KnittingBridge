import type { Metadata } from "next";
import GuideAgreementContent from "./GuideAgreementContent";

export const metadata: Metadata = {
  title: "Guide Agreement | KnittingBridge",
};

export default function GuideAgreement() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Legal</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Guide Agreement
        </h1>
        <p className="text-sm text-muted-foreground">
          Independent Contractor Agreement. Effective date: January 1, 2025.
          Applies to all approved Guides.
        </p>
      </div>

      <GuideAgreementContent />
    </div>
  );
}
