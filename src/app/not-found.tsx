import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
        Page not found
      </h1>
      <p className="mt-3 text-lg text-[var(--muted)]">
        That page does not exist or was moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </main>
  );
}
