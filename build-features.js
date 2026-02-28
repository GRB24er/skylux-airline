/**
 * SKYLUX Airways Feature Builder
 * Creates: Landing Page, Booking Tracker, Admin Flight Creator,
 * Payment Confirmation, Flight Status Updates, Invoice PDF
 * 
 * Run: node build-features.js
 */

const fs = require("fs");
const path = require("path");

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  console.log("  Created: " + filePath);
}

console.log("\n=== SKYLUX Airways Feature Builder ===\n");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. LANDING PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[1/9] Landing Page...");

writeFile("src/app/page.tsx", `"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const T = {
  bg:"#030614",surface:"#0a0f1e",card:"#0c1121",
  border:"rgba(255,255,255,0.06)",text:"#f0f0f5",
  sub:"#8892b0",dim:"#5a6480",accent:"#6366f1",
  accentLight:"#818cf8",cyan:"#22d3ee",gold:"#c9a96e",
  goldDim:"#a68a4b",emerald:"#10b981",hot:"#ef4444",
};

const DESTINATIONS = [
  {city:"London",code:"LHR",country:"United Kingdom",img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop"},
  {city:"Dubai",code:"DXB",country:"UAE",img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop"},
  {city:"Tokyo",code:"NRT",country:"Japan",img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"},
  {city:"New York",code:"JFK",country:"USA",img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop"},
  {city:"Singapore",code:"SIN",country:"Singapore",img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop"},
  {city:"Paris",code:"CDG",country:"France",img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop"},
];

const STATS = [
  {n:"140+",l:"Destinations"},
  {n:"50+",l:"Aircraft"},
  {n:"99.2%",l:"On-Time Rate"},
  {n:"24/7",l:"Support"},
];

const CLASSES = [
  {name:"First Class",desc:"Private suites with shower spa, personal minibar, and chauffeur service",color:T.gold,features:["Private Suite","Shower Spa","Dine On Demand","Chauffeur Transfer"]},
  {name:"Business Class",desc:"Lie-flat beds with direct aisle access, premium dining, and lounge access",color:T.accent,features:["Lie-Flat Bed","Direct Aisle","Lounge Access","Amenity Kit"]},
  {name:"Premium Economy",desc:"Extra legroom, priority boarding, enhanced meal service",color:T.cyan,features:["Extra Legroom","Priority Boarding","Enhanced Meals","USB Power"]},
  {name:"Economy",desc:"Comfortable seating with personal entertainment and complimentary meals",color:T.sub,features:["Personal IFE","Complimentary Meals","USB Charging","Wi-Fi"]},
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [trackRef, setTrackRef] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{background:T.bg,color:T.text,fontFamily:"'Segoe UI','Plus Jakarta Sans',system-ui,sans-serif",overflowX:"hidden"}}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .hero-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,0.4)!important}
        .dest-card:hover{transform:translateY(-8px);border-color:rgba(255,255,255,0.15)!important}
        .class-card:hover{border-color:rgba(255,255,255,0.15)!important;background:rgba(255,255,255,0.03)!important}
        .nav-link:hover{color:#f0f0f5!important}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
      \`}</style>

      {/* ━━ NAVBAR ━━ */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",background:scrollY>50?"rgba(3,6,20,0.95)":"transparent",backdropFilter:scrollY>50?"blur(20px)":"none",borderBottom:scrollY>50?"1px solid "+T.border:"none",transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:4,color:T.text}}>SKYLUX</div>
          <div style={{fontSize:8,letterSpacing:4,color:T.accent,fontWeight:600}}>AIRWAYS</div>
        </div>
        <div style={{display:"flex",gap:32,alignItems:"center"}}>
          {["Destinations","Fleet","Classes","Track"].map(s=>(
            <a key={s} href={"#"+s.toLowerCase()} className="nav-link" style={{color:T.sub,fontSize:13,textDecoration:"none",fontWeight:500,transition:"color 0.2s",letterSpacing:0.5}}>{s}</a>
          ))}
          <Link href="/portal" style={{padding:"8px 24px",borderRadius:8,background:"linear-gradient(135deg,"+T.gold+","+T.goldDim+")",color:"#0a0f1e",fontSize:13,fontWeight:700,textDecoration:"none",letterSpacing:0.5,transition:"all 0.3s"}} className="hero-btn">Book Now</Link>
          <Link href="/auth" style={{padding:"8px 20px",borderRadius:8,border:"1px solid "+T.border,color:T.sub,fontSize:13,fontWeight:500,textDecoration:"none"}}>Sign In</Link>
        </div>
      </nav>

      {/* ━━ HERO ━━ */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:"0 40px"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)"}} />
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 30%, rgba(201,169,110,0.05) 0%, transparent 50%)"}} />
        <div style={{position:"absolute",inset:0,opacity:0.02,backgroundImage:"linear-gradient("+T.accent+" 1px, transparent 1px), linear-gradient(90deg, "+T.accent+" 1px, transparent 1px)",backgroundSize:"60px 60px"}} />

        <div style={{textAlign:"center",position:"relative",zIndex:2,maxWidth:900,animation:"fadeUp 1s ease"}}>
          <div style={{fontSize:12,letterSpacing:6,color:T.gold,fontWeight:600,marginBottom:24}}>ELEVATE YOUR JOURNEY</div>
          <h1 style={{fontSize:"clamp(42px,7vw,80px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1,marginBottom:24}}>
            Fly Beyond <br/><em style={{fontStyle:"italic",color:T.accent}}>Expectations</em>
          </h1>
          <p style={{fontSize:18,color:T.sub,maxWidth:600,margin:"0 auto 40px",lineHeight:1.7,fontWeight:300}}>
            Experience the pinnacle of air travel. Private suites, world-class dining, and destinations spanning the globe.
          </p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/portal" className="hero-btn" style={{padding:"16px 48px",borderRadius:12,background:"linear-gradient(135deg,"+T.gold+","+T.goldDim+")",color:"#0a0f1e",fontSize:15,fontWeight:700,textDecoration:"none",letterSpacing:1,transition:"all 0.3s",boxShadow:"0 4px 20px rgba(201,169,110,0.3)"}}>Search Flights</Link>
            <Link href="/portal" className="hero-btn" style={{padding:"16px 40px",borderRadius:12,border:"1px solid "+T.border,color:T.text,fontSize:15,fontWeight:500,textDecoration:"none",transition:"all 0.3s",background:"rgba(255,255,255,0.02)"}}>Explore Destinations</Link>
          </div>
        </div>

        <div style={{position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",animation:"float 3s ease infinite"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ━━ STATS BAR ━━ */}
      <section style={{padding:"40px 0",borderTop:"1px solid "+T.border,borderBottom:"1px solid "+T.border}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,padding:"0 40px"}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:36,fontWeight:700,color:T.accent,fontFamily:"'DM Sans',sans-serif"}}>{s.n}</div>
              <div style={{fontSize:12,color:T.dim,letterSpacing:2,marginTop:4}}>{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━ DESTINATIONS ━━ */}
      <section id="destinations" style={{padding:"100px 40px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <div style={{fontSize:11,letterSpacing:5,color:T.gold,fontWeight:600,marginBottom:12}}>WHERE WE FLY</div>
          <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif"}}>Explore Our <em style={{fontStyle:"italic",color:T.accent}}>Destinations</em></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {DESTINATIONS.map((d,i)=>(
            <Link href="/portal" key={i} className="dest-card" style={{background:T.card,border:"1px solid "+T.border,borderRadius:16,overflow:"hidden",textDecoration:"none",transition:"all 0.4s",cursor:"pointer"}}>
              <div style={{height:200,background:"linear-gradient(135deg, rgba(99,102,241,0.2), rgba(201,169,110,0.1))",position:"relative",overflow:"hidden"}}>
                <img src={d.img} alt={d.city} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.7}} onError={(e:any)=>{e.target.style.display="none"}} />
                <div style={{position:"absolute",top:12,right:12,padding:"4px 12px",borderRadius:6,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
                  <span style={{color:T.accent,fontSize:14,fontWeight:700,fontFamily:"monospace"}}>{d.code}</span>
                </div>
              </div>
              <div style={{padding:"20px 24px"}}>
                <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>{d.city}</div>
                <div style={{fontSize:12,color:T.dim}}>{d.country}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ━━ CABIN CLASSES ━━ */}
      <section id="classes" style={{padding:"100px 40px",background:"linear-gradient(180deg, transparent, rgba(99,102,241,0.03), transparent)"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:60}}>
            <div style={{fontSize:11,letterSpacing:5,color:T.gold,fontWeight:600,marginBottom:12}}>CABIN EXPERIENCE</div>
            <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif"}}>Travel in <em style={{fontStyle:"italic",color:T.accent}}>Style</em></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {CLASSES.map((cls,i)=>(
              <div key={i} className="class-card" style={{background:T.card,border:"1px solid "+T.border,borderRadius:16,padding:28,transition:"all 0.3s"}}>
                <div style={{width:40,height:4,borderRadius:2,background:cls.color,marginBottom:20}} />
                <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>{cls.name}</div>
                <div style={{fontSize:12,color:T.sub,lineHeight:1.6,marginBottom:20,minHeight:60}}>{cls.desc}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {cls.features.map((f,fi)=>(
                    <div key={fi} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:4,height:4,borderRadius:2,background:cls.color,flexShrink:0}} />
                      <span style={{fontSize:11,color:T.dim}}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ FLEET ━━ */}
      <section id="fleet" style={{padding:"100px 40px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <div style={{fontSize:11,letterSpacing:5,color:T.gold,fontWeight:600,marginBottom:12}}>OUR FLEET</div>
          <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif"}}>World-Class <em style={{fontStyle:"italic",color:T.accent}}>Aircraft</em></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20}}>
          {[
            {name:"Boeing 787-9 Dreamliner",specs:"290 seats | 7,635 nm range | Mach 0.85",features:["Quieter cabin technology","LED mood lighting","Larger windows","Lower cabin altitude"]},
            {name:"Airbus A350-900",specs:"315 seats | 8,100 nm range | Mach 0.85",features:["Carbon fiber fuselage","Advanced air filtration","Extra-wide seats","Full LED lighting"]},
          ].map((a,i)=>(
            <div key={i} style={{background:T.card,border:"1px solid "+T.border,borderRadius:16,padding:32,transition:"all 0.3s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>{a.name}</div>
                  <div style={{fontSize:12,color:T.dim,fontFamily:"monospace"}}>{a.specs}</div>
                </div>
                <div style={{fontSize:32,opacity:0.15}}>&#9992;</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {a.features.map((f,fi)=>(
                  <div key={fi} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:T.surface,borderRadius:8}}>
                    <div style={{width:6,height:6,borderRadius:3,background:T.emerald,flexShrink:0}} />
                    <span style={{fontSize:11,color:T.sub}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━ TRACK BOOKING ━━ */}
      <section id="track" style={{padding:"100px 40px",background:"linear-gradient(180deg, transparent, rgba(201,169,110,0.03), transparent)"}}>
        <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:5,color:T.gold,fontWeight:600,marginBottom:12}}>BOOKING TRACKER</div>
          <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:12}}>Track Your <em style={{fontStyle:"italic",color:T.accent}}>Journey</em></h2>
          <p style={{fontSize:14,color:T.sub,marginBottom:32}}>Enter your booking reference to view real-time status, flight details, and gate information.</p>
          <div style={{display:"flex",gap:10,maxWidth:440,margin:"0 auto"}}>
            <input
              value={trackRef}
              onChange={e=>setTrackRef(e.target.value.toUpperCase())}
              placeholder="e.g. SLX-AB1234"
              onKeyDown={e=>{if(e.key==="Enter"&&trackRef.trim())window.location.href="/track/"+trackRef.trim()}}
              style={{flex:1,padding:"14px 20px",background:T.surface,border:"1px solid "+T.border,borderRadius:12,color:T.text,fontSize:15,fontFamily:"monospace",outline:"none",letterSpacing:2}}
            />
            <button
              onClick={()=>{if(trackRef.trim())window.location.href="/track/"+trackRef.trim()}}
              style={{padding:"14px 32px",borderRadius:12,border:"none",background:"linear-gradient(135deg,"+T.accent+",#7c3aed)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.3s"}}
              className="hero-btn"
            >Track</button>
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━ */}
      <section style={{padding:"100px 40px"}}>
        <div style={{maxWidth:900,margin:"0 auto",textAlign:"center",background:T.card,border:"1px solid "+T.border,borderRadius:24,padding:"60px 40px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)"}} />
          <div style={{position:"relative",zIndex:2}}>
            <h2 style={{fontSize:"clamp(28px,4vw,40px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:16}}>Ready to <em style={{fontStyle:"italic",color:T.accent}}>Fly?</em></h2>
            <p style={{fontSize:16,color:T.sub,marginBottom:36,maxWidth:500,margin:"0 auto 36px"}}>Book your next flight with SKYLUX Airways and experience travel redefined.</p>
            <Link href="/portal" className="hero-btn" style={{display:"inline-block",padding:"16px 56px",borderRadius:12,background:"linear-gradient(135deg,"+T.gold+","+T.goldDim+")",color:"#0a0f1e",fontSize:16,fontWeight:700,textDecoration:"none",letterSpacing:1,transition:"all 0.3s",boxShadow:"0 4px 20px rgba(201,169,110,0.3)"}}>Book Your Flight</Link>
          </div>
        </div>
      </section>

      {/* ━━ FOOTER ━━ */}
      <footer style={{borderTop:"1px solid "+T.border,padding:"60px 40px 40px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:4,marginBottom:8}}>SKYLUX <span style={{color:T.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
            <p style={{fontSize:12,color:T.dim,lineHeight:1.8,maxWidth:280}}>Setting the global standard for luxury air travel. Every journey is crafted to exceed expectations.</p>
          </div>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:T.dim,fontWeight:700,marginBottom:16}}>QUICK LINKS</div>
            {[{l:"Book a Flight",h:"/portal"},{l:"Check-In",h:"/checkin"},{l:"Track Booking",h:"/track"},{l:"Our Fleet",h:"#fleet"}].map(lnk=>(
              <Link key={lnk.l} href={lnk.h} style={{display:"block",color:T.sub,fontSize:13,textDecoration:"none",marginBottom:10}}>{lnk.l}</Link>
            ))}
          </div>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:T.dim,fontWeight:700,marginBottom:16}}>SUPPORT</div>
            {["Help Center","Contact Us","Baggage Info","Special Assistance"].map(s=>(
              <div key={s} style={{color:T.sub,fontSize:13,marginBottom:10}}>{s}</div>
            ))}
          </div>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:T.dim,fontWeight:700,marginBottom:16}}>CONTACT</div>
            <div style={{color:T.sub,fontSize:13,marginBottom:10}}>admin@skylux.pro</div>
            <div style={{color:T.sub,fontSize:13,marginBottom:10}}>+44 20 7946 0958</div>
            <div style={{color:T.sub,fontSize:13}}>London, United Kingdom</div>
          </div>
        </div>
        <div style={{maxWidth:1200,margin:"40px auto 0",paddingTop:24,borderTop:"1px solid "+T.border,display:"flex",justifyContent:"space-between"}}>
          <div style={{fontSize:11,color:T.dim}}>&#169; {new Date().getFullYear()} SKYLUX Airways. All rights reserved.</div>
          <div style={{display:"flex",gap:20}}>
            {["Privacy Policy","Terms of Service","Cookie Policy"].map(s=>(
              <span key={s} style={{fontSize:11,color:T.dim}}>{s}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. BOOKING TRACKER API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[2/9] Booking Tracker API...");

writeFile("src/app/api/track/route.ts", `import { NextRequest, NextResponse } from "next/server";
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
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model manufacturer" } })
      .lean();

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const flight = (booking as any).flights?.[0]?.flight;
    const pax = (booking as any).passengers || [];

    return NextResponse.json({
      success: true,
      data: {
        bookingReference: (booking as any).bookingReference,
        status: (booking as any).status,
        cabinClass: (booking as any).cabinClass,
        passengerCount: pax.length,
        passengers: pax.map((p: any) => ({ firstName: p.firstName, lastName: p.lastName })),
        payment: {
          status: (booking as any).payment?.status,
          amount: (booking as any).payment?.amount,
          method: (booking as any).payment?.method,
        },
        flight: flight ? {
          flightNumber: flight.flightNumber,
          status: flight.status,
          aircraft: flight.aircraft?.name || "N/A",
          departure: {
            city: flight.departure?.city,
            airportCode: flight.departure?.airportCode,
            airport: flight.departure?.airport,
            terminal: flight.departure?.terminal,
            gate: flight.departure?.gate,
            scheduledTime: flight.departure?.scheduledTime,
            actualTime: flight.departure?.actualTime,
          },
          arrival: {
            city: flight.arrival?.city,
            airportCode: flight.arrival?.airportCode,
            airport: flight.arrival?.airport,
            terminal: flight.arrival?.terminal,
            gate: flight.arrival?.gate,
            scheduledTime: flight.arrival?.scheduledTime,
            actualTime: flight.arrival?.actualTime,
          },
          duration: flight.duration,
          distance: flight.distance,
        } : null,
        createdAt: (booking as any).createdAt,
        boardingPassAvailable: ["confirmed","checked-in","boarded","completed"].includes((booking as any).status),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. BOOKING TRACKER PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[3/9] Booking Tracker Page...");

writeFile("src/app/track/[ref]/page.tsx", `"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  bg:"#030614",card:"#0a0f1e",surface:"#0d1225",
  border:"rgba(255,255,255,0.06)",text:"#f0f0f5",
  sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",
  accentDark:"#6366f1",cyan:"#22d3ee",gold:"#c9a96e",
  emerald:"#10b981",hot:"#ef4444",amber:"#fbbf24",
};

const statusSteps = ["pending","confirmed","checked-in","boarded","completed"];
const statusColors: Record<string,string> = {confirmed:C.emerald,pending:C.amber,"checked-in":C.cyan,boarded:C.accent,completed:C.emerald,cancelled:C.hot,delayed:C.hot};
const flightStatusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot,departed:C.cyan};

export default function TrackPage({ params }: { params: { ref: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/track?ref=" + params.ref)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.ref]);

  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch { return "TBD"; } };

  if (loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />
        <div style={{color:C.sub,fontSize:14}}>Tracking your booking...</div>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:400,padding:32}}>
        <div style={{fontSize:48,marginBottom:16,opacity:0.3}}>&#128270;</div>
        <h2 style={{color:C.text,margin:"0 0 8px",fontSize:20}}>Booking Not Found</h2>
        <p style={{color:C.sub,fontSize:14,margin:"0 0 24px"}}>{error}</p>
        <Link href="/#track" style={{color:C.accent,fontSize:14,textDecoration:"none"}}>&#8592; Try Another Reference</Link>
      </div>
    </div>
  );

  if (!data) return null;

  const currentStep = statusSteps.indexOf(data.status);
  const isCancelled = data.status === "cancelled";

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}.track-card{animation:fadeUp 0.6s ease}"}</style>

      <div className="track-card" style={{maxWidth:700,margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <Link href="/" style={{color:C.dim,fontSize:13,textDecoration:"none"}}>&#8592; Back to Home</Link>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
        </div>

        {/* Status Card */}
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>BOOKING REFERENCE</div>
              <div style={{fontSize:28,fontWeight:700,color:C.accent,letterSpacing:4,fontFamily:"monospace"}}>{data.bookingReference}</div>
            </div>
            <span style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:(statusColors[data.status]||C.dim)+"15",color:statusColors[data.status]||C.dim,textTransform:"uppercase",letterSpacing:1}}>{data.status}</span>
          </div>

          {/* Progress Steps */}
          {!isCancelled && (
            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                {statusSteps.map((step, i) => (
                  <div key={step} style={{display:"flex",alignItems:"center",flex:i<statusSteps.length-1?1:0}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>
                      <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<=currentStep?C.emerald+"20":C.surface,border:"2px solid "+(i<=currentStep?C.emerald:C.border),fontSize:12,color:i<=currentStep?C.emerald:C.dim,fontWeight:700}}>
                        {i<=currentStep?"\\u2713":i+1}
                      </div>
                      <div style={{fontSize:8,color:i<=currentStep?C.emerald:C.dim,marginTop:4,textTransform:"capitalize",letterSpacing:0.5}}>{step.replace("-"," ")}</div>
                    </div>
                    {i<statusSteps.length-1&&(
                      <div style={{flex:1,height:2,background:i<currentStep?C.emerald:C.border,margin:"0 4px",marginBottom:16}} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flight Route */}
          {data.flight && (
            <div style={{padding:"28px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.departure.airportCode}</div>
                  <div style={{color:C.dim,fontSize:12}}>{data.flight.departure.city}</div>
                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.departure.scheduledTime)}</div>
                  {data.flight.departure.actualTime && data.flight.departure.actualTime !== data.flight.departure.scheduledTime && (
                    <div style={{color:C.hot,fontSize:11,marginTop:2}}>Actual: {fmtTime(data.flight.departure.actualTime)}</div>
                  )}
                </div>
                <div style={{flex:1,textAlign:"center",padding:"0 20px"}}>
                  <div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div>
                  <div style={{borderTop:"1px dashed "+C.border,margin:"8px 0"}} />
                  <div style={{display:"flex",justifyContent:"center",gap:8,alignItems:"center"}}>
                    <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(flightStatusColors[data.flight.status]||C.dim)+"15",color:flightStatusColors[data.flight.status]||C.dim,textTransform:"uppercase"}}>{data.flight.status}</span>
                  </div>
                  <div style={{color:C.dim,fontSize:10,marginTop:4}}>{data.flight.aircraft}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.arrival.airportCode}</div>
                  <div style={{color:C.dim,fontSize:12}}>{data.flight.arrival.city}</div>
                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.arrival.scheduledTime)}</div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.border,borderRadius:10,overflow:"hidden"}}>
                {[
                  {l:"DATE",v:fmtDate(data.flight.departure.scheduledTime)},
                  {l:"GATE",v:data.flight.departure.gate||"TBD"},
                  {l:"TERMINAL",v:data.flight.departure.terminal||"TBD"},
                  {l:"DURATION",v:Math.floor(data.flight.duration/60)+"h "+data.flight.duration%60+"m"},
                ].map((f,i)=>(
                  <div key={i} style={{background:C.surface,padding:"12px 14px"}}>
                    <div style={{color:C.dim,fontSize:8,letterSpacing:1,marginBottom:4}}>{f.l}</div>
                    <div style={{color:C.text,fontSize:13,fontWeight:600}}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment & Passengers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PAYMENT</div>
            <div style={{fontSize:22,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>${data.payment?.amount?.toLocaleString()||"0"}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,background:(data.payment?.status==="completed"?C.emerald:C.amber)+"15",color:data.payment?.status==="completed"?C.emerald:C.amber,textTransform:"uppercase"}}>{data.payment?.status}</span>
              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,background:C.surface,color:C.dim,textTransform:"uppercase"}}>{data.payment?.method}</span>
            </div>
          </div>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PASSENGERS</div>
            <div style={{fontSize:22,fontWeight:700,color:C.text}}>{data.passengerCount}</div>
            <div style={{marginTop:8}}>
              {data.passengers?.map((p:any,i:number)=>(
                <div key={i} style={{fontSize:12,color:C.sub,marginBottom:2}}>{p.firstName} {p.lastName}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {data.boardingPassAvailable && (
          <div style={{display:"flex",gap:12}}>
            <Link href={"/boarding-pass/"+data.bookingReference} style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",textDecoration:"none",fontWeight:700,fontSize:14}}>View Boarding Pass</Link>
            <Link href="/checkin" style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,border:"1px solid "+C.border,background:C.card,color:C.text,textDecoration:"none",fontWeight:600,fontSize:14}}>Online Check-In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
`);

// Also create the /track index page for manual entry
writeFile("src/app/track/page.tsx", `"use client";
import { useState } from "react";

const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8"};

export default function TrackIndex() {
  const [ref, setRef] = useState("");
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{textAlign:"center",maxWidth:480}}>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:3,color:C.text,marginBottom:4}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
        <div style={{fontSize:11,letterSpacing:4,color:C.dim,marginBottom:40}}>BOOKING TRACKER</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:32}}>
          <h2 style={{color:C.text,fontSize:20,fontWeight:600,marginBottom:8}}>Track Your Booking</h2>
          <p style={{color:C.sub,fontSize:13,marginBottom:24}}>Enter your booking reference to view real-time status and flight details.</p>
          <div style={{display:"flex",gap:10}}>
            <input value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} placeholder="e.g. SLX-AB1234"
              onKeyDown={e=>{if(e.key==="Enter"&&ref.trim())window.location.href="/track/"+ref.trim()}}
              style={{flex:1,padding:"14px 16px",background:C.surface,border:"1px solid "+C.border,borderRadius:10,color:C.text,fontSize:15,fontFamily:"monospace",outline:"none",letterSpacing:2}} />
            <button onClick={()=>{if(ref.trim())window.location.href="/track/"+ref.trim()}}
              style={{padding:"14px 28px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Track</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ADMIN FLIGHT CREATOR API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[4/9] Admin Flight Creator API...");

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
    const { flightNumber, departure, arrival, departureTime, arrivalTime, aircraftId, prices, seatCounts } = body;

    if (!flightNumber || !departure || !arrival || !departureTime || !arrivalTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check duplicate
    const existing = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
    if (existing) return NextResponse.json({ success: false, error: "Flight number already exists" }, { status: 400 });

    // Get aircraft
    let aircraft = null;
    if (aircraftId) {
      aircraft = await Aircraft.findById(aircraftId);
    }
    if (!aircraft) {
      aircraft = await Aircraft.findOne({ status: "active" });
    }
    if (!aircraft) {
      return NextResponse.json({ success: false, error: "No aircraft available" }, { status: 400 });
    }

    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const duration = Math.round((arrTime.getTime() - depTime.getTime()) / 60000);

    const TZ: Record<string,string> = {
      LHR:"Europe/London",CDG:"Europe/Paris",FRA:"Europe/Berlin",AMS:"Europe/Amsterdam",DXB:"Asia/Dubai",
      JFK:"America/New_York",LAX:"America/Los_Angeles",SIN:"Asia/Singapore",NRT:"Asia/Tokyo",SYD:"Australia/Sydney",
      ACC:"Africa/Accra",LOS:"Africa/Lagos",NBO:"Africa/Nairobi",JNB:"Africa/Johannesburg",CAI:"Africa/Cairo",
      IST:"Europe/Istanbul",BCN:"Europe/Madrid",MAD:"Europe/Madrid",FCO:"Europe/Rome",BOM:"Asia/Kolkata",
      DEL:"Asia/Kolkata",BKK:"Asia/Bangkok",ICN:"Asia/Seoul",DOH:"Asia/Qatar",HKG:"Asia/Hong_Kong",
      ARN:"Europe/Stockholm",CPH:"Europe/Copenhagen",MIA:"America/New_York",ORD:"America/Chicago",
    };

    const AP: Record<string,{c:string;co:string;n:string}> = {
      LHR:{c:"London",co:"United Kingdom",n:"Heathrow"},CDG:{c:"Paris",co:"France",n:"Charles de Gaulle"},
      FRA:{c:"Frankfurt",co:"Germany",n:"Frankfurt"},AMS:{c:"Amsterdam",co:"Netherlands",n:"Schiphol"},
      DXB:{c:"Dubai",co:"UAE",n:"Dubai International"},JFK:{c:"New York",co:"USA",n:"John F Kennedy"},
      LAX:{c:"Los Angeles",co:"USA",n:"LAX"},SIN:{c:"Singapore",co:"Singapore",n:"Changi"},
      NRT:{c:"Tokyo",co:"Japan",n:"Narita"},SYD:{c:"Sydney",co:"Australia",n:"Kingsford Smith"},
      ACC:{c:"Accra",co:"Ghana",n:"Kotoka"},LOS:{c:"Lagos",co:"Nigeria",n:"Murtala Muhammed"},
      NBO:{c:"Nairobi",co:"Kenya",n:"Jomo Kenyatta"},JNB:{c:"Johannesburg",co:"South Africa",n:"OR Tambo"},
      IST:{c:"Istanbul",co:"Turkey",n:"Istanbul"},BCN:{c:"Barcelona",co:"Spain",n:"El Prat"},
      MAD:{c:"Madrid",co:"Spain",n:"Barajas"},FCO:{c:"Rome",co:"Italy",n:"Fiumicino"},
      BOM:{c:"Mumbai",co:"India",n:"Chhatrapati Shivaji"},DEL:{c:"Delhi",co:"India",n:"Indira Gandhi"},
      BKK:{c:"Bangkok",co:"Thailand",n:"Suvarnabhumi"},ICN:{c:"Seoul",co:"South Korea",n:"Incheon"},
      DOH:{c:"Doha",co:"Qatar",n:"Hamad"},HKG:{c:"Hong Kong",co:"Hong Kong",n:"Chek Lap Kok"},
      CAI:{c:"Cairo",co:"Egypt",n:"Cairo International"},ARN:{c:"Stockholm",co:"Sweden",n:"Arlanda"},
      MIA:{c:"Miami",co:"USA",n:"Miami International"},ORD:{c:"Chicago",co:"USA",n:"O Hare"},
      CPH:{c:"Copenhagen",co:"Denmark",n:"Kastrup"},
    };

    const depInfo = AP[departure.toUpperCase()] || { c: departure, co: "Unknown", n: departure };
    const arrInfo = AP[arrival.toUpperCase()] || { c: arrival, co: "Unknown", n: arrival };

    const flight = await Flight.create({
      flightNumber: flightNumber.toUpperCase(),
      type: "commercial",
      airline: "SKYLUX Airways",
      aircraft: aircraft._id,
      departure: {
        airport: depInfo.n, airportCode: departure.toUpperCase(), city: depInfo.c, country: depInfo.co,
        terminal: "T" + (Math.floor(Math.random()*3)+1), gate: String.fromCharCode(65+Math.floor(Math.random()*6)) + (Math.floor(Math.random()*20)+1),
        scheduledTime: depTime, timezone: TZ[departure.toUpperCase()] || "UTC",
      },
      arrival: {
        airport: arrInfo.n, airportCode: arrival.toUpperCase(), city: arrInfo.c, country: arrInfo.co,
        terminal: "T" + (Math.floor(Math.random()*3)+1), gate: String.fromCharCode(65+Math.floor(Math.random()*6)) + (Math.floor(Math.random()*20)+1),
        scheduledTime: arrTime, timezone: TZ[arrival.toUpperCase()] || "UTC",
      },
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
    console.error("Create flight error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. PAYMENT CONFIRMATION API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[5/9] Payment Confirmation API...");

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

    const booking = await Booking.findById(bookingId)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival" });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId = transactionId || "ADMIN-" + Date.now().toString(36).toUpperCase();
    if (notes) booking.payment.notes = notes;
    booking.status = "confirmed";
    await booking.save();

    // Award loyalty points
    const user = await User.findById(booking.user);
    if (user) {
      user.loyaltyPoints += Math.floor(booking.payment.amount * 0.1);
      user.totalFlights += 1;
      user.totalSpent += booking.payment.amount;
      await user.save();
    }

    // Send confirmation email
    const flight = (booking.flights[0]?.flight) as any;
    const pax = booking.passengers[0];
    if (booking.contactEmail && flight) {
      try {
        await sendEmail({
          to: booking.contactEmail,
          subject: "SKYLUX Airways - Payment Confirmed " + booking.bookingReference,
          html: bookingConfirmationEmail({
            name: pax?.firstName + " " + pax?.lastName,
            bookingRef: booking.bookingReference,
            flightNumber: flight.flightNumber,
            from: (flight.departure?.city || "?") + " (" + (flight.departure?.airportCode || "?") + ")",
            to: (flight.arrival?.city || "?") + " (" + (flight.arrival?.airportCode || "?") + ")",
            date: flight.departure?.scheduledTime ? new Date(flight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD",
            cabin: (booking.cabinClass?.charAt(0).toUpperCase() + booking.cabinClass?.slice(1)) || "Economy",
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
console.log("[6/9] Flight Status Update API...");

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

    const oldStatus = flight.status;
    flight.status = status;

    // Handle delay
    if (status === "delayed" && delayMinutes) {
      const newDepTime = new Date(flight.departure.scheduledTime.getTime() + delayMinutes * 60000);
      const newArrTime = new Date(flight.arrival.scheduledTime.getTime() + delayMinutes * 60000);
      flight.departure.actualTime = newDepTime;
      flight.arrival.actualTime = newArrTime;
    }

    await flight.save();

    // Find affected bookings and email passengers
    const bookings = await Booking.find({
      "flights.flight": flightId,
      status: { $in: ["confirmed", "checked-in"] },
    });

    let emailsSent = 0;
    for (const booking of bookings) {
      if (!booking.contactEmail) continue;
      const pax = booking.passengers[0];
      const name = pax ? pax.firstName + " " + pax.lastName : "Valued Passenger";

      let statusMsg = "";
      let statusColor = "#818cf8";
      if (status === "delayed") {
        statusMsg = "Your flight " + flight.flightNumber + " has been delayed" + (delayMinutes ? " by approximately " + delayMinutes + " minutes" : "") + ".";
        statusColor = "#ef4444";
      } else if (status === "boarding") {
        statusMsg = "Boarding has commenced for flight " + flight.flightNumber + ". Please proceed to Gate " + (flight.departure.gate || "TBD") + ".";
        statusColor = "#fbbf24";
      } else if (status === "cancelled") {
        statusMsg = "We regret to inform you that flight " + flight.flightNumber + " has been cancelled. Our team will contact you regarding rebooking options.";
        statusColor = "#ef4444";
      } else if (status === "departed") {
        statusMsg = "Flight " + flight.flightNumber + " has departed. We wish you a pleasant journey.";
        statusColor = "#22d3ee";
      } else if (status === "in-flight") {
        statusMsg = "Flight " + flight.flightNumber + " is now in the air.";
        statusColor = "#22d3ee";
      } else if (status === "landed" || status === "arrived") {
        statusMsg = "Flight " + flight.flightNumber + " has arrived at " + flight.arrival.city + ". Welcome to your destination.";
        statusColor = "#10b981";
      } else {
        statusMsg = "The status of flight " + flight.flightNumber + " has been updated to: " + status.toUpperCase() + ".";
      }

      if (note) statusMsg += " " + note;

      const html = \`<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
  </div>
  <div style="padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:8px 24px;border-radius:8px;background:\${statusColor}15;border:1px solid \${statusColor}30;">
        <span style="color:\${statusColor};font-size:14px;font-weight:700;letter-spacing:1px;">FLIGHT STATUS UPDATE</span>
      </div>
    </div>
    <p style="color:#f0f0f5;font-size:16px;margin:0 0 8px;">Dear \${name},</p>
    <p style="color:#8892b0;font-size:14px;line-height:1.7;margin:0 0 24px;">\${statusMsg}</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;">
      <table width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Flight</td><td style="text-align:right;color:#f0f0f5;font-weight:bold;">\${flight.flightNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Route</td><td style="text-align:right;color:#f0f0f5;">\${flight.departure.city} (\${flight.departure.airportCode}) &rarr; \${flight.arrival.city} (\${flight.arrival.airportCode})</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Status</td><td style="text-align:right;color:\${statusColor};font-weight:bold;text-transform:uppercase;">\${status}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Reference</td><td style="text-align:right;color:#818cf8;font-weight:bold;">\${booking.bookingReference}</td></tr>
      </table>
    </div>
    <a href="\${BASE}/track/\${booking.bookingReference}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;">Track Your Booking</a>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:10px;margin:0;">&copy; \${new Date().getFullYear()} SKYLUX Airways</p>
  </div>
</div></body></html>\`;

      try {
        await sendEmail({ to: booking.contactEmail, subject: "SKYLUX Airways - Flight " + flight.flightNumber + " " + status.charAt(0).toUpperCase() + status.slice(1), html });
        emailsSent++;
      } catch (e) { console.error("Status email failed:", e); }
    }

    return NextResponse.json({
      success: true,
      message: "Flight " + flight.flightNumber + " updated to " + status + ". " + emailsSent + " passenger(s) notified.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. INVOICE API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[7/9] Invoice API...");

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
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model" } })
      .lean();

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
        passenger: pax[0] ? { firstName: pax[0].firstName, lastName: pax[0].lastName, email: pax[0].email } : null,
        contactEmail: (booking as any).contactEmail,
        cabinClass: (booking as any).cabinClass,
        passengerCount: pax.length,
        passengers: pax.map((p: any) => ({ firstName: p.firstName, lastName: p.lastName, cabinClass: p.cabinClass })),
        flight: flight ? {
          flightNumber: flight.flightNumber,
          departure: { city: flight.departure?.city, airportCode: flight.departure?.airportCode, scheduledTime: flight.departure?.scheduledTime },
          arrival: { city: flight.arrival?.city, airportCode: flight.arrival?.airportCode, scheduledTime: flight.arrival?.scheduledTime },
          aircraft: flight.aircraft?.name || "N/A",
          duration: flight.duration,
        } : null,
        payment: {
          method: (booking as any).payment?.method,
          status: (booking as any).payment?.status,
          amount: (booking as any).payment?.amount,
          currency: (booking as any).payment?.currency || "USD",
          transactionId: (booking as any).payment?.transactionId,
          paidAt: (booking as any).payment?.paidAt,
          breakdown: (booking as any).payment?.breakdown,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. INVOICE PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[8/9] Invoice Page...");

writeFile("src/app/invoice/[ref]/page.tsx", `"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",emerald:"#10b981",gold:"#c9a96e"};

export default function InvoicePage({ params }: { params: { ref: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bookings/invoice?ref=" + params.ref)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.ref]);

  const generatePDF = async () => {
    if (!data) return;
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;

    // Header
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, 50, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, W, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(240, 240, 245);
    doc.text("SKYLUX AIRWAYS", 20, 22);
    doc.setFontSize(10);
    doc.setTextColor(129, 140, 248);
    doc.text("TAX INVOICE", 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 210);
    doc.text("Invoice: " + data.invoiceNumber, 20, 40);
    doc.text("Date: " + new Date(data.issueDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }), 20, 45);
    doc.text("Ref: " + data.bookingReference, W - 20, 40, { align: "right" });
    doc.text("Status: " + (data.payment.status || "").toUpperCase(), W - 20, 45, { align: "right" });

    let y = 62;

    // Bill To
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 128);
    doc.text("BILL TO", 20, y);
    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    const paxName = data.passenger ? data.passenger.firstName + " " + data.passenger.lastName : "N/A";
    doc.text(paxName, 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(data.contactEmail || "", 20, y);
    y += 12;

    // Flight Details
    doc.setFillColor(245, 245, 250);
    doc.rect(20, y, W - 40, 28, "F");
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 128);
    doc.text("FLIGHT", 25, y + 6);
    doc.text("ROUTE", 60, y + 6);
    doc.text("DATE", 120, y + 6);
    doc.text("AIRCRAFT", 155, y + 6);

    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    if (data.flight) {
      doc.text(data.flight.flightNumber || "N/A", 25, y + 14);
      doc.setFont("helvetica", "normal");
      doc.text((data.flight.departure?.airportCode || "?") + " > " + (data.flight.arrival?.airportCode || "?"), 60, y + 14);
      doc.text(data.flight.departure?.scheduledTime ? new Date(data.flight.departure.scheduledTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "TBD", 120, y + 14);
      doc.text(data.flight.aircraft || "N/A", 155, y + 14);
    }

    // Passenger details under flight
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 128);
    doc.text("CABIN: " + (data.cabinClass || "").toUpperCase() + "  |  PASSENGERS: " + data.passengerCount, 25, y + 22);
    y += 38;

    // Line Items Table
    doc.setFillColor(99, 102, 241);
    doc.rect(20, y, W - 40, 8, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", 25, y + 5.5);
    doc.text("QTY", 120, y + 5.5);
    doc.text("UNIT PRICE", 140, y + 5.5);
    doc.text("AMOUNT", W - 25, y + 5.5, { align: "right" });
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);

    const unitPrice = data.payment.amount ? Math.round(data.payment.amount / data.passengerCount) : 0;
    const classLabel = (data.cabinClass || "economy").charAt(0).toUpperCase() + (data.cabinClass || "economy").slice(1);
    doc.text(classLabel + " Class - " + (data.flight?.flightNumber || ""), 25, y + 1);
    doc.text(String(data.passengerCount), 120, y + 1);
    doc.text("$" + unitPrice.toLocaleString(), 140, y + 1);
    doc.text("$" + (data.payment.amount || 0).toLocaleString(), W - 25, y + 1, { align: "right" });

    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.line(20, y, W - 20, y);
    y += 8;

    // Totals
    const subtotal = data.payment.amount || 0;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal;

    doc.text("Subtotal", 130, y);
    doc.text("$" + subtotal.toLocaleString(), W - 25, y, { align: "right" });
    y += 6;
    doc.text("Taxes & Fees (incl.)", 130, y);
    doc.text("$" + tax.toLocaleString(), W - 25, y, { align: "right" });
    y += 8;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(125, y - 2, W - 20, y - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(99, 102, 241);
    doc.text("TOTAL", 130, y + 4);
    doc.text("$" + total.toLocaleString() + " USD", W - 25, y + 4, { align: "right" });
    y += 16;

    // Payment Info
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 128);
    doc.text("PAYMENT INFORMATION", 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Method: " + (data.payment.method || "N/A").toUpperCase(), 20, y);
    y += 5;
    doc.text("Transaction ID: " + (data.payment.transactionId || "N/A"), 20, y);
    y += 5;
    if (data.payment.paidAt) doc.text("Paid: " + new Date(data.payment.paidAt).toLocaleString(), 20, y);
    y += 15;

    // Passengers
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 128);
    doc.text("PASSENGERS", 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    data.passengers?.forEach((p: any, i: number) => {
      doc.text((i + 1) + ". " + p.firstName + " " + p.lastName + " (" + (p.cabinClass || data.cabinClass) + ")", 20, y);
      y += 5;
    });

    // Footer
    const footerY = 275;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, W - 20, footerY);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("SKYLUX Airways Ltd. | London, United Kingdom | admin@skylux.pro", W / 2, footerY + 5, { align: "center" });
    doc.text("This is a computer-generated invoice and does not require a signature.", W / 2, footerY + 9, { align: "center" });

    doc.save("SKYLUX_Invoice_" + data.bookingReference + ".pdf");
  };

  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); } catch { return "N/A"; } };

  if (loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite"}} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  if (error || !data) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:C.sub}}><p>{error || "Not found"}</p></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.inv-card{animation:fadeUp 0.6s ease}"}</style>
      <div className="inv-card" style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
          <button onClick={generatePDF} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>Download Invoice PDF</button>
        </div>

        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>INVOICE</div>
              <div style={{fontSize:20,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>{data.invoiceNumber}</div>
              <div style={{fontSize:11,color:C.dim,marginTop:4}}>Issued: {fmtDate(data.issueDate)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:700,background:(data.payment.status==="completed"?C.emerald:C.accent)+"15",color:data.payment.status==="completed"?C.emerald:C.accent,textTransform:"uppercase"}}>{data.payment.status}</span>
            </div>
          </div>

          <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:4}}>BILL TO</div>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{data.passenger?.firstName} {data.passenger?.lastName}</div>
            <div style={{fontSize:12,color:C.sub}}>{data.contactEmail}</div>
          </div>

          {data.flight && (
            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.departure.airportCode}</div>
                  <div style={{color:C.dim,fontSize:11}}>{data.flight.departure.city}</div>
                </div>
                <div style={{textAlign:"center",flex:1}}>
                  <div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div>
                  <div style={{borderTop:"1px dashed "+C.border,margin:"6px 20px"}} />
                  <div style={{color:C.dim,fontSize:10}}>{data.flight.aircraft}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.arrival.airportCode}</div>
                  <div style={{color:C.dim,fontSize:11}}>{data.flight.arrival.city}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid "+C.border}}>
                  {["Description","Qty","Unit Price","Amount"].map(h=>(
                    <th key={h} style={{padding:"8px 0",textAlign:h==="Amount"?"right":"left",fontSize:10,color:C.dim,fontWeight:600,letterSpacing:1}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{padding:"12px 0",fontSize:13,color:C.text}}>{(data.cabinClass||"economy").charAt(0).toUpperCase()+(data.cabinClass||"").slice(1)} Class - {data.flight?.flightNumber}</td>
                  <td style={{padding:"12px 0",fontSize:13,color:C.sub}}>{data.passengerCount}</td>
                  <td style={{padding:"12px 0",fontSize:13,color:C.sub}}>${data.payment.amount?Math.round(data.payment.amount/data.passengerCount).toLocaleString():"0"}</td>
                  <td style={{padding:"12px 0",fontSize:13,color:C.text,textAlign:"right",fontWeight:600}}>${(data.payment.amount||0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{padding:"20px 28px",display:"flex",justifyContent:"flex-end"}}>
            <div style={{width:250}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.sub}}>Subtotal</span>
                <span style={{fontSize:12,color:C.text}}>${(data.payment.amount||0).toLocaleString()}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:12,color:C.sub}}>Taxes & Fees (incl.)</span>
                <span style={{fontSize:12,color:C.text}}>${Math.round((data.payment.amount||0)*0.05).toLocaleString()}</span>
              </div>
              <div style={{borderTop:"2px solid "+C.accent,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:16,fontWeight:700,color:C.text}}>Total</span>
                <span style={{fontSize:16,fontWeight:700,color:C.accent}}>${(data.payment.amount||0).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          <div style={{padding:"16px 28px",borderTop:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:10,color:C.dim}}>Payment: {(data.payment.method||"").toUpperCase()} | TXN: {data.payment.transactionId||"N/A"}</span>
            <span style={{fontSize:10,color:C.dim}}>SKYLUX Airways Ltd.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. ADMIN FLIGHTS PAGE (with Creator + Status Updates)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[9/9] Admin Flights Page...");

writeFile("src/app/(admin)/flights/page.tsx", `"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24"};
const statusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,departed:C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot};
const STATUSES = ["scheduled","boarding","departed","in-flight","landed","arrived","delayed","cancelled"];

export default function FlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showStatus, setShowStatus] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  // Create form
  const [fn, setFn] = useState("SX ");
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [depTime, setDepTime] = useState("");
  const [arrTime, setArrTime] = useState("");
  const [pEcon, setPEcon] = useState("500");
  const [pPrem, setPPrem] = useState("900");
  const [pBiz, setPBiz] = useState("2500");
  const [pFirst, setPFirst] = useState("6000");

  // Status form
  const [newStatus, setNewStatus] = useState("");
  const [delayMin, setDelayMin] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/flights/search?limit=50&sortBy=departure")
      .then(r => r.json())
      .then(d => { if (d.success) setFlights(d.data?.flights || []); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const createFlight = async () => {
    if (!fn.trim() || !dep.trim() || !arr.trim() || !depTime || !arrTime) { setMsg("Error: Fill all required fields"); return; }
    setCreating(true); setMsg("");
    try {
      const res = await fetch("/api/admin/flights/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightNumber: fn.trim(), departure: dep.trim(), arrival: arr.trim(),
          departureTime: depTime, arrivalTime: arrTime,
          prices: { economy: +pEcon, premium: +pPrem, business: +pBiz, first: +pFirst },
        }),
      });
      const d = await res.json();
      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));
      if (d.success) { setShowCreate(false); setFn("SX "); setDep(""); setArr(""); load(); }
    } catch { setMsg("Error: Network error"); }
    setCreating(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const updateStatus = async () => {
    if (!showStatus || !newStatus) return;
    setUpdating(true); setMsg("");
    try {
      const res = await fetch("/api/admin/flights/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: showStatus._id, status: newStatus, delayMinutes: delayMin ? +delayMin : undefined, note: statusNote }),
      });
      const d = await res.json();
      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));
      if (d.success) { setShowStatus(null); setNewStatus(""); setDelayMin(""); setStatusNote(""); load(); }
    } catch { setMsg("Error: Network error"); }
    setUpdating(false);
    setTimeout(() => setMsg(""), 5000);
  };

  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" }); } catch { return "TBD"; } };

  const inp = (v: string, set: (v:string)=>void, ph: string, extra?: any) => (
    <input value={v} onChange={e=>set(e.target.value)} placeholder={ph} {...extra}
      style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...(extra?.style||{})}} />
  );

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:"3px solid "+C.accent+"20",borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{".mono{font-family:'JetBrains Mono',monospace}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}"}</style>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Flights</h1><p style={{fontSize:13,color:C.textDim}}>{flights.length} flights in system</p></div>
        <button onClick={()=>setShowCreate(true)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Create Flight</button>
      </div>

      {msg && <div style={{padding:"10px 16px",marginBottom:14,borderRadius:10,background:msg.startsWith("Done")?C.emerald+"12":C.hot+"12",border:"1px solid "+(msg.startsWith("Done")?C.emerald:C.hot)+"25",fontSize:13,color:msg.startsWith("Done")?C.emerald:C.hot,fontWeight:600}}>{msg}</div>}

      <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:18,overflow:"hidden"}}>
        {flights.length===0 ? (
          <div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}><div style={{fontSize:15,fontWeight:600}}>No flights. Create one above.</div></div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid "+C.glassBorder}}>{["Flight","Route","Date","Departs","Status","Econ","Biz","First","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>
            <tbody>{flights.map((f: any, i: number) => (
              <tr key={f._id||i} style={{borderBottom:"1px solid "+C.glassBorder+"08"}}>
                <td className="mono" style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.accentLight}}>{f.flightNumber}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{f.departure?.airportCode} - {f.arrival?.airportCode}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{fmtDate(f.departure?.scheduledTime)}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.text}}>{fmtTime(f.departure?.scheduledTime)}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[f.status]||C.textDim)+"12",color:statusColors[f.status]||C.textDim,textTransform:"uppercase"}}>{f.status}</span></td>
                <td className="mono" style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>${f.seatMap?.[0]?.price||"-"}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>${f.seatMap?.[2]?.price||"-"}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>${f.seatMap?.[3]?.price||"-"}</td>
                <td style={{padding:"12px 14px"}}>
                  {!f._generated && <button onClick={()=>{setShowStatus(f);setNewStatus(f.status)}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+C.accent+"25",background:"transparent",color:C.accentLight,fontSize:10,fontWeight:600,cursor:"pointer"}}>Update Status</button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Create Flight Modal */}
      {showCreate && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowCreate(false)}>
          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>Create New Flight</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FLIGHT NUMBER*</label>{inp(fn,setFn,"SX 100")}</div>
              <div></div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FROM (IATA)*</label>{inp(dep,s=>setDep(s.toUpperCase()),"e.g. LHR")}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>TO (IATA)*</label>{inp(arr,s=>setArr(s.toUpperCase()),"e.g. JFK")}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DEPARTURE TIME*</label>{inp(depTime,setDepTime,"",{type:"datetime-local"})}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>ARRIVAL TIME*</label>{inp(arrTime,setArrTime,"",{type:"datetime-local"})}</div>
            </div>
            <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6,marginTop:8}}>PRICING (USD)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
              <div><label style={{fontSize:9,color:C.textDim}}>Economy</label>{inp(pEcon,setPEcon,"500")}</div>
              <div><label style={{fontSize:9,color:C.textDim}}>Premium</label>{inp(pPrem,setPPrem,"900")}</div>
              <div><label style={{fontSize:9,color:C.textDim}}>Business</label>{inp(pBiz,setPBiz,"2500")}</div>
              <div><label style={{fontSize:9,color:C.textDim}}>First</label>{inp(pFirst,setPFirst,"6000")}</div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowCreate(false)} style={{padding:"10px 20px",borderRadius:10,border:"1px solid "+C.glassBorder,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={createFlight} disabled={creating} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:creating?"wait":"pointer"}}>{creating?"Creating...":"Create Flight"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatus && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowStatus(null)}>
          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Update Flight Status</h3>
            <p style={{fontSize:12,color:C.textDim,marginBottom:20}}>{showStatus.flightNumber} - {showStatus.departure?.airportCode} to {showStatus.arrival?.airportCode}</p>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6}}>NEW STATUS</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {STATUSES.map(s=>(
                  <button key={s} onClick={()=>setNewStatus(s)}
                    style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+(newStatus===s?(statusColors[s]||C.accent):C.glassBorder),background:newStatus===s?(statusColors[s]||C.accent)+"15":"transparent",color:newStatus===s?(statusColors[s]||C.accent):C.textSoft,fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{s}</button>
                ))}
              </div>
            </div>
            {newStatus==="delayed"&&(
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DELAY (MINUTES)</label>
                {inp(delayMin,setDelayMin,"e.g. 45",{type:"number"})}
              </div>
            )}
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>NOTE (optional - included in passenger email)</label>
              <textarea value={statusNote} onChange={e=>setStatusNote(e.target.value)} placeholder="Additional info for passengers..."
                style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:60}} />
            </div>
            <div style={{padding:"12px 16px",background:C.amber+"08",border:"1px solid "+C.amber+"20",borderRadius:10,marginBottom:20}}>
              <div style={{fontSize:11,color:C.amber}}>All passengers with confirmed/checked-in bookings on this flight will receive an email notification with the status update.</div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowStatus(null)} style={{padding:"10px 20px",borderRadius:10,border:"1px solid "+C.glassBorder,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={updateStatus} disabled={updating||!newStatus} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:updating?"wait":"pointer",opacity:newStatus?1:0.5}}>{updating?"Updating...":"Update & Notify"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. UPDATE ADMIN BOOKINGS - Add payment confirm + invoice
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("[10/10] Updating Admin Bookings with payment confirm + invoice...");

// Read existing bookings page and add confirm payment + invoice buttons
const bookingsPath = "src/app/(admin)/bookings/page.tsx";
if (fs.existsSync(bookingsPath)) {
  let bc = fs.readFileSync(bookingsPath, "utf8");
  
  // Add confirmPayment function after cancelBooking
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

    // Add payment confirm button and invoice link in expanded row
    bc = bc.replace(
      '{btn("Send E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}',
      `{btn("Send E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}
                    {b.payment?.status!=="completed"&&btn("Confirm Payment",C.emerald,()=>confirmPayment(b._id),sendingEmail===b._id+"pay")}
                    <a href={"/invoice/"+b.bookingReference} target="_blank" rel="noreferrer" style={{padding:"6px 14px",borderRadius:8,background:C.glassBorder,color:C.textSoft,fontSize:11,fontWeight:700,textDecoration:"none"}}>Invoice</a>`
    );

    // Also add confirm payment in the main row actions for pending payments
    bc = bc.replace(
      `{b.status==="pending"&&btn("Cancel",C.hot,()=>cancelBooking(b._id))}`,
      `{b.status==="pending"&&<>{btn("Confirm Pay",C.emerald,()=>confirmPayment(b._id),sendingEmail===b._id+"pay")}{btn("Cancel",C.hot,()=>cancelBooking(b._id))}</>}`
    );

    fs.writeFileSync(bookingsPath, bc, "utf8");
    console.log("  Updated: " + bookingsPath);
  } else {
    console.log("  Skipped (already has confirmPayment): " + bookingsPath);
  }
}


console.log("\n=== All features created! ===");
console.log("\nFiles created/updated:");
console.log("  1. src/app/page.tsx                              - Landing page");
console.log("  2. src/app/api/track/route.ts                    - Track API");
console.log("  3. src/app/track/[ref]/page.tsx                  - Track page");
console.log("  4. src/app/track/page.tsx                        - Track index");
console.log("  5. src/app/api/admin/flights/create/route.ts     - Create flight API");
console.log("  6. src/app/api/admin/bookings/confirm-payment/route.ts - Payment confirm API");
console.log("  7. src/app/api/admin/flights/status/route.ts     - Flight status API");
console.log("  8. src/app/api/bookings/invoice/route.ts         - Invoice API");
console.log("  9. src/app/invoice/[ref]/page.tsx                - Invoice page");
console.log("  10. src/app/(admin)/flights/page.tsx             - Admin flights + creator + status");
console.log("  11. src/app/(admin)/bookings/page.tsx            - Updated with payment confirm + invoice");
console.log("\nNext: git add -A && git commit -m 'Add all features' && git push");
