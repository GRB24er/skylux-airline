"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};

export default function CrewPanel() {
  const {user,logout,loading:authLoading}=useAuth();
  const [tab,setTab]=useState("schedule");
  const [schedule,setSchedule]=useState<any[]>([]);
  const [crewList,setCrewList]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      fetch("/api/crew/schedule").then(r=>r.json()).catch(()=>({success:false})),
      fetch("/api/crew").then(r=>r.json()).catch(()=>({success:false})),
    ]).then(([s,c])=>{
      if(s.success)setSchedule(s.data?.schedule||[]);
      if(c.success)setCrewList(c.data?.crew||[]);
    }).finally(()=>setLoading(false));
  },[]);

  if(authLoading||loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif"}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {/* Nav */}
      <nav style={{padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.glassBorder}`,background:"rgba(3,6,20,0.8)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:50}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:C.text}}>
          <div style={{width:32,height:32,borderRadius:9,background:C.accent+"18",border:`1px solid ${C.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✈</div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:2}}>SKYLUX</span>
          <span style={{fontSize:9,color:C.amber,letterSpacing:2,fontWeight:700}}>CREW</span>
        </Link>
        <div style={{display:"flex",gap:4}}>
          {["schedule","roster"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",background:tab===t?C.accent+"15":"transparent",color:tab===t?C.accentLight:C.textSoft,fontSize:13,fontWeight:600,textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {user&&<span style={{fontSize:12,color:C.textSoft}}>{user.firstName} {user.lastName}</span>}
          <button onClick={logout} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.glassBorder}`,background:"transparent",color:C.textDim,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button>
        </div>
      </nav>

      <div style={{padding:"32px 40px",maxWidth:1000,margin:"0 auto"}}>
        {tab==="schedule"&&(
          <div style={{animation:"fadeUp 0.5s ease-out both"}}>
            <h2 style={{fontSize:22,fontWeight:700,marginBottom:20}}>My Schedule</h2>
            {schedule.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"60px 0",textAlign:"center",color:C.textDim}}>
                <div style={{fontSize:36,marginBottom:12}}>📅</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No schedule assigned</div>
                <div style={{fontSize:13}}>Your schedule will appear here when flights are assigned to you.</div>
              </div>
            ):(
              schedule.map((s:any,i:number)=>(
                <div key={i} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:20,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:15,fontWeight:700}}>{s.flight?.flightNumber||"Assignment"}</div><div style={{fontSize:12,color:C.textDim}}>{s.flight?`${s.flight.departure?.airportCode} → ${s.flight.arrival?.airportCode}`:s.type||"—"}</div></div>
                    <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:13,color:C.accentLight}}>{s.date?new Date(s.date).toLocaleDateString():"—"}</div><span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:C.cyan+"12",color:C.cyan}}>{s.status||s.type||"scheduled"}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab==="roster"&&(
          <div style={{animation:"fadeUp 0.5s ease-out both"}}>
            <h2 style={{fontSize:22,fontWeight:700,marginBottom:20}}>Crew Roster</h2>
            {crewList.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"60px 0",textAlign:"center",color:C.textDim}}>
                <div style={{fontSize:36,marginBottom:12}}>👨‍✈️</div>
                <div style={{fontSize:15,fontWeight:600}}>No crew members registered</div>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {crewList.map((m:any,i:number)=>(
                  <div key={m._id} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:20,animation:`fadeUp 0.3s ease-out ${i*0.05}s both`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><div style={{fontSize:15,fontWeight:700}}>{m.user?.firstName||""} {m.user?.lastName||""}</div><div style={{fontSize:12,color:C.textDim,textTransform:"capitalize"}}>{m.role} · {m.base||"—"}</div></div>
                      <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:(m.status==="on-duty"?C.emerald:m.status==="available"?C.cyan:C.amber)+"12",color:m.status==="on-duty"?C.emerald:m.status==="available"?C.cyan:C.amber}}>{m.status||"—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
