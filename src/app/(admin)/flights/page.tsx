"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",
  glassBorder:"rgba(255,255,255,0.06)",glassBorderHover:"rgba(255,255,255,0.12)",
  text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",
  accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa",
};

const statusColors:Record<string,string> = {scheduled:C.cyan,boarding:C.amber,departed:C.violet,airborne:C.accent,arrived:C.emerald,cancelled:C.hot,delayed:C.hot};

const defaultSeatMap = [
  {class:"economy",rows:33,seatsPerRow:9,totalSeats:198,availableSeats:198,price:0,layout:"3-3-3"},
  {class:"premium",rows:7,seatsPerRow:7,totalSeats:42,availableSeats:42,price:0,layout:"2-3-2"},
  {class:"business",rows:9,seatsPerRow:4,totalSeats:36,availableSeats:36,price:0,layout:"1-2-1"},
  {class:"first",rows:7,seatsPerRow:2,totalSeats:14,availableSeats:14,price:0,layout:"1-1"},
];

export default function FlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  // Form state
  const [form, setForm] = useState({
    flightNumber:"",type:"commercial",
    depAirport:"",depCode:"",depCity:"",depCountry:"",depTerminal:"",depGate:"",depTime:"",depTz:"UTC",
    arrAirport:"",arrCode:"",arrCity:"",arrCountry:"",arrTerminal:"",arrTime:"",arrTz:"UTC",
    duration:0,distance:0,aircraftId:"",stops:0,
    seatMap:defaultSeatMap.map(s=>({...s})),
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/flights?limit=100").then(r=>r.json()),
      fetch("/api/aircraft").then(r=>r.json()),
    ]).then(([f,a])=>{
      if(f.success) setFlights(f.data?.flights||[]);
      if(a.success) setAircraft(a.data?.aircraft||[]);
    }).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const saveFlight = async () => {
    if(!form.flightNumber||!form.depCode||!form.arrCode||!form.depTime||!form.arrTime){setError("Fill in required fields");return;}
    setSaving(true);setError("");
    try {
      const body = {
        flightNumber:form.flightNumber, type:form.type, airline:"SKYLUX Airways",
        departure:{airport:form.depAirport||form.depCity+" International",airportCode:form.depCode,city:form.depCity,country:form.depCountry,terminal:form.depTerminal,gate:form.depGate,scheduledTime:new Date(form.depTime),timezone:form.depTz},
        arrival:{airport:form.arrAirport||form.arrCity+" International",airportCode:form.arrCode,city:form.arrCity,country:form.arrCountry,terminal:form.arrTerminal,scheduledTime:new Date(form.arrTime),timezone:form.arrTz},
        duration:form.duration,distance:form.distance,aircraft:form.aircraftId||undefined,stops:form.stops,
        seatMap:form.type==="commercial"?form.seatMap:[{class:"first",rows:1,seatsPerRow:19,totalSeats:19,availableSeats:19,price:form.seatMap[0]?.price||5000,layout:"club"}],
        amenities:form.type==="commercial"?["Wi-Fi","IFE","USB Charging","Meal Service"]:["Full Catering","Wi-Fi","Bedroom","Conference"],
        baggageAllowance:{cabin:{weight:7,pieces:1},checked:{weight:form.type==="commercial"?23:50,pieces:form.type==="commercial"?1:3}},
        isActive:true,
      };
      const res = await fetch("/api/flights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await res.json();
      if(data.success){setShowAdd(false);load();setForm({...form,flightNumber:"",depCode:"",arrCode:"",depCity:"",arrCity:"",depCountry:"",arrCountry:"",depTime:"",arrTime:"",depAirport:"",arrAirport:"",depTerminal:"",depGate:"",arrTerminal:"",duration:0,distance:0,seatMap:defaultSeatMap.map(s=>({...s}))});}
      else setError(data.error||"Failed to create flight");
    } catch(e){setError("Network error");}
    setSaving(false);
  };

  const deleteFlight = async (id:string) => {
    if(!confirm("Deactivate this flight?")) return;
    await fetch(`/api/flights/${id}`,{method:"DELETE"});
    load();
  };

  const filtered = flights.filter(f=>{
    if(!filter) return true;
    const s = filter.toLowerCase();
    return f.flightNumber?.toLowerCase().includes(s)||f.departure?.airportCode?.toLowerCase().includes(s)||f.arrival?.airportCode?.toLowerCase().includes(s)||f.status?.toLowerCase().includes(s);
  });

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}input::placeholder{color:${C.textDim};}`}</style>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Flights</h1><p style={{fontSize:13,color:C.textDim}}>{flights.length} flights in database</p></div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="Search flights..." value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 14px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:200}} />
          <button onClick={()=>setShowAdd(true)} style={{padding:"8px 20px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Flight</button>
        </div>
      </div>

      {/* Add Flight Modal */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
          <div style={{background:C.surface,border:`1px solid ${C.glassBorder}`,borderRadius:24,padding:32,width:700,maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:20,fontWeight:700}}>Add New Flight</h2>
              <button onClick={()=>{setShowAdd(false);setError("");}} style={{background:"none",border:"none",color:C.textDim,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {error&&<div style={{padding:"10px 14px",borderRadius:10,background:C.hot+"12",border:`1px solid ${C.hot}25`,color:C.hot,fontSize:12,marginBottom:16}}>{error}</div>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
              <div><label style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>FLIGHT NUMBER *</label><input value={form.flightNumber} onChange={e=>setForm({...form,flightNumber:e.target.value})} placeholder="SX 401" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>TYPE</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4,cursor:"pointer"}}><option value="commercial" style={{background:C.surface}}>Commercial</option><option value="private-jet" style={{background:C.surface}}>Private Jet</option></select></div>
              <div><label style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>AIRCRAFT</label><select value={form.aircraftId} onChange={e=>setForm({...form,aircraftId:e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4,cursor:"pointer"}}><option value="" style={{background:C.surface}}>Select...</option>{aircraft.map((a:any)=><option key={a._id} value={a._id} style={{background:C.surface}}>{a.name}</option>)}</select></div>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.textSoft,marginBottom:10,marginTop:8}}>DEPARTURE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textDim}}>Code *</label><input value={form.depCode} onChange={e=>setForm({...form,depCode:e.target.value.toUpperCase()})} placeholder="LHR" maxLength={4} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>City *</label><input value={form.depCity} onChange={e=>setForm({...form,depCity:e.target.value})} placeholder="London" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Country *</label><input value={form.depCountry} onChange={e=>setForm({...form,depCountry:e.target.value})} placeholder="UK" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Scheduled *</label><input type="datetime-local" value={form.depTime} onChange={e=>setForm({...form,depTime:e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textDim}}>Terminal</label><input value={form.depTerminal} onChange={e=>setForm({...form,depTerminal:e.target.value})} placeholder="T5" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Gate</label><input value={form.depGate} onChange={e=>setForm({...form,depGate:e.target.value})} placeholder="A14" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Airport Name</label><input value={form.depAirport} onChange={e=>setForm({...form,depAirport:e.target.value})} placeholder="Heathrow" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.textSoft,marginBottom:10}}>ARRIVAL</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textDim}}>Code *</label><input value={form.arrCode} onChange={e=>setForm({...form,arrCode:e.target.value.toUpperCase()})} placeholder="DXB" maxLength={4} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>City *</label><input value={form.arrCity} onChange={e=>setForm({...form,arrCity:e.target.value})} placeholder="Dubai" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Country *</label><input value={form.arrCountry} onChange={e=>setForm({...form,arrCountry:e.target.value})} placeholder="UAE" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Scheduled *</label><input type="datetime-local" value={form.arrTime} onChange={e=>setForm({...form,arrTime:e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4}} /></div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textDim}}>Duration (min)</label><input type="number" value={form.duration||""} onChange={e=>setForm({...form,duration:+e.target.value})} placeholder="380" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Distance (nm)</label><input type="number" value={form.distance||""} onChange={e=>setForm({...form,distance:+e.target.value})} placeholder="2990" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
              <div><label style={{fontSize:10,color:C.textDim}}>Stops</label><input type="number" value={form.stops} onChange={e=>setForm({...form,stops:+e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
            </div>

            {form.type==="commercial"&&(<>
              <div style={{fontSize:12,fontWeight:700,color:C.textSoft,marginBottom:10}}>PRICING (per seat)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
                {form.seatMap.map((s,i)=>(
                  <div key={i}><label style={{fontSize:10,color:C.textDim,textTransform:"capitalize"}}>{s.class} $</label><input type="number" value={s.price||""} onChange={e=>{const m=[...form.seatMap];m[i]={...m[i],price:+e.target.value};setForm({...form,seatMap:m});}} placeholder="0" style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",marginTop:4}} /></div>
                ))}
              </div>
            </>)}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowAdd(false);setError("");}} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.glassBorder}`,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={saveFlight} disabled={saving} style={{padding:"10px 24px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,color:"white",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",fontFamily:"inherit",opacity:saving?0.7:1}}>{saving?"Saving...":"Create Flight"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Flights Table */}
      <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,overflow:"hidden"}}>
        {filtered.length===0?(
          <div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}>
            <div style={{fontSize:36,marginBottom:12}}>✈</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{flights.length===0?"No flights yet":"No matching flights"}</div>
            <div style={{fontSize:13}}>Click <strong>+ Add Flight</strong> to create your first flight.</div>
          </div>
        ):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.glassBorder}`}}>
              {["Flight","Type","Route","Duration","Status","Eco $","Bus $","First $","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((f:any,i:number)=>(
                <tr key={f._id} style={{borderBottom:`1px solid ${C.glassBorder}08`,animation:`fadeUp 0.3s ease-out ${i*0.02}s both`}} onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(255,255,255,0.015)"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}>
                  <td className="mono" style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:C.accentLight}}>{f.flightNumber}</td>
                  <td style={{padding:"12px 14px"}}><span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:f.type==="commercial"?C.cyan+"12":C.violet+"12",color:f.type==="commercial"?C.cyan:C.violet}}>{f.type}</span></td>
                  <td style={{padding:"12px 14px",fontSize:13,fontWeight:600}}>{f.departure?.airportCode} → {f.arrival?.airportCode}</td>
                  <td className="mono" style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{f.duration?`${Math.floor(f.duration/60)}h ${f.duration%60}m`:"—"}</td>
                  <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[f.status]||C.textDim)+"12",color:statusColors[f.status]||C.textDim}}>{f.status}</span></td>
                  <td className="mono" style={{padding:"12px 14px",fontSize:12}}>{f.seatMap?.find((s:any)=>s.class==="economy")?.price?`$${f.seatMap.find((s:any)=>s.class==="economy").price}`:"—"}</td>
                  <td className="mono" style={{padding:"12px 14px",fontSize:12}}>{f.seatMap?.find((s:any)=>s.class==="business")?.price?`$${f.seatMap.find((s:any)=>s.class==="business").price}`:"—"}</td>
                  <td className="mono" style={{padding:"12px 14px",fontSize:12}}>{f.seatMap?.find((s:any)=>s.class==="first")?.price?`$${f.seatMap.find((s:any)=>s.class==="first").price}`:"—"}</td>
                  <td style={{padding:"12px 14px"}}><button onClick={()=>deleteFlight(f._id)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.hot}25`,background:"transparent",color:C.hot,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
