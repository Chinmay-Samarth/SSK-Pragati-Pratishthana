import Link from "next/link";
import type { PersonFolder } from "@/lib/types";

export function FolderCard({ folder }: { folder: PersonFolder }) {
  const tone = folder.gender === "Male" ? "var(--male)" : "var(--female)";

  return (
    <Link
      href={`/folder/${folder.gender}/${folder.year}`}
      className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)] hover:bg-[var(--folder)] sm:p-5"
    >
      <div
        className="mb-4 flex h-12 w-14 items-end rounded-t-xl rounded-b-md border-2 border-b-[8px] bg-[var(--folder)]"
        style={{ borderColor: tone }}
      >
        <div
          className="h-2.5 w-full rounded-b-sm opacity-80"
          style={{ background: tone }}
        />
      </div>
      <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] sm:text-2xl">
        {folder.year}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
        {folder.count} {folder.count === 1 ? "person" : "people"}
      </p>
    </Link>
  );
}
