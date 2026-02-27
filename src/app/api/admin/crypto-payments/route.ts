import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import CryptoPayment from "@/models/CryptoPayment";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

function getAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try { const d: any = jwt.verify(token, process.env.JWT_SECRET || "skylux-secret-key-2026"); return d.role === "admin" ? d : null; } catch { return null; }
}

// GET — all crypto payments
export async function GET(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const status = req.nextUrl.searchParams.get("status");
  const query: any = {};
  if (status) query.status = status;
  const payments = await (CryptoPayment as any).find(query).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ success: true, data: { payments } });
}

// PUT — confirm or update payment status
export async function PUT(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id, status, adminNotes } = await req.json();
  if (!id || !status) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });

  const update: any = { status };
  if (adminNotes) update.adminNotes = adminNotes;
  if (status === "confirmed") { update.confirmedBy = admin.userId; update.confirmedAt = new Date(); }

  const payment = await CryptoPayment.findByIdAndUpdate(id, update, { new: true });
  if (!payment) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Notify about status change
  await Notification.create({
    type: "booking",
    title: status === "confirmed" ? "✅ CRYPTO PAYMENT CONFIRMED" : `⚠ Payment ${status.toUpperCase()}`,
    message: `Crypto payment ${payment.bookingReference} (${payment.symbol} $${payment.amountUSD}) for ${payment.userName} marked as ${status} by admin.`,
    priority: status === "confirmed" ? "high" : "medium",
    isRead: false,
  });

  return NextResponse.json({ success: true, data: { payment } });
}
