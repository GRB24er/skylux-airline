import mongoose from "mongoose";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://goodnews123er:uwsaRZdpRbC4xVFQ@love.rwdzi0p.mongodb.net/skylux-airways?appName=Love";

async function run() {
  console.log("\n🚀 SKYLUX Airways — Full Global Network Population\n");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("✅ Connected to MongoDB\n");
  const db = mongoose.connection.db!;

  // WIPE
  console.log("🗑  Clearing old data...");
  await db.collection("flights").deleteMany({});
  await db.collection("aircrafts").deleteMany({});
  // Drop old indexes that might conflict
  try { await db.collection("flights").dropIndexes(); } catch(e) {}
  try { await db.collection("aircrafts").dropIndexes(); } catch(e) {}

  // ═══ AIRCRAFT ═══
  const aircraftDocs = [
    { name:"Boeing 787-9 Dreamliner", manufacturer:"Boeing", model:"787-9", type:"commercial", category:"commercial-widebody", registration:"SX-789-01", homeBase:"LHR", yearManufactured:2022, totalFlightHours:8420, specs:{maxPassengers:290,maxRange:7635,cruiseSpeed:490,ceilingAltitude:43000}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","First Class Suite"], hourlyRate:8500, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Boeing 787-9 Dreamliner II", manufacturer:"Boeing", model:"787-9", type:"commercial", category:"commercial-widebody", registration:"SX-789-02", homeBase:"JFK", yearManufactured:2023, totalFlightHours:4100, specs:{maxPassengers:290,maxRange:7635,cruiseSpeed:490,ceilingAltitude:43000}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","First Class Suite"], hourlyRate:8500, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Boeing 787-9 Dreamliner III", manufacturer:"Boeing", model:"787-9", type:"commercial", category:"commercial-widebody", registration:"SX-789-03", homeBase:"DXB", yearManufactured:2024, totalFlightHours:1200, specs:{maxPassengers:290,maxRange:7635,cruiseSpeed:490,ceilingAltitude:43000}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","First Class Suite"], hourlyRate:8500, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Airbus A350-900", manufacturer:"Airbus", model:"A350-900", type:"commercial", category:"commercial-widebody", registration:"SX-350-01", homeBase:"LHR", yearManufactured:2023, totalFlightHours:5200, specs:{maxPassengers:315,maxRange:8100,cruiseSpeed:488,ceilingAltitude:43100}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","Premium Economy"], hourlyRate:9200, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Airbus A350-900 II", manufacturer:"Airbus", model:"A350-900", type:"commercial", category:"commercial-widebody", registration:"SX-350-02", homeBase:"SIN", yearManufactured:2024, totalFlightHours:2800, specs:{maxPassengers:315,maxRange:8100,cruiseSpeed:488,ceilingAltitude:43100}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","Premium Economy"], hourlyRate:9200, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Boeing 777-300ER", manufacturer:"Boeing", model:"777-300ER", type:"commercial", category:"commercial-widebody", registration:"SX-773-01", homeBase:"DXB", yearManufactured:2020, totalFlightHours:14300, specs:{maxPassengers:396,maxRange:7370,cruiseSpeed:490,ceilingAltitude:43100}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","First Class Suite","Onboard Lounge"], hourlyRate:11000, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Boeing 777-300ER II", manufacturer:"Boeing", model:"777-300ER", type:"commercial", category:"commercial-widebody", registration:"SX-773-02", homeBase:"JFK", yearManufactured:2021, totalFlightHours:11200, specs:{maxPassengers:396,maxRange:7370,cruiseSpeed:490,ceilingAltitude:43100}, amenities:["Wi-Fi","IFE","USB Charging","Lie-Flat Business","First Class Suite","Onboard Lounge"], hourlyRate:11000, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Airbus A321neo", manufacturer:"Airbus", model:"A321neo", type:"commercial", category:"commercial-narrowbody", registration:"SX-321-01", homeBase:"LHR", yearManufactured:2024, totalFlightHours:1800, specs:{maxPassengers:220,maxRange:4000,cruiseSpeed:450,ceilingAltitude:39800}, amenities:["Wi-Fi","USB Charging","Streaming IFE","Meal Service"], hourlyRate:4800, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Airbus A321neo II", manufacturer:"Airbus", model:"A321neo", type:"commercial", category:"commercial-narrowbody", registration:"SX-321-02", homeBase:"DXB", yearManufactured:2024, totalFlightHours:900, specs:{maxPassengers:220,maxRange:4000,cruiseSpeed:450,ceilingAltitude:39800}, amenities:["Wi-Fi","USB Charging","Streaming IFE","Meal Service"], hourlyRate:4800, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Airbus A321neo III", manufacturer:"Airbus", model:"A321neo", type:"commercial", category:"commercial-narrowbody", registration:"SX-321-03", homeBase:"JFK", yearManufactured:2025, totalFlightHours:300, specs:{maxPassengers:220,maxRange:4000,cruiseSpeed:450,ceilingAltitude:39800}, amenities:["Wi-Fi","USB Charging","Streaming IFE","Meal Service"], hourlyRate:4800, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Gulfstream G700", manufacturer:"Gulfstream", model:"G700", type:"private-jet", category:"ultra-long-range", registration:"SX-G700-01", homeBase:"LHR", yearManufactured:2024, totalFlightHours:620, specs:{maxPassengers:19,maxRange:7500,cruiseSpeed:516,ceilingAltitude:51000,cabinWidth:2.49,cabinLength:17.35,cabinHeight:1.88,baggageCapacity:5}, amenities:["Full Catering","Satellite Wi-Fi","Satellite Phone","Master Bedroom","Conference Suite","Personal Butler","Entertainment System"], hourlyRate:12500, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
    { name:"Bombardier Global 7500", manufacturer:"Bombardier", model:"Global 7500", type:"private-jet", category:"ultra-long-range", registration:"SX-G75-01", homeBase:"DXB", yearManufactured:2023, totalFlightHours:980, specs:{maxPassengers:17,maxRange:7700,cruiseSpeed:516,ceilingAltitude:51000,cabinWidth:2.44,cabinLength:16.72,cabinHeight:1.88,baggageCapacity:5}, amenities:["Full Catering","Satellite Wi-Fi","Satellite Phone","Master Bedroom","Kitchen Suite","Personal Butler","Shower"], hourlyRate:11800, status:"active", isAvailable:true, images:[], seatConfiguration:[], createdAt:new Date(), updatedAt:new Date() },
  ];

  const acResult = await db.collection("aircrafts").insertMany(aircraftDocs);
  const a = Object.values(acResult.insertedIds);
  const [B789,B789B,B789C,A350,A350B,B777,B777B,A321,A321B,A321C,G700,G750] = a;
  console.log(`✅ ${a.length} aircraft inserted\n`);

  // ═══ AIRPORTS ═══
  const AP: Record<string, {city:string,country:string,airport:string,terminal:string}> = {
    // UK
    LHR: {city:"London",country:"United Kingdom",airport:"Heathrow Airport",terminal:"T5"},
    LGW: {city:"London",country:"United Kingdom",airport:"Gatwick Airport",terminal:"S"},
    MAN: {city:"Manchester",country:"United Kingdom",airport:"Manchester Airport",terminal:"T2"},
    // Europe
    CDG: {city:"Paris",country:"France",airport:"Charles de Gaulle",terminal:"T2E"},
    FCO: {city:"Rome",country:"Italy",airport:"Fiumicino Airport",terminal:"T3"},
    BCN: {city:"Barcelona",country:"Spain",airport:"El Prat Airport",terminal:"T1"},
    AMS: {city:"Amsterdam",country:"Netherlands",airport:"Schiphol Airport",terminal:"T1"},
    FRA: {city:"Frankfurt",country:"Germany",airport:"Frankfurt Airport",terminal:"T1"},
    ZRH: {city:"Zurich",country:"Switzerland",airport:"Zurich Airport",terminal:"T1"},
    IST: {city:"Istanbul",country:"Turkey",airport:"Istanbul Airport",terminal:"T1"},
    ATH: {city:"Athens",country:"Greece",airport:"Eleftherios Venizelos",terminal:"T1"},
    // USA
    JFK: {city:"New York",country:"United States",airport:"John F Kennedy International",terminal:"T7"},
    LAX: {city:"Los Angeles",country:"United States",airport:"Los Angeles International",terminal:"TBIT"},
    MIA: {city:"Miami",country:"United States",airport:"Miami International",terminal:"N"},
    ORD: {city:"Chicago",country:"United States",airport:"O'Hare International",terminal:"T5"},
    ATL: {city:"Atlanta",country:"United States",airport:"Hartsfield-Jackson International",terminal:"F"},
    SFO: {city:"San Francisco",country:"United States",airport:"San Francisco International",terminal:"TI"},
    IAD: {city:"Washington DC",country:"United States",airport:"Dulles International",terminal:"T1"},
    DFW: {city:"Dallas",country:"United States",airport:"Dallas/Fort Worth International",terminal:"D"},
    BOS: {city:"Boston",country:"United States",airport:"Logan International",terminal:"E"},
    // Canada
    YYZ: {city:"Toronto",country:"Canada",airport:"Pearson International",terminal:"T1"},
    // Middle East
    DXB: {city:"Dubai",country:"UAE",airport:"Dubai International",terminal:"T3"},
    DOH: {city:"Doha",country:"Qatar",airport:"Hamad International",terminal:"T1"},
    BAH: {city:"Bahrain",country:"Bahrain",airport:"Bahrain International",terminal:"T1"},
    RUH: {city:"Riyadh",country:"Saudi Arabia",airport:"King Khalid International",terminal:"T5"},
    MCT: {city:"Muscat",country:"Oman",airport:"Muscat International",terminal:"T1"},
    CAI: {city:"Cairo",country:"Egypt",airport:"Cairo International",terminal:"T3"},
    // Asia
    NRT: {city:"Tokyo",country:"Japan",airport:"Narita International",terminal:"T2"},
    SIN: {city:"Singapore",country:"Singapore",airport:"Changi Airport",terminal:"T1"},
    HKG: {city:"Hong Kong",country:"Hong Kong",airport:"Chek Lap Kok",terminal:"T1"},
    ICN: {city:"Seoul",country:"South Korea",airport:"Incheon International",terminal:"T2"},
    BKK: {city:"Bangkok",country:"Thailand",airport:"Suvarnabhumi Airport",terminal:"T1"},
    BOM: {city:"Mumbai",country:"India",airport:"Chhatrapati Shivaji International",terminal:"T2"},
    DEL: {city:"Delhi",country:"India",airport:"Indira Gandhi International",terminal:"T3"},
    KUL: {city:"Kuala Lumpur",country:"Malaysia",airport:"KL International",terminal:"KLIA"},
    PEK: {city:"Beijing",country:"China",airport:"Capital International",terminal:"T3"},
    // Africa
    JNB: {city:"Johannesburg",country:"South Africa",airport:"OR Tambo International",terminal:"T1"},
    CPT: {city:"Cape Town",country:"South Africa",airport:"Cape Town International",terminal:"T1"},
    NBO: {city:"Nairobi",country:"Kenya",airport:"Jomo Kenyatta International",terminal:"T1"},
    LOS: {city:"Lagos",country:"Nigeria",airport:"Murtala Muhammed International",terminal:"T2"},
    ACC: {city:"Accra",country:"Ghana",airport:"Kotoka International",terminal:"T3"},
    // Oceania
    SYD: {city:"Sydney",country:"Australia",airport:"Kingsford Smith Airport",terminal:"T1"},
    MEL: {city:"Melbourne",country:"Australia",airport:"Melbourne Airport",terminal:"T2"},
    AKL: {city:"Auckland",country:"New Zealand",airport:"Auckland Airport",terminal:"TI"},
    MLE: {city:"Malé",country:"Maldives",airport:"Velana International",terminal:"T1"},
    // South America
    GRU: {city:"São Paulo",country:"Brazil",airport:"Guarulhos International",terminal:"T3"},
    EZE: {city:"Buenos Aires",country:"Argentina",airport:"Ministro Pistarini",terminal:"T1"},
    BOG: {city:"Bogotá",country:"Colombia",airport:"El Dorado International",terminal:"T1"},
    SCL: {city:"Santiago",country:"Chile",airport:"Arturo Merino Benítez",terminal:"T1"},
    // Caribbean
    NAS: {city:"Nassau",country:"Bahamas",airport:"Lynden Pindling International",terminal:"T1"},
    // Private jet airports
    TEB: {city:"New York",country:"United States",airport:"Teterboro Airport",terminal:"VIP"},
    VNY: {city:"Los Angeles",country:"United States",airport:"Van Nuys Airport",terminal:"VIP"},
    OPF: {city:"Miami",country:"United States",airport:"Opa-Locka Executive",terminal:"VIP"},
    NCE: {city:"Nice",country:"France",airport:"Côte d'Azur Airport",terminal:"VIP"},
    MXP: {city:"Milan",country:"Italy",airport:"Malpensa Airport",terminal:"VIP"},
    IBZ: {city:"Ibiza",country:"Spain",airport:"Ibiza Airport",terminal:"VIP"},
    GVA: {city:"Geneva",country:"Switzerland",airport:"Geneva Airport",terminal:"VIP"},
    DWC: {city:"Dubai",country:"UAE",airport:"Al Maktoum International",terminal:"VIP"},
    LAS: {city:"Las Vegas",country:"United States",airport:"Henderson Executive",terminal:"VIP"},
  };

  // ═══ ROUTE DEFINITIONS ═══
  // [from, to, aircraft, type, duration, distance, stops, eco, prem, biz, first, depHour, flightNumBase, daysOfWeek]
  // daysOfWeek: 0=daily, [1,3,5]=Mon/Wed/Fri, etc.
  type Route = [string,string,any,string,number,number,number,number,number,number,number,number,string,number[]];

  const routes: Route[] = [
    // ══════ EUROPE SHORT-HAUL (A321neo from LHR) ══════
    ["LHR","CDG",A321,"commercial",80,190,0,89,210,580,0,7,"SX 1",[0]],        // daily
    ["CDG","LHR",A321,"commercial",80,190,0,89,210,580,0,18,"SX 2",[0]],
    ["LHR","AMS",A321,"commercial",75,200,0,95,230,620,0,7,"SX 3",[0]],
    ["AMS","LHR",A321,"commercial",75,200,0,95,230,620,0,19,"SX 4",[0]],
    ["LHR","FCO",A321,"commercial",155,890,0,145,380,920,0,8,"SX 5",[0]],
    ["FCO","LHR",A321,"commercial",155,890,0,145,380,920,0,16,"SX 6",[0]],
    ["LHR","BCN",A321,"commercial",140,712,0,125,340,810,0,11,"SX 7",[1,3,5,7]],
    ["BCN","LHR",A321,"commercial",140,712,0,125,340,810,0,7,"SX 8",[2,4,6,1]],
    ["LHR","FRA",A321,"commercial",100,395,0,110,270,680,0,6,"SX 9",[0]],
    ["FRA","LHR",A321,"commercial",100,395,0,110,270,680,0,20,"SX 10",[0]],
    ["LHR","ZRH",A321,"commercial",110,485,0,135,320,780,0,9,"SX 11",[1,3,5,7]],
    ["ZRH","LHR",A321,"commercial",110,485,0,135,320,780,0,17,"SX 12",[2,4,6,1]],
    ["LHR","IST",A321,"commercial",235,1560,0,198,480,1140,0,10,"SX 13",[0]],
    ["IST","LHR",A321,"commercial",255,1560,0,198,480,1140,0,5,"SX 14",[0]],
    ["LHR","ATH",A321,"commercial",215,1480,0,185,440,1060,0,8,"SX 15",[1,4,6]],
    ["ATH","LHR",A321,"commercial",235,1480,0,185,440,1060,0,6,"SX 16",[2,5,7]],
    ["MAN","CDG",A321,"commercial",90,260,0,79,195,520,0,10,"SX 17",[1,3,5]],
    ["CDG","MAN",A321,"commercial",90,260,0,79,195,520,0,17,"SX 18",[1,3,5]],
    ["LGW","BCN",A321,"commercial",135,712,0,115,310,760,0,6,"SX 19",[2,4,6]],
    ["BCN","LGW",A321,"commercial",135,712,0,115,310,760,0,14,"SX 20",[2,4,6]],

    // ══════ GULF SHORT-HAUL (A321neo II from DXB) ══════
    ["DXB","BAH",A321B,"commercial",50,160,0,78,175,390,0,8,"SX 21",[0]],
    ["DXB","DOH",A321B,"commercial",55,190,0,82,195,420,0,14,"SX 22",[0]],
    ["DXB","MCT",A321B,"commercial",65,210,0,72,165,380,0,10,"SX 23",[0]],
    ["DXB","RUH",A321B,"commercial",120,530,0,110,260,620,0,16,"SX 24",[0]],
    ["DXB","CAI",A321B,"commercial",270,1500,0,195,460,1080,0,9,"SX 25",[1,3,5,7]],
    ["CAI","DXB",A321B,"commercial",250,1500,0,195,460,1080,0,15,"SX 26",[2,4,6,1]],

    // ══════ US DOMESTIC (A321neo III from JFK) ══════
    ["JFK","MIA",A321C,"commercial",195,1089,0,129,310,780,0,7,"SX 27",[0]],
    ["MIA","JFK",A321C,"commercial",185,1089,0,129,310,780,0,18,"SX 28",[0]],
    ["JFK","ORD",A321C,"commercial",165,740,0,98,240,590,0,9,"SX 29",[0]],
    ["ORD","JFK",A321C,"commercial",155,740,0,98,240,590,0,16,"SX 30",[0]],
    ["JFK","LAX",A321C,"commercial",330,2475,0,189,450,1120,0,8,"SX 31",[0]],
    ["LAX","JFK",A321C,"commercial",310,2475,0,189,450,1120,0,22,"SX 32",[0]],
    ["JFK","ATL",A321C,"commercial",145,760,0,89,220,540,0,6,"SX 33",[1,3,5,7]],
    ["ATL","JFK",A321C,"commercial",140,760,0,89,220,540,0,19,"SX 34",[2,4,6,1]],
    ["JFK","SFO",A321C,"commercial",355,2586,0,199,470,1180,0,10,"SX 35",[1,3,5]],
    ["SFO","JFK",A321C,"commercial",330,2586,0,199,470,1180,0,21,"SX 36",[2,4,6]],
    ["JFK","BOS",A321C,"commercial",65,187,0,69,170,420,0,7,"SX 37",[0]],
    ["BOS","JFK",A321C,"commercial",65,187,0,69,170,420,0,20,"SX 38",[0]],
    ["JFK","IAD",A321C,"commercial",75,228,0,75,185,460,0,12,"SX 39",[1,3,5,7]],
    ["LAX","SFO",A321C,"commercial",75,337,0,72,178,440,0,11,"SX 40",[0]],
    ["SFO","LAX",A321C,"commercial",75,337,0,72,178,440,0,19,"SX 41",[0]],
    ["MIA","ATL",A321C,"commercial",120,594,0,82,200,490,0,8,"SX 42",[1,4,6]],
    ["LAX","DFW",A321C,"commercial",195,1235,0,109,265,650,0,13,"SX 43",[2,5,7]],

    // ══════ TRANSATLANTIC (B787-9 / A350 / B777) ══════
    ["LHR","JFK",B789,"commercial",440,3459,0,485,1280,3350,6400,10,"SX 50",[0]],
    ["JFK","LHR",B789,"commercial",405,3459,0,485,1280,3350,6400,19,"SX 51",[0]],
    ["LHR","LAX",A350,"commercial",660,5456,0,578,1440,3680,6950,14,"SX 52",[0]],
    ["LAX","LHR",A350,"commercial",610,5456,0,578,1440,3680,6950,21,"SX 53",[0]],
    ["LHR","MIA",B789,"commercial",535,4428,0,510,1350,3480,6600,9,"SX 54",[1,3,5,7]],
    ["MIA","LHR",B789,"commercial",500,4428,0,510,1350,3480,6600,20,"SX 55",[1,3,5,7]],
    ["LHR","YYZ",B789,"commercial",465,3545,0,460,1220,3200,6100,12,"SX 56",[2,4,6]],
    ["YYZ","LHR",B789,"commercial",420,3545,0,460,1220,3200,6100,21,"SX 57",[2,4,6]],
    ["LHR","SFO",A350,"commercial",660,5371,0,565,1410,3600,6800,11,"SX 58",[1,4,6]],
    ["SFO","LHR",A350,"commercial",610,5371,0,565,1410,3600,6800,18,"SX 59",[2,5,7]],
    ["LHR","ORD",B789,"commercial",510,3952,0,495,1300,3400,6500,13,"SX 60",[2,5,7]],
    ["LHR","BOS",B789,"commercial",420,3265,0,470,1250,3280,6200,11,"SX 61",[1,4]],
    ["LHR","IAD",B789B,"commercial",480,3672,0,490,1290,3380,6450,10,"SX 62",[3,6]],
    ["JFK","CDG",B789B,"commercial",435,3625,0,490,1280,3360,6400,18,"SX 63",[0]],
    ["CDG","JFK",B789B,"commercial",510,3625,0,490,1280,3360,6400,10,"SX 64",[0]],
    ["JFK","FRA",B789B,"commercial",465,3857,0,510,1340,3480,6600,17,"SX 65",[1,3,5]],

    // ══════ MIDDLE EAST LONG-HAUL ══════
    ["LHR","DXB",B789C,"commercial",380,2990,0,425,1050,2780,5480,8,"SX 70",[0]],
    ["DXB","LHR",B789C,"commercial",400,2990,0,425,1050,2780,5480,2,"SX 71",[0]],
    ["DXB","JFK",B777,"commercial",835,6846,0,645,1520,3780,8200,3,"SX 72",[0]],
    ["JFK","DXB",B777,"commercial",750,6846,0,645,1520,3780,8200,22,"SX 73",[0]],
    ["DXB","LAX",B777,"commercial",960,8339,0,720,1750,4280,9200,9,"SX 74",[1,4,6]],
    ["DXB","SFO",B777,"commercial",980,8103,0,710,1720,4200,9000,10,"SX 75",[2,5]],
    ["DXB","ORD",B777,"commercial",850,7240,0,660,1580,3880,8400,8,"SX 76",[3,7]],

    // ══════ ASIA-PACIFIC ══════
    ["LHR","NRT",B789,"commercial",690,5246,0,720,1740,4080,8600,21,"SX 80",[1,3,5,7]],
    ["NRT","LHR",B789,"commercial",720,5246,0,720,1740,4080,8600,11,"SX 81",[2,4,6,1]],
    ["LHR","SIN",A350,"commercial",750,5963,0,650,1560,3850,7500,22,"SX 82",[0]],
    ["SIN","LHR",A350,"commercial",770,5963,0,650,1560,3850,7500,23,"SX 83",[0]],
    ["LHR","HKG",B789,"commercial",700,5234,0,680,1650,3980,7900,20,"SX 84",[1,4,6]],
    ["HKG","LHR",B789,"commercial",730,5234,0,680,1650,3980,7900,0,"SX 85",[2,5,7]],
    ["LHR","ICN",A350,"commercial",680,4913,0,690,1680,4020,8400,13,"SX 86",[2,5]],
    ["LHR","DEL",B789,"commercial",510,4181,0,480,1160,2880,5800,21,"SX 87",[1,3,6]],
    ["DEL","LHR",B789,"commercial",540,4181,0,480,1160,2880,5800,3,"SX 88",[2,4,7]],
    ["LHR","BKK",A350,"commercial",690,5229,0,620,1500,3700,7400,22,"SX 89",[3,7]],
    ["DXB","SIN",A350B,"commercial",430,3200,0,380,920,2320,4650,5,"SX 90",[0]],
    ["SIN","DXB",A350B,"commercial",440,3200,0,380,920,2320,4650,8,"SX 91",[0]],
    ["DXB","BKK",B789C,"commercial",390,3040,0,360,880,2240,4500,23,"SX 92",[1,3,5,7]],
    ["BKK","DXB",B789C,"commercial",400,3040,0,360,880,2240,4500,7,"SX 93",[2,4,6,1]],
    ["DXB","BOM",B789C,"commercial",220,1200,0,245,580,1420,2900,6,"SX 94",[0]],
    ["BOM","DXB",B789C,"commercial",230,1200,0,245,580,1420,2900,22,"SX 95",[0]],
    ["DXB","DEL",B789C,"commercial",240,1370,0,265,630,1540,3100,10,"SX 96",[1,4,6]],
    ["SIN","NRT",A350B,"commercial",420,2900,0,340,820,2080,4200,10,"SX 97",[1,3,5]],
    ["NRT","SIN",A350B,"commercial",430,2900,0,340,820,2080,4200,18,"SX 98",[2,4,6]],
    ["SIN","HKG",A350B,"commercial",240,1590,0,195,470,1120,2280,14,"SX 99",[0]],
    ["HKG","SIN",A350B,"commercial",250,1590,0,195,470,1120,2280,9,"SXA 00",[0]],
    ["SIN","BKK",A350B,"commercial",155,880,0,125,310,740,0,7,"SXA 01",[1,3,5,7]],
    ["SIN","KUL",A350B,"commercial",60,195,0,68,165,390,0,8,"SXA 02",[0]],
    ["KUL","SIN",A350B,"commercial",60,195,0,68,165,390,0,18,"SXA 03",[0]],
    ["JFK","NRT",B777B,"commercial",830,6754,0,740,1780,4200,8800,12,"SXA 04",[1,4,6]],
    ["NRT","JFK",B777B,"commercial",760,6754,0,740,1780,4200,8800,17,"SXA 05",[2,5,7]],
    ["LAX","NRT",B777B,"commercial",690,5473,0,680,1640,3920,8200,13,"SXA 06",[2,5,7]],
    ["LAX","SIN",B777B,"commercial",1080,8770,1,780,1880,4480,9400,23,"SXA 07",[1,4]],
    ["LAX","HKG",B777B,"commercial",900,7260,0,750,1820,4350,9100,1,"SXA 08",[3,6]],
    ["SFO","ICN",B777B,"commercial",720,5600,0,700,1700,4100,8600,14,"SXA 09",[2,5]],
    ["DXB","PEK",B777,"commercial",480,3580,0,420,1020,2540,5100,8,"SXA 10",[1,4]],

    // ══════ AFRICA ══════
    ["LHR","JNB",B777,"commercial",660,5620,0,580,1420,3500,7200,19,"SXA 20",[1,3,5,7]],
    ["JNB","LHR",B777,"commercial",690,5620,0,580,1420,3500,7200,18,"SXA 21",[2,4,6,1]],
    ["LHR","NBO",B789,"commercial",510,4240,0,480,1180,2950,5900,22,"SXA 22",[2,5,7]],
    ["LHR","LOS",B789,"commercial",390,3100,0,440,1080,2680,5400,23,"SXA 23",[1,4]],
    ["LOS","LHR",B789,"commercial",380,3100,0,440,1080,2680,5400,5,"SXA 24",[2,5]],
    ["LHR","ACC",B789,"commercial",400,3200,0,420,1020,2580,5200,22,"SXA 25",[3,6]],
    ["DXB","ACC",B789C,"commercial",530,3860,0,420,1020,2580,5200,4,"SXA 26",[1,4,7]],
    ["DXB","NBO",B789C,"commercial",310,2580,0,320,780,1920,3900,9,"SXA 27",[2,5]],
    ["DXB","JNB",B777,"commercial",510,4150,0,480,1160,2880,5800,20,"SXA 28",[3,6]],
    ["JFK","LOS",B777B,"commercial",660,5350,0,540,1320,3350,6800,22,"SXA 29",[2,6]],
    ["JFK","ACC",B789B,"commercial",620,5100,0,520,1280,3200,6500,23,"SXA 30",[1,4]],

    // ══════ OCEANIA ══════
    ["LHR","SYD",B777,"commercial",1380,9188,1,845,2020,4480,9500,20,"SXA 40",[1,3,5]],
    ["SYD","LHR",B777,"commercial",1410,9188,1,845,2020,4480,9500,16,"SXA 41",[2,4,6]],
    ["LHR","MLE",A350,"commercial",630,4600,0,680,1680,3980,7900,9,"SXA 42",[1,4,7]],
    ["MLE","LHR",A350,"commercial",650,4600,0,680,1680,3980,7900,20,"SXA 43",[2,5,1]],
    ["DXB","SYD",B777,"commercial",840,7480,0,720,1760,4200,8800,22,"SXA 44",[2,5,7]],
    ["SYD","DXB",B777,"commercial",860,7480,0,720,1760,4200,8800,10,"SXA 45",[3,6,1]],
    ["DXB","MLE",B789C,"commercial",270,1760,0,280,680,1680,3400,14,"SXA 46",[0]],
    ["MLE","DXB",B789C,"commercial",280,1760,0,280,680,1680,3400,6,"SXA 47",[0]],
    ["SIN","SYD",A350B,"commercial",480,3400,0,390,950,2380,4800,22,"SXA 48",[1,4,6]],
    ["SIN","MEL",A350B,"commercial",500,3600,0,400,970,2420,4900,23,"SXA 49",[2,5]],
    ["LAX","SYD",B777B,"commercial",900,6516,0,780,1880,4400,9200,22,"SXA 50",[1,4]],
    ["LAX","AKL",B777B,"commercial",780,5685,0,720,1740,4120,8600,23,"SXA 51",[3,6]],

    // ══════ SOUTH AMERICA ══════
    ["LHR","GRU",B777,"commercial",710,5890,0,620,1520,3750,7600,22,"SXA 60",[1,4,7]],
    ["GRU","LHR",B777,"commercial",680,5890,0,620,1520,3750,7600,22,"SXA 61",[2,5,1]],
    ["LHR","EZE",B789,"commercial",820,6910,0,750,1820,4350,9100,23,"SXA 62",[3,6]],
    ["EZE","LHR",B789,"commercial",800,6910,0,750,1820,4350,9100,21,"SXA 63",[4,7]],
    ["JFK","GRU",B777B,"commercial",600,4775,0,540,1320,3300,6700,22,"SXA 64",[1,3,5]],
    ["GRU","JFK",B777B,"commercial",580,4775,0,540,1320,3300,6700,23,"SXA 65",[2,4,6]],
    ["JFK","EZE",B777B,"commercial",680,5298,0,620,1500,3680,7500,21,"SXA 66",[2,6]],
    ["MIA","GRU",B789B,"commercial",530,4140,0,480,1180,2950,5900,22,"SXA 67",[1,4]],
    ["MIA","BOG",A321C,"commercial",210,1400,0,165,400,960,0,8,"SXA 68",[1,3,5]],
    ["JFK","BOG",B789B,"commercial",350,2490,0,280,680,1720,3500,18,"SXA 69",[2,5]],
    ["LHR","SCL",B777,"commercial",870,7250,1,780,1880,4500,9400,22,"SXA 70",[2,6]],

    // ══════ PRIVATE JETS (weekly, various dates) ══════
    // Europe
    ["LHR","NCE",G700,"private-jet",110,640,0,0,0,0,22900,10,"SXP 01",[1,3,5]],
    ["LHR","MXP",G700,"private-jet",120,580,0,0,0,0,25000,14,"SXP 02",[2,4,6]],
    ["LHR","IBZ",G750,"private-jet",150,900,0,0,0,0,29500,9,"SXP 03",[5,6]],
    ["LHR","GVA",G700,"private-jet",100,470,0,0,0,0,20800,11,"SXP 04",[1,4]],
    // Middle East / Indian Ocean
    ["LHR","DWC",G700,"private-jet",380,2990,0,0,0,0,79200,8,"SXP 05",[1,3,5]],
    ["DWC","GVA",G750,"private-jet",380,2800,0,0,0,0,74800,10,"SXP 06",[2,4]],
    ["DWC","MLE",G750,"private-jet",270,1760,0,0,0,0,53100,18,"SXP 07",[1,5]],
    // Americas
    ["TEB","OPF",G700,"private-jet",165,1089,0,0,0,0,34400,9,"SXP 08",[1,3,5]],
    ["VNY","LAS",G700,"private-jet",70,236,0,0,0,0,14600,10,"SXP 09",[2,5,7]],
    ["OPF","NAS",G750,"private-jet",60,184,0,0,0,0,11800,8,"SXP 10",[4,6]],
    // Ultra-long private
    ["LHR","TEB",G700,"private-jet",450,3459,0,0,0,0,93800,9,"SXP 11",[1,4]],
    ["DWC","NRT",G750,"private-jet",540,4450,0,0,0,0,106200,16,"SXP 12",[3,6]],
    ["LHR","CPT",G700,"private-jet",690,5990,0,0,0,0,143800,7,"SXP 13",[2,5]],
    ["TEB","LAX",G700,"private-jet",310,2475,0,0,0,0,64600,8,"SXP 14",[1,3,5]],
    ["DWC","SIN",G750,"private-jet",430,3200,0,0,0,0,84600,9,"SXP 15",[2,6]],
    ["LHR","NRT",G700,"private-jet",690,5246,0,0,0,0,143800,20,"SXP 16",[4]],
  ];

  // ═══ GENERATE FLIGHTS: March 1 – April 30, 2026 ═══
  const flights: any[] = [];
  let flightCount = 0;
  const startDate = new Date("2026-03-01T00:00:00Z");
  const endDate = new Date("2027-02-28T23:59:59Z");

  for (const [from, to, acid, type, dur, dist, stops, eco, prem, biz, first, depHour, numBase, dow] of routes) {
    const fromAP = AP[from];
    const toAP = AP[to];
    if (!fromAP || !toAP) { console.log(`  ⚠ Missing airport: ${from} or ${to}`); continue; }

    let date = new Date(startDate);
    let seq = 0;
    while (date <= endDate) {
      const dayOfWeek = date.getDay() || 7; // 1=Mon...7=Sun
      if (dow[0] === 0 || dow.includes(dayOfWeek)) {
        seq++;
        const depTime = new Date(date);
        depTime.setUTCHours(depHour, Math.floor(Math.random() * 4) * 15, 0, 0);
        const arrTime = new Date(depTime.getTime() + dur * 60000);

        const gates = ["A","B","C","D","E","F","G"];
        const gate = gates[Math.floor(Math.random()*gates.length)] + (Math.floor(Math.random()*30)+1);

        flights.push({
          flightNumber: `${numBase}${seq.toString().padStart(2,"0")}`,
          type, airline: "SKYLUX Airways", aircraft: acid,
          departure: { airport: fromAP.airport, airportCode: from, city: fromAP.city, country: fromAP.country, terminal: fromAP.terminal, gate, scheduledTime: depTime, timezone: "UTC" },
          arrival: { airport: toAP.airport, airportCode: to, city: toAP.city, country: toAP.country, terminal: toAP.terminal, scheduledTime: arrTime, timezone: "UTC" },
          duration: dur, distance: dist, stops, status: "scheduled",
          seatMap: type === "private-jet"
            ? [{ class:"first", rows:1, seatsPerRow:19, totalSeats:19, availableSeats:19, price:first, layout:"club" }]
            : [
              ...(eco > 0 ? [{ class:"economy", rows:33, seatsPerRow:6, totalSeats:198, availableSeats:198, price:eco, layout:"3-3" }] : []),
              ...(prem > 0 ? [{ class:"premium", rows:7, seatsPerRow:6, totalSeats:42, availableSeats:42, price:prem, layout:"2-3-2" }] : []),
              ...(biz > 0 ? [{ class:"business", rows:9, seatsPerRow:4, totalSeats:36, availableSeats:36, price:biz, layout:"1-2-1" }] : []),
              ...(first > 0 ? [{ class:"first", rows:7, seatsPerRow:2, totalSeats:14, availableSeats:14, price:first, layout:"1-1" }] : []),
            ],
          amenities: type === "commercial"
            ? ["Wi-Fi","In-Flight Entertainment","USB Charging","Meal Service","Blanket & Pillow"]
            : ["Full Catering","Satellite Wi-Fi","Satellite Phone","Bedroom Suite","Conference Room","Personal Butler"],
          baggageAllowance: { cabin:{weight:7,pieces:1}, checked:{weight:type==="commercial"?23:50, pieces:type==="commercial"?1:3} },
          isActive: true, createdAt: new Date(), updatedAt: new Date(),
        });
        flightCount++;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  console.log(`\n🛫 Inserting ${flightCount} flights (March 2026 — February 2027)...`);
  // Batch insert in chunks of 1000
  for (let i = 0; i < flights.length; i += 1000) {
    const chunk = flights.slice(i, i + 1000);
    await db.collection("flights").insertMany(chunk);
    console.log(`  Inserted ${Math.min(i + 1000, flights.length).toLocaleString()} / ${flights.length.toLocaleString()}`);
  }

  // Create indexes for fast search
  console.log("\n📇 Creating search indexes...");
  await db.collection("flights").createIndex({ "departure.airportCode": 1, "arrival.airportCode": 1, "departure.scheduledTime": 1 });
  await db.collection("flights").createIndex({ "departure.city": 1 });
  await db.collection("flights").createIndex({ "arrival.city": 1 });
  await db.collection("flights").createIndex({ isActive: 1, status: 1 });
  await db.collection("flights").createIndex({ flightNumber: 1 });
  console.log("  ✅ Indexes created");

  console.log(`\n${"═".repeat(55)}`);
  console.log(`✅ 12 aircraft · ${flightCount.toLocaleString()} flights`);
  console.log(`📅 March 2026 — February 2027 (12 months)`);
  console.log(`${"═".repeat(55)}`);
  console.log(`\n🌍 50+ airports across 6 continents`);
  console.log(`🇬🇧 UK:       LHR, LGW, MAN`);
  console.log(`🇪🇺 Europe:   CDG, AMS, FCO, BCN, FRA, ZRH, IST, ATH`);
  console.log(`🇺🇸 USA:      JFK, LAX, MIA, ORD, ATL, SFO, IAD, DFW, BOS`);
  console.log(`🇨🇦 Canada:   YYZ`);
  console.log(`🇦🇪 Gulf:     DXB, DOH, BAH, RUH, MCT, CAI`);
  console.log(`🌏 Asia:     NRT, SIN, HKG, ICN, BKK, BOM, DEL, KUL, PEK`);
  console.log(`🌍 Africa:   JNB, CPT, NBO, LOS, ACC`);
  console.log(`🌏 Oceania:  SYD, MEL, AKL, MLE`);
  console.log(`🌎 S.America: GRU, EZE, BOG, SCL`);
  console.log(`🛩 Private:  NCE, MXP, IBZ, GVA, TEB, VNY, OPF, LAS, NAS`);
  console.log(`\n💰 Economy $68 → First $9,500 · Private $11,800 → $143,800`);
  console.log(`\n🌐 http://localhost:3000/portal — search any route, any date March 2026 to Feb 2027!\n`);

  await mongoose.disconnect();
}

run().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });