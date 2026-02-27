"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",glassBorderHover:"rgba(255,255,255,0.12)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
const statusColors:Record<string,string>={confirmed:C.emerald,pending:C.amber,cancelled:C.hot,completed:C.cyan,refunded:C.violet};

export default function BookingsPage() {
  const [bookings,setBookings]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("");

  const load=()=>{setLoading(true);fetch("/api/bookings?limit=100").then(r=>r.json()).then(d=>{if(d.success)setBookings(d.data?.bookings||[]);}).finally(()=>setLoading(false));};
  useEffect(load,[]);

  const cancelBooking=async(id:string)=>{
    if(!confirm("Cancel this booking?"))return;
    await fetch("/api/bookings/cancel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:id,reason:"Admin cancellation"})});
    load();
  };

  const filtered=bookings.filter(b=>{if(!filter)return true;const s=filter.toLowerCase();return b.bookingReference?.toLowerCase().includes(s)||b.passengers?.[0]?.firstName?.toLowerCase().includes(s)||b.passengers?.[0]?.lastName?.toLowerCase().includes(s)||b.cabinClass?.toLowerCase().includes(s)||b.status?.toLowerCase().includes(s);});
  const total=bookings.reduce((a:number,b:any)=>a+(b.payment?.amount||0),0);

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Bookings</h1><p style={{fontSize:13,color:C.textDim}}>{bookings.length} bookings · Total revenue: <span className="mono" style={{color:C.emerald,fontWeight:600}}>${total.toLocaleString()}</span></p></div>
        <input placeholder="Search bookings..." value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 14px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:220}} />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Confirmed",v:bookings.filter(b=>b.status==="confirmed").length,c:C.emerald},{l:"Pending",v:bookings.filter(b=>b.status==="pending").length,c:C.amber},{l:"Cancelled",v:bookings.filter(b=>b.status==="cancelled").length,c:C.hot},{l:"Total Revenue",v:`$${total.toLocaleString()}`,c:C.accent}].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:14,padding:"16px 18px"}}><div style={{fontSize:11,color:C.textDim,marginBottom:4}}>{s.l}</div><div className="mono" style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,overflow:"hidden"}}>
        {filtered.length===0?(<div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}><div style={{fontSize:36,marginBottom:12}}>📋</div><div style={{fontSize:15,fontWeight:600}}>{bookings.length===0?"No bookings yet":"No matching bookings"}</div></div>):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.glassBorder}`}}>{["Reference","Passenger","Flight","Route","Class","Amount","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((b:any,i:number)=>(
              <tr key={b._id} style={{borderBottom:`1px solid ${C.glassBorder}08`,animation:`fadeUp 0.3s ease-out ${i*0.02}s both`}} onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(255,255,255,0.015)"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}>
                <td className="mono" style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.accentLight}}>{b.bookingReference}</td>
                <td style={{padding:"12px 14px",fontSize:13}}>{b.passengers?.[0]?.firstName} {b.passengers?.[0]?.lastName}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:12}}>{b.flight?.flightNumber||"—"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{b.flight?.departure?.airportCode||"?"} → {b.flight?.arrival?.airportCode||"?"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft,textTransform:"capitalize"}}>{b.cabinClass}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:13,fontWeight:600}}>${b.payment?.amount?.toLocaleString()||"0"}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[b.status]||C.textDim)+"12",color:statusColors[b.status]||C.textDim}}>{b.status}</span></td>
                <td style={{padding:"12px 14px"}}>{b.status==="confirmed"&&<button onClick={()=>cancelBooking(b._id)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.hot}25`,background:"transparent",color:C.hot,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
