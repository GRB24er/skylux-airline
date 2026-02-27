import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Crew from "@/models/Crew";
import { authorizeRoles } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin", "pilot", "crew"]);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const sp = req.nextUrl.searchParams;
    const role = sp.get("role");
    const status = sp.get("status");
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 50);

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;

    // Non-admin crew can only see their own profile
    if (["pilot", "crew"].includes(authResult.user.role)) {
      query.user = authResult.user._id;
    }

    const total = await Crew.countDocuments(query);
    const crew = await Crew.find(query)
      .populate("user", "firstName lastName email avatar phone")
      .sort({ employeeId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { crew },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch crew" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin"]);
    if ("error" in authResult) return authResult.error;
    await connectDB();
    const body = await req.json();
    const member = await Crew.create(body);
    return NextResponse.json({ success: true, data: { crew: member } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
