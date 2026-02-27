"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",glassBorderHover:"rgba(255,255,255,0.12)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};

export default function FleetPage() {
  const [aircraft,setAircraft]=useState<any[]>([]);const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);const [saving,setSaving]=useState(false);const [error,setError]=useState("");
  const [form,setForm]=useState({name:"",manufacturer:"",model:"",category:"commercial",registration:"",maxPassengers:0,maxRange:0,cruiseSpeed:0,maxAltitude:0,fuelCapacity:0,hourlyRate:0});

  const load=()=>{setLoading(true);fetch("/api/aircraft").then(r=>r.json()).then(d=>{if(d.success)setAircraft(d.data?.aircraft||[]);}).finally(()=>setLoading(false));};
  useEffect(load,[]);

  const save=async()=>{
    if(!form.name||!form.manufacturer||!form.model){setError("Name, manufacturer and model required");return;}
    setSaving(true);setError("");
    const body={name:form.name,manufacturer:form.manufacturer,model:form.model,category:form.category,registration:form.registration,specs:{maxPassengers:form.maxPassengers,maxRange:form.maxRange,cruiseSpeed:form.cruiseSpeed,maxAltitude:form.maxAltitude,fuelCapacity:form.fuelCapacity},hourlyRate:form.hourlyRate,status:"active"};
    try{
      const res=await fetch("/api/aircraft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(data.success){setShowAdd(false);load();setForm({name:"",manufacturer:"",model:"",category:"commercial",registration:"",maxPassengers:0,maxRange:0,cruiseSpeed:0,maxAltitude:0,fuelCapacity:0,hourlyRate:0});}
      else setError(data.error||"Failed");
    }catch(e){setError("Network error");}
    setSaving(false);
  };

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Fleet Management</h1><p style={{fontSize:13,color:C.textDim}}>{aircraft.length} aircraft in fleet</p></div>
        <button onClick={()=>setShowAdd(true)} style={{padding:"8px 20px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add Aircraft</button>
      </div>

      {showAdd&&(
        <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
          <div style={{background:C.surface,border:`1px solid ${C.glassBorder}`,borderRadius:24,padding:32,width:600,maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:20,fontWeight:700}}>Add Aircraft</h2><button onClick={()=>{setShowAdd(false);setError("");}} style={{background:"none",border:"none",color:C.textDim,fontSize:18,cursor:"pointer"}}>✕</button></div>
            {error&&<div style={{padding:"10px 14px",borderRadius:10,background:C.hot+"12",border:`1px solid ${C.hot}25`,color:C.hot,fontSize:12,marginBottom:16}}>{error}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {([["name","Aircraft Name *","Boeing 787-9 Dreamliner"],["manufacturer","Manufacturer *","Boeing"],["model","Model *","787-9"],["registration","Registration","SX-787-01"],["category","Category",""],["maxPassengers","Max Passengers","290"],["maxRange","Range (nm)","7635"],["cruiseSpeed","Cruise Speed (kts)","490"],["maxAltitude","Max Alt (ft)","43000"],["fuelCapacity","Fuel (L)","126370"],["hourlyRate","Hourly Rate $","8500"]] as [string,string,string][]).map(([key,label,ph])=>(
                <div key={key}><label style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:0.5}}>{label}</label>
                {key==="category"?<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginTop:4,cursor:"pointer"}}><option style={{background:C.surface}} value="commercial">Commercial</option><option style={{background:C.surface}} value="private">Private</option></select>
                :<input value={(form as any)[key]||""} onChange={e=>setForm({...form,[key]:["maxPassengers","maxRange","cruiseSpeed","maxAltitude","fuelCapacity","hourlyRate"].includes(key)?+e.target.value:e.target.value})} placeholder={ph} type={["maxPassengers","maxRange","cruiseSpeed","maxAltitude","fuelCapacity","hourlyRate"].includes(key)?"number":"text"} style={{width:"100%",padding:"10px 12px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:["maxPassengers","maxRange","cruiseSpeed","maxAltitude","fuelCapacity","hourlyRate"].includes(key)?"'JetBrains Mono'":"inherit",outline:"none",marginTop:4}} />}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
              <button onClick={()=>{setShowAdd(false);setError("");}} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.glassBorder}`,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={save} disabled={saving} style={{padding:"10px 24px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,color:"white",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",fontFamily:"inherit",opacity:saving?0.7:1}}>{saving?"Saving...":"Add Aircraft"}</button>
            </div>
          </div>
        </div>
      )}

      {aircraft.length===0?(
        <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"60px 0",textAlign:"center",color:C.textDim}}>
          <div style={{fontSize:36,marginBottom:12}}>🛩</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No aircraft yet</div>
          <div style={{fontSize:13}}>Click <strong>+ Add Aircraft</strong> to register your first aircraft.</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {aircraft.map((a:any,i:number)=>(
            <div key={a._id} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"22px 24px",animation:`fadeUp 0.4s ease-out ${i*0.05}s both`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div><div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{a.name}</div><div style={{fontSize:12,color:C.textDim}}>{a.manufacturer} {a.model}</div></div>
                <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:a.category==="private"?C.violet+"12":C.cyan+"12",color:a.category==="private"?C.violet:C.cyan}}>{a.category}</span>
              </div>
              {a.registration&&<div className="mono" style={{fontSize:11,color:C.textDim,marginBottom:12}}>{a.registration}</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[{l:"PASSENGERS",v:a.specs?.maxPassengers||"—"},{l:"RANGE",v:a.specs?.maxRange?`${a.specs.maxRange} nm`:"—"},{l:"SPEED",v:a.specs?.cruiseSpeed?`${a.specs.cruiseSpeed} kts`:"—"}].map((s,si)=>(
                  <div key={si} style={{padding:"8px 10px",borderRadius:10,background:C.glass,border:`1px solid ${C.glassBorder}`}}>
                    <div style={{fontSize:8,color:C.textDim,letterSpacing:1}}>{s.l}</div><div className="mono" style={{fontSize:14,fontWeight:600}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
