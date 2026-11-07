import type { Gender, Person, PersonFolder } from "@/lib/types";

export function birthYear(dob: string): number {
  return Number(dob.slice(0, 4));
}

export function formatDate(dob: string): string {
  const date = new Date(`${dob}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildFolders(people: Pick<Person, "gender" | "dob">[]): PersonFolder[] {
  const map = new Map<string, PersonFolder>();

  for (const person of people) {
    const year = birthYear(person.dob);
    const key = `${person.gender}-${year}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        gender: person.gender as Gender,
        year,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender);
    return b.year - a.year;
  });
}

export async function getSignedUrl(
  supabase: {
    storage: {
      from: (bucket: string) => {
        createSignedUrl: (
          path: string,
          expiresIn: number,
        ) => Promise<{ data: { signedUrl: string } | null }>;
      };
    };
  },
  bucket: "photos" | "charts",
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
