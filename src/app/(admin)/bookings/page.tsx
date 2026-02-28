"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",glassBorderHover:"rgba(255,255,255,0.12)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
const statusColors:Record<string,string>={confirmed:C.emerald,pending:C.amber,cancelled:C.hot,completed:C.cyan,refunded:C.violet};

export default function BookingsPage() {
  const [bookings,setBookings]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("");
  const [sendingEmail,setSendingEmail]=useState<string|null>(null);
  const [emailMsg,setEmailMsg]=useState("");
  const [showEmailModal,setShowEmailModal]=useState(false);
  const [emailTarget,setEmailTarget]=useState<any>(null);
  const [customSubject,setCustomSubject]=useState("");
  const [customBody,setCustomBody]=useState("");
  const [expandedBooking,setExpandedBooking]=useState<string|null>(null);

  const load=()=>{setLoading(true);fetch("/api/bookings?limit=100").then(r=>r.json()).then(d=>{if(d.success)setBookings(d.data?.bookings||[]);}).finally(()=>setLoading(false));};
  useEffect(load,[]);

  const cancelBooking=async(id:string)=>{
    if(!confirm("Cancel this booking?"))return;
    await fetch("/api/bookings/cancel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:id,reason:"Admin cancellation"})});
    load();
  };

  const sendBookingEmail=async(bookingId:string,type:string)=>{
    setSendingEmail(bookingId+type);setEmailMsg("");
    try{
      const res=await fetch("/api/admin/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId,type})});
      const d=await res.json();
      setEmailMsg(d.success?("Done: "+d.message):("Error: "+(d.error||"Failed")));
    }catch{setEmailMsg("Error: Network error")}
    setTimeout(()=>{setSendingEmail(null);setEmailMsg("")},3000);
  };

  const sendCustomEmail=async()=>{
    if(!customSubject.trim()||!customBody.trim())return;
    setSendingEmail("custom");
    const toEmail=emailTarget?.contactEmail||emailTarget?.user?.email;
    try{
      const res=await fetch("/api/admin/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"custom",toEmail,customSubject,customBody})});
      const d=await res.json();
      setEmailMsg(d.success?"Done: Sent!":"Error: Failed");
      if(d.success){setTimeout(()=>{setShowEmailModal(false);setCustomSubject("");setCustomBody("");setEmailMsg("");setSendingEmail(null)},1500)}
      else setSendingEmail(null);
    }catch{setEmailMsg("Error: Network error");setSendingEmail(null)}
  };

  const filtered=bookings.filter(b=>{if(!filter)return true;const s=filter.toLowerCase();return b.bookingReference?.toLowerCase().includes(s)||b.passengers?.[0]?.firstName?.toLowerCase().includes(s)||b.passengers?.[0]?.lastName?.toLowerCase().includes(s)||b.cabinClass?.toLowerCase().includes(s)||b.status?.toLowerCase().includes(s)||b.contactEmail?.toLowerCase().includes(s);});
  const total=bookings.reduce((a:number,b:any)=>a+(b.payment?.amount||0),0);

  const btn=(label:string,color:string,onClick:()=>void,disabled?:boolean)=>(
    <button onClick={onClick} disabled={disabled} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+color+"25",background:disabled?color+"08":"transparent",color:disabled?color+"60":color,fontSize:10,fontWeight:600,cursor:disabled?"wait":"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s"}}>{label}</button>
  );

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:"3px solid "+C.accent+"20",borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{".mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Bookings</h1><p style={{fontSize:13,color:C.textDim}}>{bookings.length} bookings - Total revenue: <span className="mono" style={{color:C.emerald,fontWeight:600}}>${total.toLocaleString()}</span></p></div>
        <input placeholder="Search bookings, emails..." value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 14px",background:C.glass,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:260}} />
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Confirmed",v:bookings.filter(b=>b.status==="confirmed").length,c:C.emerald},{l:"Pending",v:bookings.filter(b=>b.status==="pending").length,c:C.amber},{l:"Cancelled",v:bookings.filter(b=>b.status==="cancelled").length,c:C.hot},{l:"Total Revenue",v:"$"+total.toLocaleString(),c:C.accent}].map((s,i)=>(
          <div key={i} style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:14,padding:"16px 18px"}}><div style={{fontSize:11,color:C.textDim,marginBottom:4}}>{s.l}</div><div className="mono" style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>

      {emailMsg&&!showEmailModal&&<div style={{padding:"10px 16px",marginBottom:14,borderRadius:10,background:emailMsg.startsWith("Done")?C.emerald+"12":C.hot+"12",border:"1px solid "+(emailMsg.startsWith("Done")?C.emerald:C.hot)+"25",fontSize:13,color:emailMsg.startsWith("Done")?C.emerald:C.hot,fontWeight:600}}>{emailMsg}</div>}

      <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:18,overflow:"hidden"}}>
        {filtered.length===0?(<div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}><div style={{fontSize:15,fontWeight:600}}>{bookings.length===0?"No bookings yet":"No matching bookings"}</div></div>):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid "+C.glassBorder}}>{["Reference","Passenger","Email","Route","Class","Amount","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((b:any,i:number)=>{
              const flight=b.flights?.[0]?.flight;
              const isExpanded=expandedBooking===b._id;
              return [
              <tr key={b._id} style={{borderBottom:"1px solid "+C.glassBorder+"08",cursor:"pointer"}}
                onClick={()=>setExpandedBooking(isExpanded?null:b._id)}>
                <td className="mono" style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.accentLight}}>{b.bookingReference}</td>
                <td style={{padding:"12px 14px",fontSize:13}}>{b.passengers?.[0]?.firstName} {b.passengers?.[0]?.lastName}{b.passengers?.length>1?" +"+String(b.passengers.length-1):""}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textSoft}}>{b.contactEmail||"-"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{flight?.departure?.airportCode||"?"} - {flight?.arrival?.airportCode||"?"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textSoft,textTransform:"capitalize"}}>{b.cabinClass}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:13,fontWeight:600}}>${b.payment?.amount?.toLocaleString()||"0"}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:(statusColors[b.status]||C.textDim)+"12",color:statusColors[b.status]||C.textDim}}>{b.status}</span></td>
                <td style={{padding:"12px 14px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {b.status==="confirmed"&&<>{btn("Send Confirm",C.emerald,()=>sendBookingEmail(b._id,"confirmation"),sendingEmail===b._id+"confirmation")}{btn("E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}{btn("Cancel",C.hot,()=>cancelBooking(b._id))}</>}
                  {b.status==="pending"&&btn("Cancel",C.hot,()=>cancelBooking(b._id))}
                  {btn("Custom Email",C.accentLight,()=>{setEmailTarget(b);setShowEmailModal(true)})}
                  </div>
                </td>
              </tr>,
              isExpanded?(<tr key={b._id+"exp"}><td colSpan={8} style={{padding:0}}>
                <div style={{padding:"16px 24px",background:"rgba(99,102,241,0.03)",borderBottom:"1px solid "+C.glassBorder}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:12}}>
                    <div><div style={{fontSize:10,color:C.textDim,letterSpacing:1}}>FLIGHT</div><div className="mono" style={{fontSize:14,fontWeight:600,color:C.text}}>{flight?.flightNumber||"N/A"}</div></div>
                    <div><div style={{fontSize:10,color:C.textDim,letterSpacing:1}}>DATE</div><div style={{fontSize:13,color:C.text}}>{flight?.departure?.scheduledTime?new Date(flight.departure.scheduledTime).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"TBD"}</div></div>
                    <div><div style={{fontSize:10,color:C.textDim,letterSpacing:1}}>DEPARTURE</div><div style={{fontSize:13,color:C.text}}>{flight?.departure?.scheduledTime?new Date(flight.departure.scheduledTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}):"TBD"}</div></div>
                    <div><div style={{fontSize:10,color:C.textDim,letterSpacing:1}}>PAYMENT</div><div style={{fontSize:13,color:b.payment?.status==="completed"?C.emerald:C.amber,fontWeight:600,textTransform:"capitalize"}}>{b.payment?.status||"unknown"}</div></div>
                  </div>
                  <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:6}}>PASSENGERS</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    {b.passengers?.map((p:any,pi:number)=>(
                      <div key={pi} style={{padding:"6px 12px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:8,fontSize:12}}>
                        <span style={{fontWeight:600}}>{p.firstName} {p.lastName}</span>
                        <span style={{color:C.textDim,marginLeft:8}}>{p.nationality} - {p.passportNumber}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <a href="/checkin" target="_blank" rel="noreferrer" style={{padding:"6px 14px",borderRadius:8,background:C.accent+"15",border:"1px solid "+C.accent+"25",color:C.accentLight,fontSize:11,fontWeight:700,textDecoration:"none"}}>Check-In Page</a>
                    <a href={"/boarding-pass/"+b.bookingReference} target="_blank" rel="noreferrer" style={{padding:"6px 14px",borderRadius:8,background:C.cyan+"15",border:"1px solid "+C.cyan+"25",color:C.cyan,fontSize:11,fontWeight:700,textDecoration:"none"}}>Boarding Pass</a>
                    {btn("Send Confirmation",C.emerald,()=>sendBookingEmail(b._id,"confirmation"),sendingEmail===b._id+"confirmation")}
                    {btn("Send E-Ticket",C.cyan,()=>sendBookingEmail(b._id,"eticket"),sendingEmail===b._id+"eticket")}
                  </div>
                </div>
              </td></tr>):null
              ];
            })}</tbody>
          </table>
        )}
      </div>

      {showEmailModal&&emailTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>{setShowEmailModal(false);setEmailMsg("")}}>
          <div style={{background:C.card,border:"1px solid "+C.glassBorder,borderRadius:20,padding:32,width:"100%",maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Send Email</h3>
            <p style={{fontSize:12,color:C.textDim,marginBottom:20}}>To: {emailTarget.contactEmail||emailTarget.user?.email||"N/A"} - Ref: {emailTarget.bookingReference}</p>
            {emailMsg&&<div style={{padding:"8px 14px",marginBottom:14,borderRadius:8,background:emailMsg.startsWith("Done")?C.emerald+"12":C.hot+"12",color:emailMsg.startsWith("Done")?C.emerald:C.hot,fontSize:12,fontWeight:600}}>{emailMsg}</div>}
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1,marginBottom:4}}>SUBJECT</label>
              <input value={customSubject} onChange={e=>setCustomSubject(e.target.value)} placeholder="Email subject..." style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1,marginBottom:4}}>MESSAGE (HTML supported)</label>
              <textarea value={customBody} onChange={e=>setCustomBody(e.target.value)} placeholder="Enter your message..." rows={6} style={{width:"100%",padding:"10px 14px",background:C.surface,border:"1px solid "+C.glassBorder,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowEmailModal(false);setEmailMsg("")}} style={{padding:"10px 20px",borderRadius:10,border:"1px solid "+C.glassBorder,background:"transparent",color:C.textSoft,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={sendCustomEmail} disabled={sendingEmail==="custom"||!customSubject.trim()||!customBody.trim()} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+C.accent+",#7c3aed)",color:"white",fontSize:13,fontWeight:700,cursor:sendingEmail==="custom"?"wait":"pointer",fontFamily:"inherit",opacity:(!customSubject.trim()||!customBody.trim())?0.5:1}}>
                {sendingEmail==="custom"?"Sending...":"Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}