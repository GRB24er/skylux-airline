import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Flight from "@/models/Flight";
import Booking from "@/models/Booking";
import { sendEmail } from "@/services/email";
const _f = Flight;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://skylux.pro";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    if (!["admin","superadmin"].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const { flightId, status, delayMinutes, note } = await req.json();
    if (!flightId || !status) return NextResponse.json({ success: false, error: "flightId and status required" }, { status: 400 });
    const flight = await Flight.findById(flightId);
    if (!flight) return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    flight.status = status;
    if (status === "delayed" && delayMinutes) {
      flight.departure.actualTime = new Date(flight.departure.scheduledTime.getTime() + delayMinutes * 60000);
      flight.arrival.actualTime = new Date(flight.arrival.scheduledTime.getTime() + delayMinutes * 60000);
    }
    await flight.save();
    const bookings = await Booking.find({ "flights.flight": flightId, status: { $in: ["confirmed", "checked-in"] } });
    let emailsSent = 0;
    for (const booking of bookings) {
      if (!booking.contactEmail) continue;
      const pax = booking.passengers[0];
      const name = pax ? pax.firstName + " " + pax.lastName : "Valued Passenger";
      let statusMsg = "The status of flight " + flight.flightNumber + " has been updated to: " + status.toUpperCase() + ".";
      let statusColor = "#818cf8";
      if (status === "delayed") { statusMsg = "Your flight " + flight.flightNumber + " has been delayed" + (delayMinutes ? " by approximately " + delayMinutes + " minutes" : "") + "."; statusColor = "#ef4444"; }
      else if (status === "boarding") { statusMsg = "Boarding has commenced for flight " + flight.flightNumber + ". Please proceed to Gate " + (flight.departure.gate || "TBD") + "."; statusColor = "#fbbf24"; }
      else if (status === "cancelled") { statusMsg = "We regret to inform you that flight " + flight.flightNumber + " has been cancelled."; statusColor = "#ef4444"; }
      else if (status === "departed") { statusMsg = "Flight " + flight.flightNumber + " has departed."; statusColor = "#22d3ee"; }
      else if (status === "landed" || status === "arrived") { statusMsg = "Flight " + flight.flightNumber + " has arrived at " + flight.arrival.city + "."; statusColor = "#10b981"; }
      if (note) statusMsg += " " + note;
      const html = buildStatusEmail(name, statusMsg, statusColor, flight, booking.bookingReference);
      try { await sendEmail({ to: booking.contactEmail, subject: "SKYLUX Airways - Flight " + flight.flightNumber + " " + status.charAt(0).toUpperCase() + status.slice(1), html }); emailsSent++; } catch (e) { console.error("Email err:", e); }
    }
    return NextResponse.json({ success: true, message: "Flight " + flight.flightNumber + " updated to " + status + ". " + emailsSent + " passenger(s) notified." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function buildStatusEmail(name: string, statusMsg: string, statusColor: string, flight: any, bookingRef: string): string {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">' +
    '<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">' +
    '<div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">' +
    '<div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div></div>' +
    '<div style="padding:32px;">' +
    '<div style="text-align:center;margin-bottom:24px;"><div style="display:inline-block;padding:8px 24px;border-radius:8px;background:' + statusColor + '15;border:1px solid ' + statusColor + '30;">' +
    '<span style="color:' + statusColor + ';font-size:14px;font-weight:700;letter-spacing:1px;">FLIGHT STATUS UPDATE</span></div></div>' +
    '<p style="color:#f0f0f5;font-size:16px;margin:0 0 8px;">Dear ' + name + ',</p>' +
    '<p style="color:#8892b0;font-size:14px;line-height:1.7;margin:0 0 24px;">' + statusMsg + '</p>' +
    '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;">' +
    '<table width="100%" style="border-collapse:collapse;">' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Flight</td><td style="text-align:right;color:#f0f0f5;font-weight:bold;">' + flight.flightNumber + '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Route</td><td style="text-align:right;color:#f0f0f5;">' + flight.departure.city + ' (' + flight.departure.airportCode + ') &rarr; ' + flight.arrival.city + ' (' + flight.arrival.airportCode + ')</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Status</td><td style="text-align:right;color:' + statusColor + ';font-weight:bold;text-transform:uppercase;">' + flight.status + '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Reference</td><td style="text-align:right;color:#818cf8;font-weight:bold;">' + bookingRef + '</td></tr>' +
    '</table></div>' +
    '<a href="' + BASE + '/track/' + bookingRef + '" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;">Track Your Booking</a>' +
    '</div>' +
    '<div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);"><p style="color:#5a6480;font-size:10px;margin:0;">&copy; ' + new Date().getFullYear() + ' SKYLUX Airways</p></div>' +
    '</div></body></html>';
}
