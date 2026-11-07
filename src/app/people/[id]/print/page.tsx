import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PrintButton } from "@/components/PrintButton";
import { personPrintRows } from "@/lib/fields";
import { getSignedUrl } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const PRINT_HEADING = "SSK Pragati Pratishthana, Bengaluru";

export default async function PrintPersonPage({ params }: PageProps) {
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
  const printRows = personPrintRows(person);
  const isSheet = person.entry_mode === "sheet";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="no-print">
        <AppHeader subtitle="Print biodata" />
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="no-print mb-6 flex flex-wrap gap-3">
          <PrintButton />
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
          <Link
            href={`/folder/${person.gender}/${person.dob.slice(0, 4)}`}
            className="btn-secondary"
          >
            Open folder
          </Link>
        </div>

        <article
          className={`print-sheet mx-auto flex flex-col border-2 border-black bg-white p-3 text-black sm:p-4 ${
            isSheet ? "print-sheet--portrait" : "print-sheet--landscape"
          }`}
        >
          <div className="print-heading-bar mb-2 grid shrink-0 grid-cols-[minmax(5.5rem,9rem)_minmax(0,1fr)_minmax(5.5rem,9rem)] items-center gap-3 border-b-2 border-black pb-2">
            <div
              className="print-end-box h-10 w-full border border-black sm:h-11"
              aria-hidden="true"
            />
            <p className="print-heading text-center text-lg font-bold tracking-wide text-black sm:text-xl">
              {PRINT_HEADING}
            </p>
            <div
              className="print-end-box h-10 w-full border border-black sm:h-11"
              aria-hidden="true"
            />
          </div>

          {isSheet ? (
            <div className="print-sheet-body flex min-h-0 flex-1 flex-col gap-2">
              <div className="print-sheet-image flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={`${person.name} sheet`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-[var(--muted)] no-print">No sheet image</p>
                )}
              </div>
              <div className="print-remarks shrink-0">
                <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-neutral-700">
                  Remarks
                </p>
                <div className="print-remarks-line w-full border-b border-black" />
              </div>
            </div>
          ) : (
            <div className="print-detailed flex min-h-0 flex-1 flex-col gap-2">
              <div className="print-detailed-body mx-auto grid min-h-0 w-[78%] flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-3">
                <div className="print-detailed-info flex min-h-0 flex-col overflow-hidden">
                  <h2 className="mb-1.5 shrink-0 text-center text-xl font-bold text-black sm:text-2xl">
                    {person.name}
                  </h2>
                  <table className="print-info-table w-full border-collapse border border-black text-left">
                    <tbody>
                      {printRows.map(([label, value]) => (
                        <tr key={label}>
                          <th className="w-[32%] border border-black bg-neutral-100 px-2 py-1 align-top text-xs font-bold uppercase tracking-wide text-neutral-700 sm:text-sm">
                            {label}
                          </th>
                          <td className="break-words border border-black px-2 py-1 align-top text-base font-semibold leading-snug text-black sm:text-lg">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="print-detailed-media grid min-h-0 grid-rows-2 gap-2 overflow-hidden">
                  <div className="flex min-h-0 items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={person.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <p className="text-sm text-[var(--muted)] no-print">
                        No photo
                      </p>
                    )}
                  </div>

                  <div className="flex min-h-0 items-center justify-center overflow-hidden">
                    {chartUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={chartUrl}
                        alt={`${person.name} chart`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <p className="text-sm text-[var(--muted)] no-print">
                        No chart
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="print-remarks shrink-0">
                <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-neutral-700">
                  Remarks
                </p>
                <div className="print-remarks-line w-full border-b border-black" />
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
