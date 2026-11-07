import XLSX from "xlsx";

const wb = XLSX.readFile("C:/Users/Admin/Downloads/Matri New Regn.xlsx");
const sheet = wb.Sheets.BOYS;
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
console.log("raw0", raw[0]);
console.log("raw1", raw[1]);
console.log("raw2", raw[2]);

const rows = XLSX.utils.sheet_to_json(sheet, { range: 1, defval: "" });
console.log("keys", Object.keys(rows[0] || {}));
console.log("first", rows[0]);
console.log("dob sample", rows.slice(0, 3).map((r) => r["Date of Birth"]));
