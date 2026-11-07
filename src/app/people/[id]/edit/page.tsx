import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePerson, updatePerson } from "@/app/people/actions";
import { AppHeader } from "@/components/AppHeader";
import { PersonForm } from "@/components/PersonForm";
import { getSignedUrl } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPersonPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const person = data as Person;
  const photoUrl = await getSignedUrl(supabase, "photos", person.photo_path);
  const chartUrl =
    person.entry_mode === "detailed"
      ? await getSignedUrl(supabase, "charts", person.chart_path)
      : null;
  const boundUpdate = updatePerson.bind(null, person.id);
  const boundDelete = deletePerson.bind(null, person.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader subtitle={`Edit ${person.name}`} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                Edit person
              </h1>
              <p className="mt-2 text-lg text-[var(--muted)]">
                {person.name} · {person.entry_mode === "sheet" ? "Sheet" : "Detailed"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/people/${person.id}/print`} className="btn-secondary">
                Print
              </Link>
              <form action={boundDelete}>
                <button type="submit" className="btn-danger">
                  Delete
                </button>
              </form>
            </div>
          </div>
          <PersonForm
            person={person}
            photoUrl={photoUrl}
            chartUrl={chartUrl}
            entryMode={person.entry_mode ?? "detailed"}
            action={boundUpdate}
            submitLabel="Save changes"
          />
        </div>
      </main>
    </div>
  );
}
