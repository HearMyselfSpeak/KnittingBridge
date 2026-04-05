"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
  callbackUrl: string;
  onSaveState?: () => void;
}

export default function Step4Account({ onComplete, callbackUrl, onSaveState }: Props) {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Skip if already signed in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      onComplete();
    }
  }, [status, session, onComplete]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Checking account...</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError(
        mode === "signup"
          ? "Account created. Please sign in."
          : "Invalid email or password.",
      );
      if (mode === "signup") setMode("signin");
    } else if (result?.url) {
      onSaveState?.();
      window.location.href = result.url;
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto py-8 px-4">
      <h2
        className="text-xl font-semibold text-foreground text-center mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Create your account to continue
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        We need a way to reach you when your Guide is ready.
      </p>

      <button
        onClick={() => {
          onSaveState?.();
          signIn("google", { callbackUrl });
        }}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-md px-4 py-2.5 text-sm font-medium text-foreground bg-background hover:bg-secondary transition-colors mb-4"
      >
        Continue with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            or use email and password
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
          className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-3">
        {mode === "signin" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="text-primary hover:underline"
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
