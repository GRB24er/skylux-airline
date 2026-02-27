import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import "@/models/Aircraft";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const flight = await Flight.findById(params.id)
      .populate("aircraft")
      .populate({ path: "crew", populate: { path: "user", select: "firstName lastName avatar" } })
      .lean();

    if (!flight) {
      return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { flight } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch flight" }, { status: 500 });
  }
}

// Admin: Update flight
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // TODO: Add admin auth check
    await connectDB();
    const body = await req.json();
    const flight = await Flight.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!flight) return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { flight } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

// Admin: Delete flight
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const flight = await Flight.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!flight) return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Flight deactivated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
