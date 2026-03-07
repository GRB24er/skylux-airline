import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const sxFlights = await Flight.find({ flightNumber: { $regex: /^SX/i } }).select("flightNumber seatMap createdAt").lean();
    const result = await Flight.deleteMany({ flightNumber: { $regex: /^SX/i } });
    return NextResponse.json({ success: true, found: sxFlights.length, deleted: result.deletedCount, flights: sxFlights.map((f) => f.flightNumber) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
