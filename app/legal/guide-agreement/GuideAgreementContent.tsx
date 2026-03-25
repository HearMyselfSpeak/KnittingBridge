// Composes the full Guide Independent Contractor Agreement.
// Content is split across Part1 (sections 1–7) and Part2 (sections 8–13)
// to keep each file under 200 lines.

import GuideAgreementPart1 from "./GuideAgreementPart1";
import GuideAgreementPart2 from "./GuideAgreementPart2";

export default function GuideAgreementContent() {
  return (
    <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
      <GuideAgreementPart1 />
      <GuideAgreementPart2 />
    </div>
  );
}
