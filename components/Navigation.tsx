import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { NavigationMobileMenu } from "@/components/NavigationMobileMenu";

export default async function Navigation() {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-primary tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          KnittingBridge
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {!user && (
            <>
              <Link
                href="/how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/color-preview"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Color preview
              </Link>
              <Link
                href="/guides"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                For Guides
              </Link>
            </>
          )}

          {user && role === "MAKER" && (
            <>
              <Link
                href="/get-help"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Get help
              </Link>
              <Link
                href="/color-preview"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Color preview
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}

          {user && role === "GUIDE" && (
            <Link
              href="/dashboard/guide"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}

          {user && role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-primary border border-primary/30 px-4 py-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user.name ?? user.email}
              </span>
              <SignOutButton />
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <NavigationMobileMenu session={session} />
      </div>
    </header>
  );
}
