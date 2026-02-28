"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",accentDark:"#6366f1",cyan:"#22d3ee",gold:"#c9a96e",emerald:"#10b981",hot:"#ef4444",amber:"#fbbf24"};

const statusSteps = ["pending","confirmed","checked-in","boarded","completed"];
const statusColors: Record<string,string> = {confirmed:C.emerald,pending:C.amber,"checked-in":C.cyan,boarded:C.accent,completed:C.emerald,cancelled:C.hot,delayed:C.hot};
const flightStatusColors: Record<string,string> = {scheduled:C.accent,boarding:C.amber,"in-flight":C.cyan,departed:C.cyan,landed:C.emerald,arrived:C.emerald,delayed:C.hot,cancelled:C.hot};

export default function TrackPage({ params }: { params: { ref: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/track?ref=" + params.ref)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.ref]);

  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "TBD"; } };
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch { return "TBD"; } };

  if (loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}} />
        <div style={{color:C.sub,fontSize:14}}>Tracking your booking...</div>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:400,padding:32}}>
        <div style={{fontSize:48,marginBottom:16,opacity:0.3}}>&#128270;</div>
        <h2 style={{color:C.text,margin:"0 0 8px",fontSize:20}}>Booking Not Found</h2>
        <p style={{color:C.sub,fontSize:14,margin:"0 0 24px"}}>{error}</p>
        <Link href="/#track" style={{color:C.accent,fontSize:14,textDecoration:"none"}}>&#8592; Try Another Reference</Link>
      </div>
    </div>
  );

  if (!data) return null;

  const currentStep = statusSteps.indexOf(data.status);
  const isCancelled = data.status === "cancelled";

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}"}</style>

      <div style={{maxWidth:700,margin:"0 auto",animation:"fadeUp 0.6s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <Link href="/" style={{color:C.dim,fontSize:13,textDecoration:"none"}}>&#8592; Back to Home</Link>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
        </div>

        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>BOOKING REFERENCE</div>
              <div style={{fontSize:28,fontWeight:700,color:C.accent,letterSpacing:4,fontFamily:"monospace"}}>{data.bookingReference}</div>
            </div>
            <span style={{padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:(statusColors[data.status]||C.dim)+"15",color:statusColors[data.status]||C.dim,textTransform:"uppercase",letterSpacing:1}}>{data.status}</span>
          </div>

          {!isCancelled && (
            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                {statusSteps.map((step, i) => (
                  <div key={step} style={{display:"flex",alignItems:"center",flex:i<statusSteps.length-1?1:0}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>
                      <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<=currentStep?C.emerald+"20":C.surface,border:"2px solid "+(i<=currentStep?C.emerald:C.border),fontSize:12,color:i<=currentStep?C.emerald:C.dim,fontWeight:700}}>
                        {i<=currentStep?"\u2713":i+1}
                      </div>
                      <div style={{fontSize:8,color:i<=currentStep?C.emerald:C.dim,marginTop:4,textTransform:"capitalize",letterSpacing:0.5}}>{step.replace("-"," ")}</div>
                    </div>
                    {i<statusSteps.length-1&&(
                      <div style={{flex:1,height:2,background:i<currentStep?C.emerald:C.border,margin:"0 4px",marginBottom:16}} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.flight && (
            <div style={{padding:"28px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.departure.airportCode}</div>
                  <div style={{color:C.dim,fontSize:12}}>{data.flight.departure.city}</div>
                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.departure.scheduledTime)}</div>
                </div>
                <div style={{flex:1,textAlign:"center",padding:"0 20px"}}>
                  <div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div>
                  <div style={{borderTop:"1px dashed "+C.border,margin:"8px 0"}} />
                  <div style={{display:"flex",justifyContent:"center",gap:8,alignItems:"center"}}>
                    <span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(flightStatusColors[data.flight.status]||C.dim)+"15",color:flightStatusColors[data.flight.status]||C.dim,textTransform:"uppercase"}}>{data.flight.status}</span>
                  </div>
                  <div style={{color:C.dim,fontSize:10,marginTop:4}}>{data.flight.aircraft}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{color:C.text,fontSize:32,fontWeight:700}}>{data.flight.arrival.airportCode}</div>
                  <div style={{color:C.dim,fontSize:12}}>{data.flight.arrival.city}</div>
                  <div style={{color:C.accent,fontSize:16,fontWeight:600,marginTop:4}}>{fmtTime(data.flight.arrival.scheduledTime)}</div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.border,borderRadius:10,overflow:"hidden"}}>
                {[
                  {l:"DATE",v:fmtDate(data.flight.departure.scheduledTime)},
                  {l:"GATE",v:data.flight.departure.gate||"TBD"},
                  {l:"TERMINAL",v:data.flight.departure.terminal||"TBD"},
                  {l:"DURATION",v:Math.floor(data.flight.duration/60)+"h "+data.flight.duration%60+"m"},
                ].map((f,i)=>(
                  <div key={i} style={{background:C.surface,padding:"12px 14px"}}>
                    <div style={{color:C.dim,fontSize:8,letterSpacing:1,marginBottom:4}}>{f.l}</div>
                    <div style={{color:C.text,fontSize:13,fontWeight:600}}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PAYMENT</div>
            <div style={{fontSize:22,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>{"$"}{data.payment?.amount?.toLocaleString()||"0"}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,background:(data.payment?.status==="completed"?C.emerald:C.amber)+"15",color:data.payment?.status==="completed"?C.emerald:C.amber,textTransform:"uppercase"}}>{data.payment?.status}</span>
              <span style={{padding:"3px 8px",borderRadius:5,fontSize:10,background:C.surface,color:C.dim,textTransform:"uppercase"}}>{data.payment?.method}</span>
            </div>
          </div>
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:8}}>PASSENGERS</div>
            <div style={{fontSize:22,fontWeight:700,color:C.text}}>{data.passengerCount}</div>
            <div style={{marginTop:8}}>
              {data.passengers?.map((p:any,i:number)=>(
                <div key={i} style={{fontSize:12,color:C.sub,marginBottom:2}}>{p.firstName} {p.lastName}</div>
              ))}
            </div>
          </div>
        </div>

        {data.boardingPassAvailable && (
          <div style={{display:"flex",gap:12}}>
            <Link href={"/boarding-pass/"+data.bookingReference} style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",textDecoration:"none",fontWeight:700,fontSize:14}}>View Boarding Pass</Link>
            <Link href="/checkin" style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,border:"1px solid "+C.border,background:C.card,color:C.text,textDecoration:"none",fontWeight:600,fontSize:14}}>Online Check-In</Link>
            <Link href={"/invoice/"+data.bookingReference} style={{flex:1,display:"block",textAlign:"center",padding:"14px",borderRadius:12,border:"1px solid "+C.border,background:C.card,color:C.sub,textDecoration:"none",fontWeight:600,fontSize:14}}>Download Invoice</Link>
          </div>
        )}
      </div>
    </div>
  );
}