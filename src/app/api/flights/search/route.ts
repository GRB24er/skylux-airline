import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import "@/models/Aircraft";

/* ══════════════════════════════════════════════════════════════════
   SKYLUX Flight Search — Universal Coverage
   DB flights first → fallback to dynamic generation for ANY route
   ANY origin + ANY destination = flights ALWAYS available
   ══════════════════════════════════════════════════════════════════ */

const AP: Record<string,{c:string;co:string;la:number;lo:number;n:string}> = {
  LHR:{c:"London",co:"United Kingdom",la:51.47,lo:-0.46,n:"Heathrow"},
  LGW:{c:"London",co:"United Kingdom",la:51.15,lo:-0.19,n:"Gatwick"},
  STN:{c:"London",co:"United Kingdom",la:51.89,lo:0.26,n:"Stansted"},
  MAN:{c:"Manchester",co:"United Kingdom",la:53.35,lo:-2.27,n:"Manchester"},
  EDI:{c:"Edinburgh",co:"United Kingdom",la:55.95,lo:-3.37,n:"Edinburgh"},
  BHX:{c:"Birmingham",co:"United Kingdom",la:52.45,lo:-1.75,n:"Birmingham"},
  CDG:{c:"Paris",co:"France",la:49.01,lo:2.55,n:"Charles de Gaulle"},
  ORY:{c:"Paris",co:"France",la:48.72,lo:2.37,n:"Orly"},
  NCE:{c:"Nice",co:"France",la:43.66,lo:7.22,n:"Côte d'Azur"},
  LYS:{c:"Lyon",co:"France",la:45.73,lo:5.08,n:"Saint-Exupéry"},
  MRS:{c:"Marseille",co:"France",la:43.44,lo:5.22,n:"Provence"},
  AMS:{c:"Amsterdam",co:"Netherlands",la:52.31,lo:4.77,n:"Schiphol"},
  FRA:{c:"Frankfurt",co:"Germany",la:50.03,lo:8.57,n:"Frankfurt"},
  MUC:{c:"Munich",co:"Germany",la:48.35,lo:11.79,n:"Franz Josef Strauss"},
  BER:{c:"Berlin",co:"Germany",la:52.37,lo:13.52,n:"Brandenburg"},
  DUS:{c:"Düsseldorf",co:"Germany",la:51.28,lo:6.77,n:"Düsseldorf"},
  HAM:{c:"Hamburg",co:"Germany",la:53.63,lo:9.99,n:"Hamburg"},
  FCO:{c:"Rome",co:"Italy",la:41.8,lo:12.25,n:"Fiumicino"},
  MXP:{c:"Milan",co:"Italy",la:45.63,lo:8.72,n:"Malpensa"},
  VCE:{c:"Venice",co:"Italy",la:45.5,lo:12.35,n:"Marco Polo"},
  NAP:{c:"Naples",co:"Italy",la:40.89,lo:14.29,n:"Capodichino"},
  BCN:{c:"Barcelona",co:"Spain",la:41.3,lo:2.08,n:"El Prat"},
  MAD:{c:"Madrid",co:"Spain",la:40.49,lo:-3.57,n:"Barajas"},
  AGP:{c:"Malaga",co:"Spain",la:36.67,lo:-4.49,n:"Costa del Sol"},
  PMI:{c:"Palma",co:"Spain",la:39.55,lo:2.74,n:"Palma de Mallorca"},
  IBZ:{c:"Ibiza",co:"Spain",la:38.87,lo:1.37,n:"Ibiza"},
  LIS:{c:"Lisbon",co:"Portugal",la:38.77,lo:-9.13,n:"Humberto Delgado"},
  OPO:{c:"Porto",co:"Portugal",la:41.24,lo:-8.68,n:"Francisco Sá Carneiro"},
  ZRH:{c:"Zurich",co:"Switzerland",la:47.46,lo:8.55,n:"Zurich"},
  GVA:{c:"Geneva",co:"Switzerland",la:46.24,lo:6.11,n:"Geneva"},
  VIE:{c:"Vienna",co:"Austria",la:48.11,lo:16.57,n:"Schwechat"},
  BRU:{c:"Brussels",co:"Belgium",la:50.9,lo:4.48,n:"Brussels"},
  CPH:{c:"Copenhagen",co:"Denmark",la:55.62,lo:12.66,n:"Kastrup"},
  OSL:{c:"Oslo",co:"Norway",la:60.19,lo:11.1,n:"Gardermoen"},
  ARN:{c:"Stockholm",co:"Sweden",la:59.65,lo:17.94,n:"Arlanda"},
  GOT:{c:"Gothenburg",co:"Sweden",la:57.66,lo:12.28,n:"Landvetter"},
  HEL:{c:"Helsinki",co:"Finland",la:60.32,lo:24.97,n:"Vantaa"},
  DUB:{c:"Dublin",co:"Ireland",la:53.42,lo:-6.27,n:"Dublin"},
  ATH:{c:"Athens",co:"Greece",la:37.94,lo:23.94,n:"Eleftherios Venizelos"},
  IST:{c:"Istanbul",co:"Turkey",la:41.26,lo:28.74,n:"Istanbul"},
  SAW:{c:"Istanbul",co:"Turkey",la:40.9,lo:29.31,n:"Sabiha Gökçen"},
  AYT:{c:"Antalya",co:"Turkey",la:36.9,lo:30.8,n:"Antalya"},
  WAW:{c:"Warsaw",co:"Poland",la:52.17,lo:20.97,n:"Chopin"},
  PRG:{c:"Prague",co:"Czech Republic",la:50.1,lo:14.26,n:"Václav Havel"},
  BUD:{c:"Budapest",co:"Hungary",la:47.44,lo:19.26,n:"Ferenc Liszt"},
  OTP:{c:"Bucharest",co:"Romania",la:44.57,lo:26.09,n:"Henri Coandă"},
  SOF:{c:"Sofia",co:"Bulgaria",la:42.7,lo:23.41,n:"Sofia"},
  BEG:{c:"Belgrade",co:"Serbia",la:44.82,lo:20.31,n:"Nikola Tesla"},
  ZAG:{c:"Zagreb",co:"Croatia",la:45.74,lo:16.07,n:"Franjo Tuđman"},
  KEF:{c:"Reykjavik",co:"Iceland",la:63.99,lo:-22.62,n:"Keflavik"},
  DXB:{c:"Dubai",co:"UAE",la:25.25,lo:55.36,n:"Dubai International"},
  DWC:{c:"Dubai",co:"UAE",la:24.9,lo:55.16,n:"Al Maktoum"},
  AUH:{c:"Abu Dhabi",co:"UAE",la:24.43,lo:54.65,n:"Zayed International"},
  DOH:{c:"Doha",co:"Qatar",la:25.27,lo:51.61,n:"Hamad"},
  BAH:{c:"Bahrain",co:"Bahrain",la:26.27,lo:50.63,n:"Bahrain International"},
  RUH:{c:"Riyadh",co:"Saudi Arabia",la:24.96,lo:46.7,n:"King Khalid"},
  JED:{c:"Jeddah",co:"Saudi Arabia",la:21.67,lo:39.16,n:"King Abdulaziz"},
  MCT:{c:"Muscat",co:"Oman",la:23.59,lo:58.28,n:"Muscat International"},
  KWI:{c:"Kuwait",co:"Kuwait",la:29.23,lo:47.97,n:"Kuwait International"},
  AMM:{c:"Amman",co:"Jordan",la:31.72,lo:35.99,n:"Queen Alia"},
  BEY:{c:"Beirut",co:"Lebanon",la:33.82,lo:35.49,n:"Rafic Hariri"},
  TLV:{c:"Tel Aviv",co:"Israel",la:32.01,lo:34.89,n:"Ben Gurion"},
  JFK:{c:"New York",co:"USA",la:40.64,lo:-73.78,n:"John F Kennedy"},
  EWR:{c:"Newark",co:"USA",la:40.69,lo:-74.17,n:"Newark Liberty"},
  TEB:{c:"New York",co:"USA",la:40.85,lo:-74.06,n:"Teterboro"},
  LAX:{c:"Los Angeles",co:"USA",la:33.94,lo:-118.41,n:"LAX"},
  VNY:{c:"Los Angeles",co:"USA",la:34.21,lo:-118.49,n:"Van Nuys"},
  SFO:{c:"San Francisco",co:"USA",la:37.62,lo:-122.38,n:"SFO"},
  MIA:{c:"Miami",co:"USA",la:25.79,lo:-80.29,n:"Miami International"},
  OPF:{c:"Miami",co:"USA",la:25.91,lo:-80.28,n:"Opa-Locka Executive"},
  ORD:{c:"Chicago",co:"USA",la:41.97,lo:-87.91,n:"O'Hare"},
  ATL:{c:"Atlanta",co:"USA",la:33.64,lo:-84.43,n:"Hartsfield-Jackson"},
  DFW:{c:"Dallas",co:"USA",la:32.9,lo:-97.04,n:"Dallas/Fort Worth"},
  IAH:{c:"Houston",co:"USA",la:29.99,lo:-95.34,n:"George Bush"},
  IAD:{c:"Washington DC",co:"USA",la:38.95,lo:-77.46,n:"Dulles"},
  BOS:{c:"Boston",co:"USA",la:42.36,lo:-71.01,n:"Logan"},
  SEA:{c:"Seattle",co:"USA",la:47.45,lo:-122.31,n:"Sea-Tac"},
  DEN:{c:"Denver",co:"USA",la:39.86,lo:-104.67,n:"Denver International"},
  PHX:{c:"Phoenix",co:"USA",la:33.44,lo:-112.01,n:"Sky Harbor"},
  LAS:{c:"Las Vegas",co:"USA",la:36.08,lo:-115.15,n:"Harry Reid"},
  MSP:{c:"Minneapolis",co:"USA",la:44.88,lo:-93.22,n:"MSP"},
  DTW:{c:"Detroit",co:"USA",la:42.21,lo:-83.35,n:"Detroit Metro"},
  MCO:{c:"Orlando",co:"USA",la:28.43,lo:-81.31,n:"Orlando International"},
  HNL:{c:"Honolulu",co:"USA",la:21.32,lo:-157.92,n:"Daniel K. Inouye"},
  YYZ:{c:"Toronto",co:"Canada",la:43.68,lo:-79.63,n:"Pearson"},
  YVR:{c:"Vancouver",co:"Canada",la:49.19,lo:-123.18,n:"Vancouver"},
  YUL:{c:"Montreal",co:"Canada",la:45.47,lo:-73.74,n:"Trudeau"},
  MEX:{c:"Mexico City",co:"Mexico",la:19.44,lo:-99.07,n:"Benito Juárez"},
  CUN:{c:"Cancún",co:"Mexico",la:21.04,lo:-86.87,n:"Cancún International"},
  NRT:{c:"Tokyo",co:"Japan",la:35.76,lo:140.39,n:"Narita"},
  HND:{c:"Tokyo",co:"Japan",la:35.55,lo:139.78,n:"Haneda"},
  KIX:{c:"Osaka",co:"Japan",la:34.43,lo:135.24,n:"Kansai"},
  SIN:{c:"Singapore",co:"Singapore",la:1.35,lo:103.99,n:"Changi"},
  HKG:{c:"Hong Kong",co:"Hong Kong",la:22.31,lo:113.91,n:"Chek Lap Kok"},
  ICN:{c:"Seoul",co:"South Korea",la:37.46,lo:126.44,n:"Incheon"},
  BKK:{c:"Bangkok",co:"Thailand",la:13.69,lo:100.75,n:"Suvarnabhumi"},
  KUL:{c:"Kuala Lumpur",co:"Malaysia",la:2.75,lo:101.71,n:"KLIA"},
  CGK:{c:"Jakarta",co:"Indonesia",la:-6.13,lo:106.66,n:"Soekarno-Hatta"},
  DPS:{c:"Bali",co:"Indonesia",la:-8.75,lo:115.17,n:"Ngurah Rai"},
  MNL:{c:"Manila",co:"Philippines",la:14.51,lo:121.02,n:"Ninoy Aquino"},
  SGN:{c:"Ho Chi Minh City",co:"Vietnam",la:10.82,lo:106.65,n:"Tan Son Nhat"},
  HAN:{c:"Hanoi",co:"Vietnam",la:21.22,lo:105.81,n:"Noi Bai"},
  PEK:{c:"Beijing",co:"China",la:40.08,lo:116.58,n:"Capital International"},
  PVG:{c:"Shanghai",co:"China",la:31.14,lo:121.81,n:"Pudong"},
  CAN:{c:"Guangzhou",co:"China",la:23.39,lo:113.3,n:"Baiyun"},
  TPE:{c:"Taipei",co:"Taiwan",la:25.08,lo:121.23,n:"Taoyuan"},
  BOM:{c:"Mumbai",co:"India",la:19.09,lo:72.87,n:"Chhatrapati Shivaji"},
  DEL:{c:"Delhi",co:"India",la:28.56,lo:77.1,n:"Indira Gandhi"},
  BLR:{c:"Bangalore",co:"India",la:13.2,lo:77.71,n:"Kempegowda"},
  CMB:{c:"Colombo",co:"Sri Lanka",la:7.18,lo:79.88,n:"Bandaranaike"},
  KTM:{c:"Kathmandu",co:"Nepal",la:27.7,lo:85.36,n:"Tribhuvan"},
  DAC:{c:"Dhaka",co:"Bangladesh",la:23.84,lo:90.4,n:"Hazrat Shahjalal"},
  ISB:{c:"Islamabad",co:"Pakistan",la:33.62,lo:72.83,n:"Islamabad International"},
  KHI:{c:"Karachi",co:"Pakistan",la:24.91,lo:67.16,n:"Jinnah"},
  MLE:{c:"Malé",co:"Maldives",la:4.19,lo:73.53,n:"Velana"},
  JNB:{c:"Johannesburg",co:"South Africa",la:-26.14,lo:28.24,n:"OR Tambo"},
  CPT:{c:"Cape Town",co:"South Africa",la:-33.97,lo:18.6,n:"Cape Town International"},
  NBO:{c:"Nairobi",co:"Kenya",la:-1.32,lo:36.93,n:"Jomo Kenyatta"},
  LOS:{c:"Lagos",co:"Nigeria",la:6.58,lo:3.32,n:"Murtala Muhammed"},
  ACC:{c:"Accra",co:"Ghana",la:5.61,lo:-0.17,n:"Kotoka"},
  CAI:{c:"Cairo",co:"Egypt",la:30.12,lo:31.41,n:"Cairo International"},
  CMN:{c:"Casablanca",co:"Morocco",la:33.37,lo:-7.59,n:"Mohammed V"},
  ADD:{c:"Addis Ababa",co:"Ethiopia",la:8.98,lo:38.8,n:"Bole"},
  DAR:{c:"Dar es Salaam",co:"Tanzania",la:-6.88,lo:39.2,n:"Julius Nyerere"},
  MRU:{c:"Mauritius",co:"Mauritius",la:-20.43,lo:57.68,n:"SSR International"},
  SEZ:{c:"Mahé",co:"Seychelles",la:-4.67,lo:55.52,n:"Seychelles International"},
  NAS:{c:"Nassau",co:"Bahamas",la:25.04,lo:-77.47,n:"Lynden Pindling"},
  GRU:{c:"São Paulo",co:"Brazil",la:-23.43,lo:-46.47,n:"Guarulhos"},
  GIG:{c:"Rio de Janeiro",co:"Brazil",la:-22.81,lo:-43.25,n:"Galeão"},
  EZE:{c:"Buenos Aires",co:"Argentina",la:-34.82,lo:-58.54,n:"Ezeiza"},
  BOG:{c:"Bogotá",co:"Colombia",la:4.7,lo:-74.15,n:"El Dorado"},
  SCL:{c:"Santiago",co:"Chile",la:-33.39,lo:-70.79,n:"Arturo Merino"},
  LIM:{c:"Lima",co:"Peru",la:-12.02,lo:-77.11,n:"Jorge Chávez"},
  SYD:{c:"Sydney",co:"Australia",la:-33.95,lo:151.18,n:"Kingsford Smith"},
  MEL:{c:"Melbourne",co:"Australia",la:-37.67,lo:144.84,n:"Tullamarine"},
  BNE:{c:"Brisbane",co:"Australia",la:-27.38,lo:153.12,n:"Brisbane"},
  PER:{c:"Perth",co:"Australia",la:-31.94,lo:115.97,n:"Perth"},
  AKL:{c:"Auckland",co:"New Zealand",la:-36.85,lo:174.76,n:"Auckland"},
  NAN:{c:"Nadi",co:"Fiji",la:-17.76,lo:177.44,n:"Nadi International"},
};

function dist(a1:number,o1:number,a2:number,o2:number){
  const R=6371,dA=((a2-a1)*Math.PI)/180,dO=((o2-o1)*Math.PI)/180;
  const x=Math.sin(dA/2)**2+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))*0.539957);
}

function sRng(s:string){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return()=>{h=(h*16807)%2147483647;return(h&0x7fffffff)/2147483647}}

function genFlights(fc:string,tc:string,ds:string){
  const f=AP[fc],t=AP[tc];if(!f||!t||fc===tc)return[];
  const nm=dist(f.la,f.lo,t.la,t.lo);
  const dur=Math.round((nm/450)*60)+30;
  let eB:number,bB:number,fB:number;
  if(nm<300){eB=90;bB=280;fB=520}
  else if(nm<800){eB=160;bB=480;fB=920}
  else if(nm<1500){eB=280;bB=750;fB=1500}
  else if(nm<3000){eB=480;bB=1350;fB=2800}
  else if(nm<5000){eB=680;bB=2100;fB=4200}
  else if(nm<7000){eB=880;bB=2800;fB=5800}
  else{eB=1180;bB=3600;fB=7400}
  const r=sRng(`${fc}${tc}${ds}`);
  const d=new Date(ds);if(isNaN(d.getTime()))return[];
  const n=Math.min(6,Math.max(3,3+Math.round(r()*3)));
  const wins=[{h:6,m:10},{h:8,m:40},{h:11,m:5},{h:14,m:20},{h:17,m:45},{h:21,m:10},{h:23,m:50}];
  const ac=[
    {nm:"Boeing 787-9 Dreamliner",mf:"Boeing",md:"787-9",ct:"widebody"},
    {nm:"Airbus A350-900",mf:"Airbus",md:"A350-900",ct:"widebody"},
  ];
  const out=[];
  for(let i=0;i<n;i++){
    const w=wins[i%wins.length];
    const dep=new Date(d);dep.setHours(w.h,w.m+Math.round(r()*15),0,0);
    const arr=new Date(dep.getTime()+dur*60000);
    const a=ac[i%ac.length];
    const pm=0.88+r()*0.28;
    const ec=Math.round(eB*pm/5)*5,pe=Math.round(ec*1.45/5)*5,bz=Math.round(bB*pm/5)*5,fi=Math.round(fB*pm/5)*5;
    const fn=`SLX${String(100+Math.round(r()*899))}`;
    out.push({
      _id:`gen_${fc}_${tc}_${ds}_${i}`,flightNumber:fn,type:"commercial",
      departure:{airportCode:fc,airport:f.n,city:f.c,country:f.co,terminal:`T${1+Math.round(r()*3)}`,gate:`${String.fromCharCode(65+Math.round(r()*5))}${1+Math.round(r()*30)}`,scheduledTime:dep.toISOString()},
      arrival:{airportCode:tc,airport:t.n,city:t.c,country:t.co,terminal:`T${1+Math.round(r()*2)}`,gate:`${String.fromCharCode(65+Math.round(r()*5))}${1+Math.round(r()*30)}`,scheduledTime:arr.toISOString()},
      duration:dur,distance:nm,status:"scheduled",
      aircraft:{name:a.nm,manufacturer:a.mf,model:a.md,category:a.ct,specs:{maxPassengers:290}},
      seatMap:[
        {class:"economy",price:ec,availableSeats:100+Math.round(r()*80),totalSeats:200},
        {class:"premium-economy",price:pe,availableSeats:15+Math.round(r()*20),totalSeats:40},
        {class:"business",price:bz,availableSeats:6+Math.round(r()*18),totalSeats:28},
        {class:"first",price:fi,availableSeats:2+Math.round(r()*6),totalSeats:8},
      ],
      stops:0,isActive:true,_generated:true,
    });
  }
  return out.sort((a,b)=>new Date(a.departure.scheduledTime).getTime()-new Date(b.departure.scheduledTime).getTime());
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const from = sp.get("from")?.toUpperCase();
    const to = sp.get("to")?.toUpperCase();
    const departDate = sp.get("departDate");
    const type = sp.get("type");
    const cabinClass = sp.get("cabinClass");
    const passengers = parseInt(sp.get("passengers") || "1");
    const maxPrice = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : undefined;
    const sortBy = sp.get("sortBy") || "departure";
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 50);

    // ── 1. Try real DB flights ──
    const q: any = { isActive: true, status: { $nin: ["cancelled", "arrived"] } };
    if (from) { q.$or = [{ "departure.airportCode": from }, { "departure.city": { $regex: from, $options: "i" } }]; }
    if (to) {
      const tq = [{ "arrival.airportCode": to }, { "arrival.city": { $regex: to, $options: "i" } }];
      if (q.$or) { q.$and = [{ $or: q.$or }, { $or: tq }]; delete q.$or; } else { q.$or = tq; }
    }
    if (departDate) {
      const dt = new Date(departDate);
      if (!isNaN(dt.getTime())) { const nx = new Date(dt); nx.setDate(nx.getDate() + 1); q["departure.scheduledTime"] = { $gte: dt, $lt: nx }; }
    }
    if (type) q.type = type;

    let sort: any = {};
    switch (sortBy) { case "price": sort = { "seatMap.price": 1 }; break; case "duration": sort = { duration: 1 }; break; default: sort = { "departure.scheduledTime": 1 }; }

    const dbFlights = await Flight.find(q).populate("aircraft", "name manufacturer model category specs").sort(sort).skip((page - 1) * limit).limit(limit).lean();
    let flights: any[] = [...dbFlights];

    // ── 2. If no DB results, generate for any route ──
    if (flights.length === 0 && from && to && departDate) {
      flights = genFlights(from, to, departDate);
    }
    // ── 3. If very few DB results, pad with generated ──
    if (flights.length > 0 && flights.length < 3 && from && to && departDate) {
      const gen = genFlights(from, to, departDate);
      const existing = new Set(flights.map((f: any) => f.flightNumber));
      for (const g of gen) { if (!existing.has(g.flightNumber) && flights.length < 6) { flights.push(g); existing.add(g.flightNumber); } }
    }

    // ── Post-filter ──
    let filtered = flights.filter((f: any) => {
      if (passengers > 1) { const ok = f.seatMap?.some((s: any) => s.availableSeats >= passengers); if (!ok) return false; }
      if (maxPrice && cabinClass) { const s = f.seatMap?.find((s: any) => s.class === cabinClass); if (!s || s.price > maxPrice) return false; }
      return true;
    });
    if (sortBy === "price") filtered.sort((a: any, b: any) => (a.seatMap?.[0]?.price || 0) - (b.seatMap?.[0]?.price || 0));
    else if (sortBy === "duration") filtered.sort((a: any, b: any) => (a.duration || 0) - (b.duration || 0));

    return NextResponse.json({
      success: true,
      data: { flights: filtered },
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    });
  } catch (error: any) {
    console.error("Flight search error:", error);
    return NextResponse.json({ success: false, error: error.message || "Search failed" }, { status: 500 });
  }
}