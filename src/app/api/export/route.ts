import * as XLSX from "xlsx";
import { isAllowedStaffEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/types";

function toRow(person: Person) {
  return {
    "Entry Mode": person.entry_mode,
    "Sl No": person.sl_no ?? "",
    Name: person.name,
    DOB: person.dob,
    Gender: person.gender,
    Year: person.dob.slice(0, 4),
    Time: person.birth_time ?? "",
    "Place of Birth": person.place_of_birth ?? "",
    "Father's Name": person.father_name ?? "",
    "Mother's Name": person.mother_name ?? "",
    Gharana: person.gharana ?? "",
    Gotra: person.gotra ?? "",
    Nakshatra: person.nakshatra ?? "",
    Rashi: person.rashi ?? "",
    Gana: person.gana ?? "",
    Height: person.height ?? "",
    Qualification: person.qualification ?? "",
    Occupation: person.occupation ?? "",
    "Place of Occupation": person.place_of_occupation ?? "",
    Income: person.income ?? "",
    "Residential Address": person.residential_address ?? "",
    "Native Place": person.native_place ?? "",
    "Marital Status": person.marital_status ?? "",
    "Phone Number": person.phone_number ?? "",
    Remarks: person.remarks ?? "",
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedStaffEmail(user.email)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("dob", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const people = (data ?? []) as Person[];
  const boys = people.filter((p) => p.gender === "Male").map(toRow);
  const girls = people.filter((p) => p.gender === "Female").map(toRow);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(boys), "Boys");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(girls),
    "Girls",
  );
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const today = new Date();
  const dateStamp = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const filename = `ssk-people-${dateStamp}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
