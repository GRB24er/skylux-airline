import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if ("error" in auth) return auth.error;
    if (!["admin", "superadmin"].includes(auth.user.role)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const role = sp.get("role");
    const query: any = { isActive: true };
    if (role) query.role = role;
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: { users } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
