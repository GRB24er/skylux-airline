"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};

export default function RevenuePage() {
  const [data,setData]=useState<any>(null);const [bookings,setBookings]=useState<any[]>([]);const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      fetch("/api/analytics/revenue").then(r=>r.json()),
      fetch("/api/bookings?limit=100").then(r=>r.json()),
    ]).then(([r,b])=>{
      if(r.success)setData(r.data);
      if(b.success)setBookings(b.data?.bookings||[]);
    }).finally(()=>setLoading(false));
  },[]);

  const totalRevenue=bookings.filter(b=>b.status!=="cancelled").reduce((a:number,b:any)=>a+(b.payment?.amount||0),0);
  const avgPerBooking=bookings.length>0?totalRevenue/bookings.filter(b=>b.status!=="cancelled").length:0;
  const cancelledRevenue=bookings.filter(b=>b.status==="cancelled").reduce((a:number,b:any)=>a+(b.payment?.amount||0),0);

  // Revenue by class
  const byClass:Record<string,number>={};
  bookings.filter(b=>b.status!=="cancelled").forEach(b=>{byClass[b.cabinClass]=(byClass[b.cabinClass]||0)+(b.payment?.amount||0);});

  // Revenue by route
  const byRoute:Record<string,{count:number,revenue:number}>={};
  bookings.filter(b=>b.status!=="cancelled"&&b.flights?.[0]?.flight).forEach(b=>{
    const route=`${b.flights?.[0]?.flight?.departure?.airportCode||"?"} → ${b.flights?.[0]?.flight?.arrival?.airportCode||"?"}`;
    if(!byRoute[route])byRoute[route]={count:0,revenue:0};
    byRoute[route].count++;byRoute[route].revenue+=b.payment?.amount||0;
  });

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{marginBottom:24}}><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Revenue Analytics</h1><p style={{fontSize:13,color:C.textDim}}>Live data from bookings</p></div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[{l:"Total Revenue",v:`$${totalRevenue.toLocaleString()}`,c:C.emerald},{l:"Avg per Booking",v:`$${Math.round(avgPerBooking).toLocaleString()}`,c:C.accent},{l:"Cancelled Value",v:`$${cancelledRevenue.toLocaleString()}`,c:C.hot},{l:"Active Bookings",v:bookings.filter(b=>b.status!=="cancelled").length,c:C.cyan}].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"20px 22px",animation:`fadeUp 0.4s ease-out ${i*0.05}s both`}}>
            <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>{s.l}</div><div className="mono" style={{fontSize:26,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* By Class */}
        <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"22px 24px"}}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>Revenue by Cabin Class</div>
          {Object.keys(byClass).length===0?<div style={{color:C.textDim,fontSize:13,padding:"20px 0",textAlign:"center"}}>No data yet</div>:
          Object.entries(byClass).sort(([,a],[,b])=>(b as number)-(a as number)).map(([cls,rev],i)=>(
            <div key={cls} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<Object.keys(byClass).length-1?`1px solid ${C.glassBorder}`:"none"}}>
              <span style={{fontSize:13,fontWeight:600,textTransform:"capitalize"}}>{cls}</span>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:120,height:6,borderRadius:3,background:C.glassBorder,overflow:"hidden"}}><div style={{width:`${totalRevenue>0?((rev as number)/totalRevenue*100):0}%`,height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.accent},${C.accentLight})`}} /></div>
                <span className="mono" style={{fontSize:13,fontWeight:600,minWidth:80,textAlign:"right"}}>${(rev as number).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* By Route */}
        <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,padding:"22px 24px"}}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>Revenue by Route</div>
          {Object.keys(byRoute).length===0?<div style={{color:C.textDim,fontSize:13,padding:"20px 0",textAlign:"center"}}>No data yet</div>:
          Object.entries(byRoute).sort(([,a],[,b])=>b.revenue-a.revenue).map(([route,d],i)=>(
            <div key={route} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<Object.keys(byRoute).length-1?`1px solid ${C.glassBorder}`:"none"}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{route}</div><div style={{fontSize:11,color:C.textDim}}>{d.count} booking{d.count>1?"s":""}</div></div>
              <span className="mono" style={{fontSize:13,fontWeight:600}}>${d.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
