"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  compressImage,
  type CompressKind,
} from "@/lib/compress-image";
import { DETAILED_TEXT_FIELDS } from "@/lib/fields";
import { createClient } from "@/lib/supabase/server";
import type { EntryMode, Gender } from "@/lib/types";

function clean(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function readDetailedFields(formData: FormData) {
  const fields: Record<string, string | null> = {};
  for (const [key] of DETAILED_TEXT_FIELDS) {
    fields[key] = clean(formData.get(key));
  }
  return fields;
}

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // pre-compress; Vercel body limit ~4.5MB after form overhead
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function assertValidImage(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large. Please use a file under 12 MB.");
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
}

async function uploadImage(
  file: File | null,
  bucket: "photos" | "charts",
  personId: string,
  kind: CompressKind,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  assertValidImage(file);

  const supabase = await createClient();
  const compressed = await compressImage(file, kind);
  const path = `${personId}/${bucket}-${Date.now()}.${compressed.extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, compressed.buffer, {
    upsert: true,
    contentType: compressed.contentType,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export type PersonFormState = {
  error?: string;
};

export async function createPerson(
  _prev: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  const entry_mode = (clean(formData.get("entry_mode")) || "detailed") as EntryMode;
  const name = clean(formData.get("name"));
  const dob = clean(formData.get("dob"));
  const gender = clean(formData.get("gender")) as Gender | null;
  const detailed = entry_mode === "detailed" ? readDetailedFields(formData) : {};
  const photo = formData.get("photo");
  const chart = formData.get("chart");

  if (!name || !dob || (gender !== "Male" && gender !== "Female")) {
    return { error: "Name, date of birth, and gender are required." };
  }

  if (entry_mode !== "detailed" && entry_mode !== "sheet") {
    return { error: "Invalid entry mode." };
  }

  if (entry_mode === "sheet") {
    const photoFile = photo instanceof File ? photo : null;
    if (!photoFile || photoFile.size === 0) {
      return { error: "Please upload the biodata sheet image." };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .insert({
      entry_mode,
      name,
      dob,
      gender,
      ...detailed,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not save person." };
  }

  try {
    const photoFile = photo instanceof File ? photo : null;
    const chartFile = chart instanceof File ? chart : null;
    const photo_path = await uploadImage(
      photoFile,
      "photos",
      data.id,
      entry_mode === "sheet" ? "sheet" : "photo",
    );
    const chart_path =
      entry_mode === "detailed"
        ? await uploadImage(chartFile, "charts", data.id, "chart")
        : null;

    if (photo_path || chart_path) {
      const { error: updateError } = await supabase
        .from("people")
        .update({ photo_path, chart_path })
        .eq("id", data.id);
      if (updateError) {
        return { error: updateError.message };
      }
    }
  } catch (uploadError) {
    return {
      error:
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload images.",
    };
  }

  revalidatePath("/");
  redirect(`/people/${data.id}/print`);
}

export async function updatePerson(
  personId: string,
  _prev: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  const entry_mode = (clean(formData.get("entry_mode")) || "detailed") as EntryMode;
  const name = clean(formData.get("name"));
  const dob = clean(formData.get("dob"));
  const gender = clean(formData.get("gender")) as Gender | null;
  const detailed = entry_mode === "detailed" ? readDetailedFields(formData) : {};
  const photo = formData.get("photo");
  const chart = formData.get("chart");

  if (!name || !dob || (gender !== "Male" && gender !== "Female")) {
    return { error: "Name, date of birth, and gender are required." };
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("people")
    .select("photo_path, chart_path")
    .eq("id", personId)
    .single();

  if (existingError || !existing) {
    return { error: "Person not found." };
  }

  let photo_path = existing.photo_path as string | null;
  let chart_path = existing.chart_path as string | null;

  try {
    const photoFile = photo instanceof File ? photo : null;
    const chartFile = chart instanceof File ? chart : null;
    const newPhoto = await uploadImage(
      photoFile,
      "photos",
      personId,
      entry_mode === "sheet" ? "sheet" : "photo",
    );
    if (newPhoto) photo_path = newPhoto;

    if (entry_mode === "detailed") {
      const newChart = await uploadImage(chartFile, "charts", personId, "chart");
      if (newChart) chart_path = newChart;
    } else {
      chart_path = null;
    }
  } catch (uploadError) {
    return {
      error:
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload images.",
    };
  }

  if (entry_mode === "sheet" && !photo_path) {
    return { error: "Please upload the biodata sheet image." };
  }

  const { error } = await supabase
    .from("people")
    .update({
      entry_mode,
      name,
      dob,
      gender,
      ...detailed,
      photo_path,
      chart_path,
    })
    .eq("id", personId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/people/${personId}/edit`);
  redirect(`/folder/${gender}/${dob.slice(0, 4)}`);
}

export async function deletePerson(personId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("people")
    .select("gender, dob, photo_path, chart_path")
    .eq("id", personId)
    .single();

  if (data?.photo_path) {
    await supabase.storage.from("photos").remove([data.photo_path]);
  }
  if (data?.chart_path) {
    await supabase.storage.from("charts").remove([data.chart_path]);
  }

  await supabase.from("people").delete().eq("id", personId);
  revalidatePath("/");

  if (data) {
    redirect(`/folder/${data.gender}/${String(data.dob).slice(0, 4)}`);
  }
  redirect("/");
}
