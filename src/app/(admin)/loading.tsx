export default function AdminLoading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(99,102,241,0.15)",
          borderTop: "3px solid #6366f1", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <div style={{ fontSize: 13, color: "#8892b0" }}>Loading...</div>
      </div>
    </div>
  );
}
