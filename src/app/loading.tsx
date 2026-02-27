export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#030614", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>✈</div>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(99,102,241,0.15)",
          borderTop: "3px solid #6366f1", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <div style={{ fontSize: 14, color: "#8892b0", fontWeight: 600 }}>SKYLUX Airways</div>
      </div>
    </div>
  );
}
