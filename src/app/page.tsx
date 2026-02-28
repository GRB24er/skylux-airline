"use client";
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
      <style>{`
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
      `}</style>

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
