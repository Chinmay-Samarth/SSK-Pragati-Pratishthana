import XLSX from "xlsx";
import { writeFileSync } from "fs";

const wb = XLSX.readFile("C:/Users/Admin/Downloads/Matri New Regn.xlsx");
const rows = XLSX.utils.sheet_to_json(wb.Sheets.BOYS, { range: 1, defval: "" });

function parseDob(v) {
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!m) return null;
  let y = m[3];
  if (y.length === 2) y = (Number(y) > 50 ? "19" : "20") + y;
  return `${y.padStart(4, "0")}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function sqlStr(v) {
  if (v == null || v === "") return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const mapped = rows
  .map((r) => ({
    sl_no: String(r["Sl No"] || "") || null,
    name: String(r["Name"] || "").trim(),
    dob: parseDob(r["Date of Birth"]),
    birth_time: String(r["Time"] || "") || null,
    place_of_birth: String(r["Place of Birth"] || "") || null,
    father_name: String(r["Father's Name"] || "") || null,
    mother_name: String(r["Mother's Name"] || "") || null,
    gharana: String(r["Gharana"] || "") || null,
    gotra: String(r["Gotra"] || "") || null,
    nakshatra: String(r["Nakshatra"] || "") || null,
    rashi: String(r["Rashi"] || "") || null,
    gana: String(r["Gana"] || "") || null,
    height: String(r["Height"] || "") || null,
    qualification: String(r["Quaification"] || "") || null,
    occupation: String(r["Occupation"] || "") || null,
    place_of_occupation: String(r["Place of Occupation"] || "") || null,
    income: String(r["Income"] || "") || null,
    residential_address: String(r["Residential Address"] || "") || null,
    native_place: String(r["Native Place"] || "") || null,
    marital_status: String(r["Marital Status"] || "") || null,
    phone_number: String(r["Phone Number"] || "") || null,
    remarks: String(r["Remarks"] || "") || null,
  }))
  .filter((r) => r.name && r.dob);

const values = mapped
  .map(
    (r) => `(
  'detailed', 'Male',
  ${sqlStr(r.sl_no)}, ${sqlStr(r.name)}, ${sqlStr(r.dob)},
  ${sqlStr(r.birth_time)}, ${sqlStr(r.place_of_birth)},
  ${sqlStr(r.father_name)}, ${sqlStr(r.mother_name)},
  ${sqlStr(r.gharana)}, ${sqlStr(r.gotra)}, ${sqlStr(r.nakshatra)},
  ${sqlStr(r.rashi)}, ${sqlStr(r.gana)}, ${sqlStr(r.height)},
  ${sqlStr(r.qualification)}, ${sqlStr(r.occupation)},
  ${sqlStr(r.place_of_occupation)}, ${sqlStr(r.income)},
  ${sqlStr(r.residential_address)}, ${sqlStr(r.native_place)},
  ${sqlStr(r.marital_status)}, ${sqlStr(r.phone_number)}, ${sqlStr(r.remarks)}
)`,
  )
  .join(",\n");

const sql = `
-- avoid duplicates by name+dob for this one-time import
insert into public.people (
  entry_mode, gender, sl_no, name, dob, birth_time, place_of_birth,
  father_name, mother_name, gharana, gotra, nakshatra, rashi, gana,
  height, qualification, occupation, place_of_occupation, income,
  residential_address, native_place, marital_status, phone_number, remarks
)
select * from (values
${values}
) as v(
  entry_mode, gender, sl_no, name, dob, birth_time, place_of_birth,
  father_name, mother_name, gharana, gotra, nakshatra, rashi, gana,
  height, qualification, occupation, place_of_occupation, income,
  residential_address, native_place, marital_status, phone_number, remarks
)
where not exists (
  select 1 from public.people p
  where p.name = v.name and p.dob = v.dob::date
);
`;

writeFileSync(new URL("./import-boys.sql", import.meta.url), sql);
console.log(`Prepared ${mapped.length} rows`);
