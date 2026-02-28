import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";
import User from "@/models/User";
import { generateBookingReference, calculatePriceBreakdown, calculatePointsEarned } from "@/utils/helpers";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    await connectDB();
    const body = await req.json();
    const { flightIds, passengers, cabinClass, contactEmail, contactPhone, addOns, paymentMethod, useLoyaltyPoints } = body;
    if (!flightIds?.length || !passengers?.length || !cabinClass || !contactEmail || !contactPhone || !paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const realIds: string[] = [];
    const generatedIds: string[] = [];
    for (const id of flightIds) {
      if (typeof id === "string" && id.startsWith("gen_")) generatedIds.push(id);
      else realIds.push(id);
    }

    let flights: any[] = [];
    if (realIds.length > 0) {
      const dbFlights = await Flight.find({ _id: { $in: realIds }, isActive: true });
      flights.push(...dbFlights);
    }

    if (generatedIds.length > 0) {
      // Get or create a default aircraft for generated flights
      let defaultAircraft = await Aircraft.findOne({ registration: "SX-GEN-001" });
      if (!defaultAircraft) {
        defaultAircraft = await Aircraft.create({
          registration: "SX-GEN-001", name: "Boeing 787-9 Dreamliner", manufacturer: "Boeing", model: "787-9",
          category: "commercial-widebody", type: "commercial", status: "active",
          specs: { maxPassengers: 290, maxRange: 7635, cruiseSpeed: 488 },
          seatConfiguration: [
            { class: "economy", seats: 198, layout: "3-3-3", pitch: "32 inches", features: ["USB","IFE"] },
            { class: "premium", seats: 42, layout: "2-3-2", pitch: "38 inches", features: ["USB","IFE","Legrest"] },
            { class: "business", seats: 36, layout: "1-2-1", pitch: "60 inches", features: ["Lie-flat","Lounge"] },
            { class: "first", seats: 14, layout: "1-1-1", pitch: "82 inches", features: ["Suite","Shower"] },
          ],
          amenities: ["Wi-Fi","IFE","USB"], yearManufactured: 2022, totalFlightHours: 4800, homeBase: "LHR", isAvailable: true,
        });
      }

      for (const genId of generatedIds) {
        const parts = genId.split("_");
        if (parts.length >= 5) {
          const fromCode = parts[1];
          const toCode = parts[2];
          const date = parts[3];
          const idx = parseInt(parts[4]);
          const genFlights = generateFlightsForBooking(fromCode, toCode, date, defaultAircraft._id);
          const target = genFlights[idx];
          if (target) {
            // Check if flight number already exists
            const existing = await Flight.findOne({ flightNumber: target.flightNumber });
            if (existing) {
              flights.push(existing);
            } else {
              const saved = await Flight.create(target);
              flights.push(saved);
            }
          }
        }
      }
    }

    if (flights.length === 0) {
      return NextResponse.json({ success: false, error: "No valid flights found" }, { status: 404 });
    }

    for (const flight of flights) {
      const seatConfig = flight.seatMap.find((s: any) => s.class === cabinClass);
      if (!seatConfig || seatConfig.availableSeats < passengers.length) {
        return NextResponse.json({ success: false, error: `Not enough seats in ${cabinClass} on ${flight.flightNumber}` }, { status: 400 });
      }
    }

    const baseFarePerPerson = flights.reduce((sum: number, f: any) => {
      const seat = f.seatMap.find((s: any) => s.class === cabinClass);
      return sum + (seat?.price || 0);
    }, 0);
    const breakdown = calculatePriceBreakdown(baseFarePerPerson, passengers.length, 0, useLoyaltyPoints || 0);

    let bookingRef: string;
    let refExists = true;
    do { bookingRef = generateBookingReference(); refExists = !!(await Booking.findOne({ bookingReference: bookingRef })); } while (refExists);

    const booking = await Booking.create({
      bookingReference: bookingRef, user: authResult.user._id,
      flights: flights.map((f: any, i: number) => ({ flight: f._id, direction: i === 0 ? "outbound" : "return" })),
      passengers: passengers.map((p: any) => ({ ...p, cabinClass })),
      cabinClass, status: "pending",
      payment: { status: "pending", method: paymentMethod, amount: breakdown.total, currency: "USD", breakdown },
      addOns: addOns || {}, contactEmail, contactPhone,
      loyaltyPointsEarned: calculatePointsEarned(breakdown.total),
    });

    for (const flight of flights) {
      const seatIdx = flight.seatMap.findIndex((s: any) => s.class === cabinClass);
      if (seatIdx >= 0) { flight.seatMap[seatIdx].availableSeats -= passengers.length; await flight.save(); }
    }

    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId = "TXN-" + Date.now().toString(36).toUpperCase();
    booking.status = "confirmed";
    await booking.save();

    const user = await User.findById(authResult.user._id);
    if (user) { user.loyaltyPoints += booking.loyaltyPointsEarned; user.totalFlights += 1; user.totalSpent += breakdown.total; await user.save(); }

    const pf = flights[0];
    try {
      await sendEmail({
        to: contactEmail, subject: `SKYLUX Airways - Booking Confirmed ${bookingRef}`,
        html: bookingConfirmationEmail({
          name: `${passengers[0].firstName} ${passengers[0].lastName}`, bookingRef,
          flightNumber: pf.flightNumber,
          from: `${pf.departure.city} (${pf.departure.airportCode})`,
          to: `${pf.arrival.city} (${pf.arrival.airportCode})`,
          date: new Date(pf.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          cabin: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1),
          total: `$${breakdown.total.toLocaleString()}`,
        }),
      });
      booking.eTicketSent = true; await booking.save();
    } catch (e) { console.error("Email failed:", e); }

    const populated = await Booking.findById(booking._id)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status aircraft" })
      .populate("user", "firstName lastName email").lean();

    return NextResponse.json({ success: true, data: { booking: populated }, message: `Booking ${bookingRef} confirmed` }, { status: 201 });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ success: false, error: error.message || "Booking failed" }, { status: 500 });
  }
}

const TZ: Record<string,string> = {
  LHR:"Europe/London",CDG:"Europe/Paris",FRA:"Europe/Berlin",AMS:"Europe/Amsterdam",DXB:"Asia/Dubai",
  JFK:"America/New_York",LAX:"America/Los_Angeles",SIN:"Asia/Singapore",HKG:"Asia/Hong_Kong",NRT:"Asia/Tokyo",
  SYD:"Australia/Sydney",ACC:"Africa/Accra",LOS:"Africa/Lagos",NBO:"Africa/Nairobi",JNB:"Africa/Johannesburg",
  CAI:"Africa/Cairo",IST:"Europe/Istanbul",BCN:"Europe/Madrid",MAD:"Europe/Madrid",FCO:"Europe/Rome",
  MXP:"Europe/Rome",BOM:"Asia/Kolkata",DEL:"Asia/Kolkata",BKK:"Asia/Bangkok",ICN:"Asia/Seoul",
  GRU:"America/Sao_Paulo",MEX:"America/Mexico_City",YYZ:"America/Toronto",MIA:"America/New_York",
  ORD:"America/Chicago",SFO:"America/Los_Angeles",ATL:"America/New_York",DFW:"America/Chicago",
  SEA:"America/Los_Angeles",DOH:"Asia/Qatar",KUL:"Asia/Kuala_Lumpur",CPT:"Africa/Johannesburg",
  ARN:"Europe/Stockholm",OSL:"Europe/Oslo",CPH:"Europe/Copenhagen",HEL:"Europe/Helsinki",
  ZRH:"Europe/Zurich",VIE:"Europe/Vienna",LIS:"Europe/Lisbon",ATH:"Europe/Athens",
  MLE:"Indian/Maldives",CMN:"Africa/Casablanca",ADD:"Africa/Addis_Ababa",CUN:"America/Cancun",
  PVG:"Asia/Shanghai",BER:"Europe/Berlin",MUC:"Europe/Berlin",DUB:"Europe/Dublin",
  EZE:"America/Argentina/Buenos_Aires",SCL:"America/Santiago",LIM:"America/Lima",BOG:"America/Bogota",
  MEL:"Australia/Melbourne",AKL:"Pacific/Auckland",PEK:"Asia/Shanghai",TPE:"Asia/Taipei",
  CGK:"Asia/Jakarta",DPS:"Asia/Makassar",HND:"Asia/Tokyo",BNE:"Australia/Brisbane",PER:"Australia/Perth",
  WAW:"Europe/Warsaw",PRG:"Europe/Prague",BUD:"Europe/Budapest",DAR:"Africa/Dar_es_Salaam",
  MRU:"Indian/Mauritius",RUH:"Asia/Riyadh",JED:"Asia/Riyadh",AUH:"Asia/Dubai",MCT:"Asia/Muscat",
  AMM:"Asia/Amman",BEY:"Asia/Beirut",KWI:"Asia/Kuwait",ISB:"Asia/Karachi",BLR:"Asia/Kolkata",
  CMB:"Asia/Colombo",SGN:"Asia/Ho_Chi_Minh",MNL:"Asia/Manila",
};

const AP: Record<string,{c:string;co:string;la:number;lo:number;n:string}> = {
  LHR:{c:"London",co:"United Kingdom",la:51.47,lo:-0.46,n:"Heathrow"},
  CDG:{c:"Paris",co:"France",la:49.01,lo:2.55,n:"Charles de Gaulle"},
  FRA:{c:"Frankfurt",co:"Germany",la:50.03,lo:8.57,n:"Frankfurt"},
  AMS:{c:"Amsterdam",co:"Netherlands",la:52.31,lo:4.77,n:"Schiphol"},
  DXB:{c:"Dubai",co:"UAE",la:25.25,lo:55.36,n:"Dubai International"},
  JFK:{c:"New York",co:"USA",la:40.64,lo:-73.78,n:"John F Kennedy"},
  LAX:{c:"Los Angeles",co:"USA",la:33.94,lo:-118.41,n:"LAX"},
  SIN:{c:"Singapore",co:"Singapore",la:1.35,lo:103.99,n:"Changi"},
  HKG:{c:"Hong Kong",co:"Hong Kong",la:22.31,lo:113.91,n:"Chek Lap Kok"},
  NRT:{c:"Tokyo",co:"Japan",la:35.76,lo:140.39,n:"Narita"},
  SYD:{c:"Sydney",co:"Australia",la:-33.95,lo:151.18,n:"Kingsford Smith"},
  ACC:{c:"Accra",co:"Ghana",la:5.61,lo:-0.17,n:"Kotoka"},
  LOS:{c:"Lagos",co:"Nigeria",la:6.58,lo:3.32,n:"Murtala Muhammed"},
  NBO:{c:"Nairobi",co:"Kenya",la:-1.32,lo:36.93,n:"Jomo Kenyatta"},
  JNB:{c:"Johannesburg",co:"South Africa",la:-26.14,lo:28.24,n:"OR Tambo"},
  CAI:{c:"Cairo",co:"Egypt",la:30.12,lo:31.41,n:"Cairo International"},
  IST:{c:"Istanbul",co:"Turkey",la:41.26,lo:28.74,n:"Istanbul"},
  BCN:{c:"Barcelona",co:"Spain",la:41.3,lo:2.08,n:"El Prat"},
  MAD:{c:"Madrid",co:"Spain",la:40.49,lo:-3.57,n:"Barajas"},
  FCO:{c:"Rome",co:"Italy",la:41.8,lo:12.25,n:"Fiumicino"},
  MXP:{c:"Milan",co:"Italy",la:45.63,lo:8.72,n:"Malpensa"},
  BOM:{c:"Mumbai",co:"India",la:19.09,lo:72.87,n:"Chhatrapati Shivaji"},
  DEL:{c:"Delhi",co:"India",la:28.56,lo:77.1,n:"Indira Gandhi"},
  BKK:{c:"Bangkok",co:"Thailand",la:13.69,lo:100.75,n:"Suvarnabhumi"},
  ICN:{c:"Seoul",co:"South Korea",la:37.46,lo:126.44,n:"Incheon"},
  GRU:{c:"Sao Paulo",co:"Brazil",la:-23.43,lo:-46.47,n:"Guarulhos"},
  MEX:{c:"Mexico City",co:"Mexico",la:19.44,lo:-99.07,n:"Benito Juarez"},
  YYZ:{c:"Toronto",co:"Canada",la:43.68,lo:-79.63,n:"Pearson"},
  MIA:{c:"Miami",co:"USA",la:25.79,lo:-80.29,n:"Miami International"},
  ORD:{c:"Chicago",co:"USA",la:41.97,lo:-87.91,n:"O Hare"},
  SFO:{c:"San Francisco",co:"USA",la:37.62,lo:-122.38,n:"SFO"},
  ATL:{c:"Atlanta",co:"USA",la:33.64,lo:-84.43,n:"Hartsfield-Jackson"},
  DFW:{c:"Dallas",co:"USA",la:32.9,lo:-97.04,n:"Dallas Fort Worth"},
  SEA:{c:"Seattle",co:"USA",la:47.45,lo:-122.31,n:"Sea-Tac"},
  DOH:{c:"Doha",co:"Qatar",la:25.27,lo:51.61,n:"Hamad"},
  KUL:{c:"Kuala Lumpur",co:"Malaysia",la:2.75,lo:101.71,n:"KLIA"},
  CPT:{c:"Cape Town",co:"South Africa",la:-33.97,lo:18.6,n:"Cape Town International"},
  ARN:{c:"Stockholm",co:"Sweden",la:59.65,lo:17.94,n:"Arlanda"},
  OSL:{c:"Oslo",co:"Norway",la:60.19,lo:11.1,n:"Gardermoen"},
  CPH:{c:"Copenhagen",co:"Denmark",la:55.62,lo:12.66,n:"Kastrup"},
  HEL:{c:"Helsinki",co:"Finland",la:60.32,lo:24.97,n:"Vantaa"},
  ZRH:{c:"Zurich",co:"Switzerland",la:47.46,lo:8.55,n:"Zurich"},
  VIE:{c:"Vienna",co:"Austria",la:48.11,lo:16.57,n:"Schwechat"},
  LIS:{c:"Lisbon",co:"Portugal",la:38.77,lo:-9.13,n:"Humberto Delgado"},
  ATH:{c:"Athens",co:"Greece",la:37.94,lo:23.94,n:"Eleftherios Venizelos"},
  MLE:{c:"Male",co:"Maldives",la:4.19,lo:73.53,n:"Velana"},
  CMN:{c:"Casablanca",co:"Morocco",la:33.37,lo:-7.59,n:"Mohammed V"},
  ADD:{c:"Addis Ababa",co:"Ethiopia",la:8.98,lo:38.8,n:"Bole"},
  CUN:{c:"Cancun",co:"Mexico",la:21.04,lo:-86.87,n:"Cancun International"},
  PVG:{c:"Shanghai",co:"China",la:31.14,lo:121.81,n:"Pudong"},
  BER:{c:"Berlin",co:"Germany",la:52.37,lo:13.52,n:"Brandenburg"},
  MUC:{c:"Munich",co:"Germany",la:48.35,lo:11.79,n:"Franz Josef Strauss"},
  DUB:{c:"Dublin",co:"Ireland",la:53.42,lo:-6.27,n:"Dublin"},
  EZE:{c:"Buenos Aires",co:"Argentina",la:-34.82,lo:-58.54,n:"Ezeiza"},
  SCL:{c:"Santiago",co:"Chile",la:-33.39,lo:-70.79,n:"Arturo Merino"},
  LIM:{c:"Lima",co:"Peru",la:-12.02,lo:-77.11,n:"Jorge Chavez"},
  BOG:{c:"Bogota",co:"Colombia",la:4.7,lo:-74.15,n:"El Dorado"},
  MEL:{c:"Melbourne",co:"Australia",la:-37.67,lo:144.84,n:"Tullamarine"},
  AKL:{c:"Auckland",co:"New Zealand",la:-36.85,lo:174.76,n:"Auckland"},
  PEK:{c:"Beijing",co:"China",la:40.08,lo:116.58,n:"Capital International"},
  TPE:{c:"Taipei",co:"Taiwan",la:25.08,lo:121.23,n:"Taoyuan"},
  CGK:{c:"Jakarta",co:"Indonesia",la:-6.13,lo:106.66,n:"Soekarno-Hatta"},
  DPS:{c:"Bali",co:"Indonesia",la:-8.75,lo:115.17,n:"Ngurah Rai"},
  HND:{c:"Tokyo",co:"Japan",la:35.55,lo:139.78,n:"Haneda"},
  BNE:{c:"Brisbane",co:"Australia",la:-27.38,lo:153.12,n:"Brisbane"},
  PER:{c:"Perth",co:"Australia",la:-31.94,lo:115.97,n:"Perth"},
  WAW:{c:"Warsaw",co:"Poland",la:52.17,lo:20.97,n:"Chopin"},
  PRG:{c:"Prague",co:"Czech Republic",la:50.1,lo:14.26,n:"Vaclav Havel"},
  BUD:{c:"Budapest",co:"Hungary",la:47.44,lo:19.26,n:"Ferenc Liszt"},
  DAR:{c:"Dar es Salaam",co:"Tanzania",la:-6.88,lo:39.2,n:"Julius Nyerere"},
  MRU:{c:"Mauritius",co:"Mauritius",la:-20.43,lo:57.68,n:"SSR International"},
  RUH:{c:"Riyadh",co:"Saudi Arabia",la:24.96,lo:46.7,n:"King Khalid"},
  JED:{c:"Jeddah",co:"Saudi Arabia",la:21.67,lo:39.16,n:"King Abdulaziz"},
  AUH:{c:"Abu Dhabi",co:"UAE",la:24.43,lo:54.65,n:"Zayed International"},
  MCT:{c:"Muscat",co:"Oman",la:23.59,lo:58.28,n:"Muscat International"},
  AMM:{c:"Amman",co:"Jordan",la:31.72,lo:35.99,n:"Queen Alia"},
  BEY:{c:"Beirut",co:"Lebanon",la:33.82,lo:35.49,n:"Rafic Hariri"},
  KWI:{c:"Kuwait",co:"Kuwait",la:29.23,lo:47.97,n:"Kuwait International"},
  ISB:{c:"Islamabad",co:"Pakistan",la:33.62,lo:72.83,n:"Islamabad International"},
  BLR:{c:"Bangalore",co:"India",la:13.2,lo:77.71,n:"Kempegowda"},
  CMB:{c:"Colombo",co:"Sri Lanka",la:7.18,lo:79.88,n:"Bandaranaike"},
  SGN:{c:"Ho Chi Minh City",co:"Vietnam",la:10.82,lo:106.65,n:"Tan Son Nhat"},
  MNL:{c:"Manila",co:"Philippines",la:14.51,lo:121.02,n:"Ninoy Aquino"},
};

function dist(a1:number,o1:number,a2:number,o2:number){
  const R=6371,dA=((a2-a1)*Math.PI)/180,dO=((o2-o1)*Math.PI)/180;
  const x=Math.sin(dA/2)**2+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))*0.539957);
}

function sRng(s:string){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return()=>{h=(h*16807)%2147483647;return(h&0x7fffffff)/2147483647}}

function generateFlightsForBooking(fc:string,tc:string,ds:string,aircraftId:any){
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
  const ftz=TZ[fc]||"UTC",ttz=TZ[tc]||"UTC";
  const out=[];
  for(let i=0;i<n;i++){
    const w=wins[i%wins.length];
    const dep=new Date(d);dep.setHours(w.h,w.m+Math.round(r()*15),0,0);
    const arr=new Date(dep.getTime()+dur*60000);
    const pm=0.88+r()*0.28;
    const ec=Math.round(eB*pm/5)*5,pe=Math.round(ec*1.45/5)*5,bz=Math.round(bB*pm/5)*5,fi=Math.round(fB*pm/5)*5;
    const fn=`SX ${String(100+Math.round(r()*899))}`;
    out.push({
      flightNumber:fn,type:"commercial" as const,airline:"SKYLUX Airways",isActive:true,
      aircraft:aircraftId,
      departure:{airport:f.n,airportCode:fc,city:f.c,country:f.co,terminal:`T${1+Math.round(r()*3)}`,gate:`${String.fromCharCode(65+Math.round(r()*5))}${1+Math.round(r()*30)}`,scheduledTime:dep,timezone:ftz},
      arrival:{airport:t.n,airportCode:tc,city:t.c,country:t.co,terminal:`T${1+Math.round(r()*2)}`,gate:`${String.fromCharCode(65+Math.round(r()*5))}${1+Math.round(r()*30)}`,scheduledTime:arr,timezone:ttz},
      duration:dur,distance:nm,status:"scheduled",stops:0,
      seatMap:[
        {class:"economy",price:ec,availableSeats:100+Math.round(r()*80),totalSeats:198,rows:33,seatsPerRow:6,layout:"3-3-3"},
        {class:"premium",price:pe,availableSeats:15+Math.round(r()*20),totalSeats:42,rows:7,seatsPerRow:6,layout:"2-3-2"},
        {class:"business",price:bz,availableSeats:6+Math.round(r()*18),totalSeats:36,rows:9,seatsPerRow:4,layout:"1-2-1"},
        {class:"first",price:fi,availableSeats:2+Math.round(r()*6),totalSeats:14,rows:7,seatsPerRow:2,layout:"1-1"},
      ],
    });
  }
  return out;
}
