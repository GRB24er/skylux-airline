import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import User from "@/models/User";
import { generateToken } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      role: "customer",
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role as any });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, role: user.role, loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier,
        },
        token,
      },
      message: "Account created successfully",
    }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: error.message || "Registration failed" }, { status: 500 });
  }
}
