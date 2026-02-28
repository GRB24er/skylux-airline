import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import "@/models/Aircraft";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ref = req.nextUrl.searchParams.get("ref");
    const paxIndex = parseInt(req.nextUrl.searchParams.get("pax") || "0");

    if (!ref) {
      return NextResponse.json({ success: false, error: "Booking reference required" }, { status: 400 });
    }

    const booking = await Booking.findOne({ bookingReference: ref.toUpperCase() })
      .populate({
        path: "flights.flight",
        populate: { path: "aircraft", select: "name type registration" },
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (!["confirmed", "checked-in", "boarded", "completed"].includes(booking.status)) {
      return NextResponse.json({ success: false, error: "Boarding pass not available for this booking status" }, { status: 400 });
    }

    const passenger = booking.passengers[paxIndex];
    if (!passenger) {
      return NextResponse.json({ success: false, error: "Passenger not found" }, { status: 404 });
    }

    const flightData = booking.flights[0];
    const flight = flightData?.flight as any;
    if (!flight) {
      return NextResponse.json({ success: false, error: "Flight data not found" }, { status: 404 });
    }

    // Generate gate and seat if not assigned
    const gate = passenger.seatNumber
      ? String.fromCharCode(65 + Math.floor(Math.random() * 8)) + (Math.floor(Math.random() * 30) + 1)
      : "A" + (Math.floor(Math.random() * 20) + 1);

    const seatNumber = passenger.seatNumber || (() => {
      const classPrefix: Record<string, string[]> = {
        first: ["1", "2", "3"],
        business: ["4", "5", "6", "7", "8"],
        premium: ["10", "11", "12", "13", "14"],
        economy: ["15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
      };
      const rows = classPrefix[passenger.cabinClass] || classPrefix.economy;
      const row = rows[Math.floor(Math.random() * rows.length)];
      const col = ["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)];
      return row + col;
    })();

    const departureTime = new Date(flight.departure?.scheduledTime);
    const arrivalTime = new Date(flight.arrival?.scheduledTime);
    const boardingTime = new Date(departureTime.getTime() - 45 * 60000);

    const boardingPassData = {
      // Airline
      airline: "SKYLUX AIRWAYS",
      // Passenger
      passengerName: `${passenger.lastName}/${passenger.firstName}`.toUpperCase(),
      passengerFirstName: passenger.firstName,
      passengerLastName: passenger.lastName,
      // Booking
      bookingReference: booking.bookingReference,
      ticketNumber: "SX" + Date.now().toString(36).toUpperCase().slice(-8),
      eTicketNumber: "217-" + Math.floor(1000000000 + Math.random() * 9000000000),
      sequenceNumber: String(paxIndex + 1).padStart(3, "0"),
      // Flight
      flightNumber: flight.flightNumber,
      aircraft: flight.aircraft?.name || flight.aircraft?.type || "Boeing 787-9",
      aircraftRegistration: flight.aircraft?.registration || "",
      // Route
      departure: {
        city: flight.departure?.city || "Unknown",
        airportCode: flight.departure?.airportCode || "???",
        airportName: flight.departure?.airport || flight.departure?.city || "",
        terminal: "T" + (Math.floor(Math.random() * 4) + 1),
        time: departureTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: departureTime.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
        dateShort: departureTime.toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase(),
      },
      arrival: {
        city: flight.arrival?.city || "Unknown",
        airportCode: flight.arrival?.airportCode || "???",
        airportName: flight.arrival?.airport || flight.arrival?.city || "",
        terminal: "T" + (Math.floor(Math.random() * 4) + 1),
        time: arrivalTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: arrivalTime.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
      },
      // Seat & Gate
      seatNumber,
      gate,
      cabinClass: passenger.cabinClass.toUpperCase(),
      boardingTime: boardingTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      boardingGroup: passenger.cabinClass === "first" ? "1" : passenger.cabinClass === "business" ? "2" : passenger.cabinClass === "premium" ? "3" : "4",
      // Add-ons
      priorityBoarding: booking.addOns?.priorityBoarding || passenger.cabinClass === "first" || passenger.cabinClass === "business",
      loungeAccess: booking.addOns?.loungeAccess || passenger.cabinClass === "first" || passenger.cabinClass === "business",
      mealPreference: passenger.mealPreference || "standard",
      // Baggage
      baggageAllowance: passenger.cabinClass === "first" ? "3 × 32kg" : passenger.cabinClass === "business" ? "2 × 32kg" : passenger.cabinClass === "premium" ? "2 × 23kg" : "1 × 23kg",
      // Frequent flyer
      frequentFlyer: passenger.frequentFlyerNumber || null,
      // Status
      status: booking.status,
      // QR data
      qrData: JSON.stringify({
        ref: booking.bookingReference,
        fn: flight.flightNumber,
        pax: `${passenger.lastName}/${passenger.firstName}`,
        seat: seatNumber,
        dep: flight.departure?.airportCode,
        arr: flight.arrival?.airportCode,
        date: departureTime.toISOString().split("T")[0],
        seq: String(paxIndex + 1).padStart(3, "0"),
      }),
      // Total passengers
      totalPassengers: booking.passengers.length,
      passengerIndex: paxIndex,
    };

    // Mark boarding pass as generated
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { boardingPassGenerated: true } }
    );

    return NextResponse.json({ success: true, data: boardingPassData });
  } catch (error: any) {
    console.error("Boarding pass error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate boarding pass" }, { status: 500 });
  }
}