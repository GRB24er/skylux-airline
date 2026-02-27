"use client";

import { useState } from "react";

const C = {
  bg: "#030614", surface: "#0a0f1e", card: "#0c1121",
  glass: "rgba(255,255,255,0.02)", glassBorder: "rgba(255,255,255,0.06)", glassBorderHover: "rgba(255,255,255,0.12)",
  text: "#f0f0f5", textSoft: "#8892b0", textDim: "#5a6480",
  accent: "#6366f1", accentLight: "#818cf8",
  cyan: "#22d3ee", hot: "#f43f5e", emerald: "#34d399", amber: "#fbbf24", violet: "#a78bfa",
};

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  booking: { icon: "📋", color: C.cyan, label: "Booking" },
  flight: { icon: "✈", color: C.accent, label: "Flight Ops" },
  payment: { icon: "💳", color: C.emerald, label: "Payment" },
  crew: { icon: "👨‍✈️", color: C.amber, label: "Crew" },
  system: { icon: "⚙", color: C.violet, label: "System" },
  alert: { icon: "⚠", color: C.hot, label: "Alert" },
};

const notifications = [
  { id: 1, type: "alert", title: "SX 788 — Weather Advisory", message: "Severe turbulence forecast on JFK→NRT route FL340-380. Alternate routing recommended via northern Pacific track.", time: "2 min ago", read: false, priority: "high" },
  { id: 2, type: "booking", title: "New Booking — SX-M4P2K7", message: "Takeshi Yamamoto booked G700 charter LHR→NCE for Feb 28. Diamond tier. $25,600 confirmed via bank transfer.", time: "12 min ago", read: false, priority: "normal" },
  { id: 3, type: "payment", title: "Payment Received — $142,800", message: "Wire transfer from Jin Kim Woo for annual corporate travel package. 12 business class tickets + 2 charter credits.", time: "28 min ago", read: false, priority: "normal" },
  { id: 4, type: "flight", title: "SX 401 — Gate Change", message: "LHR→DXB gate changed from A14 to A18 due to aircraft repositioning. All PAX notified via push notification.", time: "45 min ago", read: false, priority: "normal" },
  { id: 5, type: "crew", title: "Crew Certification Expiry Warning", message: "FO Priya Singh A350 Type Rating expires in 92 days. Schedule recurrent training before May 28, 2026.", time: "1 hr ago", read: false, priority: "medium" },
  { id: 6, type: "system", title: "Database Backup Completed", message: "Nightly backup completed successfully. 847 collections, 2.4GB compressed. Stored to AWS S3 eu-west-1.", time: "2 hrs ago", read: true, priority: "low" },
  { id: 7, type: "booking", title: "Booking Cancelled — SX-F2H9V1", message: "Maria Santos cancelled SIN→ZRH business class. Refund of $5,100 processed to original payment method.", time: "3 hrs ago", read: true, priority: "normal" },
  { id: 8, type: "flight", title: "SX 215 Departed On-Time", message: "SIN→ZRH departed Gate C12 at 14:30 SGT. 248 PAX, Capt. Weber commanding. ETA 21:15 CET.", time: "4 hrs ago", read: true, priority: "low" },
  { id: 9, type: "alert", title: "Fleet — Cessna CX+ Maintenance", message: "SX-CX+01 C-Check overdue by 12 hours. Aircraft grounded at LHR maintenance hangar. Engineer team dispatched.", time: "5 hrs ago", read: true, priority: "high" },
  { id: 10, type: "payment", title: "Refund Processed — $896", message: "Auto-refund for Emma Laurent CDG→JFK flight cancellation. Credit card ending 4421. Settlement in 5-7 business days.", time: "6 hrs ago", read: true, priority: "low" },
  { id: 11, type: "crew", title: "Roster Updated — Week 10", message: "March 2-8 roster published. 4 captains, 6 FOs, 12 cabin crew assigned across 18 scheduled flights.", time: "8 hrs ago", read: true, priority: "normal" },
  { id: 12, type: "system", title: "API Rate Limit Warning", message: "Partner integration endpoint /api/flights/search hit 85% of hourly rate limit. Consider scaling or caching.", time: "10 hrs ago", read: true, priority: "medium" },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(notifications);

  const filtered = items.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.type === filter;
    return true;
  });

  const unreadCount = items.filter(n => !n.read).length;
  const markAllRead = () => setItems(items.map(n => ({ ...n, read: true })));
  const toggleRead = (id: number) => setItems(items.map(n => n.id === id ? { ...n, read: !n.read } : n));

  return (
    <div style={{ padding: "28px 32px", color: C.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`.mono{font-family:'JetBrains Mono',monospace;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, animation: "fadeUp 0.4s ease-out both" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: C.textDim }}>{unreadCount} unread · {items.length} total</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={markAllRead} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.glassBorder}`, background: "transparent", color: C.textSoft, cursor: "pointer", fontFamily: "inherit" }}>Mark All Read</button>
          <button style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${C.glassBorder}`, background: "transparent", color: C.textSoft, cursor: "pointer", fontFamily: "inherit" }}>Clear All</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", animation: "fadeUp 0.4s ease-out 0.05s both" }}>
        {[
          { id: "all", label: "All" },
          { id: "unread", label: `Unread (${unreadCount})` },
          ...Object.entries(typeConfig).map(([id, cfg]) => ({ id, label: cfg.label })),
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            border: `1px solid ${filter === f.id ? C.accent + "40" : C.glassBorder}`,
            background: filter === f.id ? C.accent + "12" : "transparent",
            color: filter === f.id ? C.accentLight : C.textSoft,
            cursor: "pointer", fontFamily: "inherit",
          }}>{f.label}</button>
        ))}
      </div>

      {/* Notifications list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((n, i) => {
          const cfg = typeConfig[n.type];
          return (
            <div key={n.id} onClick={() => toggleRead(n.id)} style={{
              display: "flex", gap: 16, padding: "18px 22px",
              background: n.read ? C.card : C.card,
              border: `1px solid ${n.read ? C.glassBorder : cfg.color + "20"}`,
              borderLeft: `3px solid ${n.read ? C.glassBorder : cfg.color}`,
              borderRadius: 16, cursor: "pointer", transition: "all 0.15s",
              animation: `fadeUp 0.3s ease-out ${i * 0.03}s both`,
              opacity: n.read ? 0.7 : 1,
            }}
              onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = C.glassBorderHover; e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = n.read ? C.glassBorder : cfg.color + "20"; e.currentTarget.style.opacity = n.read ? "0.7" : "1"; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: cfg.color + "12", border: `1px solid ${cfg.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{cfg.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: C.text }}>{n.title}</span>
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />}
                    {n.priority === "high" && <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: C.hot + "15", color: C.hot }}>HIGH</span>}
                    {n.priority === "medium" && <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: C.amber + "15", color: C.amber }}>MEDIUM</span>}
                  </div>
                  <span style={{ fontSize: 11, color: C.textDim, whiteSpace: "nowrap", marginLeft: 12, flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6, margin: 0 }}>{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No notifications</div>
        </div>
      )}
    </div>
  );
}
