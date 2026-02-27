import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import User from "@/models/User";
import { generateToken } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role as any });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, role: user.role, loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier, avatar: user.avatar,
        },
        token,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
