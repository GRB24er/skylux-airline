import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Crew from "@/models/Crew";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const sp = req.nextUrl.searchParams;
    const crewId = sp.get("crewId");
    const startDate = sp.get("startDate");
    const endDate = sp.get("endDate");

    const query: any = {};
    if (crewId) query._id = crewId;
    else if (["pilot", "crew"].includes(authResult.user.role)) {
      query.user = authResult.user._id;
    }

    const crewMember = await Crew.findOne(query)
      .populate("user", "firstName lastName email")
      .lean();

    if (!crewMember) {
      return NextResponse.json({ success: false, error: "Crew member not found" }, { status: 404 });
    }

    let schedule = crewMember.schedule || [];
    if (startDate) schedule = schedule.filter((s: any) => new Date(s.date) >= new Date(startDate));
    if (endDate) schedule = schedule.filter((s: any) => new Date(s.date) <= new Date(endDate));

    return NextResponse.json({ success: true, data: { crew: crewMember, schedule } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch schedule" }, { status: 500 });
  }
}

// Add schedule entry
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const { crewId, entry } = await req.json();
    const crew = await Crew.findById(crewId);
    if (!crew) return NextResponse.json({ success: false, error: "Crew not found" }, { status: 404 });

    crew.schedule.push(entry);
    await crew.save();

    return NextResponse.json({ success: true, data: { schedule: crew.schedule }, message: "Schedule updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update schedule" }, { status: 500 });
  }
}
