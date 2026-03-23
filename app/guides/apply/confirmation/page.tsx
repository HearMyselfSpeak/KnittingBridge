import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application submitted — KnittingBridge",
};

interface EmailDebug {
  keyPresent: boolean;
  emailFrom: string | undefined;
  error?: string;
}

interface Props {
  searchParams: Promise<{ id?: string; email?: string; debug?: string }>;
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { id, email, debug } = await searchParams;
  let emailDebug: EmailDebug | null = null;
  if (debug) {
    try { emailDebug = JSON.parse(decodeURIComponent(debug)); } catch { /* ignore */ }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 flex items-start justify-center">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Application submitted
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Thanks, we're grateful for your submission and will be back to you within 24 hours.
          </p>
        </div>

        {email && (
          <p className="text-sm text-muted-foreground">
            Confirmation sent to <span className="font-medium text-foreground">{email}</span>
          </p>
        )}

        {id && (
          <p className="text-xs text-muted-foreground font-mono">
            Application ID: {id}
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
        </div>

        {emailDebug && (
          <div className="mt-6 text-left border border-border rounded-md p-4 bg-secondary/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Email debug
            </p>
            <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">
              {JSON.stringify(emailDebug, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
