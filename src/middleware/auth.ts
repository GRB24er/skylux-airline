import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/database";
import User from "@/models/User";

export type UserRole = "customer" | "admin" | "superadmin" | "pilot" | "crew";

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "skylux-secret-change-in-production";

export function generateToken(payload: { userId: string; email: string; role: UserRole }): string {
  // @ts-ignore
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  return req.cookies.get("token")?.value || null;
}

export async function authenticateUser(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return { error: NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 }) };
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 }) };
  }
  await connectDB();
  const user = await User.findById(decoded.userId).select("-password");
  if (!user || !user.isActive) {
    return { error: NextResponse.json({ success: false, error: "User not found or deactivated" }, { status: 401 }) };
  }
  return { user, decoded };
}

export async function authorizeRoles(req: NextRequest, allowedRoles: UserRole[]) {
  const result = await authenticateUser(req);
  if ("error" in result) return result;
  if (!allowedRoles.includes(result.user.role as UserRole)) {
    return { error: NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 }) };
  }
  return result;
}
