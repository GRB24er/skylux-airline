import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import { authorizeRoles } from "@/middleware/auth";
import "@/models/Aircraft";


// GET all flights (admin)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 100);
    const status = sp.get("status");
    const type = sp.get("type");
    const search = sp.get("search");

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { flightNumber: { $regex: search, $options: "i" } },
        { "departure.city": { $regex: search, $options: "i" } },
        { "arrival.city": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Flight.countDocuments(query);
    const flights = await Flight.find(query)
      .populate("aircraft", "name model registration")
      .sort({ "departure.scheduledTime": -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { flights },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch flights" }, { status: 500 });
  }
}

// POST: Create new flight (admin)
export async function POST(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin"]);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const body = await req.json();
    const flight = await Flight.create(body);

    return NextResponse.json({ success: true, data: { flight }, message: "Flight created" }, { status: 201 });
  } catch (error: any) {
    console.error("Create flight error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create flight" }, { status: 500 });
  }
}
