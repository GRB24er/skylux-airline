"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ──────────────── DESIGN SYSTEM ──────────────── */
const T = {
  bg: "#060a13",
  surface: "#0a0e1a",
  card: "#0d1220",
  border: "rgba(255,255,255,0.06)",
  text: "#f5f5f7",
  sub: "#8b95a9",
  dim: "#515c72",
  muted: "#1a2035",
  gold: "#c9a96e",
  goldLight: "#dfc08a",
  goldDim: "#a68b4b",
};

/* ──────────────── DATA ──────────────── */
const NAV_LINKS = [
  { label: "Destinations", href: "#destinations" },
  { label: "Experience", href: "#experience" },
  { label: "Fleet", href: "#fleet" },
  { label: "Charter", href: "#charter" },
  { label: "Loyalty", href: "#loyalty" },
];

const DESTINATIONS = [
  { city: "Dubai", code: "DXB", tagline: "Where the future touches the sky", from: 820, image: "/images/destinations/dubai.jpg" },
  { city: "Tokyo", code: "NRT", tagline: "Tradition woven through neon light", from: 1280, image: "/images/destinations/tokyo.jpg" },
  { city: "Maldives", code: "MLE", tagline: "Solitude on crystal horizons", from: 1640, image: "/images/destinations/maldives.jpg" },
  { city: "New York", code: "JFK", tagline: "Where ambition has no ceiling", from: 780, image: "/images/destinations/newyork.jpg" },
  { city: "Paris", code: "CDG", tagline: "Elegance written in every stone", from: 680, image: "/images/destinations/paris.jpg" },
  { city: "Zurich", code: "ZRH", tagline: "Precision wrapped in alpine air", from: 920, image: "/images/destinations/zurich.jpg" },
];

const EXPERIENCE = [
  { title: "First Class", sub: "Your private sanctuary above the clouds", desc: "Enclosed suites with lie-flat beds, personal minibars, and bespoke dining from our award-winning chefs. Every journey becomes an arrival.", image: "/images/experience/firstclass.jpg", accent: "#c9a96e" },
  { title: "Business Class", sub: "Where productivity meets indulgence", desc: "Direct-aisle access, 78-inch flatbed seats with massage function, and a curated wine selection chosen by our resident sommelier.", image: "/images/experience/cabin-service.jpg", accent: "#94a3b8" },
  { title: "Fine Dining", sub: "Michelin-inspired menus at 40,000 feet", desc: "Multi-course meals crafted with seasonal ingredients, paired with wines from our cellar of over 200 labels across all cabin classes.", image: "/images/experience/dining.jpg", accent: "#34d399" },
];

const FLEET = [
  { name: "Boeing 787-9 Dreamliner", role: "Long-Haul", pax: 290, range: "7,635 nm", image: "/images/fleet/b787.jpg" },
  { name: "Airbus A350-900", role: "Ultra Long-Range", pax: 315, range: "8,100 nm", image: "/images/fleet/a350.jpg" },
  { name: "Gulfstream G700", role: "Private Charter", pax: 19, range: "7,500 nm", image: "/images/fleet/g700.jpg" },
  { name: "Bombardier Global 7500", role: "Private Charter", pax: 17, range: "7,700 nm", image: "/images/fleet/global7500.jpg" },
];

const STATS = [
  { value: "150+", label: "Destinations" },
  { value: "45", label: "Countries" },
  { value: "98.7%", label: "On-Time Rate" },
  { value: "4.9", label: "Passenger Rating" },
];

const TIERS = [
  { name: "Silver", color: "#94a3b8", mult: "1.25×", perk: "Priority check-in & extra baggage" },
  { name: "Gold", color: "#c9a96e", mult: "1.5×", perk: "Lounge access & priority boarding" },
  { name: "Platinum", color: "#818cf8", mult: "2×", perk: "Complimentary upgrades & companion voucher" },
  { name: "Diamond", color: "#22d3ee", mult: "3×", perk: "First class lounge & personal concierge" },
];

const AIRPORTS = [
  "London (LHR)","Dubai (DXB)","New York (JFK)","Tokyo (NRT)","Singapore (SIN)",
  "Paris (CDG)","Zurich (ZRH)","Maldives (MLE)","Miami (MIA)","Los Angeles (LAX)",
  "Rome (FCO)","Sydney (SYD)","Hong Kong (HKG)","Doha (DOH)","Istanbul (IST)",
];

/* ──────────────── HOOKS ──────────────── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ──────────────── COMPONENTS ──────────────── */
function FadeIn({ children, delay = 0, direction = "up", style = {} }: { children: React.ReactNode; delay?: number; direction?: "up"|"down"|"left"|"right"|"none"; style?: React.CSSProperties }) {
  const { ref, visible } = useInView(0.1);
  const transforms: Record<string, string> = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(-40px)", right: "translateX(40px)", none: "none" };
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : transforms[direction], transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold, marginBottom: 16 }}>{children}</div>;
}

function SectionTitle({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300, lineHeight: 1.2, color: T.text, margin: 0, fontFamily: "'Playfair Display', Georgia, serif", ...style }}>{children}</h2>;
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function Home() {
  const scrollY = useScrollY();
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [depDate, setDepDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [tripType, setTripType] = useState<"return"|"one-way">("return");
  const [pax, setPax] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");
  const [heroTextIdx, setHeroTextIdx] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const heroTexts = ["Experience the Art of Flying", "Redefining Luxury in the Skies", "Your Journey, Elevated"];
  useEffect(() => { const t = setInterval(() => setHeroTextIdx(p => (p + 1) % heroTexts.length), 5000); return () => clearInterval(t); }, []);

  const navOpaque = scrollY > 60;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        ::selection{background:${T.gold}30;color:${T.gold}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
        .nav-link{color:${T.sub};text-decoration:none;font-size:13px;font-weight:500;letter-spacing:0.3px;transition:color 0.3s;padding:8px 0;position:relative}
        .nav-link:hover{color:${T.text}}
        .nav-link::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:${T.gold};transition:width 0.3s}
        .nav-link:hover::after{width:100%}
        .dest-card{position:relative;overflow:hidden;border-radius:16px;cursor:pointer;transition:transform 0.5s cubic-bezier(0.16,1,0.3,1),box-shadow 0.5s}
        .dest-card:hover{transform:translateY(-8px);box-shadow:0 24px 64px rgba(0,0,0,0.4)}
        .dest-card:hover .dest-img{transform:scale(1.08)}
        .dest-card .dest-img{transition:transform 0.7s cubic-bezier(0.16,1,0.3,1)}
        .fleet-card{transition:transform 0.4s,border-color 0.3s}
        .fleet-card:hover{transform:translateY(-4px);border-color:rgba(201,169,110,0.15)!important}
        .exp-card{transition:transform 0.5s,box-shadow 0.5s}
        .exp-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,0.3)}
        .gold-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:linear-gradient(135deg,${T.gold},${T.goldDim});color:#0a0e1a;font-size:14px;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-family:inherit;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px}
        .gold-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,169,110,0.25)}
        .outline-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:transparent;color:${T.goldLight};font-size:14px;font-weight:600;border:1px solid rgba(201,169,110,0.3);border-radius:12px;cursor:pointer;font-family:inherit;text-decoration:none;transition:all 0.3s}
        .outline-btn:hover{background:rgba(201,169,110,0.06);border-color:rgba(201,169,110,0.5)}
        input,select{background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:12px 16px;color:${T.text};font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.2s}
        input:focus,select:focus{border-color:rgba(201,169,110,0.4)}
        select option{background:${T.card};color:${T.text}}
        @media(max-width:1024px){
          nav .nav-links{display:none!important}
          nav .nav-cta .signin{display:none!important}
          section .search-widget .search-fields{grid-template-columns:1fr 1fr!important}
          section .stats-row{grid-template-columns:repeat(2,1fr)!important}
          section .dest-grid{grid-template-columns:1fr 1fr!important}
          section .exp-grid{grid-template-columns:1fr!important}
          section .fleet-grid{grid-template-columns:1fr 1fr!important}
          section .loyalty-split{grid-template-columns:1fr!important;gap:40px!important}
          footer .footer-cols{grid-template-columns:1fr 1fr 1fr!important}
        }
        @media(max-width:640px){
          section .search-fields{grid-template-columns:1fr!important}
          section .stats-row{grid-template-columns:1fr 1fr!important;gap:16px!important;padding:32px 20px!important}
          section .dest-grid{grid-template-columns:1fr!important}
          section .fleet-grid{grid-template-columns:1fr!important}
          section .tier-grid{grid-template-columns:1fr!important}
          footer .footer-cols{grid-template-columns:1fr!important}
          footer .footer-bottom{flex-direction:column!important;gap:12px!important;text-align:center!important}
          .gold-btn,.outline-btn{padding:12px 24px!important;font-size:13px!important}
          section>div,footer>div,nav>div{padding-left:20px!important;padding-right:20px!important}
        }
        .hamburger{display:none;background:none;border:none;cursor:pointer;padding:8px;z-index:1100}
        .hamburger span{display:block;width:22px;height:2px;background:${T.text};margin:5px 0;transition:all 0.3s;border-radius:1px}
        .hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
        .hamburger.open span:nth-child(2){opacity:0}
        .hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}
        @media(max-width:1024px){.hamburger{display:block!important}}
        .mobile-overlay{position:fixed;inset:0;z-index:1050;background:rgba(6,10,19,0.97);backdrop-filter:blur(24px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;opacity:0;pointer-events:none;transition:opacity 0.35s}
        .mobile-overlay.open{opacity:1;pointer-events:all}
        .mobile-overlay a{font-size:20px;font-weight:500;color:${T.sub};text-decoration:none;transition:color 0.3s;letter-spacing:1px}
        .mobile-overlay a:hover{color:${T.gold}}
        @media(max-width:1024px){
          .nav-desktop{display:none!important}
          .hero-search{max-width:100%!important}
          .hero-search-grid{grid-template-columns:1fr 1fr!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .dest-grid{grid-template-columns:1fr 1fr!important}
          .exp-grid{grid-template-columns:1fr!important}
          .fleet-grid{grid-template-columns:1fr 1fr!important}
          .loyalty-grid{grid-template-columns:1fr!important;gap:32px!important}
          .tier-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:24px!important}
          .section-header{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
        }
        @media(max-width:640px){
          .hero-search-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:1fr 1fr!important;gap:16px!important}
          .dest-grid{grid-template-columns:1fr!important}
          .fleet-grid{grid-template-columns:1fr!important}
          .tier-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
          .footer-bottom{flex-direction:column!important;gap:12px!important;text-align:center!important}
          .charter-cta-inner{padding:40px 28px!important}
          .gold-btn,.outline-btn{padding:12px 24px!important;font-size:13px!important}
          .hero-buttons{flex-direction:column!important;width:100%!important}
          .hero-buttons .gold-btn,.hero-buttons .outline-btn{width:100%!important;justify-content:center}
        }
      `}} />

      {/* ════════════════════════ NAVIGATION ════════════════════════ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:1000,
        background:navOpaque?"rgba(6,10,19,0.95)":"transparent",
        backdropFilter:navOpaque?"blur(20px) saturate(180%)":"none",
        borderBottom:navOpaque?`1px solid ${T.border}`:"1px solid transparent",
        transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 40px",height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:12,textDecoration:"none"}}>
            <img src="/images/logo.png" alt="SKYLUX" style={{height:34,objectFit:"contain"}} onError={(e:any)=>{e.target.style.display="none"}}/>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:3,lineHeight:1}}>SKYLUX</div>
              <div style={{fontSize:8,fontWeight:500,letterSpacing:4,color:T.gold,textTransform:"uppercase",marginTop:1}}>Airways</div>
            </div>
          </Link>
          <div className="nav-links" style={{display:"flex",alignItems:"center",gap:32}}>
            {NAV_LINKS.map(l=>(<a key={l.label} href={l.href} className="nav-link">{l.label}</a>))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <Link href="/auth" className="nav-links" style={{fontSize:13,fontWeight:500,color:T.sub,textDecoration:"none",transition:"color 0.3s"}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.sub}>Sign In</Link>
            <Link href="/portal" className="gold-btn" style={{padding:"10px 24px",fontSize:12,borderRadius:10}}>Book a Flight</Link>
            <button className={`hamburger ${mobileMenu?"open":""}`} onClick={()=>setMobileMenu(!mobileMenu)}><span/><span/><span/></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenu?"open":""}`}>
        {NAV_LINKS.map(l=>(<a key={l.label} href={l.href} onClick={()=>setMobileMenu(false)}>{l.label}</a>))}
        <div style={{height:1,width:60,background:T.border,margin:"8px 0"}}/>
        <Link href="/charter" onClick={()=>setMobileMenu(false)} style={{fontSize:20,fontWeight:500,color:T.gold,textDecoration:"none"}}>Private Charter</Link>
        <Link href="/auth" onClick={()=>setMobileMenu(false)} style={{fontSize:16,color:T.sub,textDecoration:"none"}}>Sign In / Register</Link>
        <Link href="/portal" onClick={()=>setMobileMenu(false)} className="gold-btn" style={{marginTop:12}}>Book a Flight</Link>
      </div>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section style={{position:"relative",height:"100vh",minHeight:700,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"url(/images/hero/landing-hero.jpg)",backgroundSize:"cover",backgroundPosition:"center",transform:`translateY(${scrollY*0.3}px) scale(${1+scrollY*0.0002})`,transition:"transform 0.1s linear"}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${T.bg}90 0%,${T.bg}40 40%,${T.bg}70 70%,${T.bg} 100%)`}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${T.bg}cc 0%,transparent 60%)`}}/>

        <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",maxWidth:1320,margin:"0 auto",padding:"0 40px"}}>
          <div style={{maxWidth:680,marginBottom:48}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:5,color:T.gold,textTransform:"uppercase",marginBottom:24,animation:"fadeUp 0.8s ease-out"}}>
              Welcome to SKYLUX Airways
            </div>
            <h1 key={heroTextIdx} style={{
              fontSize:"clamp(36px,5.5vw,64px)",fontWeight:300,lineHeight:1.1,
              fontFamily:"'Playfair Display',Georgia,serif",marginBottom:20,
              animation:"fadeUp 0.8s ease-out 0.2s both",
            }}>
              {heroTexts[heroTextIdx]}
            </h1>
            <p style={{fontSize:17,lineHeight:1.7,color:T.sub,maxWidth:520,animation:"fadeUp 0.8s ease-out 0.4s both"}}>
              Connecting the world through uncompromising luxury. Fly to over 150 destinations across 45 countries with the airline that puts you first.
            </p>
            <div style={{display:"flex",gap:14,marginTop:36,animation:"fadeUp 0.8s ease-out 0.6s both"}}>
              <Link href="/portal" className="gold-btn">Book Your Flight →</Link>
              <Link href="/charter" className="outline-btn">Private Charter</Link>
            </div>
          </div>

          {/* Search Widget */}
          <div style={{
            background:"rgba(10,14,26,0.85)",backdropFilter:"blur(24px) saturate(150%)",
            border:`1px solid ${T.border}`,borderRadius:20,padding:"24px 28px",maxWidth:900,
            animation:"fadeUp 0.8s ease-out 0.8s both",
          }}>
            <div style={{display:"flex",gap:4,marginBottom:18}}>
              {(["return","one-way"] as const).map(t=>(
                <button key={t} onClick={()=>setTripType(t)} style={{
                  padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",
                  fontSize:12,fontWeight:600,textTransform:"capitalize",
                  background:tripType===t?T.gold+"15":"transparent",
                  color:tripType===t?T.goldLight:T.dim,transition:"all 0.2s",
                }}>{t.replace("-"," ")}</button>
              ))}
            </div>
            <div className="search-fields" style={{display:"grid",gridTemplateColumns:tripType==="return"?"1fr 1fr 1fr 1fr auto":"1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>FROM</label>
                <select value={fromAirport} onChange={e=>setFromAirport(e.target.value)}>
                  <option value="">Select origin</option>
                  {AIRPORTS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>TO</label>
                <select value={toAirport} onChange={e=>setToAirport(e.target.value)}>
                  <option value="">Select destination</option>
                  {AIRPORTS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>DEPARTURE</label>
                <input type="date" value={depDate} onChange={e=>setDepDate(e.target.value)} style={{colorScheme:"dark"}}/>
              </div>
              {tripType==="return"&&(
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>RETURN</label>
                  <input type="date" value={retDate} onChange={e=>setRetDate(e.target.value)} style={{colorScheme:"dark"}}/>
                </div>
              )}
              <Link href="/portal" className="gold-btn" style={{padding:"12px 32px",borderRadius:10,textAlign:"center",whiteSpace:"nowrap"}}>Search Flights</Link>
            </div>
            <div style={{display:"flex",gap:16,marginTop:14,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:T.dim}}>Passengers:</span>
                <select value={pax} onChange={e=>setPax(+e.target.value)} style={{width:"auto",padding:"6px 12px",fontSize:12}}>
                  {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:T.dim}}>Class:</span>
                <select value={cabinClass} onChange={e=>setCabinClass(e.target.value)} style={{width:"auto",padding:"6px 12px",fontSize:12,textTransform:"capitalize"}}>
                  {["economy","premium economy","business","first"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:2,animation:"shimmer 2s ease-in-out infinite"}}>
          <div style={{width:1,height:40,background:`linear-gradient(180deg,${T.gold},transparent)`,margin:"0 auto 8px"}}/>
          <div style={{fontSize:9,letterSpacing:3,color:T.dim,textTransform:"uppercase"}}>Scroll</div>
        </div>
      </section>

      {/* ════════════════════════ STATS BAR ════════════════════════ */}
      <section style={{borderBottom:`1px solid ${T.border}`}}>
        <div className="stats-row" style={{maxWidth:1320,margin:"0 auto",padding:"48px 40px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32}}>
          {STATS.map((s,i)=>(
            <FadeIn key={s.label} delay={i*0.1}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"clamp(28px,3vw,42px)",fontWeight:300,fontFamily:"'Playfair Display',serif",color:T.gold}}>{s.value}</div>
                <div style={{fontSize:12,fontWeight:500,color:T.dim,letterSpacing:2,textTransform:"uppercase",marginTop:6}}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ════════════════════════ DESTINATIONS ════════════════════════ */}
      <section id="destinations" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
        <FadeIn>
          <SectionLabel>Explore the World</SectionLabel>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48}}>
            <SectionTitle>Popular <em style={{fontStyle:"italic",color:T.gold}}>Destinations</em></SectionTitle>
            <Link href="/portal" style={{fontSize:13,fontWeight:600,color:T.gold,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>View all routes <span style={{fontSize:16}}>→</span></Link>
          </div>
        </FadeIn>
        <div className="dest-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {DESTINATIONS.map((d,i)=>(
            <FadeIn key={d.city} delay={i*0.1}>
              <Link href="/portal" style={{textDecoration:"none",color:"inherit"}}>
                <div className="dest-card" style={{height:i<2?420:320,background:T.card}}>
                  <div className="dest-img" style={{position:"absolute",inset:0,backgroundImage:`url(${d.image})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.85) 100%)"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:T.gold,marginBottom:6}}>{d.code}</div>
                        <div style={{fontSize:24,fontWeight:600,marginBottom:4}}>{d.city}</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{d.tagline}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:10,color:T.dim,marginBottom:2}}>From</div>
                        <div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:T.goldLight}}>${d.from.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ════════════════════════ EXPERIENCE ════════════════════════ */}
      <section id="experience" style={{background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
          <FadeIn>
            <SectionLabel>The SKYLUX Difference</SectionLabel>
            <SectionTitle style={{marginBottom:56}}>An Experience <em style={{fontStyle:"italic",color:T.gold}}>Beyond Compare</em></SectionTitle>
          </FadeIn>
          <div className="exp-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
            {EXPERIENCE.map((exp,i)=>(
              <FadeIn key={exp.title} delay={i*0.12}>
                <div className="exp-card" style={{position:"relative",overflow:"hidden",borderRadius:18,background:T.card,border:`1px solid ${T.border}`,height:380}}>
                  <div style={{position:"absolute",inset:0,backgroundImage:`url(${exp.image})`,backgroundSize:"cover",backgroundPosition:"center",opacity:0.35}}/>
                  <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${T.bg}ee 20%,${T.bg}88 100%)`}}/>
                  <div style={{position:"relative",zIndex:2,padding:i===0?"44px":"32px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                    <div style={{width:40,height:3,background:exp.accent,borderRadius:2,marginBottom:16}}/>
                    <div style={{fontSize:i===0?28:22,fontWeight:600,fontFamily:"'Playfair Display',serif",marginBottom:6}}>{exp.title}</div>
                    <div style={{fontSize:12,fontWeight:600,color:exp.accent,letterSpacing:0.5,marginBottom:12}}>{exp.sub}</div>
                    <div style={{fontSize:14,lineHeight:1.7,color:T.sub,maxWidth:400}}>{exp.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FLEET ════════════════════════ */}
      <section id="fleet" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
        <FadeIn>
          <SectionLabel>Our Aircraft</SectionLabel>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48}}>
            <SectionTitle>A Fleet Built for <em style={{fontStyle:"italic",color:T.gold}}>Excellence</em></SectionTitle>
            <Link href="/charter" style={{fontSize:13,fontWeight:600,color:T.gold,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>Charter a jet <span style={{fontSize:16}}>→</span></Link>
          </div>
        </FadeIn>
        <div className="fleet-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {FLEET.map((f,i)=>(
            <FadeIn key={f.name} delay={i*0.1}>
              <div className="fleet-card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
                <div style={{height:180,backgroundImage:`url(${f.image})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",bottom:10,left:10,padding:"4px 10px",borderRadius:6,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",fontSize:10,fontWeight:700,color:T.goldLight,letterSpacing:1}}>{f.role}</div>
                </div>
                <div style={{padding:"18px 20px"}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:12,lineHeight:1.3}}>{f.name}</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:9,fontWeight:700,color:T.dim,letterSpacing:1,marginBottom:2}}>PASSENGERS</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace"}}>{f.pax}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:9,fontWeight:700,color:T.dim,letterSpacing:1,marginBottom:2}}>RANGE</div><div style={{fontSize:14,fontWeight:600,fontFamily:"monospace"}}>{f.range}</div></div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ════════════════════════ CHARTER CTA ════════════════════════ */}
      <section id="charter">
        <FadeIn>
          <div style={{position:"relative",overflow:"hidden",margin:"0 40px",borderRadius:24,minHeight:400}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"url(/images/charter/jet-cta.jpg)",backgroundSize:"cover",backgroundPosition:"center"}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${T.bg}ee 0%,${T.bg}88 50%,transparent 100%)`}}/>
            <div style={{position:"relative",zIndex:2,padding:"72px 64px",maxWidth:560}}>
              <SectionLabel>Private Aviation</SectionLabel>
              <div style={{fontSize:"clamp(28px,3.5vw,44px)",fontWeight:300,fontFamily:"'Playfair Display',serif",lineHeight:1.2,marginBottom:16}}>
                Your Schedule.<br/>Your Aircraft.<br/><span style={{color:T.gold}}>Your Rules.</span>
              </div>
              <p style={{fontSize:15,lineHeight:1.7,color:T.sub,marginBottom:32,maxWidth:440}}>
                Fly anywhere in the world on your terms. Gulfstream G700 and Bombardier Global 7500 available for immediate charter with full concierge service.
              </p>
              <div style={{display:"flex",gap:12}}>
                <Link href="/charter" className="gold-btn">Explore Charter →</Link>
                <Link href="/portal" className="outline-btn">Request a Quote</Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ════════════════════════ LOYALTY ════════════════════════ */}
      <section id="loyalty" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
        <FadeIn>
          <div className="loyalty-split" style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:64,alignItems:"center"}}>
            <div>
              <SectionLabel>SKYLUX Rewards</SectionLabel>
              <SectionTitle style={{marginBottom:20}}>Loyalty That <em style={{fontStyle:"italic",color:T.gold}}>Elevates</em></SectionTitle>
              <p style={{fontSize:15,lineHeight:1.8,color:T.sub,marginBottom:32}}>
                Every flight earns points toward complimentary upgrades, lounge access, priority services, and exclusive experiences. The more you fly, the more extraordinary your journey becomes.
              </p>
              <Link href="/auth" className="gold-btn">Join SKYLUX Rewards →</Link>
            </div>
            <div className="tier-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {TIERS.map((t,i)=>(
                <FadeIn key={t.name} delay={i*0.1}>
                  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"24px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:t.color}}/>
                    <div style={{fontSize:14,fontWeight:700,color:t.color,marginBottom:4}}>{t.name}</div>
                    <div style={{fontSize:28,fontWeight:300,fontFamily:"'Playfair Display',serif",marginBottom:10}}>{t.mult}</div>
                    <div style={{fontSize:11,color:T.sub,lineHeight:1.5}}>{t.perk}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ════════════════════════ GLOBAL CTA ════════════════════════ */}
      <section style={{background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"80px 40px",textAlign:"center"}}>
          <FadeIn>
            <SectionLabel>Ready to Fly?</SectionLabel>
            <SectionTitle style={{marginBottom:16,maxWidth:600,marginLeft:"auto",marginRight:"auto"}}>Begin Your <em style={{fontStyle:"italic",color:T.gold}}>Journey</em> Today</SectionTitle>
            <p style={{fontSize:15,color:T.sub,maxWidth:480,margin:"0 auto 36px",lineHeight:1.7}}>Join millions of discerning travellers who choose SKYLUX for an unparalleled flying experience.</p>
            <div style={{display:"flex",gap:14,justifyContent:"center"}}>
              <Link href="/portal" className="gold-btn">Search Flights →</Link>
              <Link href="/auth" className="outline-btn">Create Account</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer style={{borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"64px 40px 40px"}}>
          <div className="footer-cols" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr",gap:40,marginBottom:48}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <img src="/images/logo.png" alt="SKYLUX" style={{height:28,objectFit:"contain"}} onError={(e:any)=>{e.target.style.display="none"}}/>
                <div>
                  <div style={{fontSize:16,fontWeight:700,letterSpacing:3}}>SKYLUX</div>
                  <div style={{fontSize:7,letterSpacing:4,color:T.gold,textTransform:"uppercase"}}>Airways</div>
                </div>
              </div>
              <p style={{fontSize:13,lineHeight:1.7,color:T.dim,maxWidth:260}}>Connecting the world through uncompromising luxury since 2024. Every journey, an experience.</p>
            </div>
            {[
              {title:"Fly With Us",links:["Book a Flight","Destinations","Charter","Manage Booking"]},
              {title:"Experience",links:["First Class","Business Class","Lounges","Dining"]},
              {title:"SKYLUX Rewards",links:["Join Now","Tier Benefits","Earn Points","Redeem"]},
              {title:"Support",links:["Contact Us","FAQ","Baggage Policy","Travel Advisory"]},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:T.text,textTransform:"uppercase",marginBottom:18}}>{col.title}</div>
                {col.links.map(l=>(<div key={l} style={{marginBottom:10}}><span style={{fontSize:13,color:T.dim,cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.dim}>{l}</span></div>))}
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{borderTop:`1px solid ${T.border}`,paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:T.dim}}>© 2024 SKYLUX Airways. All rights reserved.</div>
            <div style={{display:"flex",gap:24}}>
              {["Privacy Policy","Terms of Service","Cookie Preferences"].map(l=>(<span key={l} style={{fontSize:12,color:T.dim,cursor:"pointer",transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.sub} onMouseLeave={e=>e.currentTarget.style.color=T.dim}>{l}</span>))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
