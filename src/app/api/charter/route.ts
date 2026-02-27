import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const aircraftId = sp.get("aircraftId");
    const from = sp.get("from")?.toUpperCase();
    const to = sp.get("to")?.toUpperCase();
    const departDate = sp.get("departDate");

    // If no params, return fleet + sample routes
    if (!from && !to && !departDate) {
      const fleet = await Aircraft.find({ type: "private-jet", status: "active" }).lean();

      // Get distinct routes for each aircraft
      const fleetWithRoutes = await Promise.all(fleet.map(async (ac: any) => {
        const routes = await Flight.aggregate([
          { $match: { aircraft: ac._id, type: "private-jet", isActive: true } },
          { $group: {
            _id: { from: "$departure.airportCode", to: "$arrival.airportCode" },
            fromCity: { $first: "$departure.city" },
            toCity: { $first: "$arrival.city" },
            fromAirport: { $first: "$departure.airport" },
            toAirport: { $first: "$arrival.airport" },
            duration: { $first: "$duration" },
            distance: { $first: "$distance" },
            price: { $first: { $arrayElemAt: ["$seatMap.price", 0] } },
            nextAvailable: { $min: "$departure.scheduledTime" },
            flightCount: { $sum: 1 },
          }},
          { $sort: { price: 1 } },
        ]);
        return { ...ac, routes };
      }));

      return NextResponse.json({ success: true, data: { fleet: fleetWithRoutes } });
    }

    // Search specific charter flights
    const query: any = { type: "private-jet", isActive: true };
    if (aircraftId) query.aircraft = aircraftId;
    if (from) query["departure.airportCode"] = from;
    if (to) query["arrival.airportCode"] = to;
    if (departDate) {
      const date = new Date(departDate);
      if (!isNaN(date.getTime())) {
        const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);
        query["departure.scheduledTime"] = { $gte: date, $lt: nextDay };
      }
    }

    const flights = await Flight.find(query)
      .populate("aircraft")
      .sort({ "departure.scheduledTime": 1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, data: { flights } });
  } catch (error: any) {
    console.error("Charter search error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}