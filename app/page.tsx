// Phase 0 placeholder — replaced in Phase 1 with full homepage.
// Homepage will feature Color Preview Tool above the fold, marketplace intro below.

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1
          className="text-4xl font-serif tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          KnittingBridge
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Expert help, when you need it. Coming soon.
        </p>
        <p className="text-sm text-muted-foreground">
          Phase 0 scaffold — database and authentication in progress.
        </p>
      </div>
    </main>
  );
}
