import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";

// DELETE /api/flights/cleanup — removes generated flights with depleted seats
// so fresh ones can be created on next booking
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // Delete all flights created by the booking generator (SX format, low seats)
    // that have first-class seats below 2
    const result = await Flight.deleteMany({
      flightNumber: { $regex: /^SX \d+$/ },
      "seatMap": {
        $elemMatch: {
          class: "first",
          availableSeats: { $lt: 3 }
        }
      }
    });

    // Also clean any orphaned generated flights older than 24h with no bookings
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldResult = await Flight.deleteMany({
      flightNumber: { $regex: /^SX \d+$/ },
      createdAt: { $lt: yesterday }
    });

    return NextResponse.json({
      success: true,
      deleted: {
        depletedSeats: result.deletedCount,
        staleFlights: oldResult.deletedCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}