"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#030614", surface: "#0a0f1e", surface2: "#0f1628",
  card: "#0c1121", glass: "rgba(255,255,255,0.02)",
  glassBorder: "rgba(255,255,255,0.06)", glassBorderHover: "rgba(255,255,255,0.12)",
  text: "#f0f0f5", textSoft: "#8892b0", textDim: "#5a6480",
  accent: "#6366f1", accentLight: "#818cf8",
  cyan: "#22d3ee", hot: "#f43f5e", emerald: "#34d399", amber: "#fbbf24", violet: "#a78bfa",
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "◈" },
  { label: "Flights", href: "/flights", icon: "✈" },
  { label: "Bookings", href: "/bookings", icon: "📋" },
  { label: "Fleet", href: "/fleet", icon: "🛩" },
  { label: "Crew", href: "/crew", icon: "👨‍✈️" },
  { label: "Customers", href: "/customers", icon: "👥" },
  { label: "Revenue", href: "/revenue", icon: "📊" },
  { label: "Crypto", href: "/crypto", icon: "₿" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState("");
  const [notifCount] = useState(5);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${C.accent}20`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  // Route protection: redirect to admin login if not authenticated or not admin
  if (!user || !["admin", "superadmin"].includes(user.role)) {
    if (typeof window !== "undefined") {
      router.replace("/admin-login");
    }
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, gap: 16 }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.accent}20`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 13, color: C.textDim }}>Redirecting to admin login...</div>
      </div>
    );
  }

  const userName = user ? `${user.firstName} ${user.lastName}` : "Admin User";
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "SX";
  const userRole = user?.role === "superadmin" ? "Superadmin" : "Admin";

  const w = collapsed ? 72 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}}` }} />
      <aside style={{
        width: w, height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 50,
        background: C.surface, borderRight: `1px solid ${C.glassBorder}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 16px" : "20px 22px",
          borderBottom: `1px solid ${C.glassBorder}`,
          display: "flex", alignItems: "center", gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
          minHeight: 68,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            overflow: "hidden",
          }}><img src="/images/logo.png" alt="SKYLUX" style={{width:"100%",height:"100%",objectFit:"contain"}} /></div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, color: C.text, lineHeight: 1 }}>SKYLUX</div>
              <div style={{ fontSize: 8, color: C.accentLight, letterSpacing: 4, fontWeight: 600 }}>ADMIN PORTAL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {navItems.map((item, i) => {
            const active = pathname === item.href;
            const isNotif = item.label === "Notifications";
            return (
              <Link key={i} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "11px 0" : "11px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 12, marginBottom: 2,
                background: active ? C.accent + "12" : "transparent",
                border: `1px solid ${active ? C.accent + "25" : "transparent"}`,
                color: active ? C.accentLight : C.textSoft,
                textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 500,
                transition: "all 0.15s", position: "relative",
              }}
                onMouseEnter={(e: any) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={(e: any) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {isNotif && notifCount > 0 && (
                  <span style={{
                    position: collapsed ? "absolute" : "relative",
                    top: collapsed ? 6 : "auto", right: collapsed ? 10 : "auto",
                    marginLeft: collapsed ? 0 : "auto",
                    padding: "1px 6px", borderRadius: 6,
                    background: C.hot, color: "white",
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono'",
                    minWidth: 18, textAlign: "center",
                  }}>{notifCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse + User */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.glassBorder}` }}>
          {/* Collapse button */}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: "100%", padding: "8px 0", borderRadius: 10,
            background: C.glass, border: `1px solid ${C.glassBorder}`,
            color: C.textDim, fontSize: 12, cursor: "pointer",
            fontFamily: "inherit", marginBottom: 10, transition: "all 0.15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
            onMouseEnter={(e: any) => e.currentTarget.style.borderColor = C.glassBorderHover}
            onMouseLeave={(e: any) => e.currentTarget.style.borderColor = C.glassBorder}
          >
            <span style={{ transition: "transform 0.25s", transform: collapsed ? "rotate(180deg)" : "none" }}>◂</span>
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "8px 0" : "8px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>{userInitials}</div>
            {!collapsed && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{userName}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{userRole}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => { logout(); router.replace("/admin-login"); }} style={{
              width: "100%", padding: "7px 0", borderRadius: 8, marginTop: 6,
              background: "transparent", border: `1px solid ${C.hot}20`,
              color: C.hot, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Sign Out</button>
          )}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ marginLeft: w, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {/* Top bar */}
        <header style={{
          height: 56, padding: "0 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${C.glassBorder}`,
          background: "rgba(3,6,20,0.8)", backdropFilter: "blur(16px)",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: C.glass, border: `1px solid ${C.glassBorder}`, minWidth: 220 }}>
              <span style={{ color: C.textDim, fontSize: 13 }}>⌕</span>
              <input placeholder="Search flights, bookings, customers..." style={{ background: "transparent", border: "none", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: C.textDim }}>{time}</span>
            <Link href="/notifications" style={{ position: "relative", textDecoration: "none", fontSize: 16, cursor: "pointer" }}>
              🔔
              {notifCount > 0 && <span style={{ position: "absolute", top: -4, right: -6, width: 8, height: 8, borderRadius: "50%", background: C.hot }} />}
            </Link>
            <Link href="/" style={{ fontSize: 11, color: C.textDim, textDecoration: "none", padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.glassBorder}` }}>
              ← Main Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
