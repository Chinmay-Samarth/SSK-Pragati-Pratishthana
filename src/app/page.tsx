import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { FolderList } from "@/components/FolderList";
import { buildFolders } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("gender,dob")
    .order("dob", { ascending: false });

  const folders = buildFolders((data ?? []) as Pick<Person, "gender" | "dob">[]);
  const maleFolders = folders.filter((f) => f.gender === "Male");
  const femaleFolders = folders.filter((f) => f.gender === "Female");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader
        subtitle="Male and Female folders by birth year"
        showHome={false}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)] sm:text-4xl">
              Records
            </h1>
            <p className="mt-1 text-lg text-[var(--muted)]">
              Open a year folder to browse people
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/people/new" className="btn-primary">
              Add person
            </Link>
            <a href="/api/export" className="btn-secondary">
              Export Excel
            </a>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-[var(--danger-bg)] px-4 py-3 text-[var(--danger-text)]">
            Could not load folders. Please try again.
          </p>
        ) : null}

        {folders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
              No records yet
            </p>
            <p className="mt-2 text-lg text-[var(--muted)]">
              Add the first person to create folders automatically.
            </p>
            <Link href="/people/new" className="btn-primary mt-6">
              Add person
            </Link>
          </div>
        ) : (
          <FolderList maleFolders={maleFolders} femaleFolders={femaleFolders} />
        )}
      </main>
    </div>
  );
}
