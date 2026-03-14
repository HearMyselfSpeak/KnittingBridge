"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // next-auth resolves relative /api/auth/* fetch URLs against
  // window.location.href. When SITE_PASSWORD HTTP Basic Auth is active the
  // URL contains credentials (e.g. http://user:pass@localhost:3000), and the
  // Fetch API rejects any Request built from a credentialed URL. Using an
  // absolute basePath derived from window.location.origin (which always
  // strips username/password) prevents the ClientFetchError.
  const basePath =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : "/api/auth";

  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
