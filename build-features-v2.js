/**
 * SKYLUX Airways Feature Builder v2 (Fixed)
 * Files 1-2 already created. This creates files 3-10.
 * Run: node build-features-v2.js
 */
const fs = require("fs");
const path = require("path");

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function writeFile(fp, content) {
  mkdirp(path.dirname(fp));
  fs.writeFileSync(fp, content, "utf8");
  console.log("  Created: " + fp);
}

// Helper: builds file content from array of lines
function lines(...args) { return args.join("\n"); }

console.log("\n=== SKYLUX Feature Builder v2 ===\n");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. BOOKING TRACKER PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[3] Tracker Page...");

// Build content using regular strings to avoid template literal issues
var trackPage = [];
trackPage.push('"use client";');
trackPage.push('import { useState, useEffect } from "react";');
trackPage.push('import Link from "next/link";');
trackPage.push('');
trackPage.push('const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",accentDark:"#6366f1",cyan:"#22d3ee",gold:"#c9a96e",emerald:"#10b981",hot:"#ef4444",amber:"#fbbf24"};');
trackPage.push('');
trackPage.push('const statusSteps = ["pending","confirmed","checked-in","boarded","completed"];');
trackPage.push('const statusColors: Record<string,string> = {confirmed:C.emerald,pending:C.amber,"checked-in":C.cyan,boarded:C.accent,completed:C.emerald,cancelled:C.hot,delayed:C.hot};');
trackPage.push('const flightStatusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,departed:C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot};');
trackPage.push('');
trackPage.push('export default function TrackPage({ params }: { params: { ref: string } }) {');
trackPage.push('  const [data, setData] = useState<any>(null);');
trackPage.push('  const [loading, setLoading] = useState(true);');
trackPage.push('  const [error, setError] = useState("");');
trackPage.push('');
trackPage.push('  useEffect(() => {');
trackPage.push('    fetch("/api/track?ref=" + params.ref)');
trackPage.push('      .then(r => r.json())');
trackPage.push('      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })');
trackPage.push('      .catch(() => setError("Failed to load"))');
trackPage.push('      .finally(() => setLoading(false));');
trackPage.push('  }, [params.ref]);');
trackPage.push('');
trackPage.push('  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };');
trackPage.push('  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch { return "TBD"; } };');
trackPage.push('');
trackPage.push('  if (loading) return (');
trackPage.push('    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>');
trackPage.push('      <div style={{textAlign:"center"}}>');
trackPage.push('        <div style={{width:40,height:40,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />');
trackPage.push('        <div style={{color:C.sub,fontSize:14}}>Tracking your booking...</div>');
trackPage.push('        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>');
trackPage.push('      </div>');
trackPage.push('    </div>');
trackPage.push('  );');
trackPage.push('');
trackPage.push('  if (error) return (');
trackPage.push('    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>');
trackPage.push('      <div style={{textAlign:"center",maxWidth:400,padding:32}}>');
trackPage.push('        <div style={{fontSize:48,marginBottom:16,opacity:0.3}}>&#128270;</div>');
trackPage.push('        <h2 style={{color:C.text,margin:"0 0 8px",fontSize:20}}>Booking Not Found</h2>');
trackPage.push('        <p style={{color:C.sub,fontSize:14,margin:"0 0 24px"}}>{error}</p>');
trackPage.push('        <Link href="/#track" style={{color:C.accent,fontSize:14,textDecoration:"none"}}>&#8592; Try Another Reference</Link>');
trackPage.push('      </div>');
trackPage.push('    </div>');
trackPage.push('  );');
trackPage.push('');
trackPage.push('  if (!data) return null;');
trackPage.push('');
trackPage.push('  const currentStep = statusSteps.indexOf(data.status);');
trackPage.push('  const isCancelled = data.status === "cancelled";');
trackPage.push('');
trackPage.push('  return (');
trackPage.push('    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"\'Segoe UI\',Arial,sans-serif"}}>');
trackPage.push('      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}"}</style>');
trackPage.push('');
trackPage.push('      <div style={{maxWidth:700,margin:"0 auto",animation:"fadeUp 0.6s ease"}}>');
trackPage.push('        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>');
trackPage.push('          <Link href="/" style={{color:C.dim,fontSize:13,textDecoration:"none"}}>&#8592; Back to Home</Link>');
trackPage.push('          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>');
trackPage.push('        </div>');
trackPage.push('');
trackPage.push('        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>');
trackPage.push('          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>');
trackPage.push('            <div>');
trackPage.push('              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>BOOKING REFERENCE</div>');
trackPage.push('              <div style={{fontSize:28,fontWeight:700,color:C.accent,letterSpacing:4,fontFamily:"monospace"}}>{data.bookingReference}</div>');
trackPage.push('            </div>');
trackPage.push('            <span style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:(statusColors[data.status]||C.dim)+"15",color:statusColors[data.status]||C.dim,textTransform:"uppercase",letterSpacing:1}}>{data.status}</span>');
trackPage.push('          </div>');
trackPage.push('');
trackPage.push('          {!isCancelled && (');
trackPage.push('            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>');
trackPage.push('              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>');
trackPage.push('                {statusSteps.map((step, i) => (');
trackPage.push('                  <div key={step} style={{display:"flex",alignItems:"center",flex:i<statusSteps.length-1?1:0}}>');
trackPage.push('                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>');
trackPage.push('                      <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<=currentStep?C.emerald+"20":C.surface,border:"2px solid "+(i<=currentStep?C.emerald:C.border),fontSize:12,color:i<=currentStep?C.emerald:C.dim,fontWeight:700}}>');
trackPage.push('                        {i<=currentStep?"\\u2713":i+1}');
trackPage.push('                      </div>');
trackPage.push('                      <div style={{fontSize:8,color:i<=currentStep?C.emerald:C.dim,marginTop:4,textTransform:"capitalize",letterSpacing:0.5}}>{step.replace("-"," ")}</div>');
trackPage.push('                    </div>');
trackPage.push('                    {i<statusSteps.length-1&&(');
trackPage.push('                      <div style={{flex:1,height:2,background:i<currentStep?C.emerald:C.border,margin:"0 4px",marginBottom:16}} />');
trackPage.push('                    )}');
trackPage.push('                  </div>');
trackPage.push('                ))}');
trackPage.push('              </div>');
trackPage.push('            </div>');
trackPage.push('          )}');
trackPage.push('');
trackPage.push('          {data.flight && (');
trackPage.push('            <div style={{padding:"28px"}}>');
trackPage.push('              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>');
trackPage.push('                <div style={{textAlign:"center"}}>');
trackPage.push('                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.departure.airportCode}</div>');
trackPage.push('                  <div style={{color:C.dim,fontSize:12}}>{data.flight.departure.city}</div>');
trackPage.push('                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.departure.scheduledTime)}</div>');
trackPage.push('                </div>');
trackPage.push('                <div style={{flex:1,textAlign:"center",padding:"0 20px"}}>');
trackPage.push('                  <div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div>');
trackPage.push('                  <div style={{borderTop:"1px dashed "+C.border,margin:"8px 0"}} />');
trackPage.push('                  <div style={{display:"flex",justifyContent:"center",gap:8,alignItems:"center"}}>');
trackPage.push('                    <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(flightStatusColors[data.flight.status]||C.dim)+"15",color:flightStatusColors[data.flight.status]||C.dim,textTransform:"uppercase"}}>{data.flight.status}</span>');
trackPage.push('                  </div>');
trackPage.push('                  <div style={{color:C.dim,fontSize:10,marginTop:4}}>{data.flight.aircraft}</div>');
trackPage.push('                </div>');
trackPage.push('                <div style={{textAlign:"center"}}>');
trackPage.push('                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.arrival.airportCode}</div>');
trackPage.push('                  <div style={{color:C.dim,fontSize:12}}>{data.flight.arrival.city}</div>');
trackPage.push('                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.arrival.scheduledTime)}</div>');
trackPage.push('                </div>');
trackPage.push('              </div>');
trackPage.push('');
trackPage.push('              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.border,borderRadius:10,overflow:"hidden"}}>');
trackPage.push('                {[');
trackPage.push('                  {l:"DATE",v:fmtDate(data.flight.departure.scheduledTime)},');
trackPage.push('                  {l:"GATE",v:data.flight.departure.gate||"TBD"},');
trackPage.push('                  {l:"TERMINAL",v:data.flight.departure.terminal||"TBD"},');
trackPage.push('                  {l:"DURATION",v:Math.floor(data.flight.duration/60)+"h "+data.flight.duration%60+"m"},');
trackPage.push('                ].map((f,i)=>(');
trackPage.push('                  <div key={i} style={{background:C.surface,padding:"12px 14px"}}>');
trackPage.push('                    <div style={{color:C.dim,fontSize:8,letterSpacing:1,marginBottom:4}}>{f.l}</div>');
trackPage.push('                    <div style={{color:C.text,fontSize:13,fontWeight:600}}>{f.v}</div>');
trackPage.push('                  </div>');
trackPage.push('                ))}');
trackPage.push('              </div>');
trackPage.push('            </div>');
trackPage.push('          )}');
trackPage.push('        </div>');
trackPage.push('');
trackPage.push('        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>');
trackPage.push('          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>');
trackPage.push('            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PAYMENT</div>');
trackPage.push('            <div style={{fontSize:22,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>{"$"}{data.payment?.amount?.toLocaleString()||"0"}</div>');
trackPage.push('            <div style={{display:"flex",gap:8,marginTop:8}}>');
trackPage.push('              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,background:(data.payment?.status==="completed"?C.emerald:C.amber)+"15",color:data.payment?.status==="completed"?C.emerald:C.amber,textTransform:"uppercase"}}>{data.payment?.status}</span>');
trackPage.push('              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,background:C.surface,color:C.dim,textTransform:"uppercase"}}>{data.payment?.method}</span>');
trackPage.push('            </div>');
trackPage.push('          </div>');
trackPage.push('          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>');
trackPage.push('            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PASSENGERS</div>');
trackPage.push('            <div style={{fontSize:22,fontWeight:700,color:C.text}}>{data.passengerCount}</div>');
trackPage.push('            <div style={{marginTop:8}}>');
trackPage.push('              {data.passengers?.map((p:any,i:number)=>(');
trackPage.push('                <div key={i} style={{fontSize:12,color:C.sub,marginBottom:2}}>{p.firstName} {p.lastName}</div>');
trackPage.push('              ))}');
trackPage.push('            </div>');
trackPage.push('          </div>');
trackPage.push('        </div>');
trackPage.push('');
trackPage.push('        {data.boardingPassAvailable && (');
trackPage.push('          <div style={{display:"flex",gap:12}}>');
trackPage.push('            <Link href={"/boarding-pass/"+data.bookingReference} style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",textDecoration:"none",fontWeight:700,fontSize:14}}>View Boarding Pass</Link>');
trackPage.push('            <Link href="/checkin" style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,border:"1px solid "+C.border,background:C.card,color:C.text,textDecoration:"none",fontWeight:600,fontSize:14}}>Online Check-In</Link>');
trackPage.push('            <Link href={"/invoice/"+data.bookingReference} style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,border:"1px solid "+C.border,background:C.card,color:C.sub,textDecoration:"none",fontWeight:600,fontSize:14}}>Download Invoice</Link>');
trackPage.push('          </div>');
trackPage.push('        )}');
trackPage.push('      </div>');
trackPage.push('    </div>');
trackPage.push('  );');
trackPage.push('}');

writeFile("src/app/track/[ref]/page.tsx", trackPage.join("\n"));


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3b. Track index page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[3b] Track Index...");

var trackIdx = [];
trackIdx.push('"use client";');
trackIdx.push('import { useState } from "react";');
trackIdx.push('');
trackIdx.push('const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8"};');
trackIdx.push('');
trackIdx.push('export default function TrackIndex() {');
trackIdx.push('  const [ref, setRef] = useState("");');
trackIdx.push('  return (');
trackIdx.push('    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"\'Segoe UI\',Arial,sans-serif"}}>');
trackIdx.push('      <div style={{textAlign:"center",maxWidth:480}}>');
trackIdx.push('        <div style={{fontSize:22,fontWeight:700,letterSpacing:3,color:C.text,marginBottom:4}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>');
trackIdx.push('        <div style={{fontSize:11,letterSpacing:4,color:C.dim,marginBottom:40}}>BOOKING TRACKER</div>');
trackIdx.push('        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:32}}>');
trackIdx.push('          <h2 style={{color:C.text,fontSize:20,fontWeight:600,marginBottom:8}}>Track Your Booking</h2>');
trackIdx.push('          <p style={{color:C.sub,fontSize:13,marginBottom:24}}>Enter your booking reference to view real-time status and flight details.</p>');
trackIdx.push('          <div style={{display:"flex",gap:10}}>');
trackIdx.push('            <input value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} placeholder="e.g. SLX-AB1234"');
trackIdx.push('              onKeyDown={e=>{if(e.key==="Enter"&&ref.trim())window.location.href="/track/"+ref.trim()}}');
trackIdx.push('              style={{flex:1,padding:"14px 16px",background:C.surface,border:"1px solid "+C.border,borderRadius:10,color:C.text,fontSize:15,fontFamily:"monospace",outline:"none",letterSpacing:2}} />');
trackIdx.push('            <button onClick={()=>{if(ref.trim())window.location.href="/track/"+ref.trim()}}');
trackIdx.push('              style={{padding:"14px 28px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Track</button>');
trackIdx.push('          </div>');
trackIdx.push('        </div>');
trackIdx.push('      </div>');
trackIdx.push('    </div>');
trackIdx.push('  );');
trackIdx.push('}');

writeFile("src/app/track/page.tsx", trackIdx.join("\n"));


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ADMIN FLIGHT CREATOR API (no template literal issues)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[4] Flight Creator API...");

// This file uses only string concatenation, safe to use template literal
writeFile("src/app/api/admin/flights/create/route.ts", `import { NextRequest, NextResponse } from "next/server";
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
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. PAYMENT CONFIRMATION API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[5] Payment Confirm API...");

writeFile("src/app/api/admin/bookings/confirm-payment/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";
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
    const { bookingId, transactionId, notes } = await req.json();
    if (!bookingId) return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
    const booking = await Booking.findById(bookingId).populate({ path: "flights.flight", select: "flightNumber departure arrival" });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId = transactionId || "ADMIN-" + Date.now().toString(36).toUpperCase();
    if (notes) booking.payment.notes = notes;
    booking.status = "confirmed";
    await booking.save();
    const user = await User.findById(booking.user);
    if (user) { user.loyaltyPoints += Math.floor(booking.payment.amount * 0.1); user.totalFlights += 1; user.totalSpent += booking.payment.amount; await user.save(); }
    const flight = (booking.flights[0]?.flight) as any;
    const pax = booking.passengers[0];
    if (booking.contactEmail && flight) {
      try {
        await sendEmail({
          to: booking.contactEmail,
          subject: "SKYLUX Airways - Payment Confirmed " + booking.bookingReference,
          html: bookingConfirmationEmail({
            name: (pax?.firstName || "") + " " + (pax?.lastName || ""),
            bookingRef: booking.bookingReference,
            flightNumber: flight.flightNumber || "N/A",
            from: (flight.departure?.city || "?") + " (" + (flight.departure?.airportCode || "?") + ")",
            to: (flight.arrival?.city || "?") + " (" + (flight.arrival?.airportCode || "?") + ")",
            date: flight.departure?.scheduledTime ? new Date(flight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD",
            cabin: ((booking.cabinClass || "economy").charAt(0).toUpperCase() + (booking.cabinClass || "economy").slice(1)),
            total: "$" + (booking.payment.amount || 0).toLocaleString(),
          }),
        });
      } catch (e) { console.error("Email failed:", e); }
    }
    return NextResponse.json({ success: true, message: "Payment confirmed and customer notified" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. FLIGHT STATUS UPDATE API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[6] Flight Status API...");

// This file has email templates with runtime template literals
// We need to use \${ for the runtime interpolations
writeFile("src/app/api/admin/flights/status/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Flight from "@/models/Flight";
import Booking from "@/models/Booking";
import { sendEmail } from "@/services/email";
const _f = Flight;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://skylux.pro";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    if (!["admin","superadmin"].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const { flightId, status, delayMinutes, note } = await req.json();
    if (!flightId || !status) return NextResponse.json({ success: false, error: "flightId and status required" }, { status: 400 });
    const flight = await Flight.findById(flightId);
    if (!flight) return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    flight.status = status;
    if (status === "delayed" && delayMinutes) {
      flight.departure.actualTime = new Date(flight.departure.scheduledTime.getTime() + delayMinutes * 60000);
      flight.arrival.actualTime = new Date(flight.arrival.scheduledTime.getTime() + delayMinutes * 60000);
    }
    await flight.save();
    const bookings = await Booking.find({ "flights.flight": flightId, status: { $in: ["confirmed", "checked-in"] } });
    let emailsSent = 0;
    for (const booking of bookings) {
      if (!booking.contactEmail) continue;
      const pax = booking.passengers[0];
      const name = pax ? pax.firstName + " " + pax.lastName : "Valued Passenger";
      let statusMsg = "The status of flight " + flight.flightNumber + " has been updated to: " + status.toUpperCase() + ".";
      let statusColor = "#818cf8";
      if (status === "delayed") { statusMsg = "Your flight " + flight.flightNumber + " has been delayed" + (delayMinutes ? " by approximately " + delayMinutes + " minutes" : "") + "."; statusColor = "#ef4444"; }
      else if (status === "boarding") { statusMsg = "Boarding has commenced for flight " + flight.flightNumber + ". Please proceed to Gate " + (flight.departure.gate || "TBD") + "."; statusColor = "#fbbf24"; }
      else if (status === "cancelled") { statusMsg = "We regret to inform you that flight " + flight.flightNumber + " has been cancelled."; statusColor = "#ef4444"; }
      else if (status === "departed") { statusMsg = "Flight " + flight.flightNumber + " has departed."; statusColor = "#22d3ee"; }
      else if (status === "landed" || status === "arrived") { statusMsg = "Flight " + flight.flightNumber + " has arrived at " + flight.arrival.city + "."; statusColor = "#10b981"; }
      if (note) statusMsg += " " + note;
      const html = buildStatusEmail(name, statusMsg, statusColor, flight, booking.bookingReference);
      try { await sendEmail({ to: booking.contactEmail, subject: "SKYLUX Airways - Flight " + flight.flightNumber + " " + status.charAt(0).toUpperCase() + status.slice(1), html }); emailsSent++; } catch (e) { console.error("Email err:", e); }
    }
    return NextResponse.json({ success: true, message: "Flight " + flight.flightNumber + " updated to " + status + ". " + emailsSent + " passenger(s) notified." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function buildStatusEmail(name: string, statusMsg: string, statusColor: string, flight: any, bookingRef: string): string {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">' +
    '<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">' +
    '<div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">' +
    '<div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div></div>' +
    '<div style="padding:32px;">' +
    '<div style="text-align:center;margin-bottom:24px;"><div style="display:inline-block;padding:8px 24px;border-radius:8px;background:' + statusColor + '15;border:1px solid ' + statusColor + '30;">' +
    '<span style="color:' + statusColor + ';font-size:14px;font-weight:700;letter-spacing:1px;">FLIGHT STATUS UPDATE</span></div></div>' +
    '<p style="color:#f0f0f5;font-size:16px;margin:0 0 8px;">Dear ' + name + ',</p>' +
    '<p style="color:#8892b0;font-size:14px;line-height:1.7;margin:0 0 24px;">' + statusMsg + '</p>' +
    '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;">' +
    '<table width="100%" style="border-collapse:collapse;">' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Flight</td><td style="text-align:right;color:#f0f0f5;font-weight:bold;">' + flight.flightNumber + '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Route</td><td style="text-align:right;color:#f0f0f5;">' + flight.departure.city + ' (' + flight.departure.airportCode + ') &rarr; ' + flight.arrival.city + ' (' + flight.arrival.airportCode + ')</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Status</td><td style="text-align:right;color:' + statusColor + ';font-weight:bold;text-transform:uppercase;">' + flight.status + '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Reference</td><td style="text-align:right;color:#818cf8;font-weight:bold;">' + bookingRef + '</td></tr>' +
    '</table></div>' +
    '<a href="' + BASE + '/track/' + bookingRef + '" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;">Track Your Booking</a>' +
    '</div>' +
    '<div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);"><p style="color:#5a6480;font-size:10px;margin:0;">&copy; ' + new Date().getFullYear() + ' SKYLUX Airways</p></div>' +
    '</div></body></html>';
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. INVOICE API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[7] Invoice API...");

writeFile("src/app/api/bookings/invoice/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";
const _f = Flight; const _a = Aircraft;

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return NextResponse.json({ success: false, error: "Booking reference required" }, { status: 400 });
    const booking = await Booking.findOne({ bookingReference: ref.toUpperCase() })
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model" } }).lean();
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    const flight = (booking as any).flights?.[0]?.flight;
    const pax = (booking as any).passengers || [];
    return NextResponse.json({
      success: true,
      data: {
        invoiceNumber: "INV-" + (booking as any).bookingReference,
        bookingReference: (booking as any).bookingReference,
        issueDate: (booking as any).createdAt,
        status: (booking as any).status,
        passenger: pax[0] ? { firstName: pax[0].firstName, lastName: pax[0].lastName } : null,
        contactEmail: (booking as any).contactEmail,
        cabinClass: (booking as any).cabinClass,
        passengerCount: pax.length,
        passengers: pax.map((p: any) => ({ firstName: p.firstName, lastName: p.lastName, cabinClass: p.cabinClass })),
        flight: flight ? { flightNumber: flight.flightNumber, departure: { city: flight.departure?.city, airportCode: flight.departure?.airportCode, scheduledTime: flight.departure?.scheduledTime }, arrival: { city: flight.arrival?.city, airportCode: flight.arrival?.airportCode, scheduledTime: flight.arrival?.scheduledTime }, aircraft: flight.aircraft?.name || "N/A", duration: flight.duration } : null,
        payment: { method: (booking as any).payment?.method, status: (booking as any).payment?.status, amount: (booking as any).payment?.amount, currency: (booking as any).payment?.currency || "USD", transactionId: (booking as any).payment?.transactionId, paidAt: (booking as any).payment?.paidAt },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. INVOICE PAGE (uses array approach to avoid escaping)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[8] Invoice Page...");

var inv = [];
inv.push('"use client";');
inv.push('import { useState, useEffect } from "react";');
inv.push('');
inv.push('const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",emerald:"#10b981",gold:"#c9a96e"};');
inv.push('');
inv.push('export default function InvoicePage({ params }: { params: { ref: string } }) {');
inv.push('  const [data, setData] = useState<any>(null);');
inv.push('  const [loading, setLoading] = useState(true);');
inv.push('  const [error, setError] = useState("");');
inv.push('');
inv.push('  useEffect(() => {');
inv.push('    fetch("/api/bookings/invoice?ref=" + params.ref)');
inv.push('      .then(r => r.json())');
inv.push('      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })');
inv.push('      .catch(() => setError("Failed to load"))');
inv.push('      .finally(() => setLoading(false));');
inv.push('  }, [params.ref]);');
inv.push('');
inv.push('  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); } catch { return "N/A"; } };');
inv.push('');
inv.push('  const generatePDF = async () => {');
inv.push('    if (!data) return;');
inv.push('    const jsPDFModule = await import("jspdf");');
inv.push('    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;');
inv.push('    const doc = new jsPDF({ unit: "mm", format: "a4" });');
inv.push('    const W = 210;');
inv.push('    doc.setFillColor(10, 15, 30); doc.rect(0, 0, W, 50, "F");');
inv.push('    doc.setFillColor(99, 102, 241); doc.rect(0, 0, W, 4, "F");');
inv.push('    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(240, 240, 245);');
inv.push('    doc.text("SKYLUX AIRWAYS", 20, 22);');
inv.push('    doc.setFontSize(10); doc.setTextColor(129, 140, 248); doc.text("TAX INVOICE", 20, 30);');
inv.push('    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 210);');
inv.push('    doc.text("Invoice: " + data.invoiceNumber, 20, 40);');
inv.push('    doc.text("Date: " + fmtDate(data.issueDate), 20, 45);');
inv.push('    doc.text("Ref: " + data.bookingReference, W - 20, 40, { align: "right" });');
inv.push('    let y = 62;');
inv.push('    doc.setFontSize(8); doc.setTextColor(90, 100, 128); doc.text("BILL TO", 20, y); y += 6;');
inv.push('    doc.setFontSize(12); doc.setTextColor(60, 60, 60); doc.setFont("helvetica", "bold");');
inv.push('    const paxName = data.passenger ? data.passenger.firstName + " " + data.passenger.lastName : "N/A";');
inv.push('    doc.text(paxName, 20, y); y += 5;');
inv.push('    doc.setFont("helvetica", "normal"); doc.setFontSize(9);');
inv.push('    doc.text(data.contactEmail || "", 20, y); y += 12;');
inv.push('    doc.setFillColor(245, 245, 250); doc.rect(20, y, W - 40, 20, "F");');
inv.push('    doc.setFontSize(8); doc.setTextColor(90, 100, 128);');
inv.push('    doc.text("FLIGHT", 25, y + 6); doc.text("ROUTE", 65, y + 6); doc.text("DATE", 120, y + 6);');
inv.push('    doc.setFontSize(10); doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "bold");');
inv.push('    if (data.flight) {');
inv.push('      doc.text(data.flight.flightNumber || "N/A", 25, y + 14);');
inv.push('      doc.setFont("helvetica", "normal");');
inv.push('      doc.text((data.flight.departure?.airportCode || "?") + " > " + (data.flight.arrival?.airportCode || "?"), 65, y + 14);');
inv.push('      doc.text(data.flight.departure?.scheduledTime ? new Date(data.flight.departure.scheduledTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "TBD", 120, y + 14);');
inv.push('    }');
inv.push('    y += 28;');
inv.push('    doc.setFillColor(99, 102, 241); doc.rect(20, y, W - 40, 8, "F");');
inv.push('    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);');
inv.push('    doc.text("DESCRIPTION", 25, y + 5.5); doc.text("QTY", 120, y + 5.5); doc.text("AMOUNT", W - 25, y + 5.5, { align: "right" }); y += 12;');
inv.push('    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); doc.setFontSize(9);');
inv.push('    const classLabel = (data.cabinClass || "economy").charAt(0).toUpperCase() + (data.cabinClass || "economy").slice(1);');
inv.push('    doc.text(classLabel + " Class - " + (data.flight?.flightNumber || ""), 25, y + 1);');
inv.push('    doc.text(String(data.passengerCount), 120, y + 1);');
inv.push('    doc.text("$" + (data.payment.amount || 0).toLocaleString(), W - 25, y + 1, { align: "right" }); y += 16;');
inv.push('    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(99, 102, 241);');
inv.push('    doc.text("TOTAL", 130, y); doc.text("$" + (data.payment.amount || 0).toLocaleString() + " USD", W - 25, y, { align: "right" }); y += 16;');
inv.push('    doc.setFontSize(8); doc.setTextColor(90, 100, 128); doc.setFont("helvetica", "normal");');
inv.push('    doc.text("Payment: " + (data.payment.method || "N/A").toUpperCase() + " | TXN: " + (data.payment.transactionId || "N/A"), 20, y); y += 8;');
inv.push('    data.passengers?.forEach((p: any, i: number) => { doc.text((i + 1) + ". " + p.firstName + " " + p.lastName, 20, y); y += 5; });');
inv.push('    doc.setFontSize(7); doc.setTextColor(150, 150, 150);');
inv.push('    doc.text("SKYLUX Airways Ltd. | admin@skylux.pro | This is a computer-generated invoice.", W / 2, 280, { align: "center" });');
inv.push('    doc.save("SKYLUX_Invoice_" + data.bookingReference + ".pdf");');
inv.push('  };');
inv.push('');
inv.push('  if (loading) return (<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:36,height:36,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite"}} /><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);');
inv.push('  if (error || !data) return (<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.sub}}><p>{error || "Not found"}</p></div></div>);');
inv.push('');
inv.push('  return (');
inv.push('    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"\'Segoe UI\',Arial,sans-serif"}}>');
inv.push('      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}"}</style>');
inv.push('      <div style={{maxWidth:700,margin:"0 auto",animation:"fadeUp 0.6s ease"}}>');
inv.push('        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>');
inv.push('          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>');
inv.push('          <button onClick={generatePDF} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>Download Invoice PDF</button>');
inv.push('        </div>');
inv.push('');
inv.push('        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>');
inv.push('          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>');
inv.push('            <div>');
inv.push('              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>INVOICE</div>');
inv.push('              <div style={{fontSize:20,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>{data.invoiceNumber}</div>');
inv.push('              <div style={{fontSize:11,color:C.dim,marginTop:4}}>Issued: {fmtDate(data.issueDate)}</div>');
inv.push('            </div>');
inv.push('            <span style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:700,height:"fit-content",background:(data.payment.status==="completed"?C.emerald:C.accent)+"15",color:data.payment.status==="completed"?C.emerald:C.accent,textTransform:"uppercase"}}>{data.payment.status}</span>');
inv.push('          </div>');
inv.push('          <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>');
inv.push('            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:4}}>BILL TO</div>');
inv.push('            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{data.passenger?.firstName} {data.passenger?.lastName}</div>');
inv.push('            <div style={{fontSize:12,color:C.sub}}>{data.contactEmail}</div>');
inv.push('          </div>');
inv.push('          {data.flight && (');
inv.push('            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>');
inv.push('              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>');
inv.push('                <div style={{textAlign:"center"}}><div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.departure.airportCode}</div><div style={{color:C.dim,fontSize:11}}>{data.flight.departure.city}</div></div>');
inv.push('                <div style={{textAlign:"center",flex:1}}><div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div><div style={{borderTop:"1px dashed "+C.border,margin:"6px 20px"}} /><div style={{color:C.dim,fontSize:10}}>{data.flight.aircraft}</div></div>');
inv.push('                <div style={{textAlign:"center"}}><div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.arrival.airportCode}</div><div style={{color:C.dim,fontSize:11}}>{data.flight.arrival.city}</div></div>');
inv.push('              </div>');
inv.push('            </div>');
inv.push('          )}');
inv.push('          <div style={{padding:"20px 28px",display:"flex",justifyContent:"flex-end"}}>');
inv.push('            <div style={{width:250}}>');
inv.push('              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>');
inv.push('                <span style={{fontSize:14,color:C.sub}}>Subtotal</span>');
inv.push('                <span style={{fontSize:14,color:C.text}}>{"$"}{(data.payment.amount||0).toLocaleString()}</span>');
inv.push('              </div>');
inv.push('              <div style={{borderTop:"2px solid "+C.accent,paddingTop:10,display:"flex",justifyContent:"space-between"}}>');
inv.push('                <span style={{fontSize:18,fontWeight:700,color:C.text}}>Total</span>');
inv.push('                <span style={{fontSize:18,fontWeight:700,color:C.accent}}>{"$"}{(data.payment.amount||0).toLocaleString()} USD</span>');
inv.push('              </div>');
inv.push('            </div>');
inv.push('          </div>');
inv.push('          <div style={{padding:"16px 28px",borderTop:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>');
inv.push('            <span style={{fontSize:10,color:C.dim}}>Payment: {(data.payment.method||"").toUpperCase()} | TXN: {data.payment.transactionId||"N/A"}</span>');
inv.push('            <span style={{fontSize:10,color:C.dim}}>SKYLUX Airways Ltd.</span>');
inv.push('          </div>');
inv.push('        </div>');
inv.push('      </div>');
inv.push('    </div>');
inv.push('  );');
inv.push('}');

writeFile("src/app/invoice/[ref]/page.tsx", inv.join("\n"));


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. ADMIN FLIGHTS PAGE (Flight Creator + Status Updates)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[9] Admin Flights Page...");

var af = [];
af.push('"use client";');
af.push('import { useState, useEffect } from "react";');
af.push('');
af.push('const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24"};');
af.push('const statusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,departed:C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot};');
af.push('const STATUSES = ["scheduled","boarding","departed","in-flight","landed","arrived","delayed","cancelled"];');
af.push('');
af.push('export default function FlightsPage() {');
af.push('  const [flights, setFlights] = useState<any[]>([]);');
af.push('  const [loading, setLoading] = useState(true);');
af.push('  const [showCreate, setShowCreate] = useState(false);');
af.push('  const [showStatus, setShowStatus] = useState<any>(null);');
af.push('  const [msg, setMsg] = useState("");');
af.push('  const [creating, setCreating] = useState(false);');
af.push('  const [fn, setFn] = useState("SX "); const [dep, setDep] = useState(""); const [arr, setArr] = useState("");');
af.push('  const [depTime, setDepTime] = useState(""); const [arrTime, setArrTime] = useState("");');
af.push('  const [pEcon, setPEcon] = useState("500"); const [pPrem, setPPrem] = useState("900"); const [pBiz, setPBiz] = useState("2500"); const [pFirst, setPFirst] = useState("6000");');
af.push('  const [newStatus, setNewStatus] = useState(""); const [delayMin, setDelayMin] = useState(""); const [statusNote, setStatusNote] = useState(""); const [updating, setUpdating] = useState(false);');
af.push('');
af.push('  const load = () => { setLoading(true); fetch("/api/flights/search?limit=50&sortBy=departure").then(r => r.json()).then(d => { if (d.success) setFlights(d.data?.flights || []); }).finally(() => setLoading(false)); };');
af.push('  useEffect(load, []);');
af.push('');
af.push('  const createFlight = async () => {');
af.push('    if (!fn.trim() || !dep.trim() || !arr.trim() || !depTime || !arrTime) { setMsg("Error: Fill all required fields"); return; }');
af.push('    setCreating(true); setMsg("");');
af.push('    try {');
af.push('      const res = await fetch("/api/admin/flights/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flightNumber: fn.trim(), departure: dep.trim(), arrival: arr.trim(), departureTime: depTime, arrivalTime: arrTime, prices: { economy: +pEcon, premium: +pPrem, business: +pBiz, first: +pFirst } }) });');
af.push('      const d = await res.json();');
af.push('      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));');
af.push('      if (d.success) { setShowCreate(false); setFn("SX "); setDep(""); setArr(""); load(); }');
af.push('    } catch { setMsg("Error: Network error"); }');
af.push('    setCreating(false); setTimeout(() => setMsg(""), 4000);');
af.push('  };');
af.push('');
af.push('  const updateStatus = async () => {');
af.push('    if (!showStatus || !newStatus) return;');
af.push('    setUpdating(true); setMsg("");');
af.push('    try {');
af.push('      const res = await fetch("/api/admin/flights/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flightId: showStatus._id, status: newStatus, delayMinutes: delayMin ? +delayMin : undefined, note: statusNote }) });');
af.push('      const d = await res.json();');
af.push('      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));');
af.push('      if (d.success) { setShowStatus(null); setNewStatus(""); setDelayMin(""); setStatusNote(""); load(); }');
af.push('    } catch { setMsg("Error: Network error"); }');
af.push('    setUpdating(false); setTimeout(() => setMsg(""), 5000);');
af.push('  };');
af.push('');
af.push('  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };');
af.push('  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" }); } catch { return "TBD"; } };');
af.push('  const inp = (v: string, set: (v:string)=>void, ph: string, extra?: any) => (<input value={v} onChange={e=>set(e.target.value)} placeholder={ph} {...extra} style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...(extra?.style||{})}} />);');
af.push('');
af.push('  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:"3px solid "+C.accent+"20",borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;');
af.push('');
af.push('  return (');
af.push('    <div style={{padding:"28px 32px",fontFamily:"\'Plus Jakarta Sans\',system-ui,sans-serif",color:C.text}}>');
af.push('      <style>{".mono{font-family:\'JetBrains Mono\',monospace}@keyframes spin{to{transform:rotate(360deg)}}"}</style>');
af.push('      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>');
af.push('        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Flights</h1><p style={{fontSize:13,color:C.textDim}}>{flights.length} flights in system</p></div>');
af.push('        <button onClick={()=>setShowCreate(true)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Create Flight</button>');
af.push('      </div>');
af.push('');
af.push('      {msg && <div style={{padding:"10px 16px",marginBottom:14,borderRadius:10,background:msg.startsWith("Done")?C.emerald+"12":C.hot+"12",border:"1px solid "+(msg.startsWith("Done")?C.emerald:C.hot)+"25",fontSize:13,color:msg.startsWith("Done")?C.emerald:C.hot,fontWeight:600}}>{msg}</div>}');
af.push('');
af.push('      <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:18,overflow:"hidden"}}>');
af.push('        {flights.length===0 ? (<div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}>No flights yet. Create one above.</div>) : (');
af.push('          <table style={{width:"100%",borderCollapse:"collapse"}}>');
af.push('            <thead><tr style={{borderBottom:"1px solid "+C.glassBorder}}>{["Flight","Route","Date","Departs","Status","Seats","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>');
af.push('            <tbody>{flights.map((f: any, i: number) => (');
af.push('              <tr key={f._id||i} style={{borderBottom:"1px solid "+C.glassBorder+"08"}}>');
af.push('                <td className="mono" style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.accentLight}}>{f.flightNumber}</td>');
af.push('                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{f.departure?.airportCode} - {f.arrival?.airportCode}</td>');
af.push('                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{fmtDate(f.departure?.scheduledTime)}</td>');
af.push('                <td style={{padding:"12px 14px",fontSize:12,color:C.text}}>{fmtTime(f.departure?.scheduledTime)}</td>');
af.push('                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[f.status]||C.textDim)+"12",color:statusColors[f.status]||C.textDim,textTransform:"uppercase"}}>{f.status}</span></td>');
af.push('                <td style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>{f.seatMap?.reduce((a:number,s:any)=>a+(s.availableSeats||0),0) || "?"}</td>');
af.push('                <td style={{padding:"12px 14px"}}>{f._id && <button onClick={()=>{setShowStatus(f);setNewStatus(f.status)}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+C.accent+"25",background:"transparent",color:C.accentLight,fontSize:10,fontWeight:600,cursor:"pointer"}}>Update Status</button>}</td>');
af.push('              </tr>');
af.push('            ))}</tbody>');
af.push('          </table>');
af.push('        )}');
af.push('      </div>');
af.push('');
af.push('      {showCreate && (');
af.push('        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowCreate(false)}>');
af.push('          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:520}} onClick={e=>e.stopPropagation()}>');
af.push('            <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>Create New Flight</h3>');
af.push('            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>');
af.push('              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FLIGHT NUMBER*</label>{inp(fn,setFn,"SX 100")}</div>');
af.push('              <div></div>');
af.push('              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FROM (IATA)*</label>{inp(dep,s=>setDep(s.toUpperCase()),"e.g. LHR")}</div>');
af.push('              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>TO (IATA)*</label>{inp(arr,s=>setArr(s.toUpperCase()),"e.g. JFK")}</div>');
af.push('              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DEPARTURE*</label>{inp(depTime,setDepTime,"",{type:"datetime-local"})}</div>');
af.push('              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>ARRIVAL*</label>{inp(arrTime,setArrTime,"",{type:"datetime-local"})}</div>');
af.push('            </div>');
af.push('            <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6,marginTop:8}}>PRICING (USD)</div>');
af.push('            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>');
af.push('              <div><label style={{fontSize:9,color:C.textDim}}>Economy</label>{inp(pEcon,setPEcon,"500")}</div>');
af.push('              <div><label style={{fontSize:9,color:C.textDim}}>Premium</label>{inp(pPrem,setPPrem,"900")}</div>');
af.push('              <div><label style={{fontSize:9,color:C.textDim}}>Business</label>{inp(pBiz,setPBiz,"2500")}</div>');
af.push('              <div><label style={{fontSize:9,color:C.textDim}}>First</label>{inp(pFirst,setPFirst,"6000")}</div>');
af.push('            </div>');
af.push('            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>');
af.push('              <button onClick={()=>setShowCreate(false)} style={{padding:"10px 20px",borderRadius:10,border:"1px solid "+C.glassBorder,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>');
af.push('              <button onClick={createFlight} disabled={creating} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:creating?"wait":"pointer"}}>{creating?"Creating...":"Create Flight"}</button>');
af.push('            </div>');
af.push('          </div>');
af.push('        </div>');
af.push('      )}');
af.push('');
af.push('      {showStatus && (');
af.push('        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowStatus(null)}>');
af.push('          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:480}} onClick={e=>e.stopPropagation()}>');
af.push('            <h3 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Update Flight Status</h3>');
af.push('            <p style={{fontSize:12,color:C.textDim,marginBottom:20}}>{showStatus.flightNumber} - {showStatus.departure?.airportCode} to {showStatus.arrival?.airportCode}</p>');
af.push('            <div style={{marginBottom:14}}>');
af.push('              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6}}>NEW STATUS</label>');
af.push('              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>');
af.push('                {STATUSES.map(s=>(<button key={s} onClick={()=>setNewStatus(s)} style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+(newStatus===s?(statusColors[s]||C.accent):C.glassBorder),background:newStatus===s?(statusColors[s]||C.accent)+"15":"transparent",color:newStatus===s?(statusColors[s]||C.accent):C.textSoft,fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{s}</button>))}');
af.push('              </div>');
af.push('            </div>');
af.push('            {newStatus==="delayed"&&(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DELAY (MINUTES)</label>{inp(delayMin,setDelayMin,"e.g. 45",{type:"number"})}</div>)}');
af.push('            <div style={{marginBottom:20}}>');
af.push('              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>NOTE (optional)</label>');
af.push('              <textarea value={statusNote} onChange={e=>setStatusNote(e.target.value)} placeholder="Info for passengers..." style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:60}} />');
af.push('            </div>');
af.push('            <div style={{padding:"12px 16px",background:C.amber+"08",border:"1px solid "+C.amber+"20",borderRadius:10,marginBottom:20}}>');
af.push('              <div style={{fontSize:11,color:C.amber}}>All passengers with confirmed bookings on this flight will be emailed.</div>');
af.push('            </div>');
af.push('            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>');
af.push('              <button onClick={()=>setShowStatus(null)} style={{padding:"10px 20px",borderRadius:10,border:"1px solid "+C.glassBorder,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>');
af.push('              <button onClick={updateStatus} disabled={updating||!newStatus} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:updating?"wait":"pointer",opacity:newStatus?1:0.5}}>{updating?"Updating...":"Update & Notify"}</button>');
af.push('            </div>');
af.push('          </div>');
af.push('        </div>');
af.push('      )}');
af.push('    </div>');
af.push('  );');
af.push('}');

writeFile("src/app/(admin)/flights/page.tsx", af.join("\n"));


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. Update Admin Bookings with payment confirm + invoice
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[10] Updating Admin Bookings...");

const bookingsPath = "src/app/(admin)/bookings/page.tsx";
if (fs.existsSync(bookingsPath)) {
  let bc = fs.readFileSync(bookingsPath, "utf8");
  if (!bc.includes("confirmPayment")) {
    bc = bc.replace(
      "const cancelBooking=async(id:string)=>{",
      `const confirmPayment=async(id:string)=>{
    if(!confirm("Confirm this payment as received?"))return;
    setSendingEmail(id+"pay");
    try{
      const res=await fetch("/api/admin/bookings/confirm-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:id})});
      const d=await res.json();
      setEmailMsg(d.success?"Done: "+d.message:"Error: "+(d.error||"Failed"));
    }catch{setEmailMsg("Error: Network error")}
    setTimeout(()=>{setSendingEmail(null);setEmailMsg("")},3000);
    load();
  };

  const cancelBooking=async(id:string)=>{`
    );
    bc = bc.replace(
      '{btn("Send E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}',
      '{btn("Send E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}\n                    {b.payment?.status!=="completed"&&btn("Confirm Payment",C.emerald,()=>confirmPayment(b._id),sendingEmail===b._id+"pay")}\n                    <a href={"/invoice/"+b.bookingReference} target="_blank" rel="noreferrer" style={{padding:"6px 14px",borderRadius:8,background:C.glassBorder,color:C.textSoft,fontSize:11,fontWeight:700,textDecoration:"none"}}>Invoice</a>'
    );
    bc = bc.replace(
      '{b.status==="pending"&&btn("Cancel",C.hot,()=>cancelBooking(b._id))}',
      '{b.status==="pending"&&<>{btn("Confirm Pay",C.emerald,()=>confirmPayment(b._id),sendingEmail===b._id+"pay")}{btn("Cancel",C.hot,()=>cancelBooking(b._id))}</>}'
    );
    fs.writeFileSync(bookingsPath, bc, "utf8");
    console.log("  Updated: " + bookingsPath);
  } else {
    console.log("  Skipped (already updated): " + bookingsPath);
  }
}


console.log("\n=== All features created! ===");
console.log("\nRun: git add -A && git commit -m 'Add all new features' && git push");
