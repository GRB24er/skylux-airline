"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#030614", surface: "#0a0f1e",
  card: "#0c1121", glass: "rgba(255,255,255,0.02)",
  glassBorder: "rgba(255,255,255,0.06)", glassBorderHover: "rgba(255,255,255,0.12)",
  text: "#f0f0f5", textSoft: "#8892b0", textDim: "#5a6480",
  accent: "#6366f1", accentLight: "#818cf8",
  cyan: "#22d3ee", hot: "#f43f5e", emerald: "#34d399", amber: "#fbbf24",
};

const Input = ({ label, type = "text", placeholder, value, onChange, error }: any) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>{label}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{
      width: "100%", padding: "12px 14px",
      background: C.glass, border: `1px solid ${error ? C.hot + "60" : C.glassBorder}`,
      borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "'Plus Jakarta Sans', system-ui",
      outline: "none", transition: "all 0.2s",
    }}
      onFocus={e => { e.target.style.borderColor = C.accent + "60"; e.target.style.boxShadow = `0 0 0 3px ${C.accent}15`; }}
      onBlur={e => { e.target.style.borderColor = error ? C.hot + "60" : C.glassBorder; e.target.style.boxShadow = "none"; }}
    />
    {error && <div style={{ fontSize: 11, color: C.hot, marginTop: 4 }}>{error}</div>}
  </div>
);

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [page, setPage] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    const res = await login(loginEmail, loginPassword);
    if (!res.success) setError(res.error || "Login failed");
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !regEmail || !regPassword) { setError("All fields required"); return; }
    if (regPassword !== regConfirm) { setError("Passwords don't match"); return; }
    if (regPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    const res = await register({ firstName, lastName, email: regEmail, phone: regPhone, password: regPassword });
    if (!res.success) setError(res.error || "Registration failed");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{ width: "45%", minHeight: "100vh", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${C.bg}, #0c0a2a, #0a1628)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}15, transparent 70%)`, top: -100, left: -100, animation: "glow 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}12, transparent 70%)`, bottom: -50, right: -50, animation: "glow 5s ease-in-out infinite 1s" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 40 }}>
            <img src="/images/logo.png" alt="SKYLUX" style={{ width: 56, height: 56, borderRadius: 16, objectFit: "contain", animation: "float 6s ease-in-out infinite" }} />
            <div style={{ textAlign: "left" }}><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>SKYLUX</div><div style={{ fontSize: 10, letterSpacing: 6, color: C.accentLight, fontWeight: 600 }}>AIRWAYS</div></div>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
            {page === "login" && "Welcome back to the skies"}
            {page === "register" && "Begin your journey with us"}
            {page === "forgot" && "Reset your password"}
          </h2>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginBottom: 40 }}>
            {page === "login" && "Sign in to manage bookings, track flights, and earn loyalty rewards."}
            {page === "register" && "Create your account to unlock premium travel experiences and exclusive rewards."}
            {page === "forgot" && "Enter your email and we'll send you reset instructions."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "✈", text: "200+ destinations worldwide" },
              { icon: "◆", text: "Private jet charter services" },
              { icon: "★", text: "5-tier loyalty rewards program" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, background: C.glass, border: `1px solid ${C.glassBorder}` }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span><span style={{ fontSize: 13, color: C.textSoft }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — FORMS */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.5s ease-out both" }} key={page}>

          {page === "login" && (<>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 6 }}>Sign In</h1>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 28 }}>Enter your credentials to access your account</p>

            {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: C.hot + "12", border: `1px solid ${C.hot}25`, color: C.hot, fontSize: 12, marginBottom: 16 }}>{error}</div>}

            <Input label="Email Address" type="email" placeholder="you@email.com" value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="Enter your password" value={loginPassword} onChange={(e: any) => setLoginPassword(e.target.value)} />

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button onClick={() => setPage("forgot")} style={{ background: "none", border: "none", color: C.accentLight, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Forgot password?</button>
            </div>

            <button onClick={handleLogin} disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
              color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 4px 20px ${C.accent}30`, opacity: loading ? 0.7 : 1,
            }}>
              {loading && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
              Sign In
            </button>

            {/* Quick login hints */}
            <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: C.glass, border: `1px solid ${C.glassBorder}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1, marginBottom: 8 }}>TEST ACCOUNTS</div>
              {[
                { role: "Admin", email: "admin@skyluxairways.com", pass: "Admin@2026!" },
                { role: "Customer", email: "customer@test.com", pass: "Test@1234!" },
                { role: "Pilot", email: "captain@skyluxairways.com", pass: "Pilot@2026!" },
              ].map((acc, i) => (
                <div key={i} onClick={() => { setLoginEmail(acc.email); setLoginPassword(acc.pass); setError(""); }} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 11, color: C.textSoft }}>{acc.role}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.textDim }}>{acc.email}</span>
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 13, color: C.textDim, marginTop: 24 }}>
              Don't have an account?{" "}
              <button onClick={() => { setPage("register"); setError(""); }} style={{ background: "none", border: "none", color: C.accentLight, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Create account</button>
            </p>
          </>)}

          {page === "register" && (<>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 6 }}>Create Account</h1>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 28 }}>Join SKYLUX Airways and start earning rewards</p>

            {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: C.hot + "12", border: `1px solid ${C.hot}25`, color: C.hot, fontSize: 12, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="First Name" placeholder="John" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
              <Input label="Last Name" placeholder="Doe" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
            </div>
            <Input label="Email Address" type="email" placeholder="you@email.com" value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} />
            <Input label="Phone Number" type="tel" placeholder="+1 234 567 8900" value={regPhone} onChange={(e: any) => setRegPhone(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Password" type="password" placeholder="Min 8 characters" value={regPassword} onChange={(e: any) => setRegPassword(e.target.value)} />
              <Input label="Confirm" type="password" placeholder="Re-enter" value={regConfirm} onChange={(e: any) => setRegConfirm(e.target.value)} />
            </div>

            <button onClick={handleRegister} disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
              color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
              cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 4px 20px ${C.accent}30`, opacity: loading ? 0.7 : 1, marginTop: 8,
            }}>
              {loading && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
              Create Account
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: C.textDim, marginTop: 24 }}>
              Already have an account?{" "}
              <button onClick={() => { setPage("login"); setError(""); }} style={{ background: "none", border: "none", color: C.accentLight, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign in</button>
            </p>
          </>)}

          {page === "forgot" && (<>
            <button onClick={() => setPage("login")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.textSoft, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 24 }}>← Back to sign in</button>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 6 }}>Forgot Password</h1>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 28 }}>Enter your email and we'll send you a reset link</p>
            <Input label="Email Address" type="email" placeholder="you@email.com" value="" onChange={() => {}} />
            <button style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
              color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
            }}>Send Reset Link</button>
          </>)}

          <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: C.textDim }}>© 2026 SKYLUX Airways. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}