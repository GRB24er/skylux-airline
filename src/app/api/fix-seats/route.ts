import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";

export async function GET() {
  await connectDB();
  const result = await Flight.updateMany(
    {},
    { $set: {
      "seatMap.0.availableSeats": 150,
      "seatMap.1.availableSeats": 30,
      "seatMap.2.availableSeats": 20,
      "seatMap.3.availableSeats": 8,
    }}
  );
  return NextResponse.json({ success: true, modified: result.modifiedCount });
}
