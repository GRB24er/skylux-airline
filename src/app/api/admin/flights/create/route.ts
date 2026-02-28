import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";
const _f = Flight; const _a = Aircraft;

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    if (!["admin","superadmin"].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const { flightNumber, departure, arrival, departureTime, arrivalTime, prices, seatCounts } = body;
    if (!flightNumber || !departure || !arrival || !departureTime || !arrivalTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const existing = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
    if (existing) return NextResponse.json({ success: false, error: "Flight number already exists" }, { status: 400 });
    let aircraft = await Aircraft.findOne({ status: "active" });
    if (!aircraft) {
      aircraft = await Aircraft.create({ name: "Boeing 787-9 Dreamliner", model: "787-9", type: "wide-body", manufacturer: "Boeing", registration: "SX-GEN-002", totalSeats: 290, status: "active" });
    }
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const duration = Math.round((arrTime.getTime() - depTime.getTime()) / 60000);
    const TZ: Record<string,string> = {LHR:"Europe/London",CDG:"Europe/Paris",FRA:"Europe/Berlin",AMS:"Europe/Amsterdam",DXB:"Asia/Dubai",JFK:"America/New_York",LAX:"America/Los_Angeles",SIN:"Asia/Singapore",NRT:"Asia/Tokyo",SYD:"Australia/Sydney",ACC:"Africa/Accra",LOS:"Africa/Lagos",NBO:"Africa/Nairobi",JNB:"Africa/Johannesburg",CAI:"Africa/Cairo",IST:"Europe/Istanbul",BCN:"Europe/Madrid",MAD:"Europe/Madrid",FCO:"Europe/Rome",BOM:"Asia/Kolkata",DEL:"Asia/Kolkata",BKK:"Asia/Bangkok",ICN:"Asia/Seoul",DOH:"Asia/Qatar",HKG:"Asia/Hong_Kong",ARN:"Europe/Stockholm",CPH:"Europe/Copenhagen",MIA:"America/New_York",ORD:"America/Chicago"};
    const AP: Record<string,{c:string;co:string;n:string}> = {LHR:{c:"London",co:"United Kingdom",n:"Heathrow"},CDG:{c:"Paris",co:"France",n:"Charles de Gaulle"},FRA:{c:"Frankfurt",co:"Germany",n:"Frankfurt"},AMS:{c:"Amsterdam",co:"Netherlands",n:"Schiphol"},DXB:{c:"Dubai",co:"UAE",n:"Dubai International"},JFK:{c:"New York",co:"USA",n:"John F Kennedy"},LAX:{c:"Los Angeles",co:"USA",n:"LAX"},SIN:{c:"Singapore",co:"Singapore",n:"Changi"},NRT:{c:"Tokyo",co:"Japan",n:"Narita"},SYD:{c:"Sydney",co:"Australia",n:"Kingsford Smith"},ACC:{c:"Accra",co:"Ghana",n:"Kotoka"},LOS:{c:"Lagos",co:"Nigeria",n:"Murtala Muhammed"},NBO:{c:"Nairobi",co:"Kenya",n:"Jomo Kenyatta"},JNB:{c:"Johannesburg",co:"South Africa",n:"OR Tambo"},IST:{c:"Istanbul",co:"Turkey",n:"Istanbul"},BCN:{c:"Barcelona",co:"Spain",n:"El Prat"},MAD:{c:"Madrid",co:"Spain",n:"Barajas"},FCO:{c:"Rome",co:"Italy",n:"Fiumicino"},BOM:{c:"Mumbai",co:"India",n:"Chhatrapati Shivaji"},DEL:{c:"Delhi",co:"India",n:"Indira Gandhi"},BKK:{c:"Bangkok",co:"Thailand",n:"Suvarnabhumi"},ICN:{c:"Seoul",co:"South Korea",n:"Incheon"},DOH:{c:"Doha",co:"Qatar",n:"Hamad"},HKG:{c:"Hong Kong",co:"Hong Kong",n:"Chek Lap Kok"},CAI:{c:"Cairo",co:"Egypt",n:"Cairo International"},ARN:{c:"Stockholm",co:"Sweden",n:"Arlanda"},MIA:{c:"Miami",co:"USA",n:"Miami International"},ORD:{c:"Chicago",co:"USA",n:"O Hare"},CPH:{c:"Copenhagen",co:"Denmark",n:"Kastrup"}};
    const depInfo = AP[departure.toUpperCase()] || { c: departure, co: "Unknown", n: departure };
    const arrInfo = AP[arrival.toUpperCase()] || { c: arrival, co: "Unknown", n: arrival };
    const flight = await Flight.create({
      flightNumber: flightNumber.toUpperCase(), type: "commercial", airline: "SKYLUX Airways", aircraft: aircraft._id,
      departure: { airport: depInfo.n, airportCode: departure.toUpperCase(), city: depInfo.c, country: depInfo.co, terminal: "T" + (Math.floor(Math.random()*3)+1), gate: String.fromCharCode(65+Math.floor(Math.random()*6)) + (Math.floor(Math.random()*20)+1), scheduledTime: depTime, timezone: TZ[departure.toUpperCase()] || "UTC" },
      arrival: { airport: arrInfo.n, airportCode: arrival.toUpperCase(), city: arrInfo.c, country: arrInfo.co, terminal: "T" + (Math.floor(Math.random()*3)+1), gate: String.fromCharCode(65+Math.floor(Math.random()*6)) + (Math.floor(Math.random()*20)+1), scheduledTime: arrTime, timezone: TZ[arrival.toUpperCase()] || "UTC" },
      duration, distance: Math.round(duration * 7.5), status: "scheduled",
      seatMap: [
        { class: "economy", price: prices?.economy || 500, availableSeats: seatCounts?.economy || 180, totalSeats: seatCounts?.economy || 180, rows: 30, seatsPerRow: 6, layout: "3-3-3" },
        { class: "premium", price: prices?.premium || 900, availableSeats: seatCounts?.premium || 42, totalSeats: seatCounts?.premium || 42, rows: 7, seatsPerRow: 6, layout: "2-3-2" },
        { class: "business", price: prices?.business || 2500, availableSeats: seatCounts?.business || 36, totalSeats: seatCounts?.business || 36, rows: 9, seatsPerRow: 4, layout: "1-2-1" },
        { class: "first", price: prices?.first || 6000, availableSeats: seatCounts?.first || 14, totalSeats: seatCounts?.first || 14, rows: 7, seatsPerRow: 2, layout: "1-1" },
      ],
      stops: 0, isActive: true,
    });
    return NextResponse.json({ success: true, data: { flight }, message: "Flight " + flightNumber + " created" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
