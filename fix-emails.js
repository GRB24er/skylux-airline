const fs = require("fs");
const file = "src/services/email.ts";
let c = fs.readFileSync(file, "utf8");

// Replace bookingConfirmationEmail
const oldConfirm = c.indexOf("export function bookingConfirmationEmail");
const oldEticket = c.indexOf("export function eTicketEmail");
const beforeConfirm = c.substring(0, oldConfirm);
const afterEticket = c.substring(c.indexOf("export function eTicketEmail"));
const afterEticketEnd = afterEticket.indexOf("\n}\n") + 3;
const remaining = c.substring(oldConfirm).substring(afterEticketEnd + (afterEticket.length - afterEticket.length));

// Just rewrite the whole file
fs.writeFileSync(file, `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://skylux.pro";

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
  return \`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08));">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#f0f0f5;margin:0 0 8px;font-size:22px;">Booking Confirmed</h2>
    <p style="color:#8892b0;margin:0 0 24px;">Dear \${data.name}, your flight has been booked successfully.</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;">
      <table width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Reference</td><td style="text-align:right;color:#818cf8;font-size:16px;font-weight:bold;">\${data.bookingRef}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Flight</td><td style="text-align:right;color:#f0f0f5;font-size:14px;font-weight:bold;">\${data.flightNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Route</td><td style="text-align:right;color:#f0f0f5;font-size:14px;">\${data.from} &rarr; \${data.to}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Date</td><td style="text-align:right;color:#f0f0f5;font-size:14px;">\${data.date}</td></tr>
        <tr><td style="padding:8px 0;color:#5a6480;font-size:12px;">Cabin</td><td style="text-align:right;color:#f0f0f5;font-size:14px;">\${data.cabin}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);"><td style="padding:12px 0 0;color:#5a6480;font-size:12px;">Total</td><td style="text-align:right;color:#818cf8;font-size:18px;font-weight:bold;padding-top:12px;">\${data.total}</td></tr>
      </table>
    </div>
    <div style="margin-bottom:16px;">
      <a href="\${BASE}/checkin" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:10px;">Online Check-In</a>
      <a href="\${BASE}/boarding-pass/\${data.bookingRef}" style="display:block;text-align:center;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">View & Download Boarding Pass</a>
    </div>
    <p style="color:#5a6480;font-size:11px;margin:16px 0 0;text-align:center;">No login required - access your boarding pass anytime using the link above.</p>
  </div>
  <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:11px;margin:0;">&copy; \${new Date().getFullYear()} SKYLUX Airways. All rights reserved.</p>
  </div>
</div></body></html>\`;
}

export function eTicketEmail(data: {
  name: string; bookingRef: string; flightNumber: string;
  from: string; fromCode: string; to: string; toCode: string;
  date: string; departTime: string; arriveTime: string;
  seat: string; gate: string; boarding: string;
}): string {
  return \`<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#030614;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0f1e;border:1px solid rgba(255,255,255,0.06);">
  <div style="padding:32px;background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.1));text-align:center;">
    <div style="font-size:24px;font-weight:bold;color:#f0f0f5;letter-spacing:2px;">SKYLUX <span style="color:#818cf8;font-size:12px;letter-spacing:3px;">AIRWAYS</span></div>
    <div style="color:#818cf8;font-size:12px;letter-spacing:3px;margin-top:8px;">E-TICKET / BOARDING PASS</div>
  </div>
  <div style="padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="color:#5a6480;font-size:10px;letter-spacing:2px;">PASSENGER</div>
      <div style="color:#f0f0f5;font-size:20px;font-weight:bold;">\${data.name}</div>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <table width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="text-align:center;width:35%;"><div style="color:#f0f0f5;font-size:32px;font-weight:bold;">\${data.fromCode}</div><div style="color:#5a6480;font-size:12px;">\${data.from}</div><div style="color:#818cf8;font-size:14px;font-weight:bold;">\${data.departTime}</div></td>
          <td style="text-align:center;width:30%;"><div style="color:#818cf8;font-size:12px;">\${data.flightNumber}</div><div style="border-top:1px dashed rgba(255,255,255,0.1);margin:8px 16px;"></div><div style="color:#5a6480;font-size:11px;">DIRECT</div></td>
          <td style="text-align:center;width:35%;"><div style="color:#f0f0f5;font-size:32px;font-weight:bold;">\${data.toCode}</div><div style="color:#5a6480;font-size:12px;">\${data.to}</div><div style="color:#818cf8;font-size:14px;font-weight:bold;">\${data.arriveTime}</div></td>
        </tr>
      </table>
    </div>
    <table width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;text-align:center;width:25%;"><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">DATE</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">\${data.date}</div></td>
        <td style="padding:16px;text-align:center;width:25%;"><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">GATE</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">\${data.gate}</div></td>
        <td style="padding:16px;text-align:center;width:25%;"><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">SEAT</div><div style="color:#818cf8;font-size:13px;font-weight:600;">\${data.seat}</div></td>
        <td style="padding:16px;text-align:center;width:25%;"><div style="color:#5a6480;font-size:9px;letter-spacing:1px;">BOARDING</div><div style="color:#f0f0f5;font-size:13px;font-weight:600;">\${data.boarding}</div></td>
      </tr>
    </table>
    <div style="text-align:center;margin-bottom:24px;padding:16px;border:1px dashed rgba(255,255,255,0.1);border-radius:8px;">
      <div style="color:#5a6480;font-size:10px;letter-spacing:1px;">BOOKING REFERENCE</div>
      <div style="color:#818cf8;font-size:24px;font-weight:bold;letter-spacing:3px;">\${data.bookingRef}</div>
    </div>
    <div style="margin-bottom:12px;">
      <a href="\${BASE}/boarding-pass/\${data.bookingRef}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:10px;">Download Boarding Pass (PDF)</a>
      <a href="\${BASE}/checkin" style="display:block;text-align:center;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#10b981;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Complete Online Check-In</a>
    </div>
    <p style="color:#5a6480;font-size:11px;margin:16px 0 0;text-align:center;">No account needed - click the links above to access your boarding pass and check-in directly.</p>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#5a6480;font-size:10px;margin:0;">Present this e-ticket at check-in. Arrive at least 2 hours before departure.</p>
    <p style="color:#5a6480;font-size:10px;margin:4px 0 0;">&copy; \${new Date().getFullYear()} SKYLUX Airways</p>
  </div>
</div></body></html>\`;
}
`, "utf8");
console.log("Email templates updated with boarding pass + check-in links");
