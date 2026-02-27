import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import CryptoWallet from "@/models/CryptoWallet";
import CryptoPayment from "@/models/CryptoPayment";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || "skylux-secret-key-2026") as any; } catch { return null; }
}

// GET — list active crypto wallets for customers
export async function GET() {
  await connectDB();
  const wallets = await CryptoWallet.find({ isActive: true }).select("currency symbol network address icon minAmount").lean();
  return NextResponse.json({ success: true, data: { wallets } });
}

// POST — create a crypto payment request (triggers admin notification)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const body = await req.json();
  const { walletId, amountUSD, bookingReference, flightDetails } = body;

  if (!walletId || !amountUSD || !bookingReference) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }

  const wallet = await CryptoWallet.findById(walletId);
  if (!wallet || !wallet.isActive) {
    return NextResponse.json({ success: false, error: "Wallet not available" }, { status: 400 });
  }

  // Create payment request
  const payment = await CryptoPayment.create({
    bookingReference,
    userId: user.userId,
    userEmail: user.email,
    userName: `${user.firstName} ${user.lastName}`,
    walletId: wallet._id,
    currency: wallet.currency,
    symbol: wallet.symbol,
    network: wallet.network,
    walletAddress: wallet.address,
    amountUSD,
    flightDetails: flightDetails || {},
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour window
  });

  // ── Instant Admin Notification ──
  await Notification.create({
    type: "booking",
    title: "🔔 NEW CRYPTO PAYMENT",
    message: `${user.firstName} ${user.lastName} (${user.email}) initiated a ${wallet.symbol} payment of $${amountUSD.toLocaleString()} for booking ${bookingReference}. Flight: ${flightDetails?.flightNumber || "N/A"} ${flightDetails?.from || ""} → ${flightDetails?.to || ""}. Wallet: ${wallet.address.slice(0, 12)}... Network: ${wallet.network}. CHECK IMMEDIATELY.`,
    priority: "critical",
    isRead: false,
  });

  return NextResponse.json({
    success: true,
    data: {
      payment: {
        id: payment._id,
        bookingReference: payment.bookingReference,
        currency: payment.currency,
        symbol: payment.symbol,
        network: payment.network,
        walletAddress: payment.walletAddress,
        amountUSD: payment.amountUSD,
        status: payment.status,
        expiresAt: payment.expiresAt,
      },
    },
  });
}
