import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import { sendEmail, bookingConfirmationEmail, eTicketEmail } from "@/services/email";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    if (!["admin","superadmin"].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const { bookingId, type, customSubject, customBody, toEmail } = await req.json();

    // Custom email
    if (type === "custom" && toEmail && customSubject && customBody) {
      const sent = await sendEmail({ to: toEmail, subject: customSubject, html: wrapHtml(customBody) });
      return NextResponse.json({ success: sent, message: sent ? "Email sent" : "Failed to send" });
    }

    // Booking-based emails
    if (!bookingId) return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
    const booking = await Booking.findById(bookingId)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status" })
      .populate("user", "firstName lastName email");
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const flight = booking.flights?.[0]?.flight;
    const pax = booking.passengers?.[0];
    const email = booking.contactEmail || (booking.user as any)?.email;
    if (!email) return NextResponse.json({ success: false, error: "No email address" }, { status: 400 });

    let sent = false;
    if (type === "confirmation") {
      sent = await sendEmail({
        to: email,
        subject: `SKYLUX Airways - Booking Confirmed ${booking.bookingReference}`,
        html: bookingConfirmationEmail({
          name: `${pax?.firstName || ""} ${pax?.lastName || ""}`,
          bookingRef: booking.bookingReference,
          flightNumber: flight?.flightNumber || "N/A",
          from: `${flight?.departure?.city || "?"} (${flight?.departure?.airportCode || "?"})`,
          to: `${flight?.arrival?.city || "?"} (${flight?.arrival?.airportCode || "?"})`,
          date: flight?.departure?.scheduledTime ? new Date(flight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD",
          cabin: booking.cabinClass?.charAt(0).toUpperCase() + booking.cabinClass?.slice(1) || "Economy",
          total: `$${(booking.payment?.amount || 0).toLocaleString()}`,
        }),
      });
    } else if (type === "eticket") {
      const depTime = flight?.departure?.scheduledTime;
      const arrTime = flight?.arrival?.scheduledTime;
      const gate = flight?.departure?.gate || "TBD";
      const boardingTime = depTime ? new Date(new Date(depTime).getTime() - 45 * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD";
      const seats = ["12A","14C","18F","22A","7B","3A"];
      const seat = seats[Math.floor(Math.random() * seats.length)];
      sent = await sendEmail({
        to: email,
        subject: `SKYLUX Airways - E-Ticket ${booking.bookingReference}`,
        html: eTicketEmail({
          name: `${pax?.firstName || ""} ${pax?.lastName || ""}`,
          bookingRef: booking.bookingReference,
          flightNumber: flight?.flightNumber || "N/A",
          from: flight?.departure?.city || "?",
          fromCode: flight?.departure?.airportCode || "?",
          to: flight?.arrival?.city || "?",
          toCode: flight?.arrival?.airportCode || "?",
          date: depTime ? new Date(depTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD",
          departTime: depTime ? new Date(depTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD",
          arriveTime: arrTime ? new Date(arrTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD",
          seat, gate, boarding: boardingTime,
        }),
      });
    }

    return NextResponse.json({ success: sent, message: sent ? `${type} email sent to ${email}` : "Failed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function wrapHtml(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
  </div>
  <div style="padding:32px;color:#f0f0f5;font-size:14px;line-height:1.6;">${body}</div>
  <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} SKYLUX Airways</p>
  </div>
</div></body></html>`;
}
