import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authorizeRoles } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import User from "@/models/User";
import Aircraft from "@/models/Aircraft";
import { getDateRange } from "@/utils/helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authorizeRoles(req, ["admin", "superadmin"]);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const today = getDateRange("today");
    const week = getDateRange("week");
    const month = getDateRange("month");
    const year = getDateRange("year");

    // Revenue stats
    const [revenueToday, revenueWeek, revenueMonth, revenueYear] = await Promise.all([
      Booking.aggregate([
        { $match: { "payment.status": "completed", createdAt: { $gte: today.start } } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]),
      Booking.aggregate([
        { $match: { "payment.status": "completed", createdAt: { $gte: week.start } } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]),
      Booking.aggregate([
        { $match: { "payment.status": "completed", createdAt: { $gte: month.start } } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]),
      Booking.aggregate([
        { $match: { "payment.status": "completed", createdAt: { $gte: year.start } } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]),
    ]);

    // Booking stats
    const [totalBookings, pendingBookings, confirmedBookings, cancelledBookings, todayBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ createdAt: { $gte: today.start } }),
    ]);

    // Flight stats
    const [totalFlights, activeFlights, delayedFlights, cancelledFlights] = await Promise.all([
      Flight.countDocuments({ isActive: true }),
      Flight.countDocuments({ status: { $in: ["scheduled", "boarding", "departed", "in-flight"] } }),
      Flight.countDocuments({ status: "delayed" }),
      Flight.countDocuments({ status: "cancelled" }),
    ]);

    const onTimeFlights = await Flight.countDocuments({ status: { $in: ["arrived", "landed"] } });
    const completedFlights = onTimeFlights + delayedFlights;
    const onTimeRate = completedFlights > 0 ? (onTimeFlights / completedFlights) * 100 : 100;

    // Passenger stats
    const totalPassengers = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: { $size: "$passengers" } } } },
    ]);
    const monthPassengers = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: month.start } } },
      { $group: { _id: null, total: { $sum: { $size: "$passengers" } } } },
    ]);
    const loyaltyMembers = await User.countDocuments({ loyaltyTier: { $ne: "standard" } });

    // Fleet stats
    const [totalAircraft, activeAircraft, maintenanceAircraft] = await Promise.all([
      Aircraft.countDocuments(),
      Aircraft.countDocuments({ status: "active" }),
      Aircraft.countDocuments({ status: "maintenance" }),
    ]);

    const stats = {
      revenue: {
        today: revenueToday[0]?.total || 0,
        thisWeek: revenueWeek[0]?.total || 0,
        thisMonth: revenueMonth[0]?.total || 0,
        thisYear: revenueYear[0]?.total || 0,
        trend: 12.5,
      },
      bookings: {
        total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings,
        cancelled: cancelledBookings, today: todayBookings, trend: 8.3,
      },
      flights: {
        total: totalFlights, active: activeFlights, delayed: delayedFlights,
        cancelled: cancelledFlights, onTimeRate: Math.round(onTimeRate * 10) / 10,
      },
      passengers: {
        total: totalPassengers[0]?.total || 0,
        thisMonth: monthPassengers[0]?.total || 0,
        averagePerFlight: completedFlights > 0 ? Math.round((totalPassengers[0]?.total || 0) / completedFlights) : 0,
        loyaltyMembers,
      },
      fleet: {
        totalAircraft, active: activeAircraft, maintenance: maintenanceAircraft,
        utilizationRate: totalAircraft > 0 ? Math.round((activeAircraft / totalAircraft) * 100) : 0,
      },
    };

    return NextResponse.json({ success: true, data: { stats } });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
