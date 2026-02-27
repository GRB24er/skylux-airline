"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const C = {bg:"#030614",card:"#0c1121",glass:"rgba(255,255,255,0.02)",glassBorder:"rgba(255,255,255,0.06)",text:"#f0f0f5",textSoft:"#8892b0",textDim:"#5a6480",accent:"#6366f1",accentLight:"#818cf8",cyan:"#22d3ee",emerald:"#34d399",hot:"#f43f5e"};

export default function SetupPage() {
  const [needed, setNeeded] = useState<boolean|null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    fetch("/api/setup").then(r=>r.json()).then(d => {
      if (d.success) setNeeded(d.data.setupRequired);
      else setNeeded(false);
    }).catch(() => setNeeded(false));
  }, []);

  const handleSetup = async () => {
    if (!form.firstName||!form.lastName||!form.email||!form.password) { setError("All fields required"); return; }
    if (form.password.length < 8) { setError("Password min 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.error || "Setup failed");
    } catch (e) { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: C.text }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}input::placeholder{color:${C.textDim};}`}</style>

      <div style={{ width: 460, animation: "fadeUp 0.5s ease-out both" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accent+"18", border: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>✈</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>SKYLUX AIRWAYS</h1>
          <p style={{ fontSize: 12, color: C.accentLight, letterSpacing: 4, fontWeight: 600 }}>INITIAL SETUP</p>
        </div>

        {needed === null && <div style={{ textAlign: "center", color: C.textDim }}>Checking...</div>}

        {needed === false && !done && (
          <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Setup Complete</h2>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 20 }}>An admin account already exists.</p>
            <Link href="/auth" style={{ padding: "10px 24px", borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Go to Sign In →</Link>
          </div>
        )}

        {needed === true && !done && (
          <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Create Superadmin Account</h2>
            <p style={{ fontSize: 12, color: C.textDim, marginBottom: 20 }}>This is the first account. It gets full admin access.</p>

            {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: C.hot+"12", border: `1px solid ${C.hot}25`, color: C.hot, fontSize: 12, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[["firstName","First Name","Patrick"],["lastName","Last Name","Admin"]].map(([key,label,ph]) => (
                <div key={key}><label style={{ fontSize: 11, fontWeight: 600, color: C.textSoft }}>{label}</label><input value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} style={{ width: "100%", padding: "11px 14px", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", marginTop: 4 }} /></div>
              ))}
            </div>
            {[["email","Email","admin@skyluxairways.com"],["password","Password","Min 8 characters"]].map(([key,label,ph]) => (
              <div key={key} style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.textSoft }}>{label}</label><input type={key==="password"?"password":"email"} value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} style={{ width: "100%", padding: "11px 14px", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: key==="email"?"'JetBrains Mono',monospace":"inherit", outline: "none", marginTop: 4 }} /></div>
            ))}
            <button onClick={handleSetup} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: loading?"wait":"pointer", opacity: loading?0.7:1, marginTop: 4 }}>
              {loading ? "Creating..." : "Create Superadmin"}
            </button>
          </div>
        )}

        {done && (
          <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: 28, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emerald+"15", border: `1px solid ${C.emerald}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>✓</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Admin Created!</h2>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>Login with your credentials, then:</p>
            <div style={{ textAlign: "left", padding: "14px 18px", borderRadius: 12, background: C.glass, border: `1px solid ${C.glassBorder}`, marginBottom: 20 }}>
              {[
                "1. Go to Fleet → Add your aircraft",
                "2. Go to Flights → Create flights with routes & pricing",
                "3. Customers can now search and book real flights",
              ].map((s,i) => <div key={i} style={{ fontSize: 12, color: C.textSoft, padding: "4px 0" }}>{s}</div>)}
            </div>
            <Link href="/auth" style={{ display: "inline-flex", padding: "12px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: "white", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Sign In as Admin →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
