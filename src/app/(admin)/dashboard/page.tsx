"use client";
import { useState, useEffect } from "react";

const C = {
  bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",
  glassBorder:"rgba(255,255,255,0.06)",glassBorderHover:"rgba(255,255,255,0.12)",
  text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",
  accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa",
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/dashboard").then(r => r.json()),
      fetch("/api/flights?limit=10").then(r => r.json()),
      fetch("/api/bookings?limit=10").then(r => r.json()),
    ]).then(([s, f, b]) => {
      if (s.success) setStats(s.data);
      if (f.success) setFlights(f.data?.flights || []);
      if (b.success) setBookings(b.data?.bookings || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  const statCards = [
    { label: "Total Flights", value: stats?.stats?.flights?.total ?? flights.length, color: C.accent },
    { label: "Total Bookings", value: stats?.stats?.bookings?.total ?? bookings.length, color: C.cyan },
    { label: "Revenue", value: stats?.stats?.revenue?.thisYear ? `$${(stats.stats.revenue.thisYear/1000).toFixed(0)}K` : `$${bookings.reduce((a:number,b:any)=>a+(b.payment?.amount||0),0).toLocaleString()}`, color: C.emerald },
    { label: "Passengers", value: stats?.stats?.passengers?.total || 0, color: C.amber },
  ];

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Dashboard</h1>
      <p style={{fontSize:13,color:C.textDim,marginBottom:24}}>Real-time overview from your database</p>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {statCards.map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"20px 22px",animation:`fadeUp 0.4s ease-out ${i*0.05}s both`}}>
            <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>{s.label}</div>
            <div className="mono" style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Flights */}
      <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.glassBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700}}>Recent Flights</span>
          <span className="mono" style={{fontSize:11,color:C.textDim}}>{flights.length} total</span>
        </div>
        {flights.length===0?(
          <div style={{padding:"40px 0",textAlign:"center",color:C.textDim}}>
            <div style={{fontSize:28,marginBottom:8}}>✈</div>
            <div style={{fontSize:13}}>No flights yet. Add flights from the Flights page.</div>
          </div>
        ):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.glassBorder}`}}>
              {["Flight","Route","Status","Departure","Aircraft"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {flights.slice(0,8).map((f:any)=>(
                <tr key={f._id} style={{borderBottom:`1px solid ${C.glassBorder}08`}} onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(255,255,255,0.015)"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}>
                  <td className="mono" style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:C.accentLight}}>{f.flightNumber}</td>
                  <td style={{padding:"12px 16px",fontSize:13}}>{f.departure?.airportCode} → {f.arrival?.airportCode}</td>
                  <td style={{padding:"12px 16px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:f.status==="scheduled"?C.cyan+"12":f.status==="departed"?C.amber+"12":f.status==="arrived"?C.emerald+"12":C.textDim+"12",color:f.status==="scheduled"?C.cyan:f.status==="departed"?C.amber:f.status==="arrived"?C.emerald:C.textDim}}>{f.status}</span></td>
                  <td className="mono" style={{padding:"12px 16px",fontSize:12,color:C.textSoft}}>{new Date(f.departure?.scheduledTime).toLocaleString("en-GB",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:C.textDim}}>{f.aircraft?.name||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Bookings */}
      <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.glassBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700}}>Recent Bookings</span>
          <span className="mono" style={{fontSize:11,color:C.textDim}}>{bookings.length} total</span>
        </div>
        {bookings.length===0?(
          <div style={{padding:"40px 0",textAlign:"center",color:C.textDim}}>
            <div style={{fontSize:28,marginBottom:8}}>📋</div>
            <div style={{fontSize:13}}>No bookings yet.</div>
          </div>
        ):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.glassBorder}`}}>
              {["Reference","Passenger","Flight","Class","Amount","Status"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {bookings.slice(0,8).map((b:any)=>(
                <tr key={b._id} style={{borderBottom:`1px solid ${C.glassBorder}08`}} onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(255,255,255,0.015)"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}>
                  <td className="mono" style={{padding:"12px 16px",fontSize:12,fontWeight:600,color:C.accentLight}}>{b.bookingReference}</td>
                  <td style={{padding:"12px 16px",fontSize:13}}>{b.passengers?.[0]?.firstName} {b.passengers?.[0]?.lastName}</td>
                  <td className="mono" style={{padding:"12px 16px",fontSize:12}}>{b.flight?.flightNumber||"—"}</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:C.textSoft,textTransform:"capitalize"}}>{b.cabinClass}</td>
                  <td className="mono" style={{padding:"12px 16px",fontSize:13,fontWeight:600}}>${b.payment?.amount?.toLocaleString()||"0"}</td>
                  <td style={{padding:"12px 16px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:b.status==="confirmed"?C.emerald+"12":b.status==="cancelled"?C.hot+"12":C.amber+"12",color:b.status==="confirmed"?C.emerald:b.status==="cancelled"?C.hot:C.amber}}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
