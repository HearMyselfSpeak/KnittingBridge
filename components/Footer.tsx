import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="font-serif text-base font-semibold text-primary mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              KnittingBridge
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Expert guidance, when you need it.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Platform
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/color-preview"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Color preview
                </Link>
              </li>
              <li>
                <Link
                  href="/request"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get help
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Guides
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guides"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Become a Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/compensation"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Compensation
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/standards"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/guide-agreement"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guide agreement
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refund policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KnittingBridge. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            A bridge does not cheer. It holds.
          </p>
        </div>
      </div>
    </footer>
  );
}
