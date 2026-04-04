export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ReviewActions } from "@/components/Admin/ReviewActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Application Detail | Admin | KnittingBridge" };

const AREA_LABELS: Record<string, string> = {
  garments: "Garments", fitSizing: "Fit & Sizing", socks: "Socks",
  lace: "Lace", colorwork: "Colorwork", cables: "Cables",
  patternMod: "Pattern Modification", yarnSub: "Yarn Substitution",
  repair: "Repair/Rescue", machine: "Machine Knitting",
};

type ScenarioData = {
  q1?: string; q2?: string; q3?: string;
  projectTypes?: string; helpContext?: string[]; sampleCaptions?: string[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-lg font-semibold text-foreground border-b border-border pb-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground mt-0.5">{value ?? "-"}</p>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");

  const profile = await prisma.guideProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!profile) notFound();

  const areas = Object.entries(AREA_LABELS)
    .filter(([k]) => (profile as Record<string, unknown>)[k] === true)
    .map(([, v]) => v);

  const sc = (profile.scenarioResponses ?? {}) as ScenarioData;

  return (
    <main className="min-h-screen bg-background px-4 py-10 max-w-3xl mx-auto">
      <Link
        href="/admin/applications"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to applications
      </Link>

      <div className="mt-6 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {profile.user.name ?? "Unnamed applicant"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <ReviewActions profileId={profile.id} currentStatus={profile.status} />
      </div>

      <div className="mt-8 space-y-8">
        <Section title="Identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" value={profile.location} />
            <Field label="Timezone" value={profile.timezone?.replace(/_/g, " ")} />
          </div>
        </Section>

        <Section title="Experience Areas">
          {areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {a}
                </span>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">None listed.</p>}
        </Section>

        <Section title="Experience Snapshot">
          <Field label="Years knitting" value={profile.yearsExperience} />
          <Field label="Project types" value={sc.projectTypes} />
          <Field label="Where they help others" value={sc.helpContext?.join(", ")} />
        </Section>

        <Section title="Sample Work">
          {profile.sampleUrls.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {profile.sampleUrls.map((url, i) => (
                <div key={url} className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Sample ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-border" />
                  {sc.sampleCaptions?.[i] && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{sc.sampleCaptions[i]}</p>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No images submitted.</p>}
        </Section>

        <Section title="Scenario Responses">
          <Field label='"I think I ruined this." What do you say first?' value={sc.q1} />
          <Field label="When do you recommend starting over?" value={sc.q2} />
          <Field label="How do you explain a tension issue?" value={sc.q3} />
        </Section>

        <Section title="Availability">
          <Field label="Session type" value={profile.asyncOnly ? "Messaging only (no video calls)" : "Messaging and video calls"} />
          {!profile.asyncOnly && profile.weeklyHours != null && (
            <Field label="Weekly hours" value={`${profile.weeklyHours}+ hrs/week`} />
          )}
        </Section>
      </div>
    </main>
  );
}
