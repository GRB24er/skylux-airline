"use client";
import { useState, useEffect } from "react";

const C = {bg:"#030614",card:"#0a0f1e",surface:"#0d1225",border:"rgba(255,255,255,0.06)",text:"#f0f0f5",sub:"#8892b0",dim:"#5a6480",accent:"#818cf8",emerald:"#10b981",gold:"#c9a96e"};

export default function InvoicePage({ params }: { params: { ref: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bookings/invoice?ref=" + params.ref)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); else setError(d.error || "Not found"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [params.ref]);

  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); } catch { return "N/A"; } };

  const generatePDF = async () => {
    if (!data) return;
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    doc.setFillColor(10, 15, 30); doc.rect(0, 0, W, 50, "F");
    doc.setFillColor(99, 102, 241); doc.rect(0, 0, W, 4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(240, 240, 245);
    doc.text("SKYLUX AIRWAYS", 20, 22);
    doc.setFontSize(10); doc.setTextColor(129, 140, 248); doc.text("TAX INVOICE", 20, 30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 210);
    doc.text("Invoice: " + data.invoiceNumber, 20, 40);
    doc.text("Date: " + fmtDate(data.issueDate), 20, 45);
    doc.text("Ref: " + data.bookingReference, W - 20, 40, { align: "right" });
    let y = 62;
    doc.setFontSize(8); doc.setTextColor(90, 100, 128); doc.text("BILL TO", 20, y); y += 6;
    doc.setFontSize(12); doc.setTextColor(60, 60, 60); doc.setFont("helvetica", "bold");
    const paxName = data.passenger ? data.passenger.firstName + " " + data.passenger.lastName : "N/A";
    doc.text(paxName, 20, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(data.contactEmail || "", 20, y); y += 12;
    doc.setFillColor(245, 245, 250); doc.rect(20, y, W - 40, 20, "F");
    doc.setFontSize(8); doc.setTextColor(90, 100, 128);
    doc.text("FLIGHT", 25, y + 6); doc.text("ROUTE", 65, y + 6); doc.text("DATE", 120, y + 6);
    doc.setFontSize(10); doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "bold");
    if (data.flight) {
      doc.text(data.flight.flightNumber || "N/A", 25, y + 14);
      doc.setFont("helvetica", "normal");
      doc.text((data.flight.departure?.airportCode || "?") + " > " + (data.flight.arrival?.airportCode || "?"), 65, y + 14);
      doc.text(data.flight.departure?.scheduledTime ? new Date(data.flight.departure.scheduledTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "TBD", 120, y + 14);
    }
    y += 28;
    doc.setFillColor(99, 102, 241); doc.rect(20, y, W - 40, 8, "F");
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", 25, y + 5.5); doc.text("QTY", 120, y + 5.5); doc.text("AMOUNT", W - 25, y + 5.5, { align: "right" }); y += 12;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); doc.setFontSize(9);
    const classLabel = (data.cabinClass || "economy").charAt(0).toUpperCase() + (data.cabinClass || "economy").slice(1);
    doc.text(classLabel + " Class - " + (data.flight?.flightNumber || ""), 25, y + 1);
    doc.text(String(data.passengerCount), 120, y + 1);
    doc.text("$" + (data.payment.amount || 0).toLocaleString(), W - 25, y + 1, { align: "right" }); y += 16;
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(99, 102, 241);
    doc.text("TOTAL", 130, y); doc.text("$" + (data.payment.amount || 0).toLocaleString() + " USD", W - 25, y, { align: "right" }); y += 16;
    doc.setFontSize(8); doc.setTextColor(90, 100, 128); doc.setFont("helvetica", "normal");
    doc.text("Payment: " + (data.payment.method || "N/A").toUpperCase() + " | TXN: " + (data.payment.transactionId || "N/A"), 20, y); y += 8;
    data.passengers?.forEach((p: any, i: number) => { doc.text((i + 1) + ". " + p.firstName + " " + p.lastName, 20, y); y += 5; });
    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text("SKYLUX Airways Ltd. | admin@skylux.pro | This is a computer-generated invoice.", W / 2, 280, { align: "center" });
    doc.save("SKYLUX_Invoice_" + data.bookingReference + ".pdf");
  };

  if (loading) return (<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:36,height:36,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 1s linear infinite"}} /><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);
  if (error || !data) return (<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.sub}}><p>{error || "Not found"}</p></div></div>);

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"40px 16px",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}"}</style>
      <div style={{maxWidth:700,margin:"0 auto",animation:"fadeUp 0.6s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:2,color:C.text}}>SKYLUX <span style={{color:C.accent,fontSize:10,letterSpacing:3}}>AIRWAYS</span></div>
          <button onClick={generatePDF} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#818cf8)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>Download Invoice PDF</button>
        </div>

        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"24px 28px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,color:C.dim,letterSpacing:2}}>INVOICE</div>
              <div style={{fontSize:20,fontWeight:700,color:C.accent,fontFamily:"monospace"}}>{data.invoiceNumber}</div>
              <div style={{fontSize:11,color:C.dim,marginTop:4}}>Issued: {fmtDate(data.issueDate)}</div>
            </div>
            <span style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:700,height:"fit-content",background:(data.payment.status==="completed"?C.emerald:C.accent)+"15",color:data.payment.status==="completed"?C.emerald:C.accent,textTransform:"uppercase"}}>{data.payment.status}</span>
          </div>
          <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,marginBottom:4}}>BILL TO</div>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{data.passenger?.firstName} {data.passenger?.lastName}</div>
            <div style={{fontSize:12,color:C.sub}}>{data.contactEmail}</div>
          </div>
          {data.flight && (
            <div style={{padding:"20px 28px",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{textAlign:"center"}}><div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.departure.airportCode}</div><div style={{color:C.dim,fontSize:11}}>{data.flight.departure.city}</div></div>
                <div style={{textAlign:"center",flex:1}}><div style={{color:C.accent,fontSize:13,fontWeight:700}}>{data.flight.flightNumber}</div><div style={{borderTop:"1px dashed "+C.border,margin:"6px 20px"}} /><div style={{color:C.dim,fontSize:10}}>{data.flight.aircraft}</div></div>
                <div style={{textAlign:"center"}}><div style={{color:C.text,fontSize:24,fontWeight:700}}>{data.flight.arrival.airportCode}</div><div style={{color:C.dim,fontSize:11}}>{data.flight.arrival.city}</div></div>
              </div>
            </div>
          )}
          <div style={{padding:"20px 28px",display:"flex",justifyContent:"flex-end"}}>
            <div style={{width:250}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:14,color:C.sub}}>Subtotal</span>
                <span style={{fontSize:14,color:C.text}}>{"$"}{(data.payment.amount||0).toLocaleString()}</span>
              </div>
              <div style={{borderTop:"2px solid "+C.accent,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:18,fontWeight:700,color:C.text}}>Total</span>
                <span style={{fontSize:18,fontWeight:700,color:C.accent}}>{"$"}{(data.payment.amount||0).toLocaleString()} USD</span>
              </div>
            </div>
          </div>
          <div style={{padding:"16px 28px",borderTop:"1px solid "+C.border,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:10,color:C.dim}}>Payment: {(data.payment.method||"").toUpperCase()} | TXN: {data.payment.transactionId||"N/A"}</span>
            <span style={{fontSize:10,color:C.dim}}>SKYLUX Airways Ltd.</span>
          </div>
        </div>
      </div>
    </div>
  );
}