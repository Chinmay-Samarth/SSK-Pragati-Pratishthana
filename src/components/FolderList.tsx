"use client";

import { useMemo, useState } from "react";
import { FolderCard } from "@/components/FolderCard";
import type { PersonFolder } from "@/lib/types";

type FolderListProps = {
  maleFolders: PersonFolder[];
  femaleFolders: PersonFolder[];
};

function FolderSection({
  title,
  folders,
}: {
  title: string;
  folders: PersonFolder[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <p className="text-base text-[var(--muted)]">
          {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </p>
      </div>
      {folders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-[var(--muted)]">
          No {title.toLowerCase()} folders match.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard
              key={`${folder.gender}-${folder.year}`}
              folder={folder}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function FolderList({ maleFolders, femaleFolders }: FolderListProps) {
  const [query, setQuery] = useState("");

  const filteredMale = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maleFolders;
    return maleFolders.filter((folder) =>
      `${folder.gender} ${folder.year}`.toLowerCase().includes(q),
    );
  }, [maleFolders, query]);

  const filteredFemale = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return femaleFolders;
    return femaleFolders.filter((folder) =>
      `${folder.gender} ${folder.year}`.toLowerCase().includes(q),
    );
  }, [femaleFolders, query]);

  return (
    <div className="space-y-8">
      <label className="block max-w-xl">
        <span className="mb-2 block text-base font-semibold">Search folders</span>
        <input
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 1995"
        />
      </label>

      <FolderSection title="Male" folders={filteredMale} />
      <FolderSection title="Female" folders={filteredFemale} />
    </div>
  );
}
