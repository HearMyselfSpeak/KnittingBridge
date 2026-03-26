// Activation gate layout for Guide-facing routes.
// All pages inside app/dashboard/guide/(activated)/ are protected:
// approved-but-not-activated Guides are redirected to /dashboard/guide/activate.
//
// The activate/ route lives OUTSIDE this route group and is never blocked.

import { requireActivatedGuide } from "@/lib/guide-gate";

export default async function ActivatedGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireActivatedGuide();
  return <>{children}</>;
}
