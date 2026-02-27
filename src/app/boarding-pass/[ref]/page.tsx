"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
// SKYLUX AIRWAYS — Premium Boarding Pass Generator
// Real airline-style PDF boarding pass with QR code
// ═══════════════════════════════════════════════════════════════════════

const C = {
  bg: "#030614", card: "#0a0f1e", cardAlt: "#0d1225",
  border: "rgba(255,255,255,0.06)", borderLight: "rgba(255,255,255,0.1)",
  text: "#f0f0f5", sub: "#8892b0", muted: "#5a6480",
  accent: "#818cf8", accentDark: "#6366f1", cyan: "#22d3ee",
  gold: "#c9a96e", emerald: "#10b981", hot: "#ef4444",
  white: "#ffffff",
};

interface BoardingPassData {
  airline: string;
  passengerName: string;
  passengerFirstName: string;
  passengerLastName: string;
  bookingReference: string;
  ticketNumber: string;
  eTicketNumber: string;
  sequenceNumber: string;
  flightNumber: string;
  aircraft: string;
  aircraftRegistration: string;
  departure: {
    city: string; airportCode: string; airportName: string;
    terminal: string; time: string; date: string; dateShort: string;
  };
  arrival: {
    city: string; airportCode: string; airportName: string;
    terminal: string; time: string; date: string;
  };
  seatNumber: string;
  gate: string;
  cabinClass: string;
  boardingTime: string;
  boardingGroup: string;
  priorityBoarding: boolean;
  loungeAccess: boolean;
  mealPreference: string;
  baggageAllowance: string;
  frequentFlyer: string | null;
  status: string;
  qrData: string;
  totalPassengers: number;
  passengerIndex: number;
}

export default function BoardingPassPage({ params }: { params: { ref: string } }) {
  const [data, setData] = useState<BoardingPassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paxIndex, setPaxIndex] = useState(0);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchPass = useCallback(async (idx: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/boarding-pass?ref=${params.ref}&pax=${idx}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (e: any) {
      setError(e.message || "Failed to load boarding pass");
    } finally {
      setLoading(false);
    }
  }, [params.ref]);

  useEffect(() => { fetchPass(paxIndex); }, [fetchPass, paxIndex]);

  // Generate QR code
  useEffect(() => {
    if (!data?.qrData) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(data.qrData, {
        width: 200, margin: 1,
        color: { dark: "#0a0f1e", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }).then(setQrImageUrl).catch(console.error);
    });
  }, [data?.qrData]);

  // ─── PDF Generation ────────────────────────────────────────────────
  const generatePDF = async () => {
    if (!data) return;
    setGenerating(true);

    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const QRCode = await import("qrcode");

      // Landscape A5-ish boarding pass (wider than tall)
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [105, 250] });
      const W = 250, H = 105;

      // ── Background ──
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, W, H, "F");

      // ── Tear-off line (separates main pass from stub) ──
      const stubX = 190;
      doc.setDrawColor(255, 255, 255);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(stubX, 0, stubX, H);
      doc.setLineDashPattern([], 0);

      // ════════════════════════════════════════════════════════════════
      // LEFT SECTION — Main Boarding Pass
      // ════════════════════════════════════════════════════════════════

      // ── Top bar with gradient effect ──
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, stubX, 16, "F");
      // Airline name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("SKYLUX AIRWAYS", 8, 10);
      // Boarding pass label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(200, 200, 255);
      doc.text("BOARDING PASS", 8, 14);
      // Class badge
      const classLabel = data.cabinClass;
      const classColors: Record<string, number[]> = {
        FIRST: [201, 169, 110], BUSINESS: [99, 102, 241],
        PREMIUM: [34, 211, 238], ECONOMY: [107, 114, 128],
      };
      const cc = classColors[classLabel] || classColors.ECONOMY;
      const classWidth = doc.getTextWidth(classLabel) + 8;
      doc.setFillColor(cc[0], cc[1], cc[2]);
      doc.roundedRect(stubX - classWidth - 6, 4, classWidth, 8, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(classLabel, stubX - classWidth - 6 + 4, 9.5);

      // Priority badge
      if (data.priorityBoarding) {
        doc.setFontSize(5);
        doc.setTextColor(201, 169, 110);
        doc.text("★ PRIORITY", stubX - classWidth - 36, 9.5);
      }

      // ── Passenger Name ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(240, 240, 245);
      doc.text(data.passengerName, 8, 25);

      // E-ticket
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(90, 100, 128);
      doc.text(`E-TICKET: ${data.eTicketNumber}`, 8, 29);

      // ── Route Section ──
      const routeY = 36;

      // FROM
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(240, 240, 245);
      doc.text(data.departure.airportCode, 8, routeY + 10);
      doc.setFontSize(6);
      doc.setTextColor(90, 100, 128);
      doc.text(data.departure.city.toUpperCase(), 8, routeY + 14);

      // Arrow / Flight path
      const arrowY = routeY + 6;
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.3);
      doc.line(50, arrowY, 90, arrowY);
      // Airplane icon (triangle)
      doc.setFillColor(99, 102, 241);
      doc.triangle(88, arrowY - 2, 88, arrowY + 2, 93, arrowY, "F");
      // Flight number on line
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(129, 140, 248);
      doc.text(data.flightNumber, 63, arrowY - 3);
      // Direct label
      doc.setFontSize(5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 100, 128);
      doc.text("DIRECT", 67, arrowY + 5);

      // TO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(240, 240, 245);
      doc.text(data.arrival.airportCode, 96, routeY + 10);
      doc.setFontSize(6);
      doc.setTextColor(90, 100, 128);
      doc.text(data.arrival.city.toUpperCase(), 96, routeY + 14);

      // ── Info Grid ──
      const gridY = 58;
      const fields = [
        { label: "DATE", value: data.departure.dateShort, x: 8 },
        { label: "DEPARTS", value: data.departure.time, x: 38 },
        { label: "ARRIVES", value: data.arrival.time, x: 62 },
        { label: "GATE", value: data.gate, x: 86 },
        { label: "SEAT", value: data.seatNumber, x: 110 },
        { label: "BOARDING", value: data.boardingTime, x: 134 },
        { label: "GROUP", value: data.boardingGroup, x: 162 },
      ];

      // Grid background
      doc.setFillColor(15, 20, 35);
      doc.roundedRect(5, gridY - 3, 178, 20, 2, 2, "F");
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.1);

      fields.forEach((f) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.setTextColor(90, 100, 128);
        doc.text(f.label, f.x, gridY + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(240, 240, 245);
        doc.text(f.value, f.x, gridY + 10);
      });

      // ── Bottom Info Bar ──
      const bottomY = 82;
      doc.setFillColor(15, 20, 35);
      doc.roundedRect(5, bottomY - 2, 178, 12, 2, 2, "F");

      const bottomFields = [
        { label: "TERMINAL", value: data.departure.terminal },
        { label: "AIRCRAFT", value: data.aircraft },
        { label: "BAGGAGE", value: data.baggageAllowance },
        { label: "MEAL", value: data.mealPreference.toUpperCase() },
        { label: "SEQ", value: data.sequenceNumber },
      ];

      bottomFields.forEach((f, i) => {
        const x = 8 + i * 36;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4.5);
        doc.setTextColor(90, 100, 128);
        doc.text(f.label, x, bottomY + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(200, 200, 210);
        doc.text(f.value, x, bottomY + 7);
      });

      // Frequent flyer
      if (data.frequentFlyer) {
        doc.setFontSize(5);
        doc.setTextColor(201, 169, 110);
        doc.text(`FFN: ${data.frequentFlyer}`, 8, 100);
      }

      // ── Footer ──
      doc.setFontSize(4);
      doc.setTextColor(60, 70, 90);
      doc.text("This boarding pass is your travel document. Please keep it with you at all times during travel.", 8, H - 2);

      // ════════════════════════════════════════════════════════════════
      // RIGHT SECTION — Stub (tear-off)
      // ════════════════════════════════════════════════════════════════

      const sX = stubX + 4;

      // Stub header
      doc.setFillColor(99, 102, 241);
      doc.rect(stubX, 0, W - stubX, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("SKYLUX", sX, 7);
      doc.setFontSize(5);
      doc.setTextColor(200, 200, 255);
      doc.text("BOARDING PASS", sX, 12);

      // Passenger on stub
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(240, 240, 245);
      const stubName = data.passengerName.length > 20 ? data.passengerName.substring(0, 20) + "..." : data.passengerName;
      doc.text(stubName, sX, 23);

      // Route on stub
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(240, 240, 245);
      doc.text(data.departure.airportCode, sX, 35);
      doc.setFontSize(8);
      doc.setTextColor(129, 140, 248);
      doc.text("→", sX + 24, 33);
      doc.setFontSize(16);
      doc.setTextColor(240, 240, 245);
      doc.text(data.arrival.airportCode, sX + 30, 35);

      // Flight & Date on stub
      doc.setFontSize(5);
      doc.setTextColor(90, 100, 128);
      doc.text("FLIGHT", sX, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(240, 240, 245);
      doc.text(data.flightNumber, sX, 47);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(90, 100, 128);
      doc.text("DATE", sX + 30, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(240, 240, 245);
      doc.text(data.departure.dateShort, sX + 30, 47);

      // Seat & Gate on stub
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(90, 100, 128);
      doc.text("GATE", sX, 54);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(240, 240, 245);
      doc.text(data.gate, sX, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(90, 100, 128);
      doc.text("SEAT", sX + 25, 54);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(129, 140, 248);
      doc.text(data.seatNumber, sX + 25, 60);

      // Boarding time on stub
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(90, 100, 128);
      doc.text("BOARDING", sX, 67);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(240, 240, 245);
      doc.text(data.boardingTime, sX, 73);

      // ── QR Code on stub ──
      try {
        const qrDataUrl = await QRCode.toDataURL(data.qrData, {
          width: 300, margin: 1,
          color: { dark: "#0a0f1e", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        doc.addImage(qrDataUrl, "PNG", sX + 5, 77, 22, 22);
      } catch (e) {
        // Fallback: draw placeholder
        doc.setFillColor(255, 255, 255);
        doc.rect(sX + 5, 77, 22, 22, "F");
        doc.setFontSize(5);
        doc.setTextColor(0, 0, 0);
        doc.text("QR CODE", sX + 9, 89);
      }

      // Booking ref under QR
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(129, 140, 248);
      doc.text(data.bookingReference, sX + 33, 90);

      // ── Save ──
      doc.save(`SKYLUX_BoardingPass_${data.bookingReference}_${data.passengerLastName}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: C.sub, fontSize: 14 }}>Generating boarding pass...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <h2 style={{ color: C.text, margin: "0 0 8px", fontSize: 20 }}>Boarding Pass Unavailable</h2>
          <p style={{ color: C.sub, fontSize: 14, margin: "0 0 24px" }}>{error}</p>
          <a href="/" style={{ color: C.accent, fontSize: 14, textDecoration: "none" }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 16px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .bp-card { animation: fadeIn 0.6s ease; }
        .download-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
      `}</style>

      <div className="bp-card" style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ color: C.text, margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>
              SKYLUX <span style={{ color: C.accent, fontSize: 12, letterSpacing: 3 }}>AIRWAYS</span>
            </h1>
            <p style={{ color: C.sub, margin: "4px 0 0", fontSize: 13 }}>Mobile Boarding Pass</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {data.totalPassengers > 1 && (
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: data.totalPassengers }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPaxIndex(i); fetchPass(i); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: `1px solid ${i === paxIndex ? C.accent : C.border}`,
                      background: i === paxIndex ? C.accentDark : "transparent", color: i === paxIndex ? "#fff" : C.sub,
                      cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            <button
              className="download-btn"
              onClick={generatePDF}
              disabled={generating}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff",
                fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? "Generating..." : "⬇ Download PDF"}
            </button>
          </div>
        </div>

        {/* ═══ Boarding Pass Card ═══ */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          {/* Top Bar */}
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)", padding: "14px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>SKYLUX AIRWAYS</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: 3, marginTop: 2 }}>BOARDING PASS</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {data.priorityBoarding && (
                <span style={{ background: "rgba(201,169,110,0.2)", color: C.gold, fontSize: 9, padding: "4px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: 1 }}>
                  ★ PRIORITY
                </span>
              )}
              <span style={{
                background: data.cabinClass === "FIRST" ? "rgba(201,169,110,0.3)" : data.cabinClass === "BUSINESS" ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)",
                color: data.cabinClass === "FIRST" ? C.gold : "#fff",
                fontSize: 10, padding: "4px 12px", borderRadius: 20, fontWeight: 700, letterSpacing: 1,
              }}>
                {data.cabinClass}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: "flex" }}>
            {/* Left — Main */}
            <div style={{ flex: 1, padding: 24 }}>
              {/* Passenger */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.muted, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>PASSENGER NAME</div>
                <div style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>{data.passengerName}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>E-TICKET: {data.eTicketNumber}</div>
              </div>

              {/* Route */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.text, fontSize: 36, fontWeight: 700 }}>{data.departure.airportCode}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{data.departure.city}</div>
                  <div style={{ color: C.accent, fontSize: 16, fontWeight: 600, marginTop: 4 }}>{data.departure.time}</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  <div style={{ color: C.accent, fontSize: 11, fontWeight: 600 }}>{data.flightNumber}</div>
                  <div style={{ borderTop: `1px dashed ${C.borderLight}`, margin: "8px 0" }} />
                  <div style={{ color: C.muted, fontSize: 9, letterSpacing: 1 }}>DIRECT</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: C.text, fontSize: 36, fontWeight: 700 }}>{data.arrival.airportCode}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{data.arrival.city}</div>
                  <div style={{ color: C.accent, fontSize: 16, fontWeight: 600, marginTop: 4 }}>{data.arrival.time}</div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
                background: C.border, borderRadius: 12, overflow: "hidden", marginBottom: 16,
              }}>
                {[
                  { label: "DATE", value: data.departure.dateShort },
                  { label: "GATE", value: data.gate },
                  { label: "SEAT", value: data.seatNumber, highlight: true },
                  { label: "BOARDING", value: data.boardingTime },
                ].map((f, i) => (
                  <div key={i} style={{ background: C.cardAlt, padding: "12px 14px" }}>
                    <div style={{ color: C.muted, fontSize: 8, letterSpacing: 1.5, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ color: f.highlight ? C.accent : C.text, fontSize: 16, fontWeight: 700 }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Bottom details */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1,
                background: C.border, borderRadius: 10, overflow: "hidden",
              }}>
                {[
                  { label: "TERMINAL", value: data.departure.terminal },
                  { label: "AIRCRAFT", value: data.aircraft.length > 14 ? data.aircraft.substring(0, 14) + "…" : data.aircraft },
                  { label: "BAGGAGE", value: data.baggageAllowance },
                  { label: "MEAL", value: data.mealPreference.toUpperCase() },
                  { label: "GROUP", value: data.boardingGroup },
                ].map((f, i) => (
                  <div key={i} style={{ background: C.cardAlt, padding: "10px 12px" }}>
                    <div style={{ color: C.muted, fontSize: 7, letterSpacing: 1, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ color: C.sub, fontSize: 10, fontWeight: 600 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — QR Stub */}
            <div style={{
              width: 180, borderLeft: `2px dashed ${C.border}`, padding: 20,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: C.cardAlt, position: "relative",
            }}>
              {/* Notch circles */}
              <div style={{ position: "absolute", left: -8, top: -1, width: 16, height: 16, borderRadius: "50%", background: C.bg }} />
              <div style={{ position: "absolute", left: -8, bottom: -1, width: 16, height: 16, borderRadius: "50%", background: C.bg }} />

              <div style={{ color: C.muted, fontSize: 8, letterSpacing: 2, marginBottom: 12 }}>SCAN TO BOARD</div>

              {qrImageUrl ? (
                <img src={qrImageUrl} alt="QR Code" style={{ width: 130, height: 130, borderRadius: 8 }} />
              ) : (
                <div style={{ width: 130, height: 130, background: "#fff", borderRadius: 8 }} />
              )}

              <div style={{ marginTop: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>BOOKING REF</div>
                <div style={{ color: C.accent, fontSize: 18, fontWeight: 700, letterSpacing: 3, marginTop: 4 }}>
                  {data.bookingReference}
                </div>
              </div>

              <div style={{ marginTop: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 7 }}>SEQ {data.sequenceNumber}</div>
                {data.frequentFlyer && (
                  <div style={{ color: C.gold, fontSize: 8, marginTop: 4 }}>FFN: {data.frequentFlyer}</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: `1px solid ${C.border}`, padding: "10px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: C.muted, fontSize: 9 }}>
              Present this boarding pass at the gate. Arrive at least 2 hours before departure.
            </span>
            <span style={{ color: C.muted, fontSize: 9 }}>
              © {new Date().getFullYear()} SKYLUX Airways
            </span>
          </div>
        </div>

        {/* Lounge Access Card */}
        {data.loungeAccess && (
          <div style={{
            marginTop: 16, background: `linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))`,
            border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 12, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>🍸</span>
            <div>
              <div style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>Lounge Access Included</div>
              <div style={{ color: C.sub, fontSize: 11 }}>Present your boarding pass at any SKYLUX partner lounge</div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}