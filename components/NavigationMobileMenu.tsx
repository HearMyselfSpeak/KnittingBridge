"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";

interface Props {
  session: Session | null;
}

export function NavigationMobileMenu({ session }: Props) {
  const [open, setOpen] = useState(false);
  const user = session?.user;
  const role = user?.role;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-foreground"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-sm z-50">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {!user && (
              <>
                <Link
                  href="/how-it-works"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  How it works
                </Link>
                <Link
                  href="/color-preview"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Color preview
                </Link>
                <Link
                  href="/guides"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  For Guides
                </Link>
                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-primary"
                >
                  Sign in
                </Link>
              </>
            )}

            {user && role === "MAKER" && (
              <>
                <Link
                  href="/request"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Get help
                </Link>
                <Link
                  href="/color-preview"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Color preview
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}

            {user && role === "GUIDE" && (
              <>
                <Link
                  href="/dashboard/guide"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}

            {user && role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              </>
            )}

            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  import("next-auth/react").then(({ signOut }) =>
                    signOut({ callbackUrl: "/" })
                  );
                }}
                className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
