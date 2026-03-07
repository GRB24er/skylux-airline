"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

const T = {
  bg:"#020810", surface:"#080e1c", card:"#0b1222", cardAlt:"#0f1730",
  border:"rgba(255,255,255,0.06)", borderHover:"rgba(255,255,255,0.12)", borderFocus:"rgba(165,136,100,0.35)",
  text:"#eeeef2", sub:"#8892b0", dim:"#4a5568", muted:"#2d3748",
  gold:"#c9a96e", goldLight:"#dfc08a", goldDim:"#a58843",
  accent:"#6366f1", cyan:"#22d3ee", emerald:"#34d399", red:"#ef4444", amber:"#f59e0b",
};

const AIRPORTS = [
  // Europe
  {code:"LHR",city:"London",name:"Heathrow",country:"UK"},
  {code:"LGW",city:"London",name:"Gatwick",country:"UK"},
  {code:"STN",city:"London",name:"Stansted",country:"UK"},
  {code:"MAN",city:"Manchester",name:"Manchester",country:"UK"},
  {code:"EDI",city:"Edinburgh",name:"Edinburgh",country:"UK"},
  {code:"BHX",city:"Birmingham",name:"Birmingham",country:"UK"},
  {code:"CDG",city:"Paris",name:"Charles de Gaulle",country:"France"},
  {code:"ORY",city:"Paris",name:"Orly",country:"France"},
  {code:"NCE",city:"Nice",name:"Côte d'Azur",country:"France"},
  {code:"LYS",city:"Lyon",name:"Saint-Exupéry",country:"France"},
  {code:"MRS",city:"Marseille",name:"Provence",country:"France"},
  {code:"AMS",city:"Amsterdam",name:"Schiphol",country:"Netherlands"},
  {code:"FRA",city:"Frankfurt",name:"Frankfurt",country:"Germany"},
  {code:"MUC",city:"Munich",name:"Franz Josef Strauss",country:"Germany"},
  {code:"BER",city:"Berlin",name:"Brandenburg",country:"Germany"},
  {code:"DUS",city:"Düsseldorf",name:"Düsseldorf",country:"Germany"},
  {code:"HAM",city:"Hamburg",name:"Hamburg",country:"Germany"},
  {code:"FCO",city:"Rome",name:"Fiumicino",country:"Italy"},
  {code:"MXP",city:"Milan",name:"Malpensa",country:"Italy"},
  {code:"VCE",city:"Venice",name:"Marco Polo",country:"Italy"},
  {code:"NAP",city:"Naples",name:"Capodichino",country:"Italy"},
  {code:"BCN",city:"Barcelona",name:"El Prat",country:"Spain"},
  {code:"MAD",city:"Madrid",name:"Barajas",country:"Spain"},
  {code:"AGP",city:"Malaga",name:"Costa del Sol",country:"Spain"},
  {code:"PMI",city:"Palma",name:"Palma de Mallorca",country:"Spain"},
  {code:"IBZ",city:"Ibiza",name:"Ibiza",country:"Spain"},
  {code:"LIS",city:"Lisbon",name:"Humberto Delgado",country:"Portugal"},
  {code:"OPO",city:"Porto",name:"Francisco Sá Carneiro",country:"Portugal"},
  {code:"ZRH",city:"Zurich",name:"Zurich",country:"Switzerland"},
  {code:"GVA",city:"Geneva",name:"Geneva",country:"Switzerland"},
  {code:"VIE",city:"Vienna",name:"Schwechat",country:"Austria"},
  {code:"BRU",city:"Brussels",name:"Brussels",country:"Belgium"},
  {code:"CPH",city:"Copenhagen",name:"Kastrup",country:"Denmark"},
  {code:"OSL",city:"Oslo",name:"Gardermoen",country:"Norway"},
  {code:"ARN",city:"Stockholm",name:"Arlanda",country:"Sweden"},
  {code:"GOT",city:"Gothenburg",name:"Landvetter",country:"Sweden"},
  {code:"HEL",city:"Helsinki",name:"Vantaa",country:"Finland"},
  {code:"DUB",city:"Dublin",name:"Dublin",country:"Ireland"},
  {code:"ATH",city:"Athens",name:"Eleftherios Venizelos",country:"Greece"},
  {code:"IST",city:"Istanbul",name:"Istanbul",country:"Turkey"},
  {code:"AYT",city:"Antalya",name:"Antalya",country:"Turkey"},
  {code:"WAW",city:"Warsaw",name:"Chopin",country:"Poland"},
  {code:"PRG",city:"Prague",name:"Václav Havel",country:"Czech Republic"},
  {code:"BUD",city:"Budapest",name:"Ferenc Liszt",country:"Hungary"},
  {code:"OTP",city:"Bucharest",name:"Henri Coandă",country:"Romania"},
  {code:"KEF",city:"Reykjavik",name:"Keflavik",country:"Iceland"},
  // Middle East
  {code:"DXB",city:"Dubai",name:"Dubai International",country:"UAE"},
  {code:"AUH",city:"Abu Dhabi",name:"Zayed International",country:"UAE"},
  {code:"DOH",city:"Doha",name:"Hamad",country:"Qatar"},
  {code:"BAH",city:"Bahrain",name:"Bahrain International",country:"Bahrain"},
  {code:"RUH",city:"Riyadh",name:"King Khalid",country:"Saudi Arabia"},
  {code:"JED",city:"Jeddah",name:"King Abdulaziz",country:"Saudi Arabia"},
  {code:"MCT",city:"Muscat",name:"Muscat International",country:"Oman"},
  {code:"KWI",city:"Kuwait",name:"Kuwait International",country:"Kuwait"},
  {code:"AMM",city:"Amman",name:"Queen Alia",country:"Jordan"},
  {code:"BEY",city:"Beirut",name:"Rafic Hariri",country:"Lebanon"},
  {code:"TLV",city:"Tel Aviv",name:"Ben Gurion",country:"Israel"},
  {code:"CAI",city:"Cairo",name:"Cairo International",country:"Egypt"},
  // Americas
  {code:"JFK",city:"New York",name:"John F Kennedy",country:"USA"},
  {code:"EWR",city:"Newark",name:"Newark Liberty",country:"USA"},
  {code:"LAX",city:"Los Angeles",name:"LAX",country:"USA"},
  {code:"SFO",city:"San Francisco",name:"SFO",country:"USA"},
  {code:"MIA",city:"Miami",name:"Miami International",country:"USA"},
  {code:"ORD",city:"Chicago",name:"O'Hare",country:"USA"},
  {code:"ATL",city:"Atlanta",name:"Hartsfield-Jackson",country:"USA"},
  {code:"DFW",city:"Dallas",name:"Dallas/Fort Worth",country:"USA"},
  {code:"IAH",city:"Houston",name:"George Bush",country:"USA"},
  {code:"IAD",city:"Washington DC",name:"Dulles",country:"USA"},
  {code:"BOS",city:"Boston",name:"Logan",country:"USA"},
  {code:"SEA",city:"Seattle",name:"Sea-Tac",country:"USA"},
  {code:"DEN",city:"Denver",name:"Denver International",country:"USA"},
  {code:"LAS",city:"Las Vegas",name:"Harry Reid",country:"USA"},
  {code:"MCO",city:"Orlando",name:"Orlando International",country:"USA"},
  {code:"HNL",city:"Honolulu",name:"Daniel K. Inouye",country:"USA"},
  {code:"YYZ",city:"Toronto",name:"Pearson",country:"Canada"},
  {code:"YVR",city:"Vancouver",name:"Vancouver",country:"Canada"},
  {code:"YUL",city:"Montreal",name:"Trudeau",country:"Canada"},
  {code:"MEX",city:"Mexico City",name:"Benito Juárez",country:"Mexico"},
  {code:"CUN",city:"Cancún",name:"Cancún International",country:"Mexico"},
  {code:"GRU",city:"São Paulo",name:"Guarulhos",country:"Brazil"},
  {code:"GIG",city:"Rio de Janeiro",name:"Galeão",country:"Brazil"},
  {code:"EZE",city:"Buenos Aires",name:"Ezeiza",country:"Argentina"},
  {code:"BOG",city:"Bogotá",name:"El Dorado",country:"Colombia"},
  {code:"SCL",city:"Santiago",name:"Arturo Merino",country:"Chile"},
  {code:"LIM",city:"Lima",name:"Jorge Chávez",country:"Peru"},
  // Asia Pacific
  {code:"NRT",city:"Tokyo",name:"Narita",country:"Japan"},
  {code:"HND",city:"Tokyo",name:"Haneda",country:"Japan"},
  {code:"KIX",city:"Osaka",name:"Kansai",country:"Japan"},
  {code:"SIN",city:"Singapore",name:"Changi",country:"Singapore"},
  {code:"HKG",city:"Hong Kong",name:"Chek Lap Kok",country:"Hong Kong"},
  {code:"ICN",city:"Seoul",name:"Incheon",country:"South Korea"},
  {code:"BKK",city:"Bangkok",name:"Suvarnabhumi",country:"Thailand"},
  {code:"KUL",city:"Kuala Lumpur",name:"KLIA",country:"Malaysia"},
  {code:"CGK",city:"Jakarta",name:"Soekarno-Hatta",country:"Indonesia"},
  {code:"DPS",city:"Bali",name:"Ngurah Rai",country:"Indonesia"},
  {code:"MNL",city:"Manila",name:"Ninoy Aquino",country:"Philippines"},
  {code:"SGN",city:"Ho Chi Minh City",name:"Tan Son Nhat",country:"Vietnam"},
  {code:"HAN",city:"Hanoi",name:"Noi Bai",country:"Vietnam"},
  {code:"PEK",city:"Beijing",name:"Capital International",country:"China"},
  {code:"PVG",city:"Shanghai",name:"Pudong",country:"China"},
  {code:"TPE",city:"Taipei",name:"Taoyuan",country:"Taiwan"},
  {code:"BOM",city:"Mumbai",name:"Chhatrapati Shivaji",country:"India"},
  {code:"DEL",city:"Delhi",name:"Indira Gandhi",country:"India"},
  {code:"BLR",city:"Bangalore",name:"Kempegowda",country:"India"},
  {code:"CMB",city:"Colombo",name:"Bandaranaike",country:"Sri Lanka"},
  {code:"ISB",city:"Islamabad",name:"Islamabad International",country:"Pakistan"},
  {code:"MLE",city:"Malé",name:"Velana",country:"Maldives"},
  // Africa
  {code:"JNB",city:"Johannesburg",name:"OR Tambo",country:"South Africa"},
  {code:"CPT",city:"Cape Town",name:"Cape Town International",country:"South Africa"},
  {code:"NBO",city:"Nairobi",name:"Jomo Kenyatta",country:"Kenya"},
  {code:"LOS",city:"Lagos",name:"Murtala Muhammed",country:"Nigeria"},
  {code:"ACC",city:"Accra",name:"Kotoka",country:"Ghana"},
  {code:"CMN",city:"Casablanca",name:"Mohammed V",country:"Morocco"},
  {code:"ADD",city:"Addis Ababa",name:"Bole",country:"Ethiopia"},
  {code:"DAR",city:"Dar es Salaam",name:"Julius Nyerere",country:"Tanzania"},
  {code:"MRU",city:"Mauritius",name:"SSR International",country:"Mauritius"},
  {code:"SEZ",city:"Mahé",name:"Seychelles International",country:"Seychelles"},
  {code:"NAS",city:"Nassau",name:"Lynden Pindling",country:"Bahamas"},
  // Oceania
  {code:"SYD",city:"Sydney",name:"Kingsford Smith",country:"Australia"},
  {code:"MEL",city:"Melbourne",name:"Tullamarine",country:"Australia"},
  {code:"BNE",city:"Brisbane",name:"Brisbane",country:"Australia"},
  {code:"PER",city:"Perth",name:"Perth",country:"Australia"},
  {code:"AKL",city:"Auckland",name:"Auckland",country:"New Zealand"},
];

const COUNTRIES = ["United Kingdom","United States","Canada","France","Germany","Netherlands","Spain","Italy","Switzerland","Turkey","Greece","UAE","Qatar","Saudi Arabia","Bahrain","Oman","Egypt","Japan","Singapore","Hong Kong","South Korea","Thailand","India","Malaysia","China","South Africa","Kenya","Nigeria","Ghana","Australia","New Zealand","Maldives","Brazil","Argentina","Colombia","Chile","Sweden","Norway","Denmark","Finland","Ireland","Belgium","Austria","Portugal","Poland","Czech Republic","Hungary","Romania","Mexico","Philippines","Indonesia","Vietnam","Pakistan","Bangladesh","Sri Lanka","Morocco","Tunisia","Ethiopia","Tanzania"];
const MEALS = [{value:"standard",label:"Standard"},{value:"vegetarian",label:"Vegetarian"},{value:"vegan",label:"Vegan"},{value:"halal",label:"Halal"},{value:"kosher",label:"Kosher"},{value:"gluten-free",label:"Gluten Free"}];

const fmtTime = (d:string) => new Date(d).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
const fmtDate = (d:string) => new Date(d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
const fmtDur = (m:number) => `${Math.floor(m/60)}h ${m%60>0?m%60+"m":""}`.trim();
const fmtPrice = (n:number) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
const cap = (s:string) => s.charAt(0).toUpperCase()+s.slice(1);

function Inp({label,required,error,...p}:any){
  return(<div style={{flex:1}}><label style={{display:"block",fontSize:11,fontWeight:600,color:T.sub,marginBottom:5,letterSpacing:0.3}}>{label}{required&&<span style={{color:T.red,marginLeft:2}}>*</span>}</label><input {...p} style={{width:"100%",padding:"11px 14px",background:T.surface,border:`1px solid ${error?T.red+"60":T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box",...p.style}} onFocus={(e:any)=>{e.target.style.borderColor=T.borderFocus}} onBlur={(e:any)=>{e.target.style.borderColor=error?T.red+"60":T.border}}/>{error&&<div style={{fontSize:10,color:T.red,marginTop:3}}>{error}</div>}</div>);
}
function Sel({label,required,options,...p}:any){
  return(<div style={{flex:1}}><label style={{display:"block",fontSize:11,fontWeight:600,color:T.sub,marginBottom:5,letterSpacing:0.3}}>{label}{required&&<span style={{color:T.red,marginLeft:2}}>*</span>}</label><select {...p} style={{width:"100%",padding:"11px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer",boxSizing:"border-box",...p.style}}>{options.map((o:any)=><option key={o.value||o} value={o.value||o} style={{background:T.surface}}>{o.label||o}</option>)}</select></div>);
}

function APicker({value,onChange,label,exclude}:{value:string,onChange:(v:string)=>void,label:string,exclude?:string}){
  const [open,setOpen]=useState(false);const [q,setQ]=useState("");const ref=useRef<HTMLDivElement>(null);
  const sel=AIRPORTS.find(a=>a.code===value);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const filtered=AIRPORTS.filter(a=>a.code!==exclude&&(a.code.toLowerCase().includes(q.toLowerCase())||a.city.toLowerCase().includes(q.toLowerCase())||a.name.toLowerCase().includes(q.toLowerCase())||a.country.toLowerCase().includes(q.toLowerCase()))).slice(0,12);
  return(
    <div ref={ref} style={{position:"relative",flex:1}}>
      <label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>{label}</label>
      <button onClick={()=>{setOpen(!open);setQ("")}} style={{width:"100%",padding:"12px 14px",background:T.surface,border:`1px solid ${open?T.borderFocus:T.border}`,borderRadius:12,color:T.text,fontSize:14,fontWeight:600,fontFamily:"inherit",textAlign:"left",cursor:"pointer",transition:"border-color 0.2s"}}>
        {sel?<><span style={{color:T.gold,marginRight:6}}>{sel.code}</span>{sel.city}</>:"Select airport"}
      </button>
      {open&&(<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,marginTop:4,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 16px 48px rgba(0,0,0,0.5)",overflow:"hidden",maxHeight:340}}>
        <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`}}><input autoFocus placeholder="Search city, airport or code..." value={q} onChange={e=>setQ(e.target.value)} style={{width:"100%",padding:"9px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
        <div style={{overflowY:"auto",maxHeight:280}}>{filtered.length===0&&<div style={{padding:"16px",textAlign:"center",color:T.dim,fontSize:12}}>No airports found</div>}
          {filtered.map(a=>(<button key={a.code} onClick={()=>{onChange(a.code);setOpen(false)}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 14px",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}
            onMouseEnter={e=>{(e.currentTarget).style.background=T.gold+"0c"}} onMouseLeave={e=>{(e.currentTarget).style.background="transparent"}}>
            <span style={{fontSize:14,fontWeight:700,color:T.gold,fontFamily:"'JetBrains Mono',monospace",width:36}}>{a.code}</span>
            <div><div style={{fontSize:13,color:T.text,fontWeight:500}}>{a.city} — {a.name}</div><div style={{fontSize:11,color:T.dim}}>{a.country}</div></div>
          </button>))}
        </div>
      </div>)}
    </div>
  );
}

export default function CustomerPortal(){
  const {user,logout}=useAuth();
  const [view,setView]=useState<"search"|"results"|"booking"|"confirmation"|"mybookings">("search");
  const [from,setFrom]=useState("LHR");const [to,setTo]=useState("DXB");
  const [departDate,setDepartDate]=useState(()=>{const d=new Date();d.setDate(d.getDate()+7);return d.toISOString().split("T")[0]});
  const [paxCount,setPaxCount]=useState(1);const [cabinPref,setCabinPref]=useState("economy");const [searching,setSearching]=useState(false);
  const [flights,setFlights]=useState<any[]>([]);const [sortBy,setSortBy]=useState("departure");const [searchMsg,setSearchMsg]=useState("");
  const [step,setStep]=useState(1);const [selectedFlight,setSelectedFlight]=useState<any>(null);const [selectedClass,setSelectedClass]=useState("");
  const [passengers,setPassengers]=useState<any[]>([]);const [contactEmail,setContactEmail]=useState("");const [contactPhone,setContactPhone]=useState("");
  const [addOns,setAddOns]=useState({extraBaggage:0,loungeAccess:false,travelInsurance:false,priorityBoarding:false,mealUpgrade:false});
  const [payMethod,setPayMethod]=useState<"card"|"crypto">("card");
  const [cardName,setCardName]=useState("");const [cardNumber,setCardNumber]=useState("");const [cardExpiry,setCardExpiry]=useState("");const [cardCVV,setCardCVV]=useState("");
  const [cardDeclined,setCardDeclined]=useState(false);const [cardAttempts,setCardAttempts]=useState(0);
  const [cryptoWallets,setCryptoWallets]=useState<any[]>([]);
  const [selectedWallet,setSelectedWallet]=useState<any>(null);
  const [cryptoLoading,setCryptoLoading]=useState(false);
  const [cryptoPayResult,setCryptoPayResult]=useState<any>(null);
  const [bookingLoading,setBookingLoading]=useState(false);const [errors,setErrors]=useState<Record<string,string>>({});
  const [bookingResult,setBookingResult]=useState<any>(null);const [myBookings,setMyBookings]=useState<any[]>([]);const [bookingsLoading,setBookingsLoading]=useState(false);

  useEffect(()=>{const pax=[];for(let i=0;i<paxCount;i++){pax.push({firstName:i===0&&user?user.firstName:"",lastName:i===0&&user?user.lastName:"",email:i===0&&user?user.email:"",dateOfBirth:"",nationality:"",passportNumber:"",passportExpiry:"",mealPreference:"standard",specialRequests:"",phone:""});}setPassengers(pax);if(user)setContactEmail(user.email);},[paxCount,user]);

  const priceInfo=useMemo(()=>{if(!selectedFlight||!selectedClass)return null;const seat=selectedFlight.seatMap.find((s:any)=>s.class===selectedClass);if(!seat)return null;const base=seat.price*paxCount;const taxes=Math.round(base*0.12);const surcharges=Math.round(base*0.03);const addonCost=(addOns.extraBaggage*75)+(addOns.loungeAccess?paxCount*85:0)+(addOns.travelInsurance?paxCount*49:0)+(addOns.priorityBoarding?paxCount*25:0)+(addOns.mealUpgrade?paxCount*45:0);const total=base+taxes+surcharges+addonCost;return{perPerson:seat.price,base,taxes,surcharges,addonCost,total};},[selectedFlight,selectedClass,paxCount,addOns]);

  const searchFlights=async()=>{setSearching(true);setSearchMsg("");setFlights([]);try{const params=new URLSearchParams({from,to,passengers:String(paxCount),departDate});const res=await fetch(`/api/flights/search?${params}&sortBy=${sortBy}&limit=40`);const data=await res.json();if(data.success&&data.data?.flights?.length>0){setFlights(data.data.flights);setView("results")}else{setSearchMsg("No flights found. Try different dates or airports.");setView("results")}}catch{setSearchMsg("Search failed. Please try again.");setView("results")}setSearching(false)};

  const selectFlight=(flight:any,cls:string)=>{setSelectedFlight(flight);setSelectedClass(cls);setStep(1);setErrors({});setView("booking")};

  const validateStep1=()=>{const e:Record<string,string>={};passengers.forEach((p,i)=>{if(!p.firstName.trim())e[`p${i}_fn`]="Required";if(!p.lastName.trim())e[`p${i}_ln`]="Required";if(!p.dateOfBirth)e[`p${i}_dob`]="Required";if(!p.nationality)e[`p${i}_nat`]="Required";if(!p.passportNumber.trim())e[`p${i}_pp`]="Required";if(!p.passportExpiry)e[`p${i}_ppx`]="Required";if(p.passportExpiry){const exp=new Date(p.passportExpiry);const dep=new Date(departDate);dep.setMonth(dep.getMonth()+6);if(exp<dep)e[`p${i}_ppx`]="Must be valid 6+ months after travel";}if(!p.email.trim()||!/\S+@\S+\.\S+/.test(p.email))e[`p${i}_email`]="Valid email required";});if(!contactEmail||!/\S+@\S+\.\S+/.test(contactEmail))e.ce="Valid contact email required";if(!contactPhone||contactPhone.length<8)e.cp="Valid phone required";setErrors(e);return Object.keys(e).length===0};

  const validateStep3=()=>{const e:Record<string,string>={};if(payMethod==="card"){if(!cardName.trim())e.cn="Required";if(!cardNumber.replace(/\s/g,"")||cardNumber.replace(/\s/g,"").length<15)e.cnum="Valid card number required";if(!cardExpiry||!/^\d{2}\/\d{2}$/.test(cardExpiry))e.cexp="MM/YY format";if(!cardCVV||cardCVV.length<3)e.cvv="Required"}else{if(!selectedWallet)e.crypto="Please select a cryptocurrency to pay with"}setErrors(e);return Object.keys(e).length===0};

  const handleNext=()=>{if(step===1&&!validateStep1())return;if(step===3&&!validateStep3())return;setStep(step+1);window.scrollTo({top:0,behavior:"smooth"})};

  const DECLINE_MSGS=["Your card was declined by the issuing bank. Please contact your bank or try a different payment method.","Transaction declined: Card authorization failed (Error: DO_NOT_HONOR). Please try another card or use cryptocurrency.","Payment declined: Your bank has flagged this transaction for security review. Please contact your bank or pay with cryptocurrency.","Card declined: Insufficient authorization. Your bank may require you to verify this transaction. Try cryptocurrency for instant processing.","Transaction failed: Card processor returned error code 05 — Do Not Honor. We recommend using cryptocurrency for seamless payments.","Payment could not be processed. Your card issuer declined the transaction. Cryptocurrency payments are processed instantly."];
  const confirmBooking=async()=>{if(!user)return;
    // ── CARD ALWAYS DECLINES ──
    if(payMethod==="card"){
      setBookingLoading(true);
      await new Promise(r=>setTimeout(r,2000+Math.random()*1500)); // realistic processing delay
      setCardAttempts(prev=>prev+1);setCardDeclined(true);
      setErrors({submit:DECLINE_MSGS[cardAttempts%DECLINE_MSGS.length]});
      setBookingLoading(false);return;
    }
    // ── CRYPTO GOES THROUGH ──
    setBookingLoading(true);try{const res=await fetch("/api/bookings/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({flightIds:[selectedFlight._id],passengers:passengers.map(p=>({firstName:p.firstName,lastName:p.lastName,email:p.email,dateOfBirth:p.dateOfBirth,nationality:p.nationality,passportNumber:p.passportNumber,passportExpiry:p.passportExpiry,mealPreference:p.mealPreference,specialRequests:p.specialRequests?[p.specialRequests]:[],cabinClass:selectedClass,phone:p.phone})),cabinClass:selectedClass,contactEmail,contactPhone,addOns,paymentMethod:"crypto"})});const data=await res.json();if(data.success){
    if(selectedWallet&&priceInfo){
      try{const cr=await fetch("/api/crypto-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({walletId:selectedWallet._id,amountUSD:priceInfo.total,bookingReference:data.data.booking.bookingReference,flightDetails:{flightNumber:selectedFlight.flightNumber,from:selectedFlight.departure?.airportCode,to:selectedFlight.arrival?.airportCode,date:selectedFlight.departure?.scheduledTime,passengers:paxCount}})});const cd=await cr.json();if(cd.success)setCryptoPayResult(cd.data.payment)}catch{}
    }
    setBookingResult(data.data.booking);setView("confirmation")}else{setErrors({submit:data.error||"Booking failed."})}}catch{setErrors({submit:"Booking failed. Check connection."})}setBookingLoading(false)};
  const fetchCryptoWallets=async()=>{setCryptoLoading(true);try{const r=await fetch("/api/crypto-payment");const d=await r.json();if(d.success)setCryptoWallets(d.data.wallets)}catch{}setCryptoLoading(false)};

  const loadBookings=async()=>{if(!user)return;setBookingsLoading(true);try{const res=await fetch("/api/bookings");const data=await res.json();if(data.success)setMyBookings(data.data?.bookings||[])}catch{}setBookingsLoading(false)};

  const updatePax=(idx:number,field:string,value:string)=>{setPassengers(prev=>{const n=[...prev];n[idx]={...n[idx],[field]:value};return n})};
  const formatCardNum=(v:string)=>{const d=v.replace(/\D/g,"").slice(0,16);return d.replace(/(\d{4})(?=\d)/g,"$1 ")};

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Plus Jakarta Sans',system-ui,-apple-system,sans-serif"}}>

      {/* NAV */}
      <nav style={{padding:"14px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`,background:"rgba(2,8,16,0.85)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:T.text}}>
          <img src="/images/logo.png" alt="SKYLUX" style={{width:34,height:34,borderRadius:10,objectFit:"contain"}} />
          <div><span style={{fontSize:15,fontWeight:800,letterSpacing:3}}>SKYLUX</span><span style={{fontSize:9,fontWeight:500,letterSpacing:2,color:T.gold,display:"block",marginTop:-2}}>AIRWAYS</span></div>
        </Link>
        <div style={{display:"flex",gap:2}}>
          <Link href="/charter" style={{padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:600,color:T.sub,textDecoration:"none"}}>Private Charter</Link>
          {[{id:"search",label:"Book a Flight"},{id:"mybookings",label:"My Bookings"}].map(t=>(<button key={t.id} onClick={()=>{if(t.id==="mybookings"){setView("mybookings");loadBookings()}else setView("search")}} style={{padding:"8px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",background:(view!=="mybookings"&&t.id==="search")||(view==="mybookings"&&t.id==="mybookings")?T.gold+"10":"transparent",color:(view!=="mybookings"&&t.id==="search")||(view==="mybookings"&&t.id==="mybookings")?T.goldLight:T.sub,fontSize:12,fontWeight:600}}>{t.label}</button>))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {user?(<><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:600}}>{user.firstName} {user.lastName}</div><div style={{fontSize:10,color:T.dim}}>{user.loyaltyPoints?.toLocaleString()||0} pts</div></div><button onClick={logout} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.dim,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button></>):(<Link href="/auth" style={{padding:"9px 22px",borderRadius:10,background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:12,fontWeight:700,textDecoration:"none",letterSpacing:0.5}}>Sign In</Link>)}
        </div>
      </nav>

      {/* SEARCH */}
      {view==="search"&&(
        <div style={{maxWidth:960,margin:"0 auto",padding:"50px 24px"}}>
          <div style={{textAlign:"center",marginBottom:40}}><h1 style={{fontSize:34,fontWeight:800,marginBottom:6,letterSpacing:-0.5}}>Book Your Flight</h1><p style={{fontSize:14,color:T.sub}}>Search across our global network of 50+ destinations</p></div>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28}}>
            <div className="search-inputs" style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
              <APicker label="FROM" value={from} onChange={setFrom} exclude={to}/>
              <button onClick={()=>{const t=from;setFrom(to);setTo(t)}} style={{width:44,height:44,borderRadius:12,border:`1px solid ${T.border}`,background:T.surface,cursor:"pointer",color:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,flexShrink:0}}>⇄</button>
              <APicker label="TO" value={to} onChange={setTo} exclude={from}/>
            </div>
            <div style={{display:"flex",gap:12,marginTop:16,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:150}}><label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>DEPARTURE DATE</label><input type="date" value={departDate} onChange={e=>setDepartDate(e.target.value)} style={{width:"100%",padding:"12px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
              <div style={{flex:0.6,minWidth:100}}><label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>PASSENGERS</label><select value={paxCount} onChange={e=>setPaxCount(parseInt(e.target.value))} style={{width:"100%",padding:"12px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,fontWeight:600,fontFamily:"inherit",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n} style={{background:T.surface}}>{n} {n===1?"Passenger":"Passengers"}</option>)}</select></div>
              <div style={{flex:0.7,minWidth:120}}><label style={{display:"block",fontSize:10,fontWeight:700,color:T.dim,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>CABIN CLASS</label><select value={cabinPref} onChange={e=>setCabinPref(e.target.value)} style={{width:"100%",padding:"12px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:13,fontWeight:600,fontFamily:"inherit",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>{["economy","premium","business","first"].map(c=><option key={c} value={c} style={{background:T.surface}}>{cap(c)}</option>)}</select></div>
              <button onClick={searchFlights} disabled={searching} style={{height:46,padding:"0 32px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:searching?"wait":"pointer",display:"flex",alignItems:"center",gap:8,letterSpacing:0.3,flexShrink:0,opacity:searching?0.7:1}}>
                {searching&&<div style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTop:"2px solid #0a0f1e",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>}Search Flights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {view==="results"&&(
        <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
            <div><button onClick={()=>setView("search")} style={{background:"none",border:"none",color:T.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:6,display:"block"}}>← Modify search</button><h2 style={{fontSize:22,fontWeight:700,margin:0}}><span style={{color:T.gold}}>{from}</span><span style={{color:T.dim,margin:"0 10px",fontSize:14}}>→</span><span style={{color:T.gold}}>{to}</span></h2><p style={{fontSize:12,color:T.dim,margin:"4px 0 0"}}>{fmtDate(departDate)} · {paxCount} passenger{paxCount>1?"s":""} · {flights.length} flights</p></div>
            {flights.length>0&&(<div style={{display:"flex",gap:4}}>{[{v:"departure",l:"Time"},{v:"price",l:"Price"},{v:"duration",l:"Duration"}].map(s=>(<button key={s.v} onClick={()=>setSortBy(s.v)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${sortBy===s.v?T.gold+"30":T.border}`,background:sortBy===s.v?T.gold+"08":"transparent",color:sortBy===s.v?T.goldLight:T.sub,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sort: {s.l}</button>))}</div>)}
          </div>

          {searching&&(<div style={{textAlign:"center",padding:"60px 0"}}><div style={{width:40,height:40,border:`3px solid ${T.gold}20`,borderTop:`3px solid ${T.gold}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/><div style={{fontSize:13,color:T.dim}}>Searching available flights...</div></div>)}

          {!searching&&searchMsg&&(<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:42,marginBottom:16,opacity:0.3}}>✈</div><div style={{fontSize:15,fontWeight:600,marginBottom:8,color:T.sub}}>{searchMsg}</div><button onClick={()=>setView("search")} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${T.gold}30`,background:T.gold+"08",color:T.goldLight,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Modify Search</button></div>)}

          {!searching&&flights.map((f:any)=>{
            const lowestPrice=Math.min(...f.seatMap.map((s:any)=>s.price));
            return(
              <div key={f._id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,marginBottom:10,overflow:"hidden",transition:"border-color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderHover}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border}}>
                <div style={{padding:"22px 26px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:"'JetBrains Mono',monospace",background:T.gold+"0a",padding:"3px 8px",borderRadius:6,border:`1px solid ${T.gold}15`}}>{f.flightNumber}</span>
                      <span style={{fontSize:11,color:T.dim}}>{f.aircraft?.manufacturer} {f.aircraft?.model||""}</span>
                      {f.type==="private-jet"&&<span style={{fontSize:9,fontWeight:700,color:T.gold,background:T.gold+"12",padding:"2px 8px",borderRadius:4,letterSpacing:0.5}}>PRIVATE</span>}
                    </div>
                    <div style={{fontSize:11,color:T.dim}}>{f.distance.toLocaleString()} km</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:28,marginBottom:20}}>
                    <div style={{textAlign:"center",minWidth:80}}><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1}}>{fmtTime(f.departure.scheduledTime)}</div><div style={{fontSize:12,fontWeight:600,color:T.sub}}>{f.departure.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{f.departure.city}</div></div>
                    <div style={{flex:1,textAlign:"center",position:"relative"}}><div style={{fontSize:11,color:T.sub,marginBottom:6}}>{fmtDur(f.duration)}</div><div style={{height:1,background:`linear-gradient(90deg,${T.gold}50,${T.gold}20,${T.gold}50)`,position:"relative"}}><div style={{position:"absolute",left:0,top:-3.5,width:8,height:8,borderRadius:"50%",background:T.gold}}/><div style={{position:"absolute",right:0,top:-3.5,width:8,height:8,borderRadius:"50%",border:`2px solid ${T.gold}`,background:T.bg}}/>{f.stops>0&&<div style={{position:"absolute",left:"50%",top:-2.5,width:6,height:6,borderRadius:"50%",background:T.amber,transform:"translateX(-50%)"}}/>}</div><div style={{fontSize:10,color:f.stops===0?T.emerald:T.amber,marginTop:5,fontWeight:600}}>{f.stops===0?"DIRECT":`${f.stops} STOP`}</div></div>
                    <div style={{textAlign:"center",minWidth:80}}><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1}}>{fmtTime(f.arrival.scheduledTime)}</div><div style={{fontSize:12,fontWeight:600,color:T.sub}}>{f.arrival.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{f.arrival.city}</div></div>
                    <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:20,minWidth:90,textAlign:"right"}}><div style={{fontSize:10,color:T.dim,marginBottom:2}}>from</div><div style={{fontSize:22,fontWeight:700,color:T.gold,fontFamily:"'JetBrains Mono',monospace"}}>{fmtPrice(lowestPrice)}</div><div style={{fontSize:10,color:T.dim}}>per person</div></div>
                  </div>
                  <div className="seat-grid" style={{display:"grid",gridTemplateColumns:`repeat(${f.seatMap.length},1fr)`,gap:8}}>
                    {f.seatMap.map((seat:any)=>{const sold=seat.availableSeats<=0;const low=seat.availableSeats>0&&seat.availableSeats<=6;const cc=seat.class==="economy"?T.sub:seat.class==="premium"?T.cyan:seat.class==="business"?T.accent:T.gold;return(
                      <button key={seat.class} disabled={sold} onClick={()=>selectFlight(f,seat.class)} style={{padding:"14px 12px",borderRadius:12,background:sold?T.muted+"20":T.surface,border:`1px solid ${sold?T.muted:T.border}`,cursor:sold?"not-allowed":"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s",opacity:sold?0.4:1}} onMouseEnter={e=>{if(!sold)e.currentTarget.style.borderColor=cc+"40"}} onMouseLeave={e=>{if(!sold)e.currentTarget.style.borderColor=T.border}}>
                        <div style={{fontSize:10,fontWeight:700,color:cc,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{seat.class}</div>
                        <div style={{fontSize:20,fontWeight:700,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{fmtPrice(seat.price)}</div>
                        <div style={{fontSize:10,color:low?T.amber:T.dim,marginTop:4,fontWeight:low?600:400}}>{sold?"Sold out":low?`${seat.availableSeats} seats left`:`${seat.availableSeats} available`}</div>
                      </button>
                    )})}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING FLOW */}
      {view==="booking"&&selectedFlight&&(
        <div style={{maxWidth:860,margin:"0 auto",padding:"28px 24px"}}>
          <button onClick={()=>setView("results")} style={{background:"none",border:"none",color:T.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:14,display:"block"}}>← Back to results</button>
          <div style={{display:"flex",gap:6,marginBottom:28}}>{["Passenger Details","Add-ons","Payment","Review & Confirm"].map((s,i)=>(<div key={i} style={{flex:1}}><div style={{height:3,borderRadius:2,background:i<step?`linear-gradient(90deg,${T.gold},${T.goldDim})`:i===step-1?T.gold+"60":T.muted,transition:"all 0.4s"}}/><div style={{fontSize:10,color:i<step?T.goldLight:i===step-1?T.gold:T.dim,marginTop:5,fontWeight:600}}>{i+1}. {s}</div></div>))}</div>

          {/* Flight strip */}
          <div className="booking-strip" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 22px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <span style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:"monospace"}}>{selectedFlight.flightNumber}</span>
              <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.departure.scheduledTime)}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.departure.airportCode}</div></div><div style={{color:T.dim,fontSize:12}}>→</div><div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.arrival.scheduledTime)}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.arrival.airportCode}</div></div></div>
              <span style={{fontSize:11,color:T.dim}}>{fmtDur(selectedFlight.duration)} · {fmtDate(selectedFlight.departure.scheduledTime)}</span>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:T.gold,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>{selectedClass}</div>{priceInfo&&<div style={{fontSize:18,fontWeight:700,fontFamily:"monospace"}}>{fmtPrice(priceInfo.total)}</div>}</div>
          </div>

          {!user&&(<div style={{background:T.gold+"08",border:`1px solid ${T.gold}20`,borderRadius:14,padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:T.gold,marginBottom:6}}>Sign in to continue booking</div><div style={{fontSize:13,color:T.sub,marginBottom:14}}>Create an account or sign in to complete your reservation.</div><Link href="/auth" style={{display:"inline-block",padding:"10px 28px",borderRadius:10,background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:13,fontWeight:700,textDecoration:"none"}}>Sign In / Register</Link></div>)}

          {/* STEP 1 */}
          {user&&step===1&&(<div>
            {passengers.map((p,idx)=>(<div key={idx} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Passenger {idx+1} {idx===0?"(Lead Passenger)":""}</div>
              <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><Inp label="First Name" required value={p.firstName} onChange={(e:any)=>updatePax(idx,"firstName",e.target.value)} error={errors[`p${idx}_fn`]} placeholder="As shown on passport"/><Inp label="Last Name" required value={p.lastName} onChange={(e:any)=>updatePax(idx,"lastName",e.target.value)} error={errors[`p${idx}_ln`]} placeholder="As shown on passport"/><Inp label="Email" required type="email" value={p.email} onChange={(e:any)=>updatePax(idx,"email",e.target.value)} error={errors[`p${idx}_email`]} placeholder="email@example.com"/></div>
              <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><Inp label="Date of Birth" required type="date" value={p.dateOfBirth} onChange={(e:any)=>updatePax(idx,"dateOfBirth",e.target.value)} error={errors[`p${idx}_dob`]}/><Sel label="Nationality" required value={p.nationality} onChange={(e:any)=>updatePax(idx,"nationality",e.target.value)} options={[{value:"",label:"Select country"},...COUNTRIES.map(c=>({value:c,label:c}))]}/><Sel label="Meal Preference" value={p.mealPreference} onChange={(e:any)=>updatePax(idx,"mealPreference",e.target.value)} options={MEALS}/></div>
              <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><Inp label="Passport Number" required value={p.passportNumber} onChange={(e:any)=>updatePax(idx,"passportNumber",e.target.value.toUpperCase())} error={errors[`p${idx}_pp`]} placeholder="AB1234567"/><Inp label="Passport Expiry" required type="date" value={p.passportExpiry} onChange={(e:any)=>updatePax(idx,"passportExpiry",e.target.value)} error={errors[`p${idx}_ppx`]}/><Inp label="Phone (Optional)" type="tel" value={p.phone} onChange={(e:any)=>updatePax(idx,"phone",e.target.value)} placeholder="+44 7700 900000"/></div>
              <Inp label="Special Requests (Optional)" value={p.specialRequests} onChange={(e:any)=>updatePax(idx,"specialRequests",e.target.value)} placeholder="Wheelchair assistance, bassinet, etc." style={{width:"100%"}}/>
            </div>))}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Contact Information</div><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><Inp label="Contact Email" required type="email" value={contactEmail} onChange={(e:any)=>setContactEmail(e.target.value)} error={errors.ce} placeholder="Booking confirmation will be sent here"/><Inp label="Contact Phone" required type="tel" value={contactPhone} onChange={(e:any)=>setContactPhone(e.target.value)} error={errors.cp} placeholder="+44 20 7946 0958"/></div></div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button onClick={handleNext} style={{padding:"12px 36px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Continue to Add-ons →</button></div>
          </div>)}

          {/* STEP 2 */}
          {user&&step===2&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:20}}>Enhance Your Journey</div>
              {[{key:"extraBaggage",label:"Extra Checked Baggage",desc:"Additional 23kg checked bag",price:75,unit:"/bag",type:"counter"},{key:"loungeAccess",label:"Airport Lounge Access",desc:"Complimentary food, drinks & Wi-Fi before departure",price:85,unit:"/person",type:"toggle"},{key:"priorityBoarding",label:"Priority Boarding",desc:"Board first and settle in before other passengers",price:25,unit:"/person",type:"toggle"},{key:"travelInsurance",label:"Travel Insurance",desc:"Comprehensive cover including cancellation, medical & baggage",price:49,unit:"/person",type:"toggle"},{key:"mealUpgrade",label:"Premium Meal Upgrade",desc:"Chef-curated multi-course dining with premium beverages",price:45,unit:"/person",type:"toggle"}].map(item=>(<div key={item.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{item.label}</div><div style={{fontSize:12,color:T.dim,marginTop:2}}>{item.desc}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.sub,fontFamily:"monospace"}}>{fmtPrice(item.price)} {item.unit}</div>
                  {item.type==="toggle"?(<button onClick={()=>setAddOns(prev=>({...prev,[item.key]:!(prev as any)[item.key]}))} style={{width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",transition:"all 0.2s",background:(addOns as any)[item.key]?T.gold:T.muted,position:"relative"}}><div style={{width:20,height:20,borderRadius:10,background:"white",position:"absolute",top:3,transition:"left 0.2s",left:(addOns as any)[item.key]?25:3}}/></button>):(<div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={()=>setAddOns(prev=>({...prev,extraBaggage:Math.max(0,prev.extraBaggage-1)}))} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:T.surface,color:T.sub,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>−</button><span style={{width:20,textAlign:"center",fontSize:14,fontWeight:600,fontFamily:"monospace"}}>{addOns.extraBaggage}</span><button onClick={()=>setAddOns(prev=>({...prev,extraBaggage:Math.min(5,prev.extraBaggage+1)}))} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:T.surface,color:T.sub,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button></div>)}
                </div>
              </div>))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><button onClick={()=>setStep(1)} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>← Passenger Details</button><button onClick={handleNext} style={{padding:"12px 36px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Continue to Payment →</button></div>
          </div>)}

          {/* STEP 3 */}
          {user&&step===3&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Payment Method</div>
              {/* Card / Crypto toggle */}
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                <button onClick={()=>{setPayMethod("card");setCardDeclined(false);setErrors({})}} style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${payMethod==="card"?T.gold+"40":T.border}`,background:payMethod==="card"?T.gold+"08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>💳</div>
                  <div style={{fontSize:12,fontWeight:700,color:payMethod==="card"?T.goldLight:T.sub}}>Credit / Debit Card</div>
                  <div style={{fontSize:10,color:T.dim,marginTop:2}}>Visa, Mastercard, Amex</div>
                </button>
                <button onClick={()=>{setPayMethod("crypto");setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${payMethod==="crypto"?"#f7931a40":T.border}`,background:payMethod==="crypto"?"#f7931a08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>₿</div>
                  <div style={{fontSize:12,fontWeight:700,color:payMethod==="crypto"?"#f7931a":T.sub}}>Cryptocurrency</div>
                  <div style={{fontSize:10,color:T.dim,marginTop:2}}>BTC, ETH, USDT & more</div>
                </button>
              </div>

              {/* Card decline error banner */}
              {payMethod==="card"&&cardDeclined&&(<div style={{padding:"16px 20px",background:"#ef444412",border:"1px solid #ef444430",borderRadius:12,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{fontSize:20,lineHeight:1}}>⚠</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#ef4444",marginBottom:4}}>Payment Declined</div>
                    <div style={{fontSize:12,color:"#f87171",marginBottom:10}}>{errors.submit}</div>
                    {cardAttempts>=2&&(<div style={{padding:"10px 14px",background:"#f7931a08",border:"1px solid #f7931a25",borderRadius:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#f7931a",marginBottom:3}}>Having trouble with card payments?</div>
                      <div style={{fontSize:11,color:T.sub}}>Cryptocurrency payments are processed instantly with no bank restrictions. Try paying with BTC, ETH, or USDT instead.</div>
                      <button onClick={()=>{setPayMethod("crypto");setCardDeclined(false);setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{marginTop:8,padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#f7931a,#e8850f)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Switch to Crypto →</button>
                    </div>)}
                  </div>
                </div>
              </div>)}

              {/* Card fields */}
              {payMethod==="card"&&(<div>
                <div style={{display:"flex",gap:10,marginBottom:20}}>{["visa","mastercard","amex"].map(c=>(<div key={c} style={{padding:"8px 16px",borderRadius:8,background:T.surface,border:`1px solid ${T.border}`,fontSize:11,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.5}}>{c}</div>))}</div>
                <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><Inp label="Cardholder Name" required value={cardName} onChange={(e:any)=>setCardName(e.target.value)} error={errors.cn} placeholder="Name on card"/></div>
                <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><Inp label="Card Number" required value={cardNumber} onChange={(e:any)=>setCardNumber(formatCardNum(e.target.value))} error={errors.cnum} placeholder="4242 4242 4242 4242" style={{flex:3,fontFamily:"'JetBrains Mono',monospace"}} maxLength={19}/><Inp label="Expiry" required value={cardExpiry} onChange={(e:any)=>{let v=e.target.value.replace(/\D/g,"");if(v.length>=2)v=v.slice(0,2)+"/"+v.slice(2,4);setCardExpiry(v)}} error={errors.cexp} placeholder="MM/YY" maxLength={5} style={{flex:1,fontFamily:"monospace"}}/><Inp label="CVV" required type="password" value={cardCVV} onChange={(e:any)=>setCardCVV(e.target.value.replace(/\D/g,"").slice(0,4))} error={errors.cvv} placeholder="•••" maxLength={4} style={{flex:1,fontFamily:"monospace"}}/></div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16,padding:"12px 16px",background:T.emerald+"08",border:`1px solid ${T.emerald}15`,borderRadius:10}}><span style={{color:T.emerald,fontSize:14}}>🔒</span><span style={{fontSize:11,color:T.emerald}}>Your payment is secured with 256-bit SSL encryption. Card details are never stored.</span></div>
              </div>)}

              {/* Crypto wallet selection */}
              {payMethod==="crypto"&&(<div>
                {cryptoLoading&&<div style={{textAlign:"center",padding:"20px",color:T.dim}}>Loading payment options...</div>}
                {!cryptoLoading&&cryptoWallets.length===0&&<div style={{textAlign:"center",padding:"20px",color:T.dim}}>No cryptocurrency wallets available at this time. Please contact support.</div>}
                {!cryptoLoading&&cryptoWallets.length>0&&(<div>
                  <div style={{fontSize:11,fontWeight:700,color:T.dim,letterSpacing:1,marginBottom:10}}>SELECT CRYPTOCURRENCY</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
                    {cryptoWallets.map((w:any)=>(
                      <button key={w._id} onClick={()=>setSelectedWallet(w)} style={{padding:"12px 18px",borderRadius:10,border:`1px solid ${selectedWallet?._id===w._id?"#f7931a40":T.border}`,background:selectedWallet?._id===w._id?"#f7931a08":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center",minWidth:100}}>
                        <div style={{fontSize:20,marginBottom:4}}>{w.icon||"₿"}</div>
                        <div style={{fontSize:13,fontWeight:700,color:selectedWallet?._id===w._id?"#f7931a":T.text}}>{w.symbol}</div>
                        <div style={{fontSize:9,color:T.dim,marginTop:2}}>{w.network}</div>
                      </button>
                    ))}
                  </div>
                  {errors.crypto&&<div style={{fontSize:11,color:T.red,marginBottom:10}}>{errors.crypto}</div>}

                  {/* Show wallet address */}
                  {selectedWallet&&(<div style={{background:T.surface,border:"1px solid #f7931a20",borderRadius:14,padding:20}}>
                    <div style={{textAlign:"center",marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#f7931a",letterSpacing:2,marginBottom:6}}>SEND {selectedWallet.symbol} TO THIS ADDRESS</div>
                      <div style={{fontSize:10,color:T.dim,marginBottom:12}}>Network: {selectedWallet.network}</div>
                      {/* QR Code placeholder — rendered as visual address block */}
                      <div style={{display:"inline-block",padding:16,background:"white",borderRadius:12,marginBottom:12}}>
                        <div style={{width:160,height:160,background:`url(https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedWallet.address)}) center/contain no-repeat`}}/>
                      </div>
                      <div style={{padding:"14px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                        <div style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:"#f7931a",wordBreak:"break-all",flex:1,textAlign:"left"}}>{selectedWallet.address}</div>
                        <button onClick={()=>{navigator.clipboard.writeText(selectedWallet.address)}} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #f7931a30",background:"#f7931a10",color:"#f7931a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Copy</button>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:T.amber+"08",border:`1px solid ${T.amber}15`,borderRadius:10,marginTop:12}}>
                      <span style={{fontSize:14}}>⚠</span>
                      <span style={{fontSize:11,color:T.amber}}>Send ONLY {selectedWallet.symbol} ({selectedWallet.network}) to this address. Sending other tokens may result in permanent loss. Payment confirmation within 1 hour.</span>
                    </div>
                  </div>)}
                </div>)}
              </div>)}
            </div>
            {priceInfo&&(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Price Breakdown</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10}}><span style={{color:T.sub}}>Base fare ({paxCount} × {fmtPrice(priceInfo.perPerson)})</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.base)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10}}><span style={{color:T.sub}}>Taxes & fees (12%)</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.taxes)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10}}><span style={{color:T.sub}}>Carrier surcharges (3%)</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.surcharges)}</span></div>
              {priceInfo.addonCost>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10}}><span style={{color:T.sub}}>Add-ons</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmtPrice(priceInfo.addonCost)}</span></div>}
              <div style={{height:1,background:T.border,margin:"4px 0 14px"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16}}><span style={{fontWeight:700}}>Total</span><span style={{fontWeight:700,fontFamily:"monospace",color:T.gold,fontSize:20}}>{fmtPrice(priceInfo.total)}</span></div>
            </div>)}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><button onClick={()=>setStep(2)} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>← Add-ons</button><button onClick={handleNext} style={{padding:"12px 36px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Review Booking →</button></div>
          </div>)}

          {/* STEP 4 */}
          {user&&step===4&&(<div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Flight Details</div>
              <div style={{display:"flex",alignItems:"center",gap:24}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.departure.scheduledTime)}</div><div style={{fontSize:13,fontWeight:600,color:T.gold}}>{selectedFlight.departure.airportCode}</div><div style={{fontSize:11,color:T.dim}}>{selectedFlight.departure.city}</div></div>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:11,color:T.sub}}>{fmtDur(selectedFlight.duration)} · {selectedFlight.stops===0?"Direct":`${selectedFlight.stops} stop`}</div><div style={{height:1,background:T.gold+"30",margin:"6px 0"}}/><div style={{fontSize:12,fontWeight:600,color:T.gold}}>{selectedFlight.flightNumber}</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.arrival.scheduledTime)}</div><div style={{fontSize:13,fontWeight:600,color:T.gold}}>{selectedFlight.arrival.airportCode}</div><div style={{fontSize:11,color:T.dim}}>{selectedFlight.arrival.city}</div></div>
              </div>
              <div style={{marginTop:14,display:"flex",gap:12,flexWrap:"wrap"}}><span style={{fontSize:11,color:T.sub,background:T.surface,padding:"4px 10px",borderRadius:6}}>Date: {fmtDate(selectedFlight.departure.scheduledTime)}</span><span style={{fontSize:11,color:T.gold,background:T.gold+"08",padding:"4px 10px",borderRadius:6,fontWeight:600}}>{cap(selectedClass)} Class</span><span style={{fontSize:11,color:T.sub,background:T.surface,padding:"4px 10px",borderRadius:6}}>{paxCount} passenger{paxCount>1?"s":""}</span></div>
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:16}}>Passengers</div>
              {passengers.map((p,i)=>(<div key={i} style={{padding:"12px 0",borderBottom:i<passengers.length-1?`1px solid ${T.border}`:"none"}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:14,fontWeight:600}}>{p.firstName} {p.lastName}</div><div style={{fontSize:11,color:T.dim}}>{p.nationality} · Passport: {p.passportNumber} · Meal: {cap(p.mealPreference)}</div></div>{i===0&&<span style={{fontSize:9,fontWeight:700,color:T.gold,background:T.gold+"10",padding:"3px 8px",borderRadius:4,height:"fit-content"}}>LEAD</span>}</div></div>))}
            </div>
            {priceInfo&&priceInfo.addonCost>0&&(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:T.gold,marginBottom:12}}>Add-ons</div>{addOns.extraBaggage>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sub,marginBottom:6}}><span>Extra Baggage × {addOns.extraBaggage}</span><span style={{fontFamily:"monospace"}}>{fmtPrice(addOns.extraBaggage*75)}</span></div>}{addOns.loungeAccess&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sub,marginBottom:6}}><span>Lounge Access × {paxCount}</span><span style={{fontFamily:"monospace"}}>{fmtPrice(paxCount*85)}</span></div>}{addOns.priorityBoarding&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sub,marginBottom:6}}><span>Priority Boarding × {paxCount}</span><span style={{fontFamily:"monospace"}}>{fmtPrice(paxCount*25)}</span></div>}{addOns.travelInsurance&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sub,marginBottom:6}}><span>Travel Insurance × {paxCount}</span><span style={{fontFamily:"monospace"}}>{fmtPrice(paxCount*49)}</span></div>}{addOns.mealUpgrade&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sub,marginBottom:6}}><span>Meal Upgrade × {paxCount}</span><span style={{fontFamily:"monospace"}}>{fmtPrice(paxCount*45)}</span></div>}</div>)}
            {priceInfo&&(<div style={{background:T.card,border:`1px solid ${T.gold}20`,borderRadius:16,padding:24,marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
              <div><div style={{fontSize:12,color:T.sub}}>Total Amount</div><div style={{fontSize:28,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(priceInfo.total)}</div><div style={{fontSize:11,color:T.dim}}>{payMethod==="card"?`Card ending ${cardNumber.slice(-4)}`:`Payment via ${selectedWallet?.symbol||"Crypto"}`}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.dim,marginBottom:8}}>By confirming, you agree to SKYLUX Airways terms & conditions</div><button onClick={confirmBooking} disabled={bookingLoading} style={{padding:"14px 40px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:15,fontWeight:700,cursor:bookingLoading?"wait":"pointer",fontFamily:"inherit",opacity:bookingLoading?0.7:1}}>{bookingLoading?"Processing Payment...":"Confirm & Pay"}</button></div>
            </div>{errors.submit&&<div style={{marginTop:12,padding:"14px 18px",background:T.red+"10",border:`1px solid ${T.red}20`,borderRadius:10}}>
              <div style={{fontSize:12,color:T.red,fontWeight:600,marginBottom:4}}>⚠ Payment Failed</div>
              <div style={{fontSize:12,color:"#f87171",marginBottom:payMethod==="card"?10:0}}>{errors.submit}</div>
              {payMethod==="card"&&<button onClick={()=>{setPayMethod("crypto");setStep(3);setCardDeclined(false);setErrors({});if(cryptoWallets.length===0)fetchCryptoWallets()}} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#f7931a,#e8850f)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Try Cryptocurrency Instead →</button>}
            </div>}</div>)}
            <div style={{display:"flex",justifyContent:"flex-start",marginTop:12}}><button onClick={()=>setStep(3)} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>← Back to Payment</button></div>
          </div>)}
        </div>
      )}

      {/* CONFIRMATION */}
      {view==="confirmation"&&bookingResult&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"40px 24px"}}>
          <div style={{background:T.card,border:`1px solid ${T.gold}20`,borderRadius:20,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(135deg,${T.gold}12,${T.gold}05)`,padding:"32px 28px",textAlign:"center",borderBottom:`1px solid ${T.gold}15`}}><div style={{width:56,height:56,borderRadius:16,background:T.emerald+"15",border:`1px solid ${T.emerald}25`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>✓</div><h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Booking Confirmed</h2><p style={{fontSize:13,color:T.sub}}>Your reservation has been confirmed and your e-ticket has been issued</p></div>
            <div style={{padding:"20px 28px",textAlign:"center",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:10,color:T.dim,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Booking Reference</div><div style={{fontSize:32,fontWeight:800,color:T.gold,fontFamily:"'JetBrains Mono',monospace",letterSpacing:4}}>{bookingResult.bookingReference}</div><div style={{fontSize:11,color:T.dim,marginTop:4}}>Confirmation sent to {contactEmail}</div></div>
            <div style={{padding:"24px 28px",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:20}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.departure.scheduledTime)}</div><div style={{fontSize:13,fontWeight:700,color:T.gold}}>{selectedFlight.departure.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.departure.city}</div></div>
                  <div style={{textAlign:"center",padding:"0 16px"}}><div style={{fontSize:10,color:T.sub}}>{fmtDur(selectedFlight.duration)}</div><div style={{width:80,height:1,background:T.gold+"40",margin:"4px 0"}}/><div style={{fontSize:11,fontWeight:600,color:T.gold}}>{selectedFlight.flightNumber}</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,fontFamily:"monospace"}}>{fmtTime(selectedFlight.arrival.scheduledTime)}</div><div style={{fontSize:13,fontWeight:700,color:T.gold}}>{selectedFlight.arrival.airportCode}</div><div style={{fontSize:10,color:T.dim}}>{selectedFlight.arrival.city}</div></div>
                </div>
              </div>
              <div style={{marginTop:14,display:"flex",gap:10,flexWrap:"wrap"}}><span style={{fontSize:11,color:T.sub,background:T.surface,padding:"4px 10px",borderRadius:6}}>{fmtDate(selectedFlight.departure.scheduledTime)}</span><span style={{fontSize:11,color:T.gold,background:T.gold+"0a",padding:"4px 10px",borderRadius:6,fontWeight:600}}>{cap(selectedClass)} Class</span><span style={{fontSize:11,color:T.sub,background:T.surface,padding:"4px 10px",borderRadius:6}}>{paxCount} passenger{paxCount>1?"s":""}</span></div>
            </div>
            <div style={{padding:"20px 28px",borderBottom:`1px solid ${T.border}`}}>{passengers.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<passengers.length-1?`1px solid ${T.border}`:"none"}}><span style={{fontSize:13,fontWeight:600}}>{p.firstName} {p.lastName}</span><span style={{fontSize:11,color:T.dim}}>{p.nationality} · {p.passportNumber}</span></div>))}</div>
            <div style={{padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:T.sub}}>Total {payMethod==="crypto"?"Due":"Paid"}</span><span style={{fontSize:22,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(bookingResult.payment?.amount||priceInfo?.total||0)}</span></div>
            {/* Crypto payment details */}
            {cryptoPayResult&&(<div style={{padding:"0 28px 24px"}}>
              <div style={{background:T.surface,border:"1px solid #f7931a25",borderRadius:14,padding:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:8,height:8,borderRadius:4,background:"#f7931a",animation:"pulse 1.5s infinite"}}/>
                  <span style={{fontSize:12,fontWeight:700,color:"#f7931a"}}>CRYPTO PAYMENT — AWAITING CONFIRMATION</span>
                </div>
                <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Send <strong style={{color:"#f7931a"}}>{cryptoPayResult.symbol}</strong> equivalent of <strong style={{color:T.gold}}>${cryptoPayResult.amountUSD?.toLocaleString()}</strong> to the address below. Our team has been notified and will confirm your payment shortly.</div>
                <div style={{padding:"12px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  <div style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:"#f7931a",wordBreak:"break-all",flex:1}}>{cryptoPayResult.walletAddress}</div>
                  <button onClick={()=>navigator.clipboard.writeText(cryptoPayResult.walletAddress)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #f7931a30",background:"#f7931a10",color:"#f7931a",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Copy</button>
                </div>
                <div style={{fontSize:10,color:T.dim,marginTop:8}}>Network: {cryptoPayResult.network} · Expires: {new Date(cryptoPayResult.expiresAt).toLocaleString()}</div>
              </div>
            </div>)}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24}}><button onClick={()=>{setView("search");setStep(1);setSelectedFlight(null)}} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${T.gold}30`,background:T.gold+"08",color:T.goldLight,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Book Another Flight</button><button onClick={()=>{setView("mybookings");loadBookings()}} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>View My Bookings</button></div>
        </div>
      )}

      {/* MY BOOKINGS */}
      {view==="mybookings"&&(
        <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:20}}>My Bookings</h2>
          {!user&&(<div style={{textAlign:"center",padding:"50px 0"}}><div style={{fontSize:15,color:T.sub,marginBottom:14}}>Sign in to view your bookings</div><Link href="/auth" style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,color:"#0a0f1e",fontSize:13,fontWeight:700,textDecoration:"none"}}>Sign In</Link></div>)}
          {user&&bookingsLoading&&<div style={{textAlign:"center",padding:"50px 0",color:T.dim}}>Loading your bookings...</div>}
          {user&&!bookingsLoading&&myBookings.length===0&&(<div style={{textAlign:"center",padding:"50px 0"}}><div style={{fontSize:42,marginBottom:12,opacity:0.2}}>✈</div><div style={{fontSize:14,color:T.dim,marginBottom:12}}>No bookings yet</div><button onClick={()=>setView("search")} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${T.gold}30`,background:T.gold+"08",color:T.goldLight,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Search Flights</button></div>)}
          {myBookings.map((b:any)=>{const flight=b.flights?.[0]?.flight;const sc=b.status==="confirmed"?T.emerald:b.status==="cancelled"?T.red:T.amber;return(
            <div key={b._id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:14,fontWeight:700,color:T.gold,fontFamily:"monospace"}}>{b.bookingReference}</span><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:sc+"12",color:sc,textTransform:"uppercase"}}>{b.status}</span></div>{flight&&(<div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:16,fontWeight:700}}>{flight.departure?.airportCode}</span><span style={{color:T.dim}}>→</span><span style={{fontSize:16,fontWeight:700}}>{flight.arrival?.airportCode}</span><span style={{fontSize:11,color:T.dim,marginLeft:8}}>{flight.flightNumber}</span><span style={{fontSize:11,color:T.dim}}>{new Date(flight.departure?.scheduledTime).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span></div>)}<div style={{fontSize:11,color:T.dim,marginTop:4}}>{cap(b.cabinClass)} · {b.passengers?.length||1} passenger{(b.passengers?.length||1)>1?"s":""}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:T.gold}}>{fmtPrice(b.payment?.amount||0)}</div><div style={{fontSize:10,color:T.dim,marginTop:2}}>{new Date(b.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div></div>
              </div>
            </div>
          )})}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.6);cursor:pointer}
        select option{background:${T.surface}}
        ::selection{background:${T.gold}30}
        *{scrollbar-width:thin;scrollbar-color:${T.muted} transparent}
        @media(max-width:768px){
          nav>div{padding:0 16px!important}
          nav .nav-tabs{display:none!important}
          .portal-content{padding:16px!important}
          .search-section{padding:16px!important}
          .search-inputs{flex-direction:column!important}
          .search-inputs>div{min-width:100%!important}
          .seat-grid{grid-template-columns:repeat(2,1fr)!important}
          .booking-strip{flex-direction:column!important;text-align:center!important;gap:8px!important}
          .booking-actions{flex-direction:column!important}
          .booking-actions>button{width:100%!important}
        }
      `}}/>
    </div>
  );
}
