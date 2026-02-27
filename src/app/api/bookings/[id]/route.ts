import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import "@/models/Aircraft";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const query: any = {};
    // Support lookup by booking reference or ObjectId
    if (params.id.startsWith("SX-")) {
      query.bookingReference = params.id.toUpperCase();
    } else {
      query._id = params.id;
    }

    const booking = await Booking.findOne(query)
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model" } })
      .populate("user", "firstName lastName email phone loyaltyTier")
      .lean();

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Customers can only see their own bookings
    if (!["admin", "superadmin"].includes(authResult.user.role)) {
      if (booking.user._id?.toString() !== authResult.user._id.toString()) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: { booking } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 });
  }
}

// Update booking (admin)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const body = await req.json();
    const booking = await Booking.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: { booking } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
