import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const existing = await User.findOne({ email: "admin@skyluxairways.com" }).select("+password");
    if (existing) {
      existing.password = "Admin@2026!";
      await existing.save();
      return NextResponse.json({ success: true, message: "Admin password reset" });
    }
    await User.create({
      email: "admin@skyluxairways.com",
      password: "Admin@2026!",
      firstName: "System",
      lastName: "Admin",
      role: "admin",
      isActive: true,
      isVerified: true,
      loyaltyPoints: 0,
      totalFlights: 0,
      totalSpent: 0,
    });
    return NextResponse.json({ success: true, message: "Admin created" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
