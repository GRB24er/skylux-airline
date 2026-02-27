"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const T = {
  bg: "#030614", surface: "#0a0f1e", card: "#0c1121",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  text: "#f0f0f5", sub: "#8892b0", dim: "#5a6480",
  accent: "#6366f1", accentLight: "#818cf8",
  red: "#ef4444", emerald: "#34d399", gold: "#c9a96e",
};

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && ["admin", "superadmin"].includes(d.data.user.role)) {
          router.replace("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      // Check if user is admin or superadmin
      if (!["admin", "superadmin"].includes(data.data.user.role)) {
        setError("Access denied. This portal is restricted to authorized administrators only.");
        // Logout the non-admin user
        await fetch("/api/auth/logout", { method: "POST" });
        setLoading(false);
        return;
      }
      // Success — redirect to dashboard
      router.replace("/dashboard");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${T.accent}20`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}}` }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Plus Jakarta Sans',system-ui,sans-serif", padding: 20 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes gridMove{0%{background-position:0 0}100%{background-position:40px 40px}}
        .admin-input{width:100%;padding:14px 16px;background:${T.surface};border:1px solid ${T.border};border-radius:12px;color:${T.text};font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box}
        .admin-input:focus{border-color:${T.accent}50;box-shadow:0 0 0 3px ${T.accent}12}
        .admin-input::placeholder{color:${T.dim}}
      `}} />

      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(${T.accent} 1px, transparent 1px), linear-gradient(90deg, ${T.accent} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        animation: "gridMove 3s linear infinite",
      }} />

      {/* Gradient orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}08, transparent 70%)`, filter: "blur(80px)" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.gold}06, transparent 70%)`, filter: "blur(80px)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420, animation: "fadeUp 0.6s ease-out" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <img src="/images/logo.png" alt="SKYLUX" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e: any) => { e.target.style.display = "none" }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, color: T.text, lineHeight: 1 }}>SKYLUX</div>
              <div style={{ fontSize: 9, letterSpacing: 5, color: T.accent, fontWeight: 600, textTransform: "uppercase" }}>Admin Portal</div>
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 300, fontFamily: "'Playfair Display',Georgia,serif", color: T.text, marginBottom: 8 }}>
            Welcome <em style={{ fontStyle: "italic", color: T.accent }}>Back</em>
          </h1>
          <p style={{ fontSize: 13, color: T.dim }}>Sign in to access the SKYLUX operations centre</p>
        </div>

        {/* Login card */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
          padding: "36px 32px", backdropFilter: "blur(20px)",
        }}>
          <form onSubmit={handleLogin}>
            {/* Error */}
            {error && (
              <div style={{
                padding: "12px 16px", background: T.red + "10", border: `1px solid ${T.red}25`,
                borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
                <div style={{ fontSize: 13, color: "#f87171", lineHeight: 1.5 }}>{error}</div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, marginBottom: 6 }}>EMAIL ADDRESS</label>
              <input
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skyluxairways.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, marginBottom: 6 }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  className="admin-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: "8px 12px",
                    fontSize: 13, color: T.dim, fontFamily: "inherit",
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? T.accent + "60" : `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
                color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, transition: "all 0.2s",
                boxShadow: loading ? "none" : `0 4px 20px ${T.accent}30`,
              }}
            >
              {loading && (
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              )}
              {loading ? "Authenticating..." : "Sign In to Admin"}
            </button>
          </form>

          {/* Security notice */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, padding: "10px 14px", background: T.accent + "06", border: `1px solid ${T.accent}10`, borderRadius: 10 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 11, color: T.sub }}>This session is protected with 256-bit encryption and monitored for unauthorized access attempts.</span>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/" style={{ fontSize: 12, color: T.dim, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = T.text}
            onMouseLeave={(e) => e.currentTarget.style.color = T.dim}
          >
            ← Back to Main Site
          </Link>
          <span style={{ margin: "0 16px", color: T.dim, fontSize: 11 }}>|</span>
          <Link href="/auth" style={{ fontSize: 12, color: T.dim, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = T.text}
            onMouseLeave={(e) => e.currentTarget.style.color = T.dim}
          >
            Customer Portal →
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: T.dim, letterSpacing: 0.5 }}>
          © 2026 SKYLUX Airways. Authorized personnel only.
        </div>
      </div>
    </div>
  );
}
