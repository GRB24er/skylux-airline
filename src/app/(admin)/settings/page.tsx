"use client";

import { useState } from "react";

const C = {
  bg: "#030614", surface: "#0a0f1e", card: "#0c1121",
  glass: "rgba(255,255,255,0.02)", glassBorder: "rgba(255,255,255,0.06)", glassBorderHover: "rgba(255,255,255,0.12)",
  text: "#f0f0f5", textSoft: "#8892b0", textDim: "#5a6480",
  accent: "#6366f1", accentLight: "#818cf8",
  cyan: "#22d3ee", hot: "#f43f5e", emerald: "#34d399", amber: "#fbbf24", violet: "#a78bfa",
};

const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <div onClick={onChange} style={{
    width: 44, height: 24, borderRadius: 12, padding: 2, cursor: "pointer",
    background: on ? C.accent : C.glassBorder, transition: "all 0.2s",
  }}>
    <div style={{ width: 20, height: 20, borderRadius: 10, background: "white", transition: "transform 0.2s", transform: on ? "translateX(20px)" : "translateX(0)" }} />
  </div>
);

const SettingRow = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
    <div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 12, color: C.textDim }}>{desc}</div></div>
    {children}
  </div>
);

const InputField = ({ label, value, type = "text", mono = false }: { label: string; value: string; type?: string; mono?: boolean }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: 0.5, marginBottom: 6 }}>{label}</label>
    <input defaultValue={value} type={type} style={{
      width: "100%", padding: "10px 14px", background: C.glass, border: `1px solid ${C.glassBorder}`,
      borderRadius: 10, color: C.text, fontSize: 13,
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Plus Jakarta Sans', system-ui",
      outline: "none",
    }} />
  </div>
);

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [flightAlerts, setFlightAlerts] = useState(true);
  const [crewAlerts, setCrewAlerts] = useState(true);
  const [revenueReports, setRevenueReports] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maintenance, setMaintenance] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: "⚙" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "email", label: "Email & SMTP", icon: "📧" },
    { id: "system", label: "System", icon: "🖥" },
  ];

  return (
    <div style={{ padding: "28px 32px", color: C.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease-out both" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: C.textDim }}>System configuration, notifications, security, and email settings</p>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Tabs */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 14px", borderRadius: 10, marginBottom: 4,
              background: tab === t.id ? C.accent + "12" : "transparent",
              border: `1px solid ${tab === t.id ? C.accent + "25" : "transparent"}`,
              color: tab === t.id ? C.accentLight : C.textSoft,
              fontSize: 13, fontWeight: tab === t.id ? 600 : 500,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, maxWidth: 700 }} key={tab}>
          {tab === "general" && (
            <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "28px 30px", animation: "fadeUp 0.3s ease-out both" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>General Settings</h3>
              <InputField label="AIRLINE NAME" value="SKYLUX Airways" />
              <InputField label="IATA CODE" value="SX" mono />
              <InputField label="ICAO CODE" value="SLX" mono />
              <InputField label="PRIMARY HUB" value="LHR — London Heathrow" />
              <InputField label="SUPPORT EMAIL" value="support@skyluxairways.com" />
              <InputField label="SUPPORT PHONE" value="+44 20 7946 0958" />
              <div style={{ marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: 0.5, marginBottom: 6 }}>DEFAULT CURRENCY</label>
                <select defaultValue="USD" style={{ padding: "10px 14px", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer", width: "100%" }}>
                  {["USD", "GBP", "EUR", "AED", "JPY", "SGD"].map(c => <option key={c} style={{ background: C.surface }}>{c}</option>)}
                </select>
              </div>
              <button style={{ marginTop: 20, padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: "white", cursor: "pointer", fontFamily: "inherit" }}>Save Changes</button>
            </div>
          )}

          {tab === "notifications" && (
            <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "28px 30px", animation: "fadeUp 0.3s ease-out both" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
              <SettingRow label="Email Notifications" desc="Receive notifications via email"><Toggle on={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} /></SettingRow>
              <SettingRow label="Push Notifications" desc="Browser push notifications for urgent alerts"><Toggle on={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} /></SettingRow>
              <SettingRow label="Booking Alerts" desc="New bookings, cancellations, and modifications"><Toggle on={bookingAlerts} onChange={() => setBookingAlerts(!bookingAlerts)} /></SettingRow>
              <SettingRow label="Flight Operations" desc="Gate changes, delays, departures, and arrivals"><Toggle on={flightAlerts} onChange={() => setFlightAlerts(!flightAlerts)} /></SettingRow>
              <SettingRow label="Crew Updates" desc="Schedule changes, certification expiries, duty alerts"><Toggle on={crewAlerts} onChange={() => setCrewAlerts(!crewAlerts)} /></SettingRow>
              <SettingRow label="Weekly Revenue Reports" desc="Automated revenue summary every Monday"><Toggle on={revenueReports} onChange={() => setRevenueReports(!revenueReports)} /></SettingRow>
            </div>
          )}

          {tab === "security" && (
            <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "28px 30px", animation: "fadeUp 0.3s ease-out both" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Security</h3>
              <SettingRow label="Two-Factor Authentication" desc="Require 2FA for admin login"><Toggle on={twoFactor} onChange={() => setTwoFactor(!twoFactor)} /></SettingRow>
              <div style={{ padding: "16px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Session Timeout</div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>Auto-logout after inactivity</div>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{ padding: "8px 14px", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                  {["15", "30", "60", "120"].map(m => <option key={m} value={m} style={{ background: C.surface }}>{m} minutes</option>)}
                </select>
              </div>
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Change Password</div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Update admin account password</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <InputField label="NEW PASSWORD" value="" type="password" />
                  <InputField label="CONFIRM PASSWORD" value="" type="password" />
                </div>
                <button style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.glassBorder}`, background: "transparent", color: C.textSoft, cursor: "pointer", fontFamily: "inherit" }}>Update Password</button>
              </div>
            </div>
          )}

          {tab === "email" && (
            <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "28px 30px", animation: "fadeUp 0.3s ease-out both" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Email & SMTP Configuration</h3>
              <InputField label="SMTP HOST" value="smtp.skyluxairways.com" mono />
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                <InputField label="SMTP USER" value="noreply@skyluxairways.com" mono />
                <InputField label="SMTP PORT" value="587" mono />
              </div>
              <InputField label="SMTP PASSWORD" value="••••••••••••" type="password" mono />
              <InputField label="FROM NAME" value="SKYLUX Airways" />
              <InputField label="FROM EMAIL" value="noreply@skyluxairways.com" mono />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`, color: "white", cursor: "pointer", fontFamily: "inherit" }}>Save SMTP</button>
                <button style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1px solid ${C.cyan}30`, background: "transparent", color: C.cyan, cursor: "pointer", fontFamily: "inherit" }}>Send Test Email</button>
              </div>
            </div>
          )}

          {tab === "system" && (
            <div style={{ background: C.card, border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "28px 30px", animation: "fadeUp 0.3s ease-out both" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>System</h3>
              <SettingRow label="Maintenance Mode" desc="Temporarily disable customer-facing pages"><Toggle on={maintenance} onChange={() => setMaintenance(!maintenance)} /></SettingRow>
              <div style={{ padding: "16px 0", borderBottom: `1px solid ${C.glassBorder}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>System Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { l: "Platform", v: "Next.js 14.1" }, { l: "Database", v: "MongoDB Atlas" },
                    { l: "Node.js", v: "v20.11 LTS" }, { l: "Environment", v: "Production" },
                    { l: "Region", v: "eu-west-1" }, { l: "Uptime", v: "99.97%" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderRadius: 8, background: C.glass, border: `1px solid ${C.glassBorder}` }}>
                      <span style={{ fontSize: 12, color: C.textDim }}>{s.l}</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "16px 0", display: "flex", gap: 10 }}>
                <button style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.emerald}30`, background: "transparent", color: C.emerald, cursor: "pointer", fontFamily: "inherit" }}>Run Database Backup</button>
                <button style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.amber}30`, background: "transparent", color: C.amber, cursor: "pointer", fontFamily: "inherit" }}>Clear Cache</button>
                <button style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.hot}30`, background: "transparent", color: C.hot, cursor: "pointer", fontFamily: "inherit" }}>Reset Seed Data</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
