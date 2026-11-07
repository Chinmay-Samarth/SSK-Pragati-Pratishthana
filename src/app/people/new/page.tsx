"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { PersonForm } from "@/components/PersonForm";
import { createPerson } from "@/app/people/actions";
import type { EntryMode } from "@/lib/types";

export default function NewPersonPage() {
  const [mode, setMode] = useState<EntryMode | null>(null);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader subtitle="Add a new person" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
          {!mode ? (
            <>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                How do you want to add?
              </h1>
              <p className="mt-2 text-lg text-[var(--muted)]">
                Choose one option. You can always edit later.
              </p>
              <div className="mt-8 grid gap-4">
                <button
                  type="button"
                  className="rounded-3xl border-2 border-[var(--line)] bg-[var(--folder)] p-6 text-left transition hover:border-[var(--accent)]"
                  onClick={() => setMode("detailed")}
                >
                  <p className="text-2xl font-bold text-[var(--ink)]">
                    Detailed entry
                  </p>
                  <p className="mt-2 text-lg text-[var(--muted)]">
                    Fill all information fields, plus photo and astrology chart.
                  </p>
                </button>
                <button
                  type="button"
                  className="rounded-3xl border-2 border-[var(--line)] bg-[var(--folder)] p-6 text-left transition hover:border-[var(--accent)]"
                  onClick={() => setMode("sheet")}
                >
                  <p className="text-2xl font-bold text-[var(--ink)]">
                    Sheet image
                  </p>
                  <p className="mt-2 text-lg text-[var(--muted)]">
                    Only Name, DOB, Gender, and one biodata photo that already
                    has the details printed.
                  </p>
                </button>
              </div>
              <Link href="/" className="btn-secondary mt-6 inline-flex">
                Cancel
              </Link>
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                    {mode === "detailed" ? "Detailed entry" : "Sheet image"}
                  </h1>
                  <p className="mt-2 text-lg text-[var(--muted)]">
                    Gender is required so the person goes into the right folder.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setMode(null)}
                >
                  Change type
                </button>
              </div>
              <PersonForm
                entryMode={mode}
                action={createPerson}
                submitLabel="Save and print"
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
