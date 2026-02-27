import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authorizeRoles } from "@/middleware/auth";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin"]);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const sp = req.nextUrl.searchParams;
    const period = sp.get("period") || "30"; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Booking.aggregate([
      {
        $match: {
          "payment.status": "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "flights", localField: "flights.flight",
          foreignField: "_id", as: "flightDetails",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$payment.amount" },
          bookings: { $sum: 1 },
          commercial: {
            $sum: {
              $cond: [{ $eq: [{ $arrayElemAt: ["$flightDetails.type", 0] }, "commercial"] }, "$payment.amount", 0],
            },
          },
          privateJet: {
            $sum: {
              $cond: [{ $eq: [{ $arrayElemAt: ["$flightDetails.type", 0] }, "private-jet"] }, "$payment.amount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenue: revenueData.map((r) => ({
          date: r._id,
          total: r.total,
          commercial: r.commercial,
          privateJet: r.privateJet,
          bookings: r.bookings,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch revenue data" }, { status: 500 });
  }
}
