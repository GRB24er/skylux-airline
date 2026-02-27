"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",hot:"#f43f5e",emerald:"#34d399",amber:"#fbbf24",violet:"#a78bfa"};
const tierC:Record<string,string>={standard:C.textSoft,silver:"#94a3b8",gold:C.amber,platinum:C.accentLight,diamond:C.cyan};

export default function CustomersPage() {
  const [users,setUsers]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("");

  useEffect(()=>{
    fetch("/api/users").then(r=>r.json()).then(d=>{if(d.success)setUsers(d.data?.users||[]);}).finally(()=>setLoading(false));
  },[]);

  const filtered=users.filter(u=>{if(!filter)return true;const s=filter.toLowerCase();return u.firstName?.toLowerCase().includes(s)||u.lastName?.toLowerCase().includes(s)||u.email?.toLowerCase().includes(s)||u.role?.toLowerCase().includes(s)||u.loyaltyTier?.toLowerCase().includes(s);});

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{width:36,height:36,border:`3px solid ${C.accent}20`,borderTop:`3px solid ${C.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  return (
    <div style={{padding:"28px 32px",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Customers & Users</h1><p style={{fontSize:13,color:C.textDim}}>{users.length} registered users</p></div>
        <input placeholder="Search users..." value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 14px",background:C.glass,border:`1px solid ${C.glassBorder}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",width:220}} />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Total",v:users.length,c:C.accent},{l:"Customers",v:users.filter(u=>u.role==="customer").length,c:C.cyan},{l:"Admins",v:users.filter(u=>["admin","superadmin"].includes(u.role)).length,c:C.amber},{l:"Crew",v:users.filter(u=>["pilot","crew"].includes(u.role)).length,c:C.emerald}].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:14,padding:"16px 18px"}}><div style={{fontSize:11,color:C.textDim,marginBottom:4}}>{s.l}</div><div className="mono" style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.glassBorder}`,borderRadius:18,overflow:"hidden"}}>
        {filtered.length===0?(
          <div style={{padding:"60px 0",textAlign:"center",color:C.textDim}}><div style={{fontSize:36,marginBottom:12}}>👥</div><div style={{fontSize:15,fontWeight:600}}>{users.length===0?"No users yet":"No matching users"}</div></div>
        ):(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${C.glassBorder}`}}>{["Name","Email","Role","Tier","Points","Joined"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:1}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((u:any,i:number)=>(
              <tr key={u._id} style={{borderBottom:`1px solid ${C.glassBorder}08`,animation:`fadeUp 0.3s ease-out ${i*0.02}s both`}} onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(255,255,255,0.015)"} onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:600}}>{u.firstName} {u.lastName}</td>
                <td className="mono" style={{padding:"12px 14px",fontSize:12,color:C.textSoft}}>{u.email}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:u.role==="superadmin"?C.hot+"12":u.role==="admin"?C.amber+"12":["pilot","crew"].includes(u.role)?C.violet+"12":C.cyan+"12",color:u.role==="superadmin"?C.hot:u.role==="admin"?C.amber:["pilot","crew"].includes(u.role)?C.violet:C.cyan}}>{u.role}</span></td>
                <td style={{padding:"12px 14px"}}><span style={{fontSize:12,fontWeight:600,color:tierC[u.loyaltyTier]||C.textDim,textTransform:"capitalize"}}>{u.loyaltyTier||"—"}</span></td>
                <td className="mono" style={{padding:"12px 14px",fontSize:12}}>{u.loyaltyPoints?.toLocaleString()||0}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textDim}}>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
