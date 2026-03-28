"use client";

interface Props {
  requestId?: string;
}

export default function Step7Matching({ requestId }: Props) {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary animate-pulse"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </div>

      <h2
        className="text-xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Finding the right Guide for you
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        We are matching you with a Guide who has the right experience for your
        project. This usually takes just a few minutes.
      </p>

      <div className="flex justify-center gap-1.5 mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
      </div>

      {requestId && (
        <p className="text-xs text-muted-foreground">
          Request ID: {requestId}
        </p>
      )}
    </div>
  );
}
