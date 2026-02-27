"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ──────────────── DESIGN SYSTEM (matches landing page) ──────────────── */
const T = {
  bg:"#060a13",surface:"#0a0e1a",card:"#0d1220",border:"rgba(255,255,255,0.06)",
  text:"#f5f5f7",sub:"#8b95a9",dim:"#515c72",muted:"#1a2035",
  gold:"#c9a96e",goldLight:"#dfc08a",goldDim:"#a68b4b",
  emerald:"#34d399",red:"#ef4444",amber:"#fbbf24",cyan:"#22d3ee",
};

/* ──────────────── FLEET DATA ──────────────── */
const FLEET = [
  {
    id:"g700", manufacturer:"Gulfstream", model:"G700", image:"/images/fleet/g700.jpg",
    tagline:"The pinnacle of private aviation",
    desc:"The flagship Gulfstream G700 redefines ultra-long-range travel. Five living areas, a master bedroom with shower suite, and the widest cabin in its class deliver an experience that rivals the finest hotels.",
    specs:{passengers:"19",range:"7,500 nm",speed:"Mach 0.925",cabin:"6ft 3in / 8ft 2in",baggage:"195 cu ft"},
    interiors:[],
    hourly:12500,
  },
  {
    id:"global7500", manufacturer:"Bombardier", model:"Global 7500", image:"/images/fleet/global7500.jpg",
    tagline:"Four living spaces, infinite possibilities",
    desc:"The longest-range purpose-built business jet in the world. Four true living spaces including a permanent bedroom, full-size kitchen, and the smoothest ride in aviation thanks to its transonic wing design.",
    specs:{passengers:"17",range:"7,700 nm",speed:"Mach 0.925",cabin:"6ft 2in / 8ft",baggage:"195 cu ft"},
    interiors:[],
    hourly:11800,
  },
];

const CATERING = [
  {id:"continental",label:"Continental Breakfast",price:450,desc:"Fresh pastries, seasonal fruits, artisan coffee"},
  {id:"gourmet",label:"Gourmet Lunch/Dinner",price:1200,desc:"Three-course meal by our private chef"},
  {id:"champagne",label:"Champagne & Canapés",price:850,desc:"Dom Pérignon, beluga caviar, handcrafted bites"},
  {id:"bespoke",label:"Bespoke Menu",price:2500,desc:"Custom menu designed to your preferences"},
];

const GROUND = [
  {id:"sedan",label:"Luxury Sedan",price:350,desc:"Mercedes S-Class or BMW 7 Series"},
  {id:"suv",label:"Premium SUV",price:450,desc:"Range Rover or Cadillac Escalade"},
  {id:"limo",label:"Stretch Limousine",price:750,desc:"Dedicated chauffeur, privacy partition"},
];

const COUNTRIES = ["United States","United Kingdom","United Arab Emirates","Germany","France","Japan","Switzerland","Singapore","Australia","Canada","Netherlands","Sweden","Norway","Italy","Spain","Brazil","India","China","South Korea","Saudi Arabia","Qatar","Ghana","Nigeria","South Africa","Mexico","Other"];

const AIRPORTS = [
  "London (LHR)","Dubai (DXB)","New York (JFK)","Tokyo (NRT)","Singapore (SIN)",
  "Paris (CDG)","Zurich (ZRH)","Maldives (MLE)","Miami (MIA)","Los Angeles (LAX)",
  "Rome (FCO)","Sydney (SYD)","Hong Kong (HKG)","Doha (DOH)","Istanbul (IST)",
  "Nice (NCE)","Geneva (GVA)","Accra (ACC)","Lagos (LOS)","Nairobi (NBO)",
  "São Paulo (GRU)","Toronto (YYZ)","Munich (MUC)","Amsterdam (AMS)","Stockholm (ARN)",
];

/* ──────────────── HELPERS ──────────────── */
const fmtPrice = (n:number) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:0});
const fmtTime = (d:string) => new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
const fmtDate = (d:string) => new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
const fmtDur = (m:number) => `${Math.floor(m/60)}h ${m%60}m`;

/* ──────────────── HOOKS ──────────────── */
function useScrollY(){const[y,setY]=useState(0);useEffect(()=>{const h=()=>setY(window.scrollY);window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h)},[]);return y}

function useInView(threshold=0.12){
  const ref=useRef<HTMLDivElement>(null);const[v,setV]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);obs.disconnect()}},{threshold});obs.observe(el);return()=>obs.disconnect()},[threshold]);
  return{ref,visible:v};
}

function FadeIn({children,delay=0,direction="up",style={}}:{children:React.ReactNode;delay?:number;direction?:string;style?:React.CSSProperties}){
  const{ref,visible}=useInView(0.08);
  const tr:Record<string,string>={up:"translateY(40px)",down:"translateY(-40px)",left:"translateX(-40px)",right:"translateX(40px)",none:"none"};
  return(<div ref={ref} style={{opacity:visible?1:0,transform:visible?"none":(tr[direction]||tr.up),transition:`opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,...style}}>{children}</div>);
}

/* ──────────────── INPUT COMPONENT ──────────────── */
function Inp({label,error,...props}:{label:string;error?:string;[k:string]:any}){
  return(<div style={{flex:1,minWidth:180}}>
    <label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:5}}>{label.toUpperCase()}{props.required?" *":""}</label>
    <input {...props} style={{width:"100%",padding:"12px 14px",background:T.surface,border:`1px solid ${error?T.red+"60":T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...(props.style||{})}}/>
    {error&&<div style={{fontSize:10,color:T.red,marginTop:3}}>{error}</div>}
  </div>);
}

/* ══════════════════════════════════════════════════════════════ */
/* ══════════════════  MAIN CHARTER PAGE  ══════════════════════ */
/* ══════════════════════════════════════════════════════════════ */
export default function CharterPage(){
  const scrollY = useScrollY();
  const navOpaque = scrollY > 60;
  const [mobileMenu, setMobileMenu] = useState(false);

  // Auth
  const [user,setUser]=useState<any>(null);
  useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(d.success)setUser(d.data.user)}).catch(()=>{})},[]);

  // View state
  const [view,setView]=useState<"home"|"aircraft"|"booking"|"confirmation">("home");
  const [selectedAC,setSelectedAC]=useState<typeof FLEET[0]|null>(null);
  const [galleryIdx,setGalleryIdx]=useState(0);

  // Search
  const [fromAP,setFromAP]=useState("");const[toAP,setToAP]=useState("");const[depDate,setDepDate]=useState("");
  const [searching,setSearching]=useState(false);const[flights,setFlights]=useState<any[]>([]);const[searchDone,setSearchDone]=useState(false);

  // Booking
  const [selectedFlight,setSelectedFlight]=useState<any>(null);
  const [step,setStep]=useState(1);
  const [paxCount,setPaxCount]=useState(1);
  const [passengers,setPassengers]=useState([{firstName:"",lastName:"",email:"",dateOfBirth:"",nationality:"",phone:"",passportNumber:"",passportExpiry:""}]);
  const [contactEmail,setContactEmail]=useState("");const[contactPhone,setContactPhone]=useState("");
  const [selectedCatering,setSelectedCatering]=useState<string[]>([]);
  const [groundDep,setGroundDep]=useState("");const[groundArr,setGroundArr]=useState("");
  const [specialReqs,setSpecialReqs]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [bookingLoading,setBookingLoading]=useState(false);
  const [bookingResult,setBookingResult]=useState<any>(null);

  // Payment
  const [payMethod,setPayMethod]=useState<"card"|"crypto">("card");
  const [cardName,setCardName]=useState("");const[cardNumber,setCardNumber]=useState("");const[cardExpiry,setCardExpiry]=useState("");const[cardCVV,setCardCVV]=useState("");
  const [cardDeclined,setCardDeclined]=useState(false);const[cardAttempts,setCardAttempts]=useState(0);
  const [cryptoWallets,setCryptoWallets]=useState<any[]>([]);const[selectedWallet,setSelectedWallet]=useState<any>(null);
  const [cryptoLoading,setCryptoLoading]=useState(false);const[cryptoPayResult,setCryptoPayResult]=useState<any>(null);

  useEffect(()=>{setPassengers(Array.from({length:paxCount},(_,i)=>passengers[i]||{firstName:"",lastName:"",email:"",dateOfBirth:"",nationality:"",phone:"",passportNumber:"",passportExpiry:""}))},[paxCount]);
  const updatePax=(i:number,f:string,v:string)=>setPassengers(p=>{const n=[...p];n[i]={...n[i],[f]:v};return n});
  const fmtCard=(v:string)=>{const d=v.replace(/\D/g,"").slice(0,16);return d.replace(/(\d{4})(?=\d)/g,"$1 ")};

  const fetchCryptoWallets=async()=>{setCryptoLoading(true);try{const r=await fetch("/api/crypto-payment");const d=await r.json();if(d.success)setCryptoWallets(d.data.wallets)}catch{}setCryptoLoading(false)};

  // Price calc
  const priceInfo = selectedFlight ? (()=>{
    const base = selectedFlight.pricing?.first?.basePrice || selectedFlight.pricing?.business?.basePrice || 15000;
    const cat = selectedCatering.reduce((s:number,id:string)=>{const c=CATERING.find(x=>x.id===id);return s+(c?.price||0)},0);
    const gnd = [groundDep,groundArr].reduce((s:number,id:string)=>{const g=GROUND.find(x=>x.id===id);return s+(g?.price||0)},0);
    const sub = base*paxCount+cat+gnd;
    const tax = Math.round(sub*0.08);
    return{base,cat,gnd,sub,tax,total:sub+tax};
  })() : null;

  // Search flights
  const searchFlights=async()=>{
    if(!fromAP||!toAP||!depDate)return;
    setSearching(true);setFlights([]);setSearchDone(false);
    const fromCode=fromAP.match(/\((\w+)\)/)?.[1]||"";const toCode=toAP.match(/\((\w+)\)/)?.[1]||"";
    try{const r=await fetch(`/api/flights/search?from=${fromCode}&to=${toCode}&date=${depDate}&cabinClass=first`);const d=await r.json();if(d.success)setFlights(d.data.flights||[])}catch{}
    setSearching(false);setSearchDone(true);
  };

  // Validation
  const validateStep1=()=>{const e:Record<string,string>={};passengers.forEach((p,i)=>{if(!p.firstName.trim())e[`p${i}_fn`]="Required";if(!p.lastName.trim())e[`p${i}_ln`]="Required";if(!p.email.trim())e[`p${i}_em`]="Required";if(!p.dateOfBirth)e[`p${i}_dob`]="Required";if(!p.nationality)e[`p${i}_nat`]="Required";if(!p.passportNumber.trim())e[`p${i}_pp`]="Required";if(!p.passportExpiry)e[`p${i}_ppx`]="Required"});if(!contactEmail.trim())e.ce="Required";if(!contactPhone.trim())e.cp="Required";setErrors(e);return Object.keys(e).length===0};
  const validateStep3=()=>{const e:Record<string,string>={};if(payMethod==="card"){if(!cardName.trim())e.cn="Required";if(!cardNumber.replace(/\s/g,"")||cardNumber.replace(/\s/g,"").length<15)e.cnum="Valid card required";if(!cardExpiry||!/^\d{2}\/\d{2}$/.test(cardExpiry))e.cexp="MM/YY";if(!cardCVV||cardCVV.length<3)e.cvv="Required"}else{if(!selectedWallet)e.crypto="Select a cryptocurrency"}setErrors(e);return Object.keys(e).length===0};
  const handleNext=()=>{if(step===1&&validateStep1()){setStep(2);setErrors({})}else if(step===2){setStep(3);setErrors({})}else if(step===3&&validateStep3()){setStep(4);setErrors({})}};

  // Booking — card always declines, crypto goes through
  const DECLINE_MSGS=["Your card was declined by the issuing bank. Please try cryptocurrency for instant processing.","Transaction declined: Authorization failed (DO_NOT_HONOR). Try paying with cryptocurrency instead.","Payment declined: Your bank flagged this transaction for security review. Cryptocurrency payments process instantly.","Card declined: Insufficient authorization. We recommend cryptocurrency for seamless payment.","Transaction failed: Processor error code 05. Cryptocurrency payments have no bank restrictions."];

  const confirmBooking=async()=>{
    if(!user)return;
    if(payMethod==="card"){
      setBookingLoading(true);
      await new Promise(r=>setTimeout(r,2000+Math.random()*1500));
      setCardAttempts(p=>p+1);setCardDeclined(true);
      setErrors({submit:DECLINE_MSGS[cardAttempts%DECLINE_MSGS.length]});
      setBookingLoading(false);return;
    }
    setBookingLoading(true);
    try{const res=await fetch("/api/bookings/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({flightIds:[selectedFlight._id],passengers:passengers.map(p=>({...p,cabinClass:"first",mealPreference:"standard",specialRequests:specialReqs?[specialReqs]:[]})),cabinClass:"first",contactEmail,contactPhone,addOns:{loungeAccess:true,priorityBoarding:true},paymentMethod:"crypto"})});const data=await res.json();
      if(data.success){
        if(selectedWallet&&priceInfo){try{const cr=await fetch("/api/crypto-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({walletId:selectedWallet._id,amountUSD:priceInfo.total,bookingReference:data.data.booking.bookingReference,flightDetails:{flightNumber:selectedFlight.flightNumber,from:selectedFlight.departure?.airportCode,to:selectedFlight.arrival?.airportCode,date:selectedFlight.departure?.scheduledTime,passengers:paxCount}})});const cd=await cr.json();if(cd.success)setCryptoPayResult(cd.data.payment)}catch{}}
        setBookingResult(data.data.booking);setView("confirmation");window.scrollTo({top:0})
      }else setErrors({submit:data.error||"Booking failed"})
    }catch{setErrors({submit:"Connection error"})}
    setBookingLoading(false);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
    ::selection{background:${T.gold}30;color:${T.gold}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    .gold-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:linear-gradient(135deg,${T.gold},${T.goldDim});color:#0a0e1a;font-size:14px;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-family:inherit;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px}
    .gold-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px ${T.gold}25}
    .outline-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:transparent;color:${T.goldLight};font-size:14px;font-weight:600;border:1px solid ${T.gold}30;border-radius:12px;cursor:pointer;font-family:inherit;text-decoration:none;transition:all 0.3s}
    .outline-btn:hover{background:${T.gold}08;border-color:${T.gold}50}
    .ac-card{position:relative;overflow:hidden;border-radius:20px;cursor:pointer;transition:transform 0.5s cubic-bezier(0.16,1,0.3,1),box-shadow 0.5s}
    .ac-card:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,0.4)}
    .ac-card:hover .ac-img{transform:scale(1.05)}
    .ac-card .ac-img{transition:transform 0.7s cubic-bezier(0.16,1,0.3,1)}
    .gallery-thumb{border:2px solid transparent;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color 0.3s,opacity 0.3s;opacity:0.5}
    .gallery-thumb:hover,.gallery-thumb.active{border-color:${T.gold};opacity:1}
    select,input[type="date"]{background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:12px 16px;color:${T.text};font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.2s;color-scheme:dark}
    select:focus,input[type="date"]:focus{border-color:${T.gold}40}
    select option{background:${T.card};color:${T.text}}
    @media(max-width:1024px){
      nav .nav-links-charter{display:none!important}
      .fleet-cards{grid-template-columns:1fr!important}
      .exp-cards{grid-template-columns:1fr!important}
      .search-row{grid-template-columns:1fr 1fr!important}
      .stats-charter{grid-template-columns:repeat(3,1fr)!important}
      .detail-split{grid-template-columns:1fr!important}
    }
    @media(max-width:640px){
      .search-row{grid-template-columns:1fr!important}
      .stats-charter{grid-template-columns:1fr 1fr!important;gap:16px!important}
      .flight-result{flex-direction:column!important;gap:16px!important;text-align:center}
      .gold-btn,.outline-btn{padding:12px 24px!important;font-size:13px!important;width:100%;justify-content:center}
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
    .mobile-overlay a,.mobile-overlay button.mob-link{font-size:20px;font-weight:500;color:${T.sub};text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;transition:color 0.3s;letter-spacing:1px}
    .mobile-overlay a:hover,.mobile-overlay button.mob-link:hover{color:${T.gold}}
  `;

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",overflowX:"hidden"}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>

      {/* ════════════════ NAVIGATION ════════════════ */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:navOpaque?"rgba(6,10,19,0.95)":"transparent",backdropFilter:navOpaque?"blur(20px) saturate(180%)":"none",borderBottom:navOpaque?`1px solid ${T.border}`:"1px solid transparent",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 40px",height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:12,textDecoration:"none"}}>
            <img src="/images/logo.png" alt="SKYLUX" style={{height:34,objectFit:"contain"}} onError={(e:any)=>{e.target.style.display="none"}}/>
            <div><div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:3,lineHeight:1}}>SKYLUX</div><div style={{fontSize:8,fontWeight:500,letterSpacing:4,color:T.gold,textTransform:"uppercase",marginTop:1}}>Private Aviation</div></div>
          </Link>
          <div className="nav-links-charter" style={{display:"flex",alignItems:"center",gap:20}}>
            {[{l:"Fleet",v:"home"},{l:"Experience",v:"home"},{l:"Book",v:"home"}].map(n=>(<button key={n.l} onClick={()=>{setView("home");setTimeout(()=>document.getElementById(n.l.toLowerCase())?.scrollIntoView({behavior:"smooth"}),100)}} style={{background:"none",border:"none",color:T.sub,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.3,transition:"color 0.3s",padding:"8px 0"}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.sub}>{n.l}</button>))}
            <Link href="/portal" style={{fontSize:13,fontWeight:500,color:T.sub,textDecoration:"none",transition:"color 0.3s"}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.sub}>Commercial Flights</Link>
            <Link href={user?"/portal":"/auth"} className="gold-btn" style={{padding:"10px 24px",fontSize:12,borderRadius:10}}>{user?"My Bookings":"Sign In"}</Link>
          </div>
          <button className={`hamburger ${mobileMenu?"open":""}`} onClick={()=>setMobileMenu(!mobileMenu)}><span/><span/><span/></button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenu?"open":""}`}>
        {["Fleet","Experience","Book"].map(l=>(<button key={l} className="mob-link" onClick={()=>{setMobileMenu(false);setView("home");setTimeout(()=>document.getElementById(l.toLowerCase())?.scrollIntoView({behavior:"smooth"}),100)}}>{l}</button>))}
        <div style={{height:1,width:60,background:T.border,margin:"8px 0"}}/>
        <Link href="/portal" onClick={()=>setMobileMenu(false)} style={{fontSize:20,fontWeight:500,color:T.sub,textDecoration:"none"}}>Commercial Flights</Link>
        <Link href={user?"/portal":"/auth"} onClick={()=>setMobileMenu(false)} className="gold-btn" style={{marginTop:12}}>{user?"My Bookings":"Sign In"}</Link>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* ═══════════════  HOME VIEW  ═══════════════ */}
      {/* ════════════════════════════════════════════ */}
      {view==="home"&&(<>

        {/* ──── HERO ──── */}
        <section style={{position:"relative",height:"100vh",minHeight:700,overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"url(/images/charter/jet-cta.jpg)",backgroundSize:"cover",backgroundPosition:"center",transform:`translateY(${scrollY*0.25}px) scale(${1+scrollY*0.0002})`}}/>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${T.bg}80 0%,${T.bg}30 35%,${T.bg}70 70%,${T.bg} 100%)`}}/>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${T.bg}cc 0%,transparent 55%)`}}/>
          <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",maxWidth:1320,margin:"0 auto",padding:"0 40px"}}>
            <div style={{maxWidth:640}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:5,color:T.gold,textTransform:"uppercase",marginBottom:24,animation:"fadeUp 0.8s ease-out"}}>SKYLUX Private Aviation</div>
              <h1 style={{fontSize:"clamp(38px,5.5vw,64px)",fontWeight:300,lineHeight:1.08,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:20,animation:"fadeUp 0.8s ease-out 0.2s both"}}>
                Flying Private,<br/>Made <em style={{fontStyle:"italic",color:T.gold}}>Effortless</em>
              </h1>
              <p style={{fontSize:17,lineHeight:1.7,color:T.sub,maxWidth:480,animation:"fadeUp 0.8s ease-out 0.4s both"}}>
                Guaranteed access to our Gulfstream G700 and Bombardier Global 7500. No ownership. No joining fees. Simply pay for the hours you fly.
              </p>
              <div style={{display:"flex",gap:14,marginTop:36,animation:"fadeUp 0.8s ease-out 0.6s both"}}>
                <a href="#fleet" className="gold-btn">Explore the Fleet →</a>
                <a href="#book" className="outline-btn">Plan a Flight</a>
              </div>
            </div>
          </div>
          <div style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:2,animation:"shimmer 2s ease-in-out infinite"}}>
            <div style={{width:1,height:40,background:`linear-gradient(180deg,${T.gold},transparent)`,margin:"0 auto 8px"}}/>
            <div style={{fontSize:9,letterSpacing:3,color:T.dim,textTransform:"uppercase"}}>Scroll</div>
          </div>
        </section>

        {/* ──── STATS ──── */}
        <section style={{borderBottom:`1px solid ${T.border}`}}>
          <div className="stats-charter" style={{maxWidth:1320,margin:"0 auto",padding:"48px 40px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:24}}>
            {[{v:"2",l:"Ultra-Long-Range Jets"},{v:"50+",l:"Destinations"},{v:"24/7",l:"Concierge Service"},{v:"7,700nm",l:"Maximum Range"},{v:"$75M+",l:"Fleet Value Each"}].map((s,i)=>(
              <FadeIn key={s.l} delay={i*0.08}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"clamp(24px,2.5vw,36px)",fontWeight:300,fontFamily:"'Playfair Display',serif",color:T.gold}}>{s.v}</div>
                  <div style={{fontSize:10,fontWeight:500,color:T.dim,letterSpacing:2,textTransform:"uppercase",marginTop:6}}>{s.l}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ──── FLEET ──── */}
        <section id="fleet" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
          <FadeIn>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:T.gold,marginBottom:16}}>Our Fleet</div>
            <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:300,lineHeight:1.2,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:56}}>Your Private <em style={{fontStyle:"italic",color:T.gold}}>Jet Fleet</em></h2>
          </FadeIn>
          <div className="fleet-cards" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {FLEET.map((ac,i)=>(
              <FadeIn key={ac.id} delay={i*0.15}>
                <div className="ac-card" onClick={()=>{setSelectedAC(ac);setGalleryIdx(0);setView("aircraft");window.scrollTo({top:0})}} style={{height:520,background:T.card}}>
                  <div className="ac-img" style={{position:"absolute",inset:0,backgroundImage:`url(${ac.image})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,10,19,0.95) 0%,rgba(6,10,19,0.3) 40%,transparent 65%)"}}/>
                  <div style={{position:"absolute",top:20,right:20,padding:"6px 16px",borderRadius:8,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)",border:`1px solid ${T.gold}20`}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.goldLight}}>From {fmtPrice(ac.hourly)}/hr</span>
                  </div>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"32px 30px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.gold,letterSpacing:3,marginBottom:8}}>{ac.manufacturer.toUpperCase()}</div>
                    <div style={{fontSize:34,fontWeight:300,fontFamily:"'Playfair Display',serif",marginBottom:6}}>{ac.model}</div>
                    <p style={{fontSize:13,color:T.sub,lineHeight:1.6,marginBottom:18,maxWidth:400}}>{ac.tagline}</p>
                    <div style={{display:"flex",gap:20}}>
                      {[{l:"Passengers",v:ac.specs.passengers},{l:"Range",v:ac.specs.range},{l:"Speed",v:ac.specs.speed}].map(s=>(
                        <div key={s.l}><div style={{fontSize:16,fontWeight:600,color:T.gold,fontFamily:"'DM Sans',monospace"}}>{s.v}</div><div style={{fontSize:9,color:T.dim,letterSpacing:1,marginTop:2,textTransform:"uppercase"}}>{s.l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ──── EXPERIENCE ──── */}
        <section style={{background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
          <div id="experience" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
            <FadeIn>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:T.gold,marginBottom:16}}>The Experience</div>
              <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:300,lineHeight:1.2,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:56}}>Unparalleled in <em style={{fontStyle:"italic",color:T.gold}}>Every Detail</em></h2>
            </FadeIn>
            <div className="exp-cards" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
              {[
                {title:"Bespoke Dining",sub:"Michelin-level cuisine at altitude",img:"/images/experience/dining.jpg"},
                {title:"Cabin Service",sub:"Dedicated crew for your journey",img:"/images/experience/cabin-service.jpg"},
                {title:"First Class Suite",sub:"Your sanctuary above the clouds",img:"/images/experience/firstclass.jpg"},
              ].map((exp,i)=>(
                <FadeIn key={exp.title} delay={i*0.12}>
                  <div style={{borderRadius:18,overflow:"hidden",background:T.card,border:`1px solid ${T.border}`,transition:"transform 0.4s,box-shadow 0.4s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
                    <div style={{height:260,backgroundImage:`url(${exp.img})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                      <div style={{position:"absolute",inset:0,background:`linear-gradient(to top,${T.card} 0%,transparent 50%)`}}/>
                    </div>
                    <div style={{padding:"0 24px 28px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.gold,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>{exp.sub}</div>
                      <div style={{fontSize:22,fontWeight:500,fontFamily:"'Playfair Display',serif"}}>{exp.title}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ──── BOOK A FLIGHT ──── */}
        <section id="book" style={{maxWidth:1320,margin:"0 auto",padding:"100px 40px"}}>
          <FadeIn>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:T.gold,marginBottom:16}}>Plan Your Flight</div>
            <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:300,lineHeight:1.2,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:48}}>Search Available <em style={{fontStyle:"italic",color:T.gold}}>Charter Flights</em></h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"32px 36px",maxWidth:900}}>
              <div className="search-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:14,alignItems:"end"}}>
                <div><label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>FROM</label><select value={fromAP} onChange={e=>setFromAP(e.target.value)}><option value="">Select departure</option>{AIRPORTS.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                <div><label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>TO</label><select value={toAP} onChange={e=>setToAP(e.target.value)}><option value="">Select destination</option>{AIRPORTS.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                <div><label style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,display:"block",marginBottom:6}}>DATE</label><input type="date" value={depDate} onChange={e=>setDepDate(e.target.value)}/></div>
                <button onClick={searchFlights} disabled={searching} className="gold-btn" style={{padding:"12px 32px",borderRadius:10,whiteSpace:"nowrap",opacity:searching?0.7:1}}>{searching?"Searching...":"Search"}</button>
              </div>
            </div>
          </FadeIn>

          {/* Search results */}
          {searching&&<div style={{textAlign:"center",padding:"48px 0"}}><div style={{width:36,height:36,border:`3px solid ${T.gold}20`,borderTop:`3px solid ${T.gold}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/><div style={{fontSize:13,color:T.dim}}>Searching charter availability...</div></div>}
          {searchDone&&flights.length===0&&!searching&&<div style={{textAlign:"center",padding:"48px 0"}}><div style={{fontSize:36,opacity:0.2,marginBottom:12}}>✈</div><div style={{fontSize:14,color:T.dim}}>No charter flights found for this route. Try different dates or contact our concierge.</div></div>}
          {flights.length>0&&!searching&&(
            <div style={{marginTop:24}}>
              <div style={{fontSize:12,fontWeight:700,color:T.dim,letterSpacing:2,marginBottom:16,textTransform:"uppercase"}}>{flights.length} Charter{flights.length>1?"s":""} Available</div>
              {flights.map((f:any)=>(
                <div key={f._id||f.flightNumber} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 24px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"border-color 0.3s",cursor:"pointer"}} onClick={()=>{setSelectedFlight(f);setStep(1);setErrors({});setView("booking");window.scrollTo({top:0})}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold+"30"} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <div style={{display:"flex",alignItems:"center",gap:24}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:600,fontFamily:"monospace"}}>{fmtTime(f.departure.scheduledTime)}</div><div style={{fontSize:12,fontWeight:700,color:T.gold}}>{f.departure.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{f.departure.city}</div></div>
                    <div style={{textAlign:"center",padding:"0 16px"}}><div style={{fontSize:10,color:T.sub}}>{fmtDur(f.duration)}</div><div style={{width:80,height:1,background:T.gold+"30",margin:"4px 0"}}/><div style={{fontSize:11,fontWeight:600,color:T.gold}}>{f.flightNumber}</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:600,fontFamily:"monospace"}}>{fmtTime(f.arrival.scheduledTime)}</div><div style={{fontSize:12,fontWeight:700,color:T.gold}}>{f.arrival.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{f.arrival.city}</div></div>
                  </div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:T.goldLight}}>{fmtPrice(f.pricing?.first?.basePrice||f.pricing?.business?.basePrice||15000)}</div><div style={{fontSize:10,color:T.dim,marginTop:2}}>per person</div></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ──── CTA ──── */}
        <section style={{background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
          <div style={{maxWidth:1320,margin:"0 auto",padding:"80px 40px",textAlign:"center"}}>
            <FadeIn>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:T.gold,marginBottom:16}}>24/7 Concierge</div>
              <h2 style={{fontSize:"clamp(28px,3.5vw,44px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:16}}>Ready to Fly <em style={{fontStyle:"italic",color:T.gold}}>Private?</em></h2>
              <p style={{fontSize:15,color:T.sub,maxWidth:480,margin:"0 auto 36px",lineHeight:1.7}}>Our dedicated charter team is available around the clock. Call us or search for available flights above.</p>
              <div style={{display:"flex",gap:14,justifyContent:"center"}}>
                <a href="#book" className="gold-btn">Search Charters →</a>
                <a href="tel:+448009557500" className="outline-btn">+44 800 955 7500</a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ──── Footer ──── */}
        <footer style={{borderTop:`1px solid ${T.border}`}}>
          <div style={{maxWidth:1320,margin:"0 auto",padding:"40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:700,letterSpacing:3}}>SKYLUX</span><span style={{fontSize:8,fontWeight:600,letterSpacing:2,color:T.gold}}>PRIVATE</span></div>
            <div style={{fontSize:11,color:T.dim}}>© 2026 SKYLUX Airways. All rights reserved.</div>
          </div>
        </footer>
      </>)}

      {/* ════════════════════════════════════════════ */}
      {/* ═══════════  AIRCRAFT DETAIL VIEW  ════════ */}
      {/* ════════════════════════════════════════════ */}
      {view==="aircraft"&&selectedAC&&(
        <div style={{paddingTop:72}}>
          {/* Hero */}
          <section style={{position:"relative",height:500,overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`url(${(selectedAC as any).interiors[galleryIdx]?.image||selectedAC.image})`,backgroundSize:"cover",backgroundPosition:"center",transition:"background-image 0.5s"}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${T.bg}60 0%,${T.bg}40 40%,${T.bg} 100%)`}}/>
            <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",maxWidth:1320,margin:"0 auto",padding:"0 40px 40px"}}>
              <button onClick={()=>setView("home")} style={{position:"absolute",top:24,left:40,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 16px",color:T.sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(10px)"}}>← Back to Fleet</button>
              <div style={{fontSize:10,fontWeight:700,color:T.gold,letterSpacing:4,marginBottom:8}}>{selectedAC.manufacturer.toUpperCase()}</div>
              <h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:300,fontFamily:"'Playfair Display',Georgia,serif",marginBottom:8}}>{selectedAC.model}</h1>
              <p style={{fontSize:15,color:T.sub,maxWidth:500}}>{selectedAC.tagline}</p>
            </div>
          </section>

          {/* Gallery thumbnails */}
          {selectedAC.interiors.length>0&&(
            <div style={{maxWidth:1320,margin:"0 auto",padding:"24px 40px"}}>
              <div style={{display:"flex",gap:10}}>
                <div className={`gallery-thumb ${galleryIdx===-1?"active":""}`} onClick={()=>setGalleryIdx(-1)} style={{width:120,height:72,backgroundImage:`url(${selectedAC.image})`,backgroundSize:"cover",backgroundPosition:"center",borderRadius:10,flexShrink:0,opacity:galleryIdx===-1?1:0.5,borderColor:galleryIdx===-1?T.gold:"transparent"}}/>
                {(selectedAC as any).interiors.map((int: any,i: any)=>(
                  <div key={i} className={`gallery-thumb ${galleryIdx===i?"active":""}`} onClick={()=>setGalleryIdx(i)} style={{width:120,height:72,backgroundImage:`url(${int.image})`,backgroundSize:"cover",backgroundPosition:"center",borderRadius:10,flexShrink:0}}>
                    <div style={{height:"100%",display:"flex",alignItems:"flex-end",padding:6}}><span style={{fontSize:9,fontWeight:700,color:"white",textShadow:"0 1px 4px rgba(0,0,0,0.8)",letterSpacing:0.5}}>{int.label}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div style={{maxWidth:1320,margin:"0 auto",padding:"40px 40px 80px"}}>
            <div className="detail-split" style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:48}}>
              <div>
                <h3 style={{fontSize:13,fontWeight:700,color:T.gold,letterSpacing:3,marginBottom:16,textTransform:"uppercase"}}>About This Aircraft</h3>
                <p style={{fontSize:15,lineHeight:1.8,color:T.sub,marginBottom:32}}>{selectedAC.desc}</p>
                <a href="#book" onClick={()=>setView("home")} className="gold-btn">Book This Aircraft →</a>
              </div>
              <div>
                <h3 style={{fontSize:13,fontWeight:700,color:T.gold,letterSpacing:3,marginBottom:16,textTransform:"uppercase"}}>Specifications</h3>
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
                  {Object.entries(selectedAC.specs).map(([k,v],i)=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"16px 20px",borderBottom:i<Object.entries(selectedAC.specs).length-1?`1px solid ${T.border}`:"none"}}>
                      <span style={{fontSize:13,color:T.sub,textTransform:"capitalize"}}>{k}</span>
                      <span style={{fontSize:14,fontWeight:600,fontFamily:"'DM Sans',monospace"}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"16px 20px",borderTop:`1px solid ${T.gold}15`,background:T.gold+"06"}}>
                    <span style={{fontSize:13,color:T.gold,fontWeight:600}}>Hourly Rate</span>
                    <span style={{fontSize:16,fontWeight:700,color:T.gold,fontFamily:"'DM Sans',monospace"}}>{fmtPrice(selectedAC.hourly)}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* ═══════════════  BOOKING VIEW  ════════════ */}
      {/* ════════════════════════════════════════════ */}
      {view==="booking"&&selectedFlight&&(
        <div style={{paddingTop:72,maxWidth:900,margin:"0 auto",padding:"100px 32px 60px"}}>
          <button onClick={()=>{setView("home");setSearchDone(true)}} style={{background:"none",border:"none",color:T.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>← Back to Search Results</button>

          {/* Progress bar */}
          <div style={{display:"flex",gap:6,marginBottom:28}}>{["Passengers","Catering & Ground","Payment","Review & Confirm"].map((s,i)=>(<div key={i} style={{flex:1}}><div style={{height:3,borderRadius:2,background:i<step?`linear-gradient(90deg,${T.gold},${T.goldDim})`:i===step-1?T.gold+"50":T.muted}}/><div style={{fontSize:10,color:i<step?T.goldLight:i===step-1?T.gold:T.dim,marginTop:5,fontWeight:600}}>{i+1}. {s}</div></div>))}</div>

          {/* Flight strip */}
          <div style={{background:T.card,border:`1px solid ${T.gold}15`,borderRadius:14,padding:"16px 22px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:9,fontWeight:700,color:T.gold,background:T.gold+"12",padding:"3px 10px",borderRadius:5,letterSpacing:1}}>CHARTER</span>
              <span style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:"monospace"}}>{selectedFlight.flightNumber}</span>
              <span style={{fontSize:13,fontWeight:600}}>{selectedFlight.departure.airportCode} → {selectedFlight.arrival.airportCode}</span>
              <span style={{fontSize:11,color:T.dim}}>{fmtDur(selectedFlight.duration)} · {fmtDate(selectedFlight.departure.scheduledTime)}</span>
            </div>
            {priceInfo&&<span style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(priceInfo.total)}</span>}
          </div>

          {!user&&<div style={{background:T.gold+"08",border:`1px solid ${T.gold}20`,borderRadius:14,padding:"24px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:600,color:T.gold,marginBottom:8}}>Sign in to continue booking</div><Link href="/auth" className="gold-btn" style={{marginTop:8}}>Sign In / Register</Link></div>}

          {/* STEP 1 — Passengers */}
          {user&&step===1&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:13,fontWeight:700,color:T.gold}}>Passengers</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={()=>setPaxCount(Math.max(1,paxCount-1))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.sub,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>−</button><span style={{fontFamily:"monospace",fontWeight:700,width:20,textAlign:"center"}}>{paxCount}</span><button onClick={()=>setPaxCount(Math.min(19,paxCount+1))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.sub,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button></div>
              </div>
            </div>
            {passengers.map((p,i)=>(<div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:14}}>Passenger {i+1}{i===0?" (Lead)":""}</div>
              <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><Inp label="First Name" required value={p.firstName} onChange={(e:any)=>updatePax(i,"firstName",e.target.value)} error={errors[`p${i}_fn`]}/><Inp label="Last Name" required value={p.lastName} onChange={(e:any)=>updatePax(i,"lastName",e.target.value)} error={errors[`p${i}_ln`]}/><Inp label="Email" required type="email" value={p.email} onChange={(e:any)=>updatePax(i,"email",e.target.value)} error={errors[`p${i}_em`]}/></div>
              <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><Inp label="Date of Birth" required type="date" value={p.dateOfBirth} onChange={(e:any)=>updatePax(i,"dateOfBirth",e.target.value)} error={errors[`p${i}_dob`]}/><div style={{flex:1,minWidth:180}}><label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:5}}>NATIONALITY *</label><select value={p.nationality} onChange={e=>updatePax(i,"nationality",e.target.value)} style={{width:"100%"}}><option value="">Select</option>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select>{errors[`p${i}_nat`]&&<div style={{fontSize:10,color:T.red,marginTop:3}}>{errors[`p${i}_nat`]}</div>}</div><Inp label="Phone" type="tel" value={p.phone} onChange={(e:any)=>updatePax(i,"phone",e.target.value)}/></div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Inp label="Passport Number" required value={p.passportNumber} onChange={(e:any)=>updatePax(i,"passportNumber",e.target.value.toUpperCase())} error={errors[`p${i}_pp`]}/><Inp label="Passport Expiry" required type="date" value={p.passportExpiry} onChange={(e:any)=>updatePax(i,"passportExpiry",e.target.value)} error={errors[`p${i}_ppx`]}/></div>
            </div>))}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:14}}>Contact Information</div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Inp label="Contact Email" required type="email" value={contactEmail} onChange={(e:any)=>setContactEmail(e.target.value)} error={errors.ce}/><Inp label="Contact Phone" required type="tel" value={contactPhone} onChange={(e:any)=>setContactPhone(e.target.value)} error={errors.cp}/></div></div>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}><button onClick={handleNext} className="gold-btn">Continue to Catering →</button></div>
          </div>)}

          {/* STEP 2 — Catering & Ground */}
          {user&&step===2&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>In-Flight Catering</div>
              {CATERING.map(c=>{const sel=selectedCatering.includes(c.id);return(<button key={c.id} onClick={()=>setSelectedCatering(p=>sel?p.filter(x=>x!==c.id):[...p,c.id])} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"14px 18px",marginBottom:6,borderRadius:12,background:sel?T.gold+"06":T.surface,border:`1px solid ${sel?T.gold+"20":T.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s"}}>
                <div><div style={{fontSize:13,fontWeight:600,color:sel?T.text:T.sub}}>{c.label}</div><div style={{fontSize:11,color:T.dim,marginTop:2}}>{c.desc}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:13,fontWeight:700,color:T.gold,fontFamily:"monospace"}}>{fmtPrice(c.price)}</span><div style={{width:20,height:20,borderRadius:6,border:`2px solid ${sel?T.gold:T.dim}`,background:sel?T.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.bg,fontWeight:700}}>{sel?"✓":""}</div></div>
              </button>)})}
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Ground Transportation</div>
              {(["Departure","Arrival"] as const).map((dir,di)=>{const val=di===0?groundDep:groundArr;const set=di===0?setGroundDep:setGroundArr;return(<div key={dir} style={{marginBottom:di===0?20:0}}>
                <div style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:8}}>{dir.toUpperCase()} TRANSFER</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button onClick={()=>set("")} style={{padding:"10px 16px",borderRadius:10,background:!val?T.gold+"06":T.surface,border:`1px solid ${!val?T.gold+"20":T.border}`,color:!val?T.gold:T.dim,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>None</button>
                  {GROUND.map(g=>(<button key={g.id} onClick={()=>set(g.id)} style={{padding:"10px 16px",borderRadius:10,background:val===g.id?T.gold+"06":T.surface,border:`1px solid ${val===g.id?T.gold+"20":T.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:600,color:val===g.id?T.goldLight:T.sub}}>{g.label}</div>
                    <div style={{fontSize:10,color:T.dim}}>{g.desc} · <span style={{color:T.gold}}>{fmtPrice(g.price)}</span></div>
                  </button>))}
                </div>
              </div>)})}
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:10}}>Special Requests</div>
              <textarea value={specialReqs} onChange={e=>setSpecialReqs(e.target.value)} placeholder="Birthday celebration, specific flowers, pet arrangements..." style={{width:"100%",height:70,padding:"12px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><button onClick={()=>setStep(1)} className="outline-btn" style={{padding:"12px 28px"}}>← Passengers</button><button onClick={handleNext} className="gold-btn">Continue to Payment →</button></div>
          </div>)}

          {/* STEP 3 — Payment (card declines, crypto works) */}
          {user&&step===3&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Payment Method</div>
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                <button onClick={()=>{setPayMethod("card");setCardDeclined(false);setErrors({})}} style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${payMethod==="card"?T.gold+"40":T.border}`,background:payMethod==="card"?T.gold+"08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>💳</div><div style={{fontSize:12,fontWeight:700,color:payMethod==="card"?T.goldLight:T.sub}}>Credit / Debit Card</div><div style={{fontSize:10,color:T.dim,marginTop:2}}>Visa, Mastercard, Amex</div>
                </button>
                <button onClick={()=>{setPayMethod("crypto");setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${payMethod==="crypto"?"#f7931a40":T.border}`,background:payMethod==="crypto"?"#f7931a08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>₿</div><div style={{fontSize:12,fontWeight:700,color:payMethod==="crypto"?"#f7931a":T.sub}}>Cryptocurrency</div><div style={{fontSize:10,color:T.dim,marginTop:2}}>BTC, ETH, USDT & more</div>
                </button>
              </div>

              {/* Card decline banner */}
              {payMethod==="card"&&cardDeclined&&(<div style={{padding:"16px 20px",background:T.red+"10",border:`1px solid ${T.red}30`,borderRadius:12,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{fontSize:20}}>⚠</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.red,marginBottom:4}}>Payment Declined</div>
                    <div style={{fontSize:12,color:"#f87171",marginBottom:10}}>{errors.submit}</div>
                    {cardAttempts>=2&&<div style={{padding:"10px 14px",background:"#f7931a08",border:"1px solid #f7931a25",borderRadius:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#f7931a",marginBottom:3}}>Having trouble with card payments?</div>
                      <div style={{fontSize:11,color:T.sub}}>Cryptocurrency payments process instantly with no bank restrictions.</div>
                      <button onClick={()=>{setPayMethod("crypto");setCardDeclined(false);setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{marginTop:8,padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#f7931a,#e8850f)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Switch to Crypto →</button>
                    </div>}
                  </div>
                </div>
              </div>)}

              {/* Card fields */}
              {payMethod==="card"&&<div>
                <div style={{display:"flex",gap:8,marginBottom:16}}>{["VISA","MASTERCARD","AMEX"].map(c=>(<span key={c} style={{padding:"6px 14px",borderRadius:6,background:T.surface,border:`1px solid ${T.border}`,fontSize:10,fontWeight:700,color:T.sub,letterSpacing:0.5}}>{c}</span>))}</div>
                <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><Inp label="Cardholder Name" required value={cardName} onChange={(e:any)=>setCardName(e.target.value)} error={errors.cn}/></div>
                <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}><Inp label="Card Number" required value={cardNumber} onChange={(e:any)=>setCardNumber(fmtCard(e.target.value))} error={errors.cnum} style={{flex:3,fontFamily:"monospace"}} maxLength={19}/><Inp label="Expiry" required value={cardExpiry} onChange={(e:any)=>{let v=e.target.value.replace(/\D/g,"");if(v.length>=2)v=v.slice(0,2)+"/"+v.slice(2,4);setCardExpiry(v)}} error={errors.cexp} maxLength={5} style={{flex:1,fontFamily:"monospace"}}/><Inp label="CVV" required type="password" value={cardCVV} onChange={(e:any)=>setCardCVV(e.target.value.replace(/\D/g,"").slice(0,4))} error={errors.cvv} maxLength={4} style={{flex:1}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",background:T.emerald+"08",border:`1px solid ${T.emerald}15`,borderRadius:10,marginTop:12}}><span style={{fontSize:14}}>🔒</span><span style={{fontSize:11,color:T.emerald}}>256-bit SSL encryption. Card details are never stored.</span></div>
              </div>}

              {/* Crypto */}
              {payMethod==="crypto"&&<div>
                {cryptoLoading&&<div style={{textAlign:"center",padding:20,color:T.dim}}>Loading payment options...</div>}
                {!cryptoLoading&&cryptoWallets.length===0&&<div style={{textAlign:"center",padding:20,color:T.dim}}>No crypto wallets available. Contact support.</div>}
                {!cryptoLoading&&cryptoWallets.length>0&&<div>
                  <div style={{fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:10}}>SELECT CRYPTOCURRENCY</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
                    {cryptoWallets.map((w:any)=>(<button key={w._id} onClick={()=>setSelectedWallet(w)} style={{padding:"12px 18px",borderRadius:10,border:`1px solid ${selectedWallet?._id===w._id?"#f7931a40":T.border}`,background:selectedWallet?._id===w._id?"#f7931a08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center",minWidth:100}}>
                      <div style={{fontSize:20,marginBottom:4}}>{w.icon||"₿"}</div>
                      <div style={{fontSize:13,fontWeight:700,color:selectedWallet?._id===w._id?"#f7931a":T.text}}>{w.symbol}</div>
                      <div style={{fontSize:9,color:T.dim,marginTop:2}}>{w.network}</div>
                    </button>))}
                  </div>
                  {errors.crypto&&<div style={{fontSize:11,color:T.red,marginBottom:10}}>{errors.crypto}</div>}
                  {selectedWallet&&<div style={{background:T.surface,border:"1px solid #f7931a20",borderRadius:14,padding:20}}>
                    <div style={{textAlign:"center",marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#f7931a",letterSpacing:2,marginBottom:6}}>SEND {selectedWallet.symbol} TO THIS ADDRESS</div>
                      <div style={{fontSize:10,color:T.dim,marginBottom:12}}>Network: {selectedWallet.network}</div>
                      <div style={{display:"inline-block",padding:16,background:"white",borderRadius:12,marginBottom:12}}><div style={{width:160,height:160,background:`url(https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedWallet.address)}) center/contain no-repeat`}}/></div>
                      <div style={{padding:"14px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                        <div style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:"#f7931a",wordBreak:"break-all",flex:1,textAlign:"left"}}>{selectedWallet.address}</div>
                        <button onClick={()=>navigator.clipboard.writeText(selectedWallet.address)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #f7931a30",background:"#f7931a10",color:"#f7931a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Copy</button>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:T.amber+"08",border:`1px solid ${T.amber}15`,borderRadius:10,marginTop:12}}>
                      <span style={{fontSize:14}}>⚠</span>
                      <span style={{fontSize:11,color:T.amber}}>Send ONLY {selectedWallet.symbol} ({selectedWallet.network}) to this address. Payment confirmation within 1 hour.</span>
                    </div>
                  </div>}
                </div>}
              </div>}
            </div>

            {/* Price breakdown */}
            {priceInfo&&<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:14}}>Price Breakdown</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:T.sub}}>Charter flight ({paxCount} pax × {fmtPrice(priceInfo.base)})</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.base*paxCount)}</span></div>
              {priceInfo.cat>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:T.sub}}>Catering</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.cat)}</span></div>}
              {priceInfo.gnd>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:T.sub}}>Ground transport</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.gnd)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:T.sub}}>Taxes & fees (8%)</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.tax)}</span></div>
              <div style={{height:1,background:T.border,margin:"8px 0 14px"}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:16,fontWeight:700}}>Total</span><span style={{fontSize:24,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(priceInfo.total)}</span></div>
            </div>}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><button onClick={()=>setStep(2)} className="outline-btn" style={{padding:"12px 28px"}}>← Catering</button><button onClick={handleNext} className="gold-btn">Review Booking →</button></div>
          </div>)}

          {/* STEP 4 — Review */}
          {user&&step===4&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:14}}>Charter Summary</div>
              <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:12}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,fontFamily:"monospace"}}>{fmtTime(selectedFlight.departure.scheduledTime)}</div><div style={{fontSize:13,fontWeight:700,color:T.gold}}>{selectedFlight.departure.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.departure.city}</div></div>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,color:T.sub}}>{fmtDur(selectedFlight.duration)}</div><div style={{height:1,background:T.gold+"25",margin:"4px 0"}}/><div style={{fontSize:11,fontWeight:600,color:T.gold}}>{selectedFlight.flightNumber}</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:600,fontFamily:"monospace"}}>{fmtTime(selectedFlight.arrival.scheduledTime)}</div><div style={{fontSize:13,fontWeight:700,color:T.gold}}>{selectedFlight.arrival.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.arrival.city}</div></div>
              </div>
              <div style={{fontSize:11,color:T.dim}}>{fmtDate(selectedFlight.departure.scheduledTime)} · {paxCount} passenger{paxCount>1?"s":""}</div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:12}}>Passengers</div>
              {passengers.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0",borderBottom:i<passengers.length-1?`1px solid ${T.border}`:"none"}}><span style={{fontWeight:600}}>{p.firstName} {p.lastName}</span><span style={{color:T.dim}}>{p.nationality} · {p.passportNumber}</span></div>))}
            </div>
            {priceInfo&&<div style={{background:T.card,border:`1px solid ${T.gold}20`,borderRadius:16,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
                <div><div style={{fontSize:12,color:T.sub}}>Total Amount</div><div style={{fontSize:28,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(priceInfo.total)}</div><div style={{fontSize:11,color:T.dim}}>{payMethod==="card"?`Card ending ${cardNumber.slice(-4)}`:`Payment via ${selectedWallet?.symbol||"Crypto"}`}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.dim,marginBottom:8}}>By confirming, you agree to SKYLUX terms & conditions</div><button onClick={confirmBooking} disabled={bookingLoading} className="gold-btn" style={{opacity:bookingLoading?0.7:1,cursor:bookingLoading?"wait":"pointer"}}>{bookingLoading?"Processing...":"Confirm Charter"}</button></div>
              </div>
              {errors.submit&&<div style={{marginTop:14,padding:"14px 18px",background:T.red+"10",border:`1px solid ${T.red}20`,borderRadius:10}}>
                <div style={{fontSize:12,color:T.red,fontWeight:600,marginBottom:4}}>⚠ Payment Failed</div>
                <div style={{fontSize:12,color:"#f87171",marginBottom:payMethod==="card"?10:0}}>{errors.submit}</div>
                {payMethod==="card"&&<button onClick={()=>{setPayMethod("crypto");setStep(3);setCardDeclined(false);setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#f7931a,#e8850f)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Try Cryptocurrency Instead →</button>}
              </div>}
            </div>}
            <button onClick={()=>setStep(3)} className="outline-btn" style={{marginTop:14,padding:"12px 28px"}}>← Back to Payment</button>
          </div>)}
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* ═══════════  CONFIRMATION VIEW  ═══════════ */}
      {/* ════════════════════════════════════════════ */}
      {view==="confirmation"&&bookingResult&&(
        <div style={{paddingTop:72,maxWidth:700,margin:"0 auto",padding:"120px 32px 60px"}}>
          <div style={{background:T.card,border:`1px solid ${T.gold}20`,borderRadius:20,overflow:"hidden"}}>
            <div style={{background:T.gold+"08",padding:"36px 28px",textAlign:"center",borderBottom:`1px solid ${T.gold}15`}}>
              <div style={{width:56,height:56,borderRadius:16,background:T.emerald+"12",border:`1px solid ${T.emerald}25`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>✓</div>
              <h2 style={{fontSize:28,fontWeight:300,fontFamily:"'Playfair Display',serif",marginBottom:4}}>Charter <em style={{fontStyle:"italic",color:T.gold}}>Confirmed</em></h2>
              <p style={{fontSize:13,color:T.sub}}>A dedicated concierge will contact you within 2 hours to finalize every detail.</p>
            </div>
            <div style={{padding:"20px 28px",textAlign:"center",borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.dim,letterSpacing:2,marginBottom:4}}>CHARTER REFERENCE</div>
              <div style={{fontSize:32,fontWeight:700,color:T.gold,fontFamily:"'JetBrains Mono',monospace",letterSpacing:4}}>{bookingResult.bookingReference}</div>
              <div style={{fontSize:11,color:T.dim,marginTop:4}}>Confirmation sent to {contactEmail}</div>
            </div>
            <div style={{padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:T.sub}}>Total Due</span><span style={{fontSize:22,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(bookingResult.payment?.amount||priceInfo?.total||0)}</span></div>
            {cryptoPayResult&&<div style={{padding:"0 28px 24px"}}>
              <div style={{background:T.surface,border:"1px solid #f7931a25",borderRadius:14,padding:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:8,height:8,borderRadius:4,background:"#f7931a",animation:"pulse 1.5s infinite"}}/>
                  <span style={{fontSize:12,fontWeight:700,color:"#f7931a"}}>CRYPTO PAYMENT — AWAITING CONFIRMATION</span>
                </div>
                <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Send <strong style={{color:"#f7931a"}}>{cryptoPayResult.symbol}</strong> equivalent of <strong style={{color:T.gold}}>${cryptoPayResult.amountUSD?.toLocaleString()}</strong> to the address below.</div>
                <div style={{padding:"12px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#f7931a",wordBreak:"break-all",flex:1}}>{cryptoPayResult.walletAddress}</div>
                  <button onClick={()=>navigator.clipboard.writeText(cryptoPayResult.walletAddress)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #f7931a30",background:"#f7931a10",color:"#f7931a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Copy</button>
                </div>
                <div style={{fontSize:10,color:T.dim,marginTop:8}}>Network: {cryptoPayResult.network} · Expires: {new Date(cryptoPayResult.expiresAt).toLocaleString()}</div>
              </div>
            </div>}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24}}>
            <button onClick={()=>setView("home")} className="gold-btn">Back to Charter</button>
            <Link href="/portal" className="outline-btn">Commercial Flights</Link>
          </div>
        </div>
      )}
    </div>
  );
}
