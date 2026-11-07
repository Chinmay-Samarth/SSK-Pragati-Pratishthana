import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PeopleBrowser } from "@/components/PeopleBrowser";
import { createClient } from "@/lib/supabase/server";
import type { Gender, Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ gender: string; year: string }>;
};

export default async function FolderPage({ params }: PageProps) {
  const { gender, year } = await params;

  if (gender !== "Male" && gender !== "Female") notFound();
  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("gender", gender)
    .gte("dob", `${year}-01-01`)
    .lte("dob", `${year}-12-31`)
    .order("dob", { ascending: true })
    .order("name", { ascending: true });

  const people = (data ?? []) as Person[];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader subtitle={`${gender} ${year}`} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
              {gender} {year}
            </h1>
            <p className="mt-1 text-lg text-[var(--muted)]">
              Sorted by birth date. Open view mode for full screen.
            </p>
          </div>
          <Link href="/people/new" className="btn-primary">
            Add person
          </Link>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">
            Could not load people for this folder.
          </p>
        ) : (
          <PeopleBrowser
            people={people}
            gender={gender as Gender}
            year={year}
          />
        )}
      </main>
    </div>
  );
}
