"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
const statusC:Record<string,string>={"on-duty":C.emerald,available:C.cyan,"on-leave":C.amber,training:C.violet,inactive:C.textDim};

export default function CrewPage() {
  const [crew,setCrew]=useState<any[]>([]);const [loading,setLoading]=useState(true);

  const load=()=>{setLoading(true);fetch("/api/crew").then(r=>r.json()).then(d=>{if(d.success)setCrew(d.data?.crew||[]);}).finally(()=>setLoading(false));};
  useEffect(load,[]);

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{marginBottom:24}}><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Crew Management</h1><p style={{fontSize:13,color:C.textDim}}>{crew.length} crew members</p></div>
      {crew.length===0?(
        <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"60px 0",textAlign:"center",color:C.textDim}}>
          <div style={{fontSize:36,marginBottom:12}}>👨‍✈️</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No crew members yet</div>
          <div style={{fontSize:13}}>Crew records are created when users with pilot/crew roles are registered.</div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {crew.map((m:any,i:number)=>(
            <div key={m._id} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"22px 24px",animation:`fadeUp 0.4s ease-out ${i*0.05}s both`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{m.user?.firstName||""} {m.user?.lastName||""}</div>
                  <div style={{fontSize:12,color:C.textDim,textTransform:"capitalize"}}>{m.role||"—"} · {m.employeeId||""}</div>
                </div>
                <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusC[m.status]||C.textDim)+"12",color:statusC[m.status]||C.textDim}}>{m.status||"—"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[{l:"BASE",v:m.base||"—"},{l:"TOTAL HOURS",v:m.flightHours?.total?`${m.flightHours.total}h`:"—"},{l:"AIRCRAFT",v:m.aircraftRatings?.map((r:any)=>r.type).join(", ")||"—"}].map((s,si)=>(
                  <div key={si} style={{padding:"8px 10px",borderRadius:10,background:C.glass,border:`1px solid ${C.glassBorder}`}}>
                    <div style={{fontSize:8,color:C.textDim,letterSpacing:1}}>{s.l}</div><div className="mono" style={{fontSize:12,fontWeight:600}}>{s.v}</div>
                  </div>
                ))}
              </div>
              {m.user?.email&&<div style={{fontSize:11,color:C.textDim,marginTop:10}}>{m.user.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
