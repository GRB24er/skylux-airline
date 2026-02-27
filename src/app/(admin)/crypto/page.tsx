"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",surface:"#0a0f1e",card:"#0c1121",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",emerald:"#34d399",amber:"#fbbf24",red:"#ef4444",cyan:"#22d3ee",orange:"#f97316",btc:"#f7931a",eth:"#627eea",usdt:"#26a17b"};

const PRESETS = [
  {currency:"Bitcoin",symbol:"BTC",network:"Bitcoin Mainnet",icon:"₿",color:C.btc},
  {currency:"Ethereum",symbol:"ETH",network:"ERC-20",icon:"Ξ",color:C.eth},
  {currency:"USDT",symbol:"USDT",network:"TRC-20 (Tron)",icon:"₮",color:C.usdt},
  {currency:"USDT",symbol:"USDT",network:"ERC-20 (Ethereum)",icon:"₮",color:C.usdt},
  {currency:"USDT",symbol:"USDT",network:"BEP-20 (BSC)",icon:"₮",color:C.usdt},
  {currency:"USDC",symbol:"USDC",network:"ERC-20",icon:"$",color:"#2775ca"},
  {currency:"Litecoin",symbol:"LTC",network:"Litecoin Mainnet",icon:"Ł",color:"#bfbbbb"},
  {currency:"Bitcoin Cash",symbol:"BCH",network:"Bitcoin Cash",icon:"₿",color:"#0ac18e"},
  {currency:"Solana",symbol:"SOL",network:"Solana Mainnet",icon:"◎",color:"#9945ff"},
  {currency:"XRP",symbol:"XRP",network:"XRP Ledger",icon:"✕",color:"#23292f"},
];

const STATUS_COLORS: Record<string,string> = {pending:C.amber,confirming:C.cyan,confirmed:C.emerald,expired:C.dim,failed:C.red};

export default function CryptoAdmin() {
  const [tab, setTab] = useState<"wallets"|"payments">("wallets");
  const [wallets, setWallets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({currency:"",symbol:"",network:"",address:"",icon:"₿"});
  const [saving, setSaving] = useState(false);
  const [payFilter, setPayFilter] = useState("");

  const fetchWallets = async()=>{try{const r=await fetch("/api/admin/crypto-wallets");const d=await r.json();if(d.success)setWallets(d.data.wallets)}catch{}};
  const fetchPayments = async()=>{try{const url=payFilter?`/api/admin/crypto-payments?status=${payFilter}`:"/api/admin/crypto-payments";const r=await fetch(url);const d=await r.json();if(d.success)setPayments(d.data.payments)}catch{}};

  useEffect(()=>{setLoading(true);Promise.all([fetchWallets(),fetchPayments()]).then(()=>setLoading(false))},[]);
  useEffect(()=>{fetchPayments()},[payFilter]);

  // Auto-refresh payments every 10s
  useEffect(()=>{const iv=setInterval(fetchPayments,10000);return()=>clearInterval(iv)},[payFilter]);

  const addWallet = async()=>{
    if(!form.currency||!form.symbol||!form.network||!form.address)return;
    setSaving(true);
    try{const r=await fetch("/api/admin/crypto-wallets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(d.success){fetchWallets();setShowAdd(false);setForm({currency:"",symbol:"",network:"",address:"",icon:"₿"})}}catch{}
    setSaving(false);
  };

  const toggleWallet = async(id:string,active:boolean)=>{
    await fetch("/api/admin/crypto-wallets",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,isActive:!active})});
    fetchWallets();
  };

  const deleteWallet = async(id:string)=>{
    if(!confirm("Delete this wallet?"))return;
    await fetch(`/api/admin/crypto-wallets?id=${id}`,{method:"DELETE"});
    fetchWallets();
  };

  const updatePayment = async(id:string,status:string)=>{
    await fetch("/api/admin/crypto-payments",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    fetchPayments();
  };

  const selectPreset = (p:typeof PRESETS[0])=>{setForm({currency:p.currency,symbol:p.symbol,network:p.network,address:"",icon:p.icon});setShowAdd(true)};

  const pendingCount = payments.filter(p=>p.status==="pending").length;

  return(
    <div style={{padding:"24px 32px",maxWidth:1200}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:0}}>Crypto Payments</h1>
          <p style={{fontSize:13,color:C.sub,marginTop:4}}>Manage wallet addresses and monitor incoming crypto payments</p>
        </div>
        {pendingCount>0&&<div style={{padding:"8px 16px",borderRadius:10,background:C.amber+"15",border:`1px solid ${C.amber}30`,display:"flex",alignItems:"center",gap:8,animation:"pulse 2s infinite"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.amber}}/>
          <span style={{fontSize:13,fontWeight:700,color:C.amber}}>{pendingCount} Pending Payment{pendingCount>1?"s":""}</span>
        </div>}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {(["wallets","payments"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${tab===t?C.accent+"40":C.border}`,background:tab===t?C.accent+"12":"transparent",color:tab===t?C.accentLight:C.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
            {t==="wallets"?"Wallet Addresses":"Payment Requests"}
            {t==="payments"&&pendingCount>0&&<span style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:9,background:C.red,color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* ═══ WALLETS TAB ═══ */}
      {tab==="wallets"&&(<div>
        {/* Quick presets */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.sub,letterSpacing:1,marginBottom:12}}>QUICK ADD CRYPTOCURRENCY</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {PRESETS.map((p,i)=>(
              <button key={i} onClick={()=>selectPreset(p)} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+"50";e.currentTarget.style.background=p.color+"08"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:14}}>{p.icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.text}}>{p.symbol}</span>
                <span style={{fontSize:10,color:C.dim}}>{p.network}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add form */}
        {showAdd&&(<div style={{background:C.card,border:`1px solid ${C.accent}30`,borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accentLight,marginBottom:14}}>Add Wallet Address</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 0.5fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:4}}>CURRENCY</label><input value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
            <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:4}}>SYMBOL</label><input value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value.toUpperCase()}))} style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
            <div><label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:4}}>NETWORK</label><input value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))} style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:700,color:C.dim,display:"block",marginBottom:4}}>WALLET ADDRESS</label>
            <input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Paste your wallet address here..." style={{width:"100%",padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:14,fontFamily:"'JetBrains Mono',monospace",outline:"none",boxSizing:"border-box",letterSpacing:0.5}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowAdd(false)} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={addWallet} disabled={saving||!form.address} style={{padding:"8px 22px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,color:"white",fontSize:12,fontWeight:700,cursor:saving?"wait":"pointer",fontFamily:"inherit",opacity:!form.address?0.4:1}}>{saving?"Saving...":"Save Wallet"}</button>
          </div>
        </div>)}

        {!showAdd&&<button onClick={()=>setShowAdd(true)} style={{padding:"10px 20px",borderRadius:10,border:`1px dashed ${C.border}`,background:"transparent",color:C.sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%",marginBottom:16}}>+ Add Custom Wallet</button>}

        {/* Wallet list */}
        {wallets.length===0&&!loading&&<div style={{textAlign:"center",padding:"40px",color:C.dim}}>No wallets configured. Add one above to start accepting crypto.</div>}
        {wallets.map(w=>(
          <div key={w._id} style={{background:C.card,border:`1px solid ${w.isActive?C.border:C.red+"30"}`,borderRadius:14,padding:"16px 20px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:40,height:40,borderRadius:10,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1px solid ${C.border}`}}>{w.icon||"₿"}</div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.text}}>{w.symbol}</span>
                  <span style={{fontSize:11,color:C.sub}}>{w.currency}</span>
                  <span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:w.isActive?C.emerald+"15":C.red+"15",color:w.isActive?C.emerald:C.red}}>{w.isActive?"ACTIVE":"DISABLED"}</span>
                </div>
                <div style={{fontSize:11,color:C.dim,marginTop:2}}>{w.network}</div>
                <div style={{fontSize:12,color:C.accentLight,fontFamily:"'JetBrains Mono',monospace",marginTop:3,letterSpacing:0.3}}>{w.address.slice(0,20)}...{w.address.slice(-8)}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>navigator.clipboard.writeText(w.address)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Copy</button>
              <button onClick={()=>toggleWallet(w._id,w.isActive)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${w.isActive?C.amber+"30":C.emerald+"30"}`,background:"transparent",color:w.isActive?C.amber:C.emerald,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{w.isActive?"Disable":"Enable"}</button>
              <button onClick={()=>deleteWallet(w._id)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.red}30`,background:"transparent",color:C.red,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ PAYMENTS TAB ═══ */}
      {tab==="payments"&&(<div>
        {/* Filters */}
        <div style={{display:"flex",gap:4,marginBottom:16}}>
          {["","pending","confirming","confirmed","expired","failed"].map(s=>(
            <button key={s} onClick={()=>setPayFilter(s)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${payFilter===s?C.accent+"40":C.border}`,background:payFilter===s?C.accent+"12":"transparent",color:payFilter===s?C.accentLight:C.sub,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{s||"All"}</button>
          ))}
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.dim}}><div style={{width:6,height:6,borderRadius:3,background:C.emerald,animation:"pulse 2s infinite"}}/>Auto-refreshing</div>
        </div>

        {payments.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.dim}}>No payment requests {payFilter?`with status "${payFilter}"`:"yet"}</div>}
        {payments.map(p=>(
          <div key={p._id} style={{background:C.card,border:`1px solid ${p.status==="pending"?C.amber+"30":C.border}`,borderRadius:14,padding:"18px 22px",marginBottom:8,boxShadow:p.status==="pending"?`0 0 20px ${C.amber}08`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:(STATUS_COLORS[p.status]||C.dim)+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:STATUS_COLORS[p.status]||C.dim}}>{p.symbol?.charAt(0)||"₿"}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.text}}>{p.userName}</span>
                    <span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:(STATUS_COLORS[p.status]||C.dim)+"15",color:STATUS_COLORS[p.status]||C.dim,textTransform:"uppercase"}}>{p.status}</span>
                    {p.status==="pending"&&<span style={{padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,background:C.red+"15",color:C.red,animation:"pulse 1.5s infinite"}}>ACTION REQUIRED</span>}
                  </div>
                  <div style={{fontSize:11,color:C.dim,marginTop:2}}>{p.userEmail} · {new Date(p.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.amber}}>${p.amountUSD?.toLocaleString()}</div>
                <div style={{fontSize:11,color:C.sub}}>{p.symbol} · {p.network}</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{padding:"10px 14px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:1,marginBottom:3}}>BOOKING</div>
                <div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:C.accentLight}}>{p.bookingReference}</div>
                {p.flightDetails?.flightNumber&&<div style={{fontSize:11,color:C.sub,marginTop:2}}>{p.flightDetails.flightNumber} · {p.flightDetails.from} → {p.flightDetails.to}</div>}
              </div>
              <div style={{padding:"10px 14px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:1,marginBottom:3}}>WALLET ADDRESS</div>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:C.text,wordBreak:"break-all"}}>{p.walletAddress}</div>
              </div>
            </div>

            {p.status==="pending"&&(
              <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                <button onClick={()=>updatePayment(p._id,"confirming")} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.cyan}30`,background:C.cyan+"08",color:C.cyan,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Mark Confirming</button>
                <button onClick={()=>updatePayment(p._id,"confirmed")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.emerald},#22c55e)`,color:"#0a2015",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓ Confirm Payment</button>
                <button onClick={()=>updatePayment(p._id,"failed")} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.red}30`,background:"transparent",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Reject</button>
              </div>
            )}
            {p.status==="confirming"&&(
              <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                <button onClick={()=>updatePayment(p._id,"confirmed")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.emerald},#22c55e)`,color:"#0a2015",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓ Confirm Payment</button>
              </div>
            )}
          </div>
        ))}
      </div>)}

      <style dangerouslySetInnerHTML={{__html:`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}@media(max-width:768px){.admin-grid{grid-template-columns:1fr!important}.admin-flex{flex-direction:column!important;gap:8px!important}}`}}/>
    </div>
  );
}
