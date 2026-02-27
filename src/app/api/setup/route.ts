import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import User from "@/models/User";

// POST /api/setup — Creates the first admin account
// Only works if zero admin/superadmin users exist in the database
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: { $in: ["admin", "superadmin"] } });
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: "Admin account already exists. Use /auth to login." }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, error: "firstName, lastName, email, and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    const admin = await User.create({
      firstName, lastName,
      email: email.toLowerCase(),
      password,
      role: "superadmin",
      isActive: true,
      loyaltyTier: "diamond",
      loyaltyPoints: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: { _id: admin._id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role },
      },
      message: "Superadmin account created. Login at /auth",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ success: false, error: error.message || "Setup failed" }, { status: 500 });
  }
}

// GET /api/setup — Check if setup is needed
export async function GET() {
  try {
    await connectDB();
    const adminCount = await User.countDocuments({ role: { $in: ["admin", "superadmin"] } });
    return NextResponse.json({ success: true, data: { setupRequired: adminCount === 0, adminCount } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Check failed" }, { status: 500 });
  }
}
