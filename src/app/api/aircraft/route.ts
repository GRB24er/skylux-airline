import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Aircraft from "@/models/Aircraft";
import { authorizeRoles } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const type = sp.get("type");
    const status = sp.get("status");
    const category = sp.get("category");
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 50);

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Aircraft.countDocuments(query);
    const aircraft = await Aircraft.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { aircraft },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch aircraft" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin"]);
    if ("error" in authResult) return authResult.error;
    await connectDB();
    const body = await req.json();
    const aircraft = await Aircraft.create(body);
    return NextResponse.json({ success: true, data: { aircraft } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed" }, { status: 500 });
  }
}
