"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24"};
const statusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,departed:C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot};
const STATUSES = ["scheduled","boarding","departed","in-flight","landed","arrived","delayed","cancelled"];

export default function FlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showStatus, setShowStatus] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [fn, setFn] = useState("SX "); const [dep, setDep] = useState(""); const [arr, setArr] = useState("");
  const [depTime, setDepTime] = useState(""); const [arrTime, setArrTime] = useState("");
  const [pEcon, setPEcon] = useState("500"); const [pPrem, setPPrem] = useState("900"); const [pBiz, setPBiz] = useState("2500"); const [pFirst, setPFirst] = useState("6000");
  const [newStatus, setNewStatus] = useState(""); const [delayMin, setDelayMin] = useState(""); const [statusNote, setStatusNote] = useState(""); const [updating, setUpdating] = useState(false);

  const load = () => { setLoading(true); fetch("/api/flights/search?limit=50&sortBy=departure").then(r => r.json()).then(d => { if (d.success) setFlights(d.data?.flights || []); }).finally(() => setLoading(false)); };
  useEffect(load, []);

  const createFlight = async () => {
    if (!fn.trim() || !dep.trim() || !arr.trim() || !depTime || !arrTime) { setMsg("Error: Fill all required fields"); return; }
    setCreating(true); setMsg("");
    try {
      const res = await fetch("/api/admin/flights/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flightNumber: fn.trim(), departure: dep.trim(), arrival: arr.trim(), departureTime: depTime, arrivalTime: arrTime, prices: { economy: +pEcon, premium: +pPrem, business: +pBiz, first: +pFirst } }) });
      const d = await res.json();
      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));
      if (d.success) { setShowCreate(false); setFn("SX "); setDep(""); setArr(""); load(); }
    } catch { setMsg("Error: Network error"); }
    setCreating(false); setTimeout(() => setMsg(""), 4000);
  };

  const updateStatus = async () => {
    if (!showStatus || !newStatus) return;
    setUpdating(true); setMsg("");
    try {
      const res = await fetch("/api/admin/flights/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flightId: showStatus._id, status: newStatus, delayMinutes: delayMin ? +delayMin : undefined, note: statusNote }) });
      const d = await res.json();
      setMsg(d.success ? "Done: " + d.message : "Error: " + (d.error || "Failed"));
      if (d.success) { setShowStatus(null); setNewStatus(""); setDelayMin(""); setStatusNote(""); load(); }
    } catch { setMsg("Error: Network error"); }
    setUpdating(false); setTimeout(() => setMsg(""), 5000);
  };

  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" }); } catch { return "TBD"; } };
  const inp = (v: string, set: (v:string)=>void, ph: string, extra?: any) => (<input value={v} onChange={e=>set(e.target.value)} placeholder={ph} {...extra} style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...(extra?.style||{})}} />);

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:"3px solid "+C.accent+"20",borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{".mono{font-family:'JetBrains Mono',monospace}@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Flights</h1><p style={{fontSize:13,color:C.textDim}}>{flights.length} flights in system</p></div>
        <button onClick={()=>setShowCreate(true)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Create Flight</button>
      </div>

      {msg && <div style={{padding:"10px 16px",marginBottom:14,borderRadius:10,background:msg.startsWith("Done")?C.emerald+"12":C.hot+"12",border:"1px solid "+(msg.startsWith("Done")?C.emerald:C.hot)+"25",fontSize:13,color:msg.startsWith("Done")?C.emerald:C.hot,fontWeight:600}}>{msg}</div>}

      <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:18,overflow:"hidden"}}>
        {flights.length===0 ? (<div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}>No flights yet. Create one above.</div>) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid "+C.glassBorder}}>{["Flight","Route","Date","Departs","Status","Seats","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>
            <tbody>{flights.map((f: any, i: number) => (
              <tr key={f._id||i} style={{borderBottom:"1px solid "+C.glassBorder+"08"}}>
                <td className="mono" style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.accentLight}}>{f.flightNumber}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{f.departure?.airportCode} - {f.arrival?.airportCode}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{fmtDate(f.departure?.scheduledTime)}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.text}}>{fmtTime(f.departure?.scheduledTime)}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[f.status]||C.textDim)+"12",color:statusColors[f.status]||C.textDim,textTransform:"uppercase"}}>{f.status}</span></td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>{f.seatMap?.reduce((a:number,s:any)=>a+(s.availableSeats||0),0) || "?"}</td>
                <td style={{padding:"12px 14px"}}>{f._id && <button onClick={()=>{setShowStatus(f);setNewStatus(f.status)}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+C.accent+"25",background:"transparent",color:C.accentLight,fontSize:10,fontWeight:600,cursor:"pointer"}}>Update Status</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowCreate(false)}>
          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>Create New Flight</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FLIGHT NUMBER*</label>{inp(fn,setFn,"SX 100")}</div>
              <div></div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>FROM (IATA)*</label>{inp(dep,s=>setDep(s.toUpperCase()),"e.g. LHR")}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>TO (IATA)*</label>{inp(arr,s=>setArr(s.toUpperCase()),"e.g. JFK")}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DEPARTURE*</label>{inp(depTime,setDepTime,"",{type:"datetime-local"})}</div>
              <div><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>ARRIVAL*</label>{inp(arrTime,setArrTime,"",{type:"datetime-local"})}</div>
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

      {showStatus && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowStatus(null)}>
          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Update Flight Status</h3>
            <p style={{fontSize:12,color:C.textDim,marginBottom:20}}>{showStatus.flightNumber} - {showStatus.departure?.airportCode} to {showStatus.arrival?.airportCode}</p>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6}}>NEW STATUS</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {STATUSES.map(s=>(<button key={s} onClick={()=>setNewStatus(s)} style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+(newStatus===s?(statusColors[s]||C.accent):C.glassBorder),background:newStatus===s?(statusColors[s]||C.accent)+"15":"transparent",color:newStatus===s?(statusColors[s]||C.accent):C.textSoft,fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{s}</button>))}
              </div>
            </div>
            {newStatus==="delayed"&&(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>DELAY (MINUTES)</label>{inp(delayMin,setDelayMin,"e.g. 45",{type:"number"})}</div>)}
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:4}}>NOTE (optional)</label>
              <textarea value={statusNote} onChange={e=>setStatusNote(e.target.value)} placeholder="Info for passengers..." style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:60}} />
            </div>
            <div style={{padding:"12px 16px",background:C.amber+"08",border:"1px solid "+C.amber+"20",borderRadius:10,marginBottom:20}}>
              <div style={{fontSize:11,color:C.amber}}>All passengers with confirmed bookings on this flight will be emailed.</div>
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