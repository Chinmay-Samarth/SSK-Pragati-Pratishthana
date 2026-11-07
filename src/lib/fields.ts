import type { Person } from "@/lib/types";
import { formatDate } from "@/lib/people";

export const DETAILED_TEXT_FIELDS = [
  ["sl_no", "Sl No"],
  ["birth_time", "Time of birth"],
  ["place_of_birth", "Place of birth"],
  ["father_name", "Father's name"],
  ["mother_name", "Mother's name"],
  ["gharana", "Gharana"],
  ["gotra", "Gotra"],
  ["nakshatra", "Nakshatra"],
  ["rashi", "Rashi"],
  ["gana", "Gana"],
  ["height", "Height"],
  ["qualification", "Qualification"],
  ["occupation", "Occupation"],
  ["place_of_occupation", "Place of occupation"],
  ["income", "Income"],
  ["residential_address", "Residential address"],
  ["native_place", "Native place"],
  ["marital_status", "Marital status"],
  ["phone_number", "Phone number"],
  ["remarks", "Remarks"],
] as const;

export type DetailedFieldKey = (typeof DETAILED_TEXT_FIELDS)[number][0];

function joinParts(...parts: Array<string | null | undefined>): string {
  const values = parts.map((p) => (p ?? "").trim()).filter(Boolean);
  return values.length ? values.join(" · ") : "—";
}

export function personDetailRows(person: Person): Array<[string, string]> {
  const extra: Array<[string, string]> = DETAILED_TEXT_FIELDS.map(
    ([key, label]) => [label, (person[key] as string | null) || "—"],
  );
  return [
    ["Name", person.name],
    ["DOB", formatDate(person.dob)],
    ["Gender", person.gender],
    ...extra,
  ];
}

/** Compact rows for gallery view mode */
export function personGalleryRows(person: Person): Array<[string, string]> {
  return [
    ["Date of birth", formatDate(person.dob)],
    [
      "Place of birth",
      joinParts(person.birth_time, person.place_of_birth),
    ],
    ["Father's name", person.father_name || "—"],
    ["Mother's name", person.mother_name || "—"],
    ["Gharana / Gotra", joinParts(person.gharana, person.gotra)],
    ["Nakshatra", person.nakshatra || "—"],
    ["Rashi", person.rashi || "—"],
    ["Gana", person.gana || "—"],
    ["Height", person.height || "—"],
    ["Qualification", person.qualification || "—"],
    [
      "Occupation",
      joinParts(person.occupation, person.place_of_occupation),
    ],
    ["Income", person.income || "—"],
    ["Residential address", person.residential_address || "—"],
    ["Native place", person.native_place || "—"],
    ["Marital status", person.marital_status || "—"],
    ["Phone number", person.phone_number || "—"],
  ];
}

/** Same as gallery view, used by print (remarks handled separately on print) */
export function personPrintRows(person: Person): Array<[string, string]> {
  return personGalleryRows(person);
}
