import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#030614", color: "#f0f0f5",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      textAlign: "center", padding: 40, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", top: -200, left: "30%" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.04), transparent 70%)", bottom: -100, right: "20%" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 14, marginBottom: 20 }}>✈</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 100, fontWeight: 800,
          background: "linear-gradient(135deg, #6366f1, #22d3ee)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1, marginBottom: 16,
        }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Flight Not Found</h1>
        <p style={{ fontSize: 14, color: "#8892b0", maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
          The page you're looking for has either been rerouted, cancelled, or never existed. Let's get you back on course.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" style={{
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "white", fontSize: 14, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>Back to Home</Link>
          <Link href="/portal" style={{
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#8892b0", fontSize: 14, fontWeight: 600,
          }}>Search Flights</Link>
        </div>
        <div style={{ marginTop: 48, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5a6480" }}>
          Error Code: PAGE_NOT_FOUND · SKYLUX Airways
        </div>
      </div>
    </div>
  );
}
