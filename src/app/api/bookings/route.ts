import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";

const _f = Flight;
const _a = Aircraft;

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 50);
    const status = sp.get("status");

    const query: any = {};
    // Admin sees all, customer sees only their own
    if (!["admin", "superadmin"].includes(authResult.user.role)) {
      query.user = authResult.user._id;
    }
    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status type" })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { bookings },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}
