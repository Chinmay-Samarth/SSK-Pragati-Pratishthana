"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
        Something went wrong
      </h1>
      <p className="mt-3 text-lg text-[var(--muted)]">
        Please try again. If this keeps happening, sign out and sign back in.
      </p>
      <button type="button" className="btn-primary mt-8" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
