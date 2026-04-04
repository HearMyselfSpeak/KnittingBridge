"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration:
    "There is an issue with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification:
    "The sign-in link has expired or has already been used. Please request a new one.",
  Default: "An error occurred during sign-in. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-foreground mb-2">
        Sign-in failed
      </p>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      <Link
        href="/auth/signin"
        className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
      >
        Try again
      </Link>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-lg font-semibold text-primary"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            KnittingBridge
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <Suspense fallback={<div className="h-24" />}>
            <AuthErrorContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
