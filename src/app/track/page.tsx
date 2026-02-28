"use client";
import { useState } from "react";

const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8"};

export default function TrackIndex() {
  const [ref, setRef] = useState("");
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{textAlign:"center",maxWidth:480}}>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:3,color:C.text,marginBottom:4}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
        <div style={{fontSize:11,letterSpacing:4,color:C.dim,marginBottom:40}}>BOOKING TRACKER</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:32}}>
          <h2 style={{color:C.text,fontSize:20,fontWeight:600,marginBottom:8}}>Track Your Booking</h2>
          <p style={{color:C.sub,fontSize:13,marginBottom:24}}>Enter your booking reference to view real-time status and flight details.</p>
          <div style={{display:"flex",gap:10}}>
            <input value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} placeholder="e.g. SLX-AB1234"
              onKeyDown={e=>{if(e.key==="Enter"&&ref.trim())window.location.href="/track/"+ref.trim()}}
              style={{flex:1,padding:"14px 16px",background:C.surface,border:"1px solid "+C.border,borderRadius:10,color:C.text,fontSize:15,fontFamily:"monospace",outline:"none",letterSpacing:2}} />
            <button onClick={()=>{if(ref.trim())window.location.href="/track/"+ref.trim()}}
              style={{padding:"14px 28px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Track</button>
          </div>
        </div>
      </div>
    </div>
  );
}