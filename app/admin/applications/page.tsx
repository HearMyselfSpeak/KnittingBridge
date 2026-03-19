export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Applications — Admin — KnittingBridge" };

const TABS = [
  { label: "Pending",  value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Declined", value: "DECLINED" },
] as const;

const AREA_LABELS: Record<string, string> = {
  garments: "Garments", fitSizing: "Fit & Sizing", socks: "Socks",
  lace: "Lace", colorwork: "Colorwork", cables: "Cables",
  patternMod: "Pattern Mod", yarnSub: "Yarn Sub", repair: "Repair/Rescue",
  machine: "Machine",
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { tab = "PENDING" } = await searchParams;
  const status = (["PENDING", "APPROVED", "DECLINED"].includes(tab) ? tab : "PENDING") as
    "PENDING" | "APPROVED" | "DECLINED";

  const { prisma } = await import("@/lib/prisma");
  const profiles = await prisma.guideProfile.findMany({
    where: { status },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-10 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-foreground mb-6">
        Guide Applications
      </h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map(({ label, value }) => (
          <Link
            key={value}
            href={`?tab=${value}`}
            className={[
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              status === value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No {status.toLowerCase()} applications.
        </p>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => {
            const areas = Object.entries(AREA_LABELS)
              .filter(([k]) => (p as Record<string, unknown>)[k] === true)
              .map(([, v]) => v);
            return (
              <Link
                key={p.id}
                href={`/admin/applications/${p.id}`}
                className="block rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/40 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {p.user.name ?? "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.user.email}</p>
                    {p.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">{p.location}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {p.yearsExperience != null && (
                      <p className="text-sm text-muted-foreground">
                        {p.yearsExperience} yr{p.yearsExperience !== 1 ? "s" : ""}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {areas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {areas.map((a) => (
                      <span
                        key={a}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
