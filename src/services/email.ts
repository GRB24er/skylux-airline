import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SKYLUX Airways" <noreply@skyluxairways.com>',
      ...options,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export function bookingConfirmationEmail(data: {
  name: string; bookingRef: string; flightNumber: string;
  from: string; to: string; date: string; cabin: string; total: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#f0f0f5;margin:0 0 8px;font-size:22px;">Booking Confirmed ✓</h2>
    <p style="color:#8892b0;margin:0 0 24px;">Dear ${data.name}, your flight has been booked successfully.</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <div><div style="color:#5a6480;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Reference</div><div style="color:#818cf8;font-size:18px;font-weight:bold;">${data.bookingRef}</div></div>
        <div style="text-align:right;"><div style="color:#5a6480;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Flight</div><div style="color:#f0f0f5;font-size:18px;font-weight:bold;">${data.flightNumber}</div></div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
        <table width="100%" style="color:#8892b0;font-size:14px;">
          <tr><td style="padding:6px 0;color:#5a6480;">Route</td><td style="text-align:right;color:#f0f0f5;">${data.from} → ${data.to}</td></tr>
          <tr><td style="padding:6px 0;color:#5a6480;">Date</td><td style="text-align:right;color:#f0f0f5;">${data.date}</td></tr>
          <tr><td style="padding:6px 0;color:#5a6480;">Cabin</td><td style="text-align:right;color:#f0f0f5;">${data.cabin}</td></tr>
          <tr><td style="padding:6px 0;color:#5a6480;">Total</td><td style="text-align:right;color:#818cf8;font-weight:bold;">${data.total}</td></tr>
        </table>
      </div>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${data.bookingRef}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;">View Booking Details</a>
  </div>
  <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:11px;margin:0;">© ${new Date().getFullYear()} SKYLUX Airways. All rights reserved.</p>
  </div>
</div>
</body></html>`;
}

export function eTicketEmail(data: {
  name: string; bookingRef: string; flightNumber: string;
  from: string; fromCode: string; to: string; toCode: string;
  date: string; departTime: string; arriveTime: string;
  seat: string; gate: string; boarding: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.1));text-align:center;">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
    <div style="color:#818cf8;font-size:12px;letter-spacing:3px;margin-top:8px;">E-TICKET / BOARDING PASS</div>
  </div>
  <div style="padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="color:#5a6480;font-size:10px;letter-spacing:2px;">PASSENGER</div>
      <div style="color:#f0f0f5;font-size:20px;font-weight:bold;">${data.name}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
      <div style="text-align:center;">
        <div style="color:#f0f0f5;font-size:32px;font-weight:bold;">${data.fromCode}</div>
        <div style="color:#5a6480;font-size:12px;">${data.from}</div>
        <div style="color:#818cf8;font-size:14px;font-weight:bold;">${data.departTime}</div>
      </div>
      <div style="flex:1;text-align:center;padding:0 16px;">
        <div style="color:#818cf8;font-size:12px;">${data.flightNumber}</div>
        <div style="border-top:1px dashed rgba(255,255,255,0.1);margin:8px 0;"></div>
        <div style="color:#5a6480;font-size:11px;">DIRECT</div>
      </div>
      <div style="text-align:center;">
        <div style="color:#f0f0f5;font-size:32px;font-weight:bold;">${data.toCode}</div>
        <div style="color:#5a6480;font-size:12px;">${data.to}</div>
        <div style="color:#818cf8;font-size:14px;font-weight:bold;">${data.arriveTime}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;">
      <div><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">DATE</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">${data.date}</div></div>
      <div><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">GATE</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">${data.gate}</div></div>
      <div><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">SEAT</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">${data.seat}</div></div>
      <div><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">BOARDING</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">${data.boarding}</div></div>
    </div>
    <div style="text-align:center;margin-top:24px;padding:16px;border:1px dashed rgba(255,255,255,0.1);border-radius:8px;">
      <div style="color:#5a6480;font-size:10px;letter-spacing:1px;">BOOKING REFERENCE</div>
      <div style="color:#818cf8;font-size:24px;font-weight:bold;letter-spacing:3px;">${data.bookingRef}</div>
    </div>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:10px;margin:0;">Present this e-ticket at check-in. Arrive at least 2 hours before departure.</p>
  </div>
</div>
</body></html>`;
}
