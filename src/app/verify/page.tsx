"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const C = {
  bg: "#030614", card: "#0a0f1e", surface: "#0d1225",
  border: "rgba(255,255,255,0.06)", text: "#f0f0f5",
  sub: "#8892b0", muted: "#5a6480", accent: "#818cf8",
  emerald: "#10b981", hot: "#ef4444", gold: "#c9a96e",
};

function VerifyContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualRef, setManualRef] = useState("");

  const ref = searchParams.get("ref");
  const fn = searchParams.get("fn");
  const pax = searchParams.get("pax");
  const seat = searchParams.get("seat");
  const dep = searchParams.get("dep");
  const arr = searchParams.get("arr");
  const date = searchParams.get("date");

  const verify = async (bookingRef: string) => {
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ ref: bookingRef });
      if (fn) params.set("fn", fn);
      if (pax) params.set("pax", pax);
      const res = await fetch("/api/verify?" + params.toString());
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, verified: false, error: "Verification failed" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ref) verify(ref);
    else setLoading(false);
  }, [ref]);

  const handleManualVerify = () => {
    if (manualRef.trim()) verify(manualRef.trim());
  };

  const fmtTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); } catch { return "N/A"; }
  };
  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch { return "N/A"; }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 16px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <style>{
        "@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
        "@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}" +
        "@keyframes checkmark{0%{stroke-dashoffset:50}100%{stroke-dashoffset:0}}" +
        ".verify-card{animation:fadeIn 0.6s ease}"
      }</style>

      <div className="verify-card" style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2 }}>
            SKYLUX <span style={{ color: C.accent, fontSize: 12, letterSpacing: 3 }}>AIRWAYS</span>
          </div>
          <div style={{ color: C.muted, fontSize: 12, letterSpacing: 3, marginTop: 6 }}>BOARDING PASS VERIFICATION</div>
        </div>

        {/* Manual entry if no ref in URL */}
        {!ref && !result && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>QR</div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Verify Boarding Pass</h2>
            <p style={{ color: C.sub, fontSize: 13, marginBottom: 24 }}>Scan a SKYLUX boarding pass QR code or enter a booking reference manually.</p>
            <div style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
              <input
                value={manualRef}
                onChange={e => setManualRef(e.target.value.toUpperCase())}
                placeholder="e.g. SLX-AB1234"
                onKeyDown={e => e.key === "Enter" && handleManualVerify()}
                style={{ flex: 1, padding: "12px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "monospace", outline: "none", letterSpacing: 1 }}
              />
              <button
                onClick={handleManualVerify}
                disabled={!manualRef.trim()}
                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: manualRef.trim() ? "pointer" : "not-allowed", opacity: manualRef.trim() ? 1 : 0.5 }}
              >Verify</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && ref && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "60px 32px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid " + C.border, borderTop: "3px solid " + C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ color: C.sub, fontSize: 14 }}>Verifying boarding pass...</div>
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, overflow: "hidden" }}>
            {/* Verification Status Banner */}
            <div style={{
              padding: "28px 24px", textAlign: "center",
              background: result.verified
                ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))"
                : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
              borderBottom: "1px solid " + (result.verified ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"),
            }}>
              {result.verified ? (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid " + C.emerald, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", animation: "pulse 2s ease infinite" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 style={{ color: C.emerald, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>VERIFIED - AUTHENTIC</h2>
                  <p style={{ color: C.sub, fontSize: 12, margin: 0 }}>This boarding pass has been verified by SKYLUX Airways</p>
                </>
              ) : (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "2px solid " + C.hot, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.hot} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <h2 style={{ color: C.hot, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>VERIFICATION FAILED</h2>
                  <p style={{ color: C.sub, fontSize: 12, margin: 0 }}>{result.error || "This boarding pass could not be verified"}</p>
                </>
              )}
            </div>

            {/* Details */}
            {result.verified && result.data && (
              <div style={{ padding: 24 }}>
                {/* Security stamp */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, marginBottom: 20 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <div style={{ color: C.emerald, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>DIGITALLY SECURED</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>Verified at {new Date().toLocaleString()}</div>
                  </div>
                </div>

                {/* Passenger */}
                {result.data.passenger && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>PASSENGER</div>
                    <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>
                      {result.data.passenger.lastName}/{result.data.passenger.firstName}
                    </div>
                    <span style={{
                      display: "inline-block", marginTop: 4, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                      background: result.data.passenger.cabinClass === "first" ? "rgba(201,169,110,0.15)" : "rgba(99,102,241,0.15)",
                      color: result.data.passenger.cabinClass === "first" ? C.gold : C.accent,
                      textTransform: "uppercase",
                    }}>{result.data.passenger.cabinClass}</span>
                  </div>
                )}

                {/* Flight Route */}
                {result.data.flight && (
                  <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{result.data.flight.departure.airportCode}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{result.data.flight.departure.city}</div>
                        <div style={{ color: C.accent, fontSize: 14, fontWeight: 600, marginTop: 4 }}>{fmtTime(result.data.flight.departure.scheduledTime)}</div>
                      </div>
                      <div style={{ textAlign: "center", flex: 1, padding: "0 16px" }}>
                        <div style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>{result.data.flight.flightNumber}</div>
                        <div style={{ borderTop: "1px dashed " + C.border, margin: "8px 0" }} />
                        <div style={{ color: C.muted, fontSize: 9 }}>{result.data.flight.aircraft}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{result.data.flight.arrival.airportCode}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{result.data.flight.arrival.city}</div>
                        <div style={{ color: C.accent, fontSize: 14, fontWeight: 600, marginTop: 4 }}>{fmtTime(result.data.flight.arrival.scheduledTime)}</div>
                      </div>
                    </div>
                    {result.data.flight.departure.scheduledTime && (
                      <div style={{ textAlign: "center", marginTop: 12, color: C.sub, fontSize: 12 }}>
                        {fmtDate(result.data.flight.departure.scheduledTime)}
                      </div>
                    )}
                  </div>
                )}

                {/* QR Details from URL params */}
                {(seat || date) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: C.border, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                    {seat && <div style={{ background: C.surface, padding: "10px 14px" }}><div style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>SEAT</div><div style={{ color: C.accent, fontSize: 16, fontWeight: 700 }}>{seat}</div></div>}
                    {date && <div style={{ background: C.surface, padding: "10px 14px" }}><div style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>DATE</div><div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{date}</div></div>}
                    <div style={{ background: C.surface, padding: "10px 14px" }}><div style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>STATUS</div><div style={{ color: C.emerald, fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>{result.data.status}</div></div>
                  </div>
                )}

                {/* Booking Ref */}
                <div style={{ textAlign: "center", padding: "14px", border: "1px dashed " + C.border, borderRadius: 10 }}>
                  <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>BOOKING REFERENCE</div>
                  <div style={{ color: C.accent, fontSize: 22, fontWeight: 700, letterSpacing: 4, marginTop: 4 }}>{result.data.bookingReference}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: "1px solid " + C.border, padding: "14px 24px", textAlign: "center" }}>
              <div style={{ color: C.muted, fontSize: 10 }}>SKYLUX Airways Digital Verification System</div>
              {!result.verified && (
                <div style={{ marginTop: 12 }}>
                  <input
                    value={manualRef}
                    onChange={e => setManualRef(e.target.value.toUpperCase())}
                    placeholder="Enter booking reference"
                    style={{ padding: "8px 12px", background: C.surface, border: "1px solid " + C.border, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "monospace", outline: "none", marginRight: 8 }}
                  />
                  <button onClick={handleManualVerify} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Try Again</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#030614", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#8892b0", fontSize: 14 }}>Loading verification...</div></div>}>
      <VerifyContent />
    </Suspense>
  );
}