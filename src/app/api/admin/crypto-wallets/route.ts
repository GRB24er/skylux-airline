import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import CryptoWallet from "@/models/CryptoWallet";
import jwt from "jsonwebtoken";

function getAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try { const d: any = jwt.verify(token, process.env.JWT_SECRET || "skylux-secret-key-2026"); return d.role === "admin" ? d : null; } catch { return null; }
}

// GET — list all wallets
export async function GET(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const wallets = await CryptoWallet.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: { wallets } });
}

// POST — create wallet
export async function POST(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const { currency, symbol, network, address, icon, minAmount, confirmations } = body;
  if (!currency || !symbol || !network || !address) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  const wallet = await CryptoWallet.create({ currency, symbol: symbol.toUpperCase(), network, address, icon: icon || "₿", minAmount: minAmount || 0, confirmations: confirmations || 3, createdBy: admin.userId });
  return NextResponse.json({ success: true, data: { wallet } });
}

// PUT — update wallet
export async function PUT(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  const wallet = await CryptoWallet.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, data: { wallet } });
}

// DELETE — remove wallet
export async function DELETE(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  await CryptoWallet.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
