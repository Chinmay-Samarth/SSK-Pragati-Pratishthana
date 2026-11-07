export type Gender = "Male" | "Female";
export type EntryMode = "detailed" | "sheet";

export type Person = {
  id: string;
  entry_mode: EntryMode;
  sl_no: string | null;
  name: string;
  dob: string;
  gender: Gender;
  birth_time: string | null;
  place_of_birth: string | null;
  father_name: string | null;
  mother_name: string | null;
  gharana: string | null;
  gotra: string | null;
  nakshatra: string | null;
  rashi: string | null;
  gana: string | null;
  height: string | null;
  qualification: string | null;
  occupation: string | null;
  place_of_occupation: string | null;
  income: string | null;
  residential_address: string | null;
  native_place: string | null;
  marital_status: string | null;
  phone_number: string | null;
  remarks: string | null;
  photo_path: string | null;
  chart_path: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonFolder = {
  gender: Gender;
  year: number;
  count: number;
};
