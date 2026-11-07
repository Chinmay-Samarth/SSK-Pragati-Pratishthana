"use client";

import { useActionState, useMemo, useState } from "react";
import type { PersonFormState } from "@/app/people/actions";
import { DETAILED_TEXT_FIELDS } from "@/lib/fields";
import type { EntryMode, Person } from "@/lib/types";

type PersonFormProps = {
  person?: Person;
  photoUrl?: string | null;
  chartUrl?: string | null;
  entryMode: EntryMode;
  action: (
    prev: PersonFormState,
    formData: FormData,
  ) => Promise<PersonFormState>;
  submitLabel: string;
};

const initialState: PersonFormState = {};

function previewFromFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  return URL.createObjectURL(file);
}

export function PersonForm({
  person,
  photoUrl,
  chartUrl,
  entryMode,
  action,
  submitLabel,
}: PersonFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [chartPreview, setChartPreview] = useState<string | null>(null);

  const sheetRequired = entryMode === "sheet" && !photoUrl;
  const shownPhoto = photoPreview ?? photoUrl ?? null;
  const shownChart = chartPreview ?? chartUrl ?? null;

  const infoFields = useMemo(
    () => [
      { key: "name", label: "Name *", required: true, type: "text" as const },
      { key: "dob", label: "Date of birth *", required: true, type: "date" as const },
      { key: "gender", label: "Gender *", required: true, type: "gender" as const },
      ...(entryMode === "detailed"
        ? DETAILED_TEXT_FIELDS.map(([key, label]) => ({
            key,
            label,
            required: false,
            type:
              key === "residential_address" || key === "remarks"
                ? ("textarea" as const)
                : ("text" as const),
          }))
        : []),
    ],
    [entryMode],
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="entry_mode" value={entryMode} />

      {entryMode === "sheet" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(260px,1.15fr)]">
          <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--folder)] p-4">
            {infoFields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-base font-semibold">
                  {field.label}
                </span>
                {field.type === "gender" ? (
                  <select
                    name="gender"
                    className="field"
                    defaultValue={person?.gender ?? ""}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <input
                    name={field.key}
                    type={field.type}
                    className="field"
                    defaultValue={
                      field.key === "name"
                        ? (person?.name ?? "")
                        : field.key === "dob"
                          ? (person?.dob ?? "")
                          : ""
                    }
                    required={field.required}
                  />
                )}
              </label>
            ))}
          </div>

          <label className="flex min-h-[420px] flex-col rounded-2xl border border-[var(--line)] bg-[var(--folder)] p-4">
            <span className="mb-2 block text-base font-semibold">
              Biodata sheet image *
            </span>
            <div className="mb-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[var(--surface)]">
              {shownPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownPhoto}
                  alt="Sheet preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[var(--muted)]">No sheet image yet</span>
              )}
            </div>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="field"
              required={sheetRequired}
              onChange={(e) => {
                const next = previewFromFile(e.target.files?.[0] ?? null);
                setPhotoPreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return next;
                });
              }}
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(240px,1.05fr)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--folder)] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {infoFields.map((field) => (
                <label
                  key={field.key}
                  className={`block ${
                    field.type === "textarea" || field.key === "remarks"
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <span className="mb-1.5 block text-sm font-semibold">
                    {field.label}
                  </span>
                  {field.type === "gender" ? (
                    <select
                      name="gender"
                      className="field !py-2.5 !text-base"
                      defaultValue={person?.gender ?? ""}
                      required
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      className="field min-h-24 !text-base"
                      defaultValue={
                        (person?.[field.key as keyof Person] as string | null) ??
                        ""
                      }
                    />
                  ) : (
                    <input
                      name={field.key}
                      type={field.type === "date" ? "date" : "text"}
                      className="field !py-2.5 !text-base"
                      defaultValue={
                        field.key === "name"
                          ? (person?.name ?? "")
                          : field.key === "dob"
                            ? (person?.dob ?? "")
                            : ((person?.[
                                field.key as keyof Person
                              ] as string | null) ?? "")
                      }
                      required={field.required}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col gap-4">
            <label className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--line)] bg-[var(--folder)] p-3">
              <span className="mb-2 block text-sm font-semibold">Photo</span>
              <div className="mb-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[var(--surface)]">
                {shownPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shownPhoto}
                    alt="Photo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-[var(--muted)]">No photo</span>
                )}
              </div>
              <input
                name="photo"
                type="file"
                accept="image/*"
                className="field !py-2 !text-sm"
                onChange={(e) => {
                  const next = previewFromFile(e.target.files?.[0] ?? null);
                  setPhotoPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return next;
                  });
                }}
              />
            </label>

            <label className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--line)] bg-[var(--folder)] p-3">
              <span className="mb-2 block text-sm font-semibold">
                Astrology chart
              </span>
              <div className="mb-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[var(--surface)]">
                {shownChart ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shownChart}
                    alt="Chart preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-[var(--muted)]">No chart</span>
                )}
              </div>
              <input
                name="chart"
                type="file"
                accept="image/*"
                className="field !py-2 !text-sm"
                onChange={(e) => {
                  const next = previewFromFile(e.target.files?.[0] ?? null);
                  setChartPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return next;
                  });
                }}
              />
            </label>
          </div>
        </div>
      )}

      {state.error ? (
        <p className="rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-base text-[var(--danger-text)]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
