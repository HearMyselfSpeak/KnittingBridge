import { ApplicationForm } from "@/components/GuideApplication/ApplicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to become a Guide — KnittingBridge",
  description:
    "Share your knitting expertise and get paid to help Makers who are stuck.",
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto mb-10 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
          Become a Guide
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-sm mx-auto">
          Share your expertise. Get paid. Help knitters who need it most.
        </p>
      </div>
      <ApplicationForm />
    </main>
  );
}
