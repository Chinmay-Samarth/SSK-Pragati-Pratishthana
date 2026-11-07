insert into public.people (
  entry_mode, gender, sl_no, name, dob, birth_time, place_of_birth,
  father_name, mother_name, gharana, gotra, nakshatra, rashi, gana,
  height, qualification, occupation, place_of_occupation, income,
  residential_address, native_place, marital_status, phone_number, remarks
)
select
  entry_mode, gender, sl_no, name, dob::date, birth_time, place_of_birth,
  father_name, mother_name, gharana, gotra, nakshatra, rashi, gana,
  height, qualification, occupation, place_of_occupation, income,
  residential_address, native_place, marital_status, phone_number, remarks
from (values
(
  'detailed', 'Male',
  '599', 'RAJESH CHOUHAN', '1992-09-17',
  '8.50 AM', 'Sangareddy',
  'Suryaprakash', 'Anita',
  'Chowhan', 'Vasishta', 'Krutika3',
  'Vrushabha', 'Rakhasa', '5.8',
  'M.Tech', 'Software Engineer',
  'Ujjivana Finance, Bangalore', '15L/A',
  'Flat S4, VR Appartments, Nobo Nagar, Bangalore', 'Bhavani Nagar, Sangareddy, Telangana',
  'Single', null::text, null::text
),
(
  'detailed', 'Male',
  '575', 'NITIN KS', '1998-06-08',
  '1.00 PM', 'Bangalore',
  'Srinivasa (L)', 'Kamala',
  'Khodays', 'Parashara', 'Vishaka-4',
  'Vrischika', 'Rakhasa', '5.7',
  'B.Com', 'Adv Tax Analyst',
  'E & Y (MNC), Bangalore', '55K',
  'Andhra Halli, Magadi Road, Bangalore, (Own)', null,
  'Single', '8150019756   9880014068', null
),
(
  'detailed', 'Male',
  '574', 'RAGHUVEER KS', '1993-01-16',
  '10.08 AM', 'Bangalore',
  'Srinivasa (L)', 'Kamala',
  'Khodays', 'Parashara', 'Swati-3',
  'Tula', 'Deva', '5.7',
  'B.Com', 'Sr Tax Analyst',
  'Diageo (MNC),  Bangalore', '70K',
  'Andhra Halli, Magadi Road, Bangalore, (Own)', null,
  'Single', '8150019756   9880014068', null
),
(
  'detailed', 'Male',
  '447', 'SHREYAS', '2003-11-28',
  '9.00 PM', 'Bangalore',
  'Satish MS', 'Roopa',
  'Magaji', 'Parashara', 'Shravana',
  'Makara', null, '5.9',
  'SSLC', 'Own Business',
  null, '1 L/m',
  'Park west, Binnypet', 'Bangalore',
  'Unmarried', '9945691744', null
),
(
  'detailed', 'Male',
  '539', 'PAVAN KUMAR SS', '2002-03-01',
  '6.52 AM', 'Bangalore',
  '(Late) Satyanarayan S R', 'Susheela',
  'Sulegai', 'Goutama', 'Hasta-1',
  'Kanya', 'Deva', '5.3',
  'Dip Physiotherapy', 'Event Manager, Digital Marketing',
  'Bangalore', '80K + 1.2L rental ',
  'Gandhi Bazar, Bangalore', 'Bangalore',
  'Unmarried', null, null
),
(
  'detailed', 'Male',
  '569', 'MARUTHI', '1992-06-04',
  '12.30PM', 'Bangalore',
  'Meghraj', 'Anita',
  'Merwade', 'Jamadagni', 'Punarvasu-4',
  'Karkataka', 'Deva', '5.6',
  'Diploma Civil Engg', 'Project Manager, Infinity Green',
  'Bangalore', '14L/A',
  'Wilson Garden, Bangalore', 'Bangalore',
  'Unmarried', '9731719190', null
)
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
