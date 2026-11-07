"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { personGalleryRows } from "@/lib/fields";
import { formatDate } from "@/lib/people";
import type { Person } from "@/lib/types";

type PeopleBrowserProps = {
  people: Person[];
  gender: string;
  year: string;
};

type SortKey = "name" | "dob" | "occupation" | "income" | "remarks";

const signedUrlCache = new Map<string, string | null>();

function cacheKey(bucket: "photos" | "charts", path: string) {
  return `${bucket}:${path}`;
}

function preloadImage(url: string | null) {
  if (!url || typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

async function fetchSignedUrl(
  bucket: "photos" | "charts",
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const key = cacheKey(bucket, path);
  if (signedUrlCache.has(key)) {
    return signedUrlCache.get(key) ?? null;
  }
  const res = await fetch(
    `/api/media?bucket=${bucket}&path=${encodeURIComponent(path)}`,
  );
  if (!res.ok) {
    signedUrlCache.set(key, null);
    return null;
  }
  const json = (await res.json()) as { url?: string };
  const url = json.url ?? null;
  signedUrlCache.set(key, url);
  preloadImage(url);
  return url;
}

async function loadPersonMedia(person: Person) {
  const [photo, chart] = await Promise.all([
    fetchSignedUrl("photos", person.photo_path),
    person.entry_mode === "detailed"
      ? fetchSignedUrl("charts", person.chart_path)
      : Promise.resolve(null),
  ]);
  return { photo, chart };
}

export function PeopleBrowser({ people, gender, year }: PeopleBrowserProps) {
  const [mode, setMode] = useState<"table" | "gallery">("table");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dob");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = people.filter((person) => {
      return (
        !q ||
        person.name.toLowerCase().includes(q) ||
        (person.phone_number ?? "").toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      const left = (a[sortKey] ?? "").toString().toLowerCase();
      const right = (b[sortKey] ?? "").toString().toLowerCase();
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [people, query, sortKey, sortDir]);

  const current = filtered[galleryIndex] ?? null;

  const loadMedia = useCallback(async (person: Person | null) => {
    if (!person) {
      setPhotoUrl(null);
      setChartUrl(null);
      return;
    }

    const photoKey = person.photo_path
      ? cacheKey("photos", person.photo_path)
      : null;
    const chartKey =
      person.entry_mode === "detailed" && person.chart_path
        ? cacheKey("charts", person.chart_path)
        : null;
    const cachedPhoto = photoKey ? signedUrlCache.get(photoKey) : null;
    const cachedChart = chartKey ? signedUrlCache.get(chartKey) : null;
    const hasCache =
      (!person.photo_path || signedUrlCache.has(photoKey!)) &&
      (person.entry_mode !== "detailed" ||
        !person.chart_path ||
        signedUrlCache.has(chartKey!));

    if (hasCache) {
      setPhotoUrl(cachedPhoto ?? null);
      setChartUrl(cachedChart ?? null);
      setMediaLoading(false);
    } else {
      setMediaLoading(true);
    }

    try {
      const { photo, chart } = await loadPersonMedia(person);
      setPhotoUrl(photo);
      setChartUrl(chart);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "gallery" || !current) return;
    void loadMedia(current);

    // Prefetch neighbors so Next/Previous feels instant while skimming
    const neighbors = [filtered[galleryIndex - 1], filtered[galleryIndex + 1]].filter(
      Boolean,
    ) as Person[];
    neighbors.forEach((person) => {
      void loadPersonMedia(person);
    });
  }, [mode, current, loadMedia, filtered, galleryIndex]);

  useEffect(() => {
    if (mode !== "gallery") return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (lightbox) {
          setLightbox(null);
        } else {
          setMode("table");
        }
        return;
      }
      if (lightbox) return;
      if (e.key === "ArrowLeft") {
        setGalleryIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "ArrowRight") {
        setGalleryIndex((i) => Math.min(filtered.length - 1, i + 1));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, lightbox, filtered.length]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "dob" ? "asc" : "asc");
    }
  }

  function openGallery(index: number) {
    setGalleryIndex(index);
    setMode("gallery");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <label className="block min-w-0 flex-1">
          <span className="mb-2 block text-base font-semibold">Search</span>
          <input
            className="field"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setGalleryIndex(0);
            }}
            placeholder="Name or phone number"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={mode === "table" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("table")}
          >
            Table
          </button>
          <button
            type="button"
            className={mode === "gallery" ? "btn-primary" : "btn-secondary"}
            onClick={() => setMode("gallery")}
            disabled={filtered.length === 0}
          >
            View mode
          </button>
        </div>
      </div>

      <p className="text-base text-[var(--muted)]">
        Showing {filtered.length} of {people.length} in {gender} {year}
      </p>

      {mode === "table" ? (
        <div className="overflow-x-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-base">
            <thead className="bg-[var(--folder)] text-[var(--muted)]">
              <tr>
                {(
                  [
                    ["name", "Name"],
                    ["dob", "DOB"],
                    ["occupation", "Occupation"],
                    ["income", "Income"],
                    ["remarks", "Remarks"],
                  ] as const
                ).map(([key, label]) => (
                  <th key={key} className="px-4 py-4 font-bold">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort(key)}
                    >
                      {label}
                      {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-4 font-bold">Type</th>
                <th className="px-4 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person, index) => (
                <tr key={person.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-4 font-semibold">{person.name}</td>
                  <td className="px-4 py-4">{formatDate(person.dob)}</td>
                  <td className="px-4 py-4">{person.occupation || "—"}</td>
                  <td className="px-4 py-4">{person.income || "—"}</td>
                  <td className="max-w-[14rem] px-4 py-4">
                    <span className="line-clamp-2">
                      {person.remarks || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {person.entry_mode === "sheet" ? (
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-bold text-[var(--accent-dark)]">
                        Sheet
                      </span>
                    ) : (
                      <span className="text-[var(--muted)]">Detailed</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-secondary !min-h-10 !px-3 !text-sm"
                        onClick={() => openGallery(index)}
                      >
                        View
                      </button>
                      <Link
                        href={`/people/${person.id}/edit`}
                        className="btn-secondary !min-h-10 !px-3 !text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-[var(--muted)]"
                  >
                    No people match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {mode === "gallery" && current ? (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[var(--background)]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2.5">
            <div>
              <p className="text-base font-bold sm:text-lg">{current.name}</p>
              <p className="text-sm text-[var(--muted)]">
                Person {galleryIndex + 1} of {filtered.length}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary !min-h-11"
              onClick={() => setMode("table")}
            >
              Close
            </button>
          </div>

          <button
            type="button"
            className="gallery-nav-btn gallery-nav-btn--prev"
            disabled={galleryIndex === 0}
            onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous person"
          >
            ‹
          </button>
          <button
            type="button"
            className="gallery-nav-btn gallery-nav-btn--next"
            disabled={galleryIndex >= filtered.length - 1}
            onClick={() =>
              setGalleryIndex((i) => Math.min(filtered.length - 1, i + 1))
            }
            aria-label="Next person"
          >
            ›
          </button>

          <div className="min-h-0 flex-1 overflow-x-hidden px-10 py-3 sm:px-16 sm:py-4">
            {mediaLoading ? (
              <p className="text-center text-base text-[var(--muted)]">
                Loading images…
              </p>
            ) : null}

            {current.entry_mode === "sheet" ? (
              <div className="mx-auto flex h-full max-w-5xl flex-col gap-2 overflow-hidden">
                <div className="shrink-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-base">
                  <span className="font-bold">{current.name}</span>
                  <span className="mx-2 text-[var(--muted)]">·</span>
                  {current.gender}
                  <span className="mx-2 text-[var(--muted)]">·</span>
                  {formatDate(current.dob)}
                </div>
                <button
                  type="button"
                  className="block min-h-0 flex-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]"
                  onClick={() =>
                    photoUrl &&
                    setLightbox({ src: photoUrl, alt: `${current.name} sheet` })
                  }
                  disabled={!photoUrl}
                >
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={`${current.name} biodata sheet`}
                      className="mx-auto h-full w-auto max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      No sheet image
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="mx-auto flex h-full w-[75%] max-w-5xl items-start justify-center">
                <div className="grid w-full aspect-[3/2] max-w-full gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(200px,0.95fr)]">
                  <div className="flex min-h-0 flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 pb-5">
                    <h2 className="mb-2 shrink-0 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)] sm:text-3xl">
                      {current.name}
                    </h2>
                    <table className="mb-3 w-full border-collapse">
                      <tbody>
                        {personGalleryRows(current).map(([label, value]) => (
                          <tr key={label} className="align-top">
                            <th className="w-[28%] py-0.5 pr-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-sm">
                              {label}
                            </th>
                            <td className="break-words py-0.5 text-lg font-semibold leading-tight whitespace-normal text-[var(--ink)] sm:text-[1.2rem]">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                    <button
                      type="button"
                      className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2"
                      onClick={() =>
                        photoUrl &&
                        setLightbox({ src: photoUrl, alt: current.name })
                      }
                      disabled={!photoUrl}
                    >
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl}
                          alt={current.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full min-h-32 items-center justify-center text-sm text-[var(--muted)]">
                          No photo
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2"
                      onClick={() =>
                        chartUrl &&
                        setLightbox({
                          src: chartUrl,
                          alt: `${current.name} chart`,
                        })
                      }
                      disabled={!chartUrl}
                    >
                      {chartUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={chartUrl}
                          alt={`${current.name} astrology chart`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full min-h-28 items-center justify-center text-sm text-[var(--muted)]">
                          No chart
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {lightbox ? (
            <ImageLightbox
              src={lightbox.src}
              alt={lightbox.alt}
              onClose={() => setLightbox(null)}
            />
          ) : null}
        </div>
      ) : null}

      {mode === "gallery" && !current ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--muted)]">
          No people to show in view mode.
        </div>
      ) : null}
    </div>
  );
}
