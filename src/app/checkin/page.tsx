"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#030614", card: "#0a0f1e", border: "rgba(255,255,255,0.06)",
  text: "#f0f0f5", sub: "#8892b0", muted: "#5a6480",
  accent: "#818cf8", accentDark: "#6366f1", gold: "#c9a96e",
  emerald: "#10b981", hot: "#ef4444",
};

export default function CheckInPage() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const handleCheckIn = async () => {
    if (!ref.trim() || !lastName.trim()) {
      setError("Please enter both booking reference and last name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference: ref.trim(), lastName: lastName.trim() }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setSuccess(data.data);
    } catch (e: any) {
      setError(e.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ci-card { animation: fadeIn 0.5s ease; }
        input:focus { outline: none; border-color: #818cf8 !important; }
        .ci-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
      `}</style>

      <div className="ci-card" style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: 2 }}>
            SKYLUX <span style={{ color: C.accent, fontSize: 14, letterSpacing: 3 }}>AIRWAYS</span>
          </div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 8 }}>Online Check-In</div>
        </div>

        {!success ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>Check In</h2>
            <p style={{ color: C.sub, fontSize: 13, margin: "0 0 24px" }}>
              Enter your booking reference and last name to check in and get your boarding pass.
            </p>

            {/* Booking Reference */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>BOOKING REFERENCE</label>
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="e.g. SX-A3B7K9"
                maxLength={10}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                  color: C.text, fontSize: 16, fontWeight: 600, letterSpacing: 2,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Last Name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>PASSENGER LAST NAME</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="As shown on passport"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                  color: C.text, fontSize: 15, boxSizing: "border-box",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                color: C.hot, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="ci-btn"
              onClick={handleCheckIn}
              disabled={loading}
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Checking in..." : "Check In Now"}
            </button>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p style={{ color: C.muted, fontSize: 11 }}>
                Check-in opens 48 hours before departure and closes 1 hour before.
              </p>
            </div>
          </div>
        ) : (
          /* ═══ Success State ═══ */
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(16,185,129,0.15)", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                fontSize: 28,
              }}>
                ✓
              </div>
              <h2 style={{ color: C.emerald, fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
                {success.alreadyCheckedIn ? "Already Checked In" : "Check-In Complete!"}
              </h2>
              <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
                Your boarding pass is ready to download
              </p>
            </div>

            {/* Booking info */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Booking Reference</span>
                <span style={{ color: C.accent, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>{success.bookingReference}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>Status</span>
                <span style={{ color: C.emerald, fontSize: 12, fontWeight: 600 }}>✓ CHECKED IN</span>
              </div>
              {success.passengers?.map((p: any, i: number) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderTop: `1px solid ${C.border}`,
                }}>
                  <span style={{ color: C.text, fontSize: 12 }}>{p.name}</span>
                  <span style={{ color: C.sub, fontSize: 11 }}>Seat: {p.seat} • {p.cabinClass}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              className="ci-btn"
              onClick={() => router.push(success.boardingPassUrl || `/boarding-pass/${success.bookingReference}`)}
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                marginBottom: 10,
              }}
            >
              View Boarding Pass
            </button>

            <button
              className="ci-btn"
              onClick={() => { setSuccess(null); setRef(""); setLastName(""); }}
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                border: `1px solid ${C.border}`, background: "transparent",
                color: C.sub, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              }}
            >
              Check In Another Passenger
            </button>
          </div>
        )}
      </div>
    </div>
  );
}