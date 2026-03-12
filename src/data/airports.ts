/* ═══════════════════════════════════════════════════════════════
   Shared Airport & Timezone Data — Single Source of Truth
   Used by flight search, booking, and airport autocomplete
   ═══════════════════════════════════════════════════════════════ */

export interface AirportData {
  code: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  name: string;
  timezone: string;
}

const RAW: Record<string, { c: string; co: string; la: number; lo: number; n: string }> = {
  // United Kingdom
  LHR: { c: "London", co: "United Kingdom", la: 51.47, lo: -0.46, n: "Heathrow" },
  LGW: { c: "London", co: "United Kingdom", la: 51.15, lo: -0.19, n: "Gatwick" },
  STN: { c: "London", co: "United Kingdom", la: 51.89, lo: 0.26, n: "Stansted" },
  MAN: { c: "Manchester", co: "United Kingdom", la: 53.35, lo: -2.27, n: "Manchester" },
  EDI: { c: "Edinburgh", co: "United Kingdom", la: 55.95, lo: -3.37, n: "Edinburgh" },
  BHX: { c: "Birmingham", co: "United Kingdom", la: 52.45, lo: -1.75, n: "Birmingham" },
  // France
  CDG: { c: "Paris", co: "France", la: 49.01, lo: 2.55, n: "Charles de Gaulle" },
  ORY: { c: "Paris", co: "France", la: 48.72, lo: 2.37, n: "Orly" },
  NCE: { c: "Nice", co: "France", la: 43.66, lo: 7.22, n: "Cote d'Azur" },
  LYS: { c: "Lyon", co: "France", la: 45.73, lo: 5.08, n: "Saint-Exupery" },
  MRS: { c: "Marseille", co: "France", la: 43.44, lo: 5.22, n: "Provence" },
  // Netherlands
  AMS: { c: "Amsterdam", co: "Netherlands", la: 52.31, lo: 4.77, n: "Schiphol" },
  // Germany
  FRA: { c: "Frankfurt", co: "Germany", la: 50.03, lo: 8.57, n: "Frankfurt" },
  MUC: { c: "Munich", co: "Germany", la: 48.35, lo: 11.79, n: "Franz Josef Strauss" },
  BER: { c: "Berlin", co: "Germany", la: 52.37, lo: 13.52, n: "Brandenburg" },
  DUS: { c: "Dusseldorf", co: "Germany", la: 51.28, lo: 6.77, n: "Dusseldorf" },
  HAM: { c: "Hamburg", co: "Germany", la: 53.63, lo: 9.99, n: "Hamburg" },
  // Italy
  FCO: { c: "Rome", co: "Italy", la: 41.8, lo: 12.25, n: "Fiumicino" },
  MXP: { c: "Milan", co: "Italy", la: 45.63, lo: 8.72, n: "Malpensa" },
  VCE: { c: "Venice", co: "Italy", la: 45.5, lo: 12.35, n: "Marco Polo" },
  NAP: { c: "Naples", co: "Italy", la: 40.89, lo: 14.29, n: "Capodichino" },
  // Spain
  BCN: { c: "Barcelona", co: "Spain", la: 41.3, lo: 2.08, n: "El Prat" },
  MAD: { c: "Madrid", co: "Spain", la: 40.49, lo: -3.57, n: "Barajas" },
  AGP: { c: "Malaga", co: "Spain", la: 36.67, lo: -4.49, n: "Costa del Sol" },
  PMI: { c: "Palma", co: "Spain", la: 39.55, lo: 2.74, n: "Palma de Mallorca" },
  IBZ: { c: "Ibiza", co: "Spain", la: 38.87, lo: 1.37, n: "Ibiza" },
  // Portugal
  LIS: { c: "Lisbon", co: "Portugal", la: 38.77, lo: -9.13, n: "Humberto Delgado" },
  OPO: { c: "Porto", co: "Portugal", la: 41.24, lo: -8.68, n: "Francisco Sa Carneiro" },
  // Switzerland
  ZRH: { c: "Zurich", co: "Switzerland", la: 47.46, lo: 8.55, n: "Zurich" },
  GVA: { c: "Geneva", co: "Switzerland", la: 46.24, lo: 6.11, n: "Geneva" },
  // Austria, Belgium, Scandinavia, Ireland
  VIE: { c: "Vienna", co: "Austria", la: 48.11, lo: 16.57, n: "Schwechat" },
  BRU: { c: "Brussels", co: "Belgium", la: 50.9, lo: 4.48, n: "Brussels" },
  CPH: { c: "Copenhagen", co: "Denmark", la: 55.62, lo: 12.66, n: "Kastrup" },
  OSL: { c: "Oslo", co: "Norway", la: 60.19, lo: 11.1, n: "Gardermoen" },
  ARN: { c: "Stockholm", co: "Sweden", la: 59.65, lo: 17.94, n: "Arlanda" },
  GOT: { c: "Gothenburg", co: "Sweden", la: 57.66, lo: 12.28, n: "Landvetter" },
  HEL: { c: "Helsinki", co: "Finland", la: 60.32, lo: 24.97, n: "Vantaa" },
  DUB: { c: "Dublin", co: "Ireland", la: 53.42, lo: -6.27, n: "Dublin" },
  // Eastern Europe
  ATH: { c: "Athens", co: "Greece", la: 37.94, lo: 23.94, n: "Eleftherios Venizelos" },
  IST: { c: "Istanbul", co: "Turkey", la: 41.26, lo: 28.74, n: "Istanbul" },
  SAW: { c: "Istanbul", co: "Turkey", la: 40.9, lo: 29.31, n: "Sabiha Gokcen" },
  AYT: { c: "Antalya", co: "Turkey", la: 36.9, lo: 30.8, n: "Antalya" },
  WAW: { c: "Warsaw", co: "Poland", la: 52.17, lo: 20.97, n: "Chopin" },
  PRG: { c: "Prague", co: "Czech Republic", la: 50.1, lo: 14.26, n: "Vaclav Havel" },
  BUD: { c: "Budapest", co: "Hungary", la: 47.44, lo: 19.26, n: "Ferenc Liszt" },
  OTP: { c: "Bucharest", co: "Romania", la: 44.57, lo: 26.09, n: "Henri Coanda" },
  SOF: { c: "Sofia", co: "Bulgaria", la: 42.7, lo: 23.41, n: "Sofia" },
  BEG: { c: "Belgrade", co: "Serbia", la: 44.82, lo: 20.31, n: "Nikola Tesla" },
  ZAG: { c: "Zagreb", co: "Croatia", la: 45.74, lo: 16.07, n: "Franjo Tudman" },
  KEF: { c: "Reykjavik", co: "Iceland", la: 63.99, lo: -22.62, n: "Keflavik" },
  // Middle East
  DXB: { c: "Dubai", co: "UAE", la: 25.25, lo: 55.36, n: "Dubai International" },
  DWC: { c: "Dubai", co: "UAE", la: 24.9, lo: 55.16, n: "Al Maktoum" },
  AUH: { c: "Abu Dhabi", co: "UAE", la: 24.43, lo: 54.65, n: "Zayed International" },
  DOH: { c: "Doha", co: "Qatar", la: 25.27, lo: 51.61, n: "Hamad" },
  BAH: { c: "Bahrain", co: "Bahrain", la: 26.27, lo: 50.63, n: "Bahrain International" },
  RUH: { c: "Riyadh", co: "Saudi Arabia", la: 24.96, lo: 46.7, n: "King Khalid" },
  JED: { c: "Jeddah", co: "Saudi Arabia", la: 21.67, lo: 39.16, n: "King Abdulaziz" },
  MCT: { c: "Muscat", co: "Oman", la: 23.59, lo: 58.28, n: "Muscat International" },
  KWI: { c: "Kuwait", co: "Kuwait", la: 29.23, lo: 47.97, n: "Kuwait International" },
  AMM: { c: "Amman", co: "Jordan", la: 31.72, lo: 35.99, n: "Queen Alia" },
  BEY: { c: "Beirut", co: "Lebanon", la: 33.82, lo: 35.49, n: "Rafic Hariri" },
  TLV: { c: "Tel Aviv", co: "Israel", la: 32.01, lo: 34.89, n: "Ben Gurion" },
  // USA Major
  JFK: { c: "New York", co: "USA", la: 40.64, lo: -73.78, n: "John F Kennedy" },
  EWR: { c: "Newark", co: "USA", la: 40.69, lo: -74.17, n: "Newark Liberty" },
  TEB: { c: "New York", co: "USA", la: 40.85, lo: -74.06, n: "Teterboro" },
  LAX: { c: "Los Angeles", co: "USA", la: 33.94, lo: -118.41, n: "LAX" },
  VNY: { c: "Los Angeles", co: "USA", la: 34.21, lo: -118.49, n: "Van Nuys" },
  SFO: { c: "San Francisco", co: "USA", la: 37.62, lo: -122.38, n: "SFO" },
  MIA: { c: "Miami", co: "USA", la: 25.79, lo: -80.29, n: "Miami International" },
  OPF: { c: "Miami", co: "USA", la: 25.91, lo: -80.28, n: "Opa-Locka Executive" },
  ORD: { c: "Chicago", co: "USA", la: 41.97, lo: -87.91, n: "O'Hare" },
  ATL: { c: "Atlanta", co: "USA", la: 33.64, lo: -84.43, n: "Hartsfield-Jackson" },
  DFW: { c: "Dallas", co: "USA", la: 32.9, lo: -97.04, n: "Dallas/Fort Worth" },
  IAH: { c: "Houston", co: "USA", la: 29.99, lo: -95.34, n: "George Bush" },
  IAD: { c: "Washington DC", co: "USA", la: 38.95, lo: -77.46, n: "Dulles" },
  BOS: { c: "Boston", co: "USA", la: 42.36, lo: -71.01, n: "Logan" },
  SEA: { c: "Seattle", co: "USA", la: 47.45, lo: -122.31, n: "Sea-Tac" },
  DEN: { c: "Denver", co: "USA", la: 39.86, lo: -104.67, n: "Denver International" },
  PHX: { c: "Phoenix", co: "USA", la: 33.44, lo: -112.01, n: "Sky Harbor" },
  LAS: { c: "Las Vegas", co: "USA", la: 36.08, lo: -115.15, n: "Harry Reid" },
  MSP: { c: "Minneapolis", co: "USA", la: 44.88, lo: -93.22, n: "MSP" },
  MCO: { c: "Orlando", co: "USA", la: 28.43, lo: -81.31, n: "Orlando International" },
  HNL: { c: "Honolulu", co: "USA", la: 21.32, lo: -157.92, n: "Daniel K. Inouye" },
  // Michigan
  DTW: { c: "Detroit", co: "USA", la: 42.21, lo: -83.35, n: "Detroit Metro" },
  MQT: { c: "Marquette", co: "USA", la: 46.3536, lo: -87.3953, n: "Sawyer International" },
  GRR: { c: "Grand Rapids", co: "USA", la: 42.8808, lo: -85.5228, n: "Gerald R. Ford International" },
  FNT: { c: "Flint", co: "USA", la: 42.9654, lo: -83.7436, n: "Bishop International" },
  LAN: { c: "Lansing", co: "USA", la: 42.7787, lo: -84.5874, n: "Capital Region International" },
  MBS: { c: "Saginaw", co: "USA", la: 43.5329, lo: -84.0796, n: "MBS International" },
  AZO: { c: "Kalamazoo", co: "USA", la: 42.235, lo: -85.5521, n: "Kalamazoo Battle Creek International" },
  TVC: { c: "Traverse City", co: "USA", la: 44.7414, lo: -85.5822, n: "Cherry Capital" },
  MKG: { c: "Muskegon", co: "USA", la: 43.1695, lo: -86.2382, n: "Muskegon County" },
  PLN: { c: "Pellston", co: "USA", la: 45.5709, lo: -84.7967, n: "Pellston Regional" },
  CIU: { c: "Sault Ste. Marie", co: "USA", la: 46.2508, lo: -84.4724, n: "Chippewa County International" },
  ESC: { c: "Escanaba", co: "USA", la: 45.7227, lo: -87.0937, n: "Delta County" },
  IMT: { c: "Iron Mountain", co: "USA", la: 45.8184, lo: -88.1146, n: "Ford Airport" },
  APN: { c: "Alpena", co: "USA", la: 45.0781, lo: -83.5603, n: "Alpena County Regional" },
  CMX: { c: "Hancock", co: "USA", la: 47.1684, lo: -88.4891, n: "Houghton County Memorial" },
  IWD: { c: "Ironwood", co: "USA", la: 46.5275, lo: -90.1314, n: "Gogebic-Iron County" },
  MBL: { c: "Manistee", co: "USA", la: 44.2725, lo: -86.2469, n: "Manistee County Blacker" },
  ISW: { c: "Woodruff", co: "USA", la: 45.9293, lo: -89.841, n: "Sawyer County" },
  // Canada
  YYZ: { c: "Toronto", co: "Canada", la: 43.68, lo: -79.63, n: "Pearson" },
  YVR: { c: "Vancouver", co: "Canada", la: 49.19, lo: -123.18, n: "Vancouver" },
  YUL: { c: "Montreal", co: "Canada", la: 45.47, lo: -73.74, n: "Trudeau" },
  // Mexico & Caribbean
  MEX: { c: "Mexico City", co: "Mexico", la: 19.44, lo: -99.07, n: "Benito Juarez" },
  CUN: { c: "Cancun", co: "Mexico", la: 21.04, lo: -86.87, n: "Cancun International" },
  NAS: { c: "Nassau", co: "Bahamas", la: 25.04, lo: -77.47, n: "Lynden Pindling" },
  // Asia - Japan
  NRT: { c: "Tokyo", co: "Japan", la: 35.76, lo: 140.39, n: "Narita" },
  HND: { c: "Tokyo", co: "Japan", la: 35.55, lo: 139.78, n: "Haneda" },
  KIX: { c: "Osaka", co: "Japan", la: 34.43, lo: 135.24, n: "Kansai" },
  // Asia - Southeast
  SIN: { c: "Singapore", co: "Singapore", la: 1.35, lo: 103.99, n: "Changi" },
  BKK: { c: "Bangkok", co: "Thailand", la: 13.69, lo: 100.75, n: "Suvarnabhumi" },
  KUL: { c: "Kuala Lumpur", co: "Malaysia", la: 2.75, lo: 101.71, n: "KLIA" },
  CGK: { c: "Jakarta", co: "Indonesia", la: -6.13, lo: 106.66, n: "Soekarno-Hatta" },
  DPS: { c: "Bali", co: "Indonesia", la: -8.75, lo: 115.17, n: "Ngurah Rai" },
  MNL: { c: "Manila", co: "Philippines", la: 14.51, lo: 121.02, n: "Ninoy Aquino" },
  SGN: { c: "Ho Chi Minh City", co: "Vietnam", la: 10.82, lo: 106.65, n: "Tan Son Nhat" },
  HAN: { c: "Hanoi", co: "Vietnam", la: 21.22, lo: 105.81, n: "Noi Bai" },
  // Asia - East
  HKG: { c: "Hong Kong", co: "Hong Kong", la: 22.31, lo: 113.91, n: "Chek Lap Kok" },
  ICN: { c: "Seoul", co: "South Korea", la: 37.46, lo: 126.44, n: "Incheon" },
  PEK: { c: "Beijing", co: "China", la: 40.08, lo: 116.58, n: "Capital International" },
  PVG: { c: "Shanghai", co: "China", la: 31.14, lo: 121.81, n: "Pudong" },
  CAN: { c: "Guangzhou", co: "China", la: 23.39, lo: 113.3, n: "Baiyun" },
  TPE: { c: "Taipei", co: "Taiwan", la: 25.08, lo: 121.23, n: "Taoyuan" },
  // South Asia
  BOM: { c: "Mumbai", co: "India", la: 19.09, lo: 72.87, n: "Chhatrapati Shivaji" },
  DEL: { c: "Delhi", co: "India", la: 28.56, lo: 77.1, n: "Indira Gandhi" },
  BLR: { c: "Bangalore", co: "India", la: 13.2, lo: 77.71, n: "Kempegowda" },
  CMB: { c: "Colombo", co: "Sri Lanka", la: 7.18, lo: 79.88, n: "Bandaranaike" },
  KTM: { c: "Kathmandu", co: "Nepal", la: 27.7, lo: 85.36, n: "Tribhuvan" },
  DAC: { c: "Dhaka", co: "Bangladesh", la: 23.84, lo: 90.4, n: "Hazrat Shahjalal" },
  ISB: { c: "Islamabad", co: "Pakistan", la: 33.62, lo: 72.83, n: "Islamabad International" },
  KHI: { c: "Karachi", co: "Pakistan", la: 24.91, lo: 67.16, n: "Jinnah" },
  MLE: { c: "Male", co: "Maldives", la: 4.19, lo: 73.53, n: "Velana" },
  // Africa
  JNB: { c: "Johannesburg", co: "South Africa", la: -26.14, lo: 28.24, n: "OR Tambo" },
  CPT: { c: "Cape Town", co: "South Africa", la: -33.97, lo: 18.6, n: "Cape Town International" },
  NBO: { c: "Nairobi", co: "Kenya", la: -1.32, lo: 36.93, n: "Jomo Kenyatta" },
  LOS: { c: "Lagos", co: "Nigeria", la: 6.58, lo: 3.32, n: "Murtala Muhammed" },
  ACC: { c: "Accra", co: "Ghana", la: 5.61, lo: -0.17, n: "Kotoka" },
  CAI: { c: "Cairo", co: "Egypt", la: 30.12, lo: 31.41, n: "Cairo International" },
  CMN: { c: "Casablanca", co: "Morocco", la: 33.37, lo: -7.59, n: "Mohammed V" },
  ADD: { c: "Addis Ababa", co: "Ethiopia", la: 8.98, lo: 38.8, n: "Bole" },
  DAR: { c: "Dar es Salaam", co: "Tanzania", la: -6.88, lo: 39.2, n: "Julius Nyerere" },
  MRU: { c: "Mauritius", co: "Mauritius", la: -20.43, lo: 57.68, n: "SSR International" },
  SEZ: { c: "Mahe", co: "Seychelles", la: -4.67, lo: 55.52, n: "Seychelles International" },
  // South America
  GRU: { c: "Sao Paulo", co: "Brazil", la: -23.43, lo: -46.47, n: "Guarulhos" },
  GIG: { c: "Rio de Janeiro", co: "Brazil", la: -22.81, lo: -43.25, n: "Galeao" },
  EZE: { c: "Buenos Aires", co: "Argentina", la: -34.82, lo: -58.54, n: "Ezeiza" },
  BOG: { c: "Bogota", co: "Colombia", la: 4.7, lo: -74.15, n: "El Dorado" },
  SCL: { c: "Santiago", co: "Chile", la: -33.39, lo: -70.79, n: "Arturo Merino" },
  LIM: { c: "Lima", co: "Peru", la: -12.02, lo: -77.11, n: "Jorge Chavez" },
  // Oceania
  SYD: { c: "Sydney", co: "Australia", la: -33.95, lo: 151.18, n: "Kingsford Smith" },
  MEL: { c: "Melbourne", co: "Australia", la: -37.67, lo: 144.84, n: "Tullamarine" },
  BNE: { c: "Brisbane", co: "Australia", la: -27.38, lo: 153.12, n: "Brisbane" },
  PER: { c: "Perth", co: "Australia", la: -31.94, lo: 115.97, n: "Perth" },
  AKL: { c: "Auckland", co: "New Zealand", la: -36.85, lo: 174.76, n: "Auckland" },
  NAN: { c: "Nadi", co: "Fiji", la: -17.76, lo: 177.44, n: "Nadi International" },
};

const TIMEZONES: Record<string, string> = {
  LHR: "Europe/London", LGW: "Europe/London", STN: "Europe/London", MAN: "Europe/London", EDI: "Europe/London", BHX: "Europe/London",
  CDG: "Europe/Paris", ORY: "Europe/Paris", NCE: "Europe/Paris", LYS: "Europe/Paris", MRS: "Europe/Paris",
  AMS: "Europe/Amsterdam",
  FRA: "Europe/Berlin", MUC: "Europe/Berlin", BER: "Europe/Berlin", DUS: "Europe/Berlin", HAM: "Europe/Berlin",
  FCO: "Europe/Rome", MXP: "Europe/Rome", VCE: "Europe/Rome", NAP: "Europe/Rome",
  BCN: "Europe/Madrid", MAD: "Europe/Madrid", AGP: "Europe/Madrid", PMI: "Europe/Madrid", IBZ: "Europe/Madrid",
  LIS: "Europe/Lisbon", OPO: "Europe/Lisbon",
  ZRH: "Europe/Zurich", GVA: "Europe/Zurich",
  VIE: "Europe/Vienna", BRU: "Europe/Brussels",
  CPH: "Europe/Copenhagen", OSL: "Europe/Oslo", ARN: "Europe/Stockholm", GOT: "Europe/Stockholm", HEL: "Europe/Helsinki",
  DUB: "Europe/Dublin", ATH: "Europe/Athens",
  IST: "Europe/Istanbul", SAW: "Europe/Istanbul", AYT: "Europe/Istanbul",
  WAW: "Europe/Warsaw", PRG: "Europe/Prague", BUD: "Europe/Budapest",
  OTP: "Europe/Bucharest", SOF: "Europe/Sofia", BEG: "Europe/Belgrade", ZAG: "Europe/Zagreb",
  KEF: "Atlantic/Reykjavik",
  DXB: "Asia/Dubai", DWC: "Asia/Dubai", AUH: "Asia/Dubai",
  DOH: "Asia/Qatar", BAH: "Asia/Bahrain",
  RUH: "Asia/Riyadh", JED: "Asia/Riyadh", MCT: "Asia/Muscat", KWI: "Asia/Kuwait",
  AMM: "Asia/Amman", BEY: "Asia/Beirut", TLV: "Asia/Jerusalem",
  JFK: "America/New_York", EWR: "America/New_York", TEB: "America/New_York",
  LAX: "America/Los_Angeles", VNY: "America/Los_Angeles", SFO: "America/Los_Angeles", SEA: "America/Los_Angeles", LAS: "America/Los_Angeles",
  MIA: "America/New_York", OPF: "America/New_York", ATL: "America/New_York", MCO: "America/New_York", BOS: "America/New_York",
  ORD: "America/Chicago", DFW: "America/Chicago", IAH: "America/Chicago", MSP: "America/Chicago",
  IAD: "America/New_York", DTW: "America/New_York", DEN: "America/Denver", PHX: "America/Phoenix",
  MQT: "America/Detroit", GRR: "America/Detroit", FNT: "America/Detroit", LAN: "America/Detroit",
  MBS: "America/Detroit", AZO: "America/Detroit", TVC: "America/Detroit", MKG: "America/Detroit",
  PLN: "America/Detroit", CIU: "America/Detroit", ESC: "America/Detroit", IMT: "America/Chicago",
  APN: "America/Detroit", CMX: "America/Detroit", IWD: "America/Chicago", MBL: "America/Detroit",
  ISW: "America/Chicago",
  HNL: "Pacific/Honolulu",
  YYZ: "America/Toronto", YVR: "America/Vancouver", YUL: "America/Montreal",
  MEX: "America/Mexico_City", CUN: "America/Cancun",
  NRT: "Asia/Tokyo", HND: "Asia/Tokyo", KIX: "Asia/Tokyo",
  SIN: "Asia/Singapore", HKG: "Asia/Hong_Kong", ICN: "Asia/Seoul",
  BKK: "Asia/Bangkok", KUL: "Asia/Kuala_Lumpur",
  CGK: "Asia/Jakarta", DPS: "Asia/Makassar",
  MNL: "Asia/Manila", SGN: "Asia/Ho_Chi_Minh", HAN: "Asia/Ho_Chi_Minh",
  PEK: "Asia/Shanghai", PVG: "Asia/Shanghai", CAN: "Asia/Shanghai", TPE: "Asia/Taipei",
  BOM: "Asia/Kolkata", DEL: "Asia/Kolkata", BLR: "Asia/Kolkata",
  CMB: "Asia/Colombo", KTM: "Asia/Kathmandu", DAC: "Asia/Dhaka",
  ISB: "Asia/Karachi", KHI: "Asia/Karachi", MLE: "Indian/Maldives",
  JNB: "Africa/Johannesburg", CPT: "Africa/Johannesburg",
  NBO: "Africa/Nairobi", LOS: "Africa/Lagos", ACC: "Africa/Accra",
  CAI: "Africa/Cairo", CMN: "Africa/Casablanca", ADD: "Africa/Addis_Ababa",
  DAR: "Africa/Dar_es_Salaam", MRU: "Indian/Mauritius", SEZ: "Indian/Mahe",
  NAS: "America/Nassau",
  GRU: "America/Sao_Paulo", GIG: "America/Sao_Paulo",
  EZE: "America/Argentina/Buenos_Aires", BOG: "America/Bogota",
  SCL: "America/Santiago", LIM: "America/Lima",
  SYD: "Australia/Sydney", MEL: "Australia/Melbourne", BNE: "Australia/Brisbane", PER: "Australia/Perth",
  AKL: "Pacific/Auckland", NAN: "Pacific/Fiji",
};

/** Short-form accessors (backward compat with existing route code) */
export const AP = RAW;
export const TZ = TIMEZONES;

/** Get full airport data by IATA code */
export function getAirport(code: string): AirportData | null {
  const raw = RAW[code.toUpperCase()];
  if (!raw) return null;
  return {
    code: code.toUpperCase(),
    city: raw.c,
    country: raw.co,
    lat: raw.la,
    lng: raw.lo,
    name: raw.n,
    timezone: TIMEZONES[code.toUpperCase()] || "UTC",
  };
}

/** Search airports by query (code, city, country, or name) */
export function searchAirports(query: string, limit = 20): AirportData[] {
  const q = query.toLowerCase();
  const results: AirportData[] = [];
  for (const [code, raw] of Object.entries(RAW)) {
    if (
      code.toLowerCase().includes(q) ||
      raw.c.toLowerCase().includes(q) ||
      raw.co.toLowerCase().includes(q) ||
      raw.n.toLowerCase().includes(q)
    ) {
      results.push({
        code,
        city: raw.c,
        country: raw.co,
        lat: raw.la,
        lng: raw.lo,
        name: raw.n,
        timezone: TIMEZONES[code] || "UTC",
      });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/** Haversine distance between two airports in nautical miles */
export function distanceNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.539957);
}

/** Get all airport codes */
export function getAllAirportCodes(): string[] {
  return Object.keys(RAW);
}
