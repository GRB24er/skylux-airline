import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";
import User from "@/models/User";
import { generateBookingReference, calculatePriceBreakdown, calculatePointsEarned } from "@/utils/helpers";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";
import { AP, TZ, distanceNM } from "@/data/airports";
import { getOffer, createBooking as duffelCreateBooking, isDuffelConfigured, parseDuration, mapCabinClass, type DuffelPassenger } from "@/services/duffel";
import { createPaymentIntent, isStripeConfigured } from "@/services/stripe";
import { SKYLUX_IATA, carrierToDisplay } from "@/config/airlines";

/* ═════════════════════════════════════════════════════════════════
   Booking Create — Supports real Amadeus flights + Stripe payments
   - Amadeus flights: Creates real PNR via GDS
   - Generated flights: Legacy fallback (saved to DB)
   - Stripe: Returns clientSecret for frontend payment
   - Crypto: Existing flow preserved
   ═════════════════════════════════════════════════════════════════ */

// ── Seeded RNG for deterministic generated flights ──
function sRng(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return () => { h = (h * 16807) % 2147483647; return (h & 0x7fffffff) / 2147483647; };
}

function generateFlightsForBooking(fc: string, tc: string, ds: string, aircraftId: any) {
  const f = AP[fc], t = AP[tc]; if (!f || !t || fc === tc) return [];
  const nm = distanceNM(f.la, f.lo, t.la, t.lo);
  const dur = Math.round((nm / 450) * 60) + 30;
  let eB: number, bB: number, fB: number;
  if (nm < 300) { eB = 90; bB = 280; fB = 520; }
  else if (nm < 800) { eB = 160; bB = 480; fB = 920; }
  else if (nm < 1500) { eB = 280; bB = 750; fB = 1500; }
  else if (nm < 3000) { eB = 480; bB = 1350; fB = 2800; }
  else if (nm < 5000) { eB = 680; bB = 2100; fB = 4200; }
  else if (nm < 7000) { eB = 880; bB = 2800; fB = 5800; }
  else { eB = 1180; bB = 3600; fB = 7400; }
  const r = sRng(`${fc}${tc}${ds}`);
  const d = new Date(ds); if (isNaN(d.getTime())) return [];
  const n = Math.min(6, Math.max(3, 3 + Math.round(r() * 3)));
  const wins = [{ h: 6, m: 10 }, { h: 8, m: 40 }, { h: 11, m: 5 }, { h: 14, m: 20 }, { h: 17, m: 45 }, { h: 21, m: 10 }, { h: 23, m: 50 }];
  const ftz = TZ[fc] || "UTC", ttz = TZ[tc] || "UTC";
  const out = [];
  for (let i = 0; i < n; i++) {
    const w = wins[i % wins.length];
    const dep = new Date(d); dep.setHours(w.h, w.m + Math.round(r() * 15), 0, 0);
    const arr = new Date(dep.getTime() + dur * 60000);
    const pm = 0.88 + r() * 0.28;
    const ec = Math.round(eB * pm / 5) * 5, pe = Math.round(ec * 1.45 / 5) * 5, bz = Math.round(bB * pm / 5) * 5, fi = Math.round(fB * pm / 5) * 5;
    const fn = `SX ${String(100 + Math.round(r() * 899))}`;
    out.push({
      flightNumber: fn, type: "commercial" as const, airline: "SKYLUX Airways", isActive: true,
      aircraft: aircraftId,
      departure: { airport: f.n, airportCode: fc, city: f.c, country: f.co, terminal: `T${1 + Math.round(r() * 3)}`, gate: `${String.fromCharCode(65 + Math.round(r() * 5))}${1 + Math.round(r() * 30)}`, scheduledTime: dep, timezone: ftz },
      arrival: { airport: t.n, airportCode: tc, city: t.c, country: t.co, terminal: `T${1 + Math.round(r() * 2)}`, gate: `${String.fromCharCode(65 + Math.round(r() * 5))}${1 + Math.round(r() * 30)}`, scheduledTime: arr, timezone: ttz },
      duration: dur, distance: nm, status: "scheduled", stops: 0,
      seatMap: [
        { class: "economy", price: ec, availableSeats: 100 + Math.round(r() * 80), totalSeats: 198, rows: 33, seatsPerRow: 6, layout: "3-3-3" },
        { class: "premium", price: pe, availableSeats: 15 + Math.round(r() * 20), totalSeats: 42, rows: 7, seatsPerRow: 6, layout: "2-3-2" },
        { class: "business", price: bz, availableSeats: 6 + Math.round(r() * 18), totalSeats: 36, rows: 9, seatsPerRow: 4, layout: "1-2-1" },
        { class: "first", price: fi, availableSeats: 6 + Math.round(r() * 8), totalSeats: 14, rows: 7, seatsPerRow: 2, layout: "1-1" },
      ],
    });
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    await connectDB();
    const body = await req.json();
    const { flightIds, passengers, cabinClass, contactEmail, contactPhone, addOns, paymentMethod, useLoyaltyPoints, duffelOffer, amadeusOffer } = body;

    if (!flightIds?.length || !passengers?.length || !cabinClass || !contactEmail || !contactPhone || !paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // ══════════════════════════════════════════════════════════
    // ROUTE 1: Duffel real flight booking
    // ══════════════════════════════════════════════════════════
    // Detect Duffel offer from explicit field OR from flightIds containing a duffel ID
    const duffelIdFromFlights = flightIds?.find((id: string) => typeof id === "string" && id.startsWith("duffel_"));
    const realOffer = duffelOffer || amadeusOffer || duffelIdFromFlights; // support all sources
    if (realOffer && isDuffelConfigured()) {
      console.log("[Booking] Duffel real flight booking");

      // Try to refresh offer for latest price; fall back to cached offer data from frontend
      const offerId = typeof realOffer === "string" ? realOffer : (realOffer.id || realOffer);
      let activeOffer: any = null;

      try {
        activeOffer = await getOffer(typeof offerId === "string" ? offerId : offerId);
      } catch (refreshErr) {
        console.warn("[Booking] Offer refresh failed (may be expired), using cached data:", refreshErr);
      }

      // Fall back to the full offer object sent from the frontend
      if (!activeOffer && typeof realOffer === "object" && realOffer.total_amount) {
        activeOffer = realOffer;
        console.log("[Booking] Using cached offer data from frontend");
      }

      if (!activeOffer) {
        return NextResponse.json({
          success: false,
          error: "Flight offer expired. Please search again and rebook.",
          code: "OFFER_EXPIRED",
        }, { status: 400 });
      }

      const totalPrice = parseFloat(activeOffer.total_amount);
      const currency = activeOffer.total_currency || "USD";

      // Calculate breakdown
      const breakdown = calculatePriceBreakdown(
        totalPrice / passengers.length,
        passengers.length,
        0,
        useLoyaltyPoints || 0,
      );

      // Generate unique booking reference
      let bookingRef: string;
      let refExists = true;
      do {
        bookingRef = generateBookingReference();
        refExists = !!(await Booking.findOne({ bookingReference: bookingRef }));
      } while (refExists);

      // Try to create real PNR via Duffel
      let duffelPNR: string | null = null;
      let duffelOrderId: string | null = null;
      try {
        const duffelPassengers: DuffelPassenger[] = passengers.map((p: any, idx: number) => ({
          id: activeOffer.passengers?.[idx]?.id || String(idx + 1),
          type: "adult" as const,
          given_name: p.firstName.toUpperCase(),
          family_name: p.lastName.toUpperCase(),
          email: contactEmail,
          phone_number: contactPhone,
          born_on: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "1990-01-01",
          gender: "m" as const,
          title: "mr" as const,
          identity_documents: p.passportNumber ? [{
            type: "passport" as const,
            unique_identifier: p.passportNumber,
            expires_on: p.passportExpiry ? new Date(p.passportExpiry).toISOString().split("T")[0] : "2030-01-01",
            issuing_country_code: (p.nationality || "US").substring(0, 2).toUpperCase(),
          }] : undefined,
        }));

        const bookingResult = await duffelCreateBooking(offerId, duffelPassengers);
        duffelPNR = bookingResult?.bookingReference || null;
        duffelOrderId = bookingResult?.orderId || null;
        console.log("[Booking] Duffel PNR created:", duffelPNR);
      } catch (duffelBookErr) {
        console.error("[Booking] Duffel PNR creation failed (continuing with local booking):", duffelBookErr);
      }

      // Get or create default aircraft
      let defaultAircraft = await Aircraft.findOne({ registration: "SX-GEN-001" });
      if (!defaultAircraft) {
        defaultAircraft = await Aircraft.create({
          registration: "SX-GEN-001", name: "Boeing 787-9 Dreamliner", manufacturer: "Boeing", model: "787-9",
          category: "commercial-widebody", type: "commercial", status: "active",
          specs: { maxPassengers: 290, maxRange: 7635, cruiseSpeed: 488 },
          seatConfiguration: [
            { class: "economy", seats: 198, layout: "3-3-3", pitch: "32 inches", features: ["USB", "IFE"] },
            { class: "premium", seats: 42, layout: "2-3-2", pitch: "38 inches", features: ["USB", "IFE", "Legrest"] },
            { class: "business", seats: 36, layout: "1-2-1", pitch: "60 inches", features: ["Lie-flat", "Lounge"] },
            { class: "first", seats: 14, layout: "1-1-1", pitch: "82 inches", features: ["Suite", "Shower"] },
          ],
          amenities: ["Wi-Fi", "IFE", "USB"], yearManufactured: 2022, totalFlightHours: 4800, homeBase: "LHR", isAvailable: true,
        });
      }

      // Create flight record from Duffel data
      const slice = activeOffer.slices[0];
      const firstSeg = slice.segments[0];
      const lastSeg = slice.segments[slice.segments.length - 1];
      const depCode = firstSeg.origin.iata_code;
      const arrCode = lastSeg.destination.iata_code;
      const depAP = AP[depCode];
      const arrAP = AP[arrCode];
      const marketingCode = firstSeg.marketing_carrier.iata_code;
      const carrierName = carrierToDisplay(marketingCode).name;

      const flightData = {
        flightNumber: `${marketingCode} ${firstSeg.marketing_carrier_flight_number}`,
        type: "commercial" as const,
        airline: carrierName,
        isActive: true,
        aircraft: defaultAircraft._id,
        realFlightData: true,
        operatingAirline: { code: firstSeg.operating_carrier.iata_code, name: firstSeg.operating_carrier.name },
        marketingAirline: { code: marketingCode, name: firstSeg.marketing_carrier.name },
        isCodeshare: firstSeg.operating_carrier.iata_code !== marketingCode,
        departure: {
          airport: firstSeg.origin.name || depAP?.n || depCode,
          airportCode: depCode,
          city: firstSeg.origin.city_name || depAP?.c || depCode,
          country: depAP?.co || "",
          terminal: "",
          gate: "",
          scheduledTime: new Date(firstSeg.departing_at),
          timezone: firstSeg.origin.time_zone || TZ[depCode] || "UTC",
        },
        arrival: {
          airport: lastSeg.destination.name || arrAP?.n || arrCode,
          airportCode: arrCode,
          city: lastSeg.destination.city_name || arrAP?.c || arrCode,
          country: arrAP?.co || "",
          terminal: "",
          gate: "",
          scheduledTime: new Date(lastSeg.arriving_at),
          timezone: lastSeg.destination.time_zone || TZ[arrCode] || "UTC",
        },
        duration: parseDuration(slice.duration),
        distance: depAP && arrAP ? distanceNM(depAP.la, depAP.lo, arrAP.la, arrAP.lo) : 0,
        status: "scheduled",
        stops: slice.segments.length - 1,
        seatMap: [
          { class: cabinClass, price: totalPrice / passengers.length, availableSeats: 9, totalSeats: 200, rows: 33, seatsPerRow: 6, layout: "3-3-3" },
        ],
      };

      // Save or find existing flight
      let savedFlight = await Flight.findOne({ flightNumber: flightData.flightNumber, "departure.scheduledTime": flightData.departure.scheduledTime });
      if (!savedFlight) {
        savedFlight = await Flight.create(flightData);
      }

      // Create booking
      const booking = await Booking.create({
        bookingReference: bookingRef,
        user: authResult.user._id,
        flights: [{ flight: savedFlight._id, direction: "outbound" }],
        passengers: passengers.map((p: any) => ({ ...p, cabinClass })),
        cabinClass,
        status: "pending",
        payment: {
          status: "pending",
          method: paymentMethod,
          amount: breakdown.total,
          currency: currency,
          breakdown,
        },
        addOns: addOns || {},
        contactEmail,
        contactPhone,
        loyaltyPointsEarned: 0,
        amadeusPNR: duffelPNR || undefined,
        source: "amadeus",
      });

      // ── Handle payment based on method ──
      let paymentResult: any = {};

      if (paymentMethod === "card" && isStripeConfigured()) {
        // Create Stripe PaymentIntent — booking stays pending until webhook confirms
        const intent = await createPaymentIntent({
          amount: breakdown.total,
          currency: currency,
          bookingReference: bookingRef,
          customerEmail: contactEmail,
          metadata: {
            bookingId: booking._id.toString(),
            duffelPNR: duffelPNR || "",
            cabinClass,
          },
        });

        booking.payment.stripePaymentIntentId = intent.paymentIntentId;
        booking.payment.status = "processing";
        await booking.save();

        paymentResult = {
          clientSecret: intent.clientSecret,
          paymentIntentId: intent.paymentIntentId,
          requiresAction: true,
        };
      } else if (paymentMethod === "crypto") {
        // Crypto flow: booking stays pending, handled by crypto-payment route
        paymentResult = { requiresAction: true, method: "crypto" };
      } else {
        // Non-Stripe card or other methods: mark as completed (legacy behavior)
        booking.payment.status = "completed";
        booking.payment.paidAt = new Date();
        booking.payment.transactionId = "TXN-" + Date.now().toString(36).toUpperCase();
        booking.status = "confirmed";
        booking.loyaltyPointsEarned = calculatePointsEarned(breakdown.total);
        await booking.save();

        // Update user stats
        const user = await User.findById(authResult.user._id);
        if (user) {
          user.loyaltyPoints += booking.loyaltyPointsEarned;
          user.totalFlights += 1;
          user.totalSpent += breakdown.total;
          await user.save();
        }

        // Send confirmation email
        try {
          await sendEmail({
            to: contactEmail,
            subject: `SKYLUX Airways - Booking Confirmed ${bookingRef}`,
            html: bookingConfirmationEmail({
              name: `${passengers[0].firstName} ${passengers[0].lastName}`,
              bookingRef,
              flightNumber: savedFlight.flightNumber,
              from: `${savedFlight.departure.city} (${savedFlight.departure.airportCode})`,
              to: `${savedFlight.arrival.city} (${savedFlight.arrival.airportCode})`,
              date: new Date(savedFlight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
              cabin: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1),
              total: `$${breakdown.total.toLocaleString()}`,
            }),
          });
          booking.eTicketSent = true;
          await booking.save();
        } catch (e) {
          console.error("Email failed:", e);
        }
      }

      const populated = await Booking.findById(booking._id)
        .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status aircraft airline" })
        .populate("user", "firstName lastName email")
        .lean();

      console.log("[Booking] SUCCESS — ref:", bookingRef, "PNR:", duffelPNR, "source: duffel");
      return NextResponse.json({
        success: true,
        data: {
          booking: populated,
          duffelPNR,
          duffelOrderId,
          payment: paymentResult,
          source: "duffel",
        },
        message: paymentResult.requiresAction
          ? `Booking ${bookingRef} created — complete payment to confirm`
          : `Booking ${bookingRef} confirmed`,
      }, { status: 201 });
    }

    // ══════════════════════════════════════════════════════════
    // ROUTE 2: Legacy flow (DB flights + generated flights)
    // ══════════════════════════════════════════════════════════
    console.log("[Booking] Legacy booking flow");

    const realIds: string[] = [];
    const generatedIds: string[] = [];
    for (const id of flightIds) {
      if (typeof id === "string" && id.startsWith("gen_")) generatedIds.push(id);
      else if (typeof id === "string" && id.startsWith("duffel_")) continue; // skip — handled by Route 1
      else realIds.push(id);
    }

    let flights: any[] = [];

    // Handle real DB flights
    if (realIds.length > 0) {
      const dbFlights = await Flight.find({ _id: { $in: realIds }, isActive: true });
      flights.push(...dbFlights);
    }

    // Handle generated flights
    if (generatedIds.length > 0) {
      let defaultAircraft = await Aircraft.findOne({ registration: "SX-GEN-001" });
      if (!defaultAircraft) {
        defaultAircraft = await Aircraft.create({
          registration: "SX-GEN-001", name: "Boeing 787-9 Dreamliner", manufacturer: "Boeing", model: "787-9",
          category: "commercial-widebody", type: "commercial", status: "active",
          specs: { maxPassengers: 290, maxRange: 7635, cruiseSpeed: 488 },
          seatConfiguration: [
            { class: "economy", seats: 198, layout: "3-3-3", pitch: "32 inches", features: ["USB", "IFE"] },
            { class: "premium", seats: 42, layout: "2-3-2", pitch: "38 inches", features: ["USB", "IFE", "Legrest"] },
            { class: "business", seats: 36, layout: "1-2-1", pitch: "60 inches", features: ["Lie-flat", "Lounge"] },
            { class: "first", seats: 14, layout: "1-1-1", pitch: "82 inches", features: ["Suite", "Shower"] },
          ],
          amenities: ["Wi-Fi", "IFE", "USB"], yearManufactured: 2022, totalFlightHours: 4800, homeBase: "LHR", isAvailable: true,
        });
      }

      for (const genId of generatedIds) {
        const parts = genId.split("_");
        if (parts.length >= 5) {
          const fromCode = parts[1], toCode = parts[2], date = parts[3], idx = parseInt(parts[4]);
          const genFlights = generateFlightsForBooking(fromCode, toCode, date, defaultAircraft._id);
          const target = genFlights[idx];
          if (target) {
            const existing = await Flight.findOne({ flightNumber: target.flightNumber });
            if (existing) {
              flights.push(existing);
            } else {
              const saved = await Flight.create(target);
              flights.push(saved);
            }
          }
        }
      }
    }

    if (flights.length === 0) {
      return NextResponse.json({ success: false, error: "No valid flights found" }, { status: 404 });
    }

    // Check seat availability
    for (const flight of flights) {
      const seatConfig = flight.seatMap.find((s: any) => s.class === cabinClass);
      if (!seatConfig || seatConfig.availableSeats < passengers.length) {
        return NextResponse.json({ success: false, error: `Not enough seats in ${cabinClass} on ${flight.flightNumber}` }, { status: 400 });
      }
    }

    // Calculate pricing
    const baseFarePerPerson = flights.reduce((sum: number, f: any) => {
      const seat = f.seatMap.find((s: any) => s.class === cabinClass);
      return sum + (seat?.price || 0);
    }, 0);
    const breakdown = calculatePriceBreakdown(baseFarePerPerson, passengers.length, 0, useLoyaltyPoints || 0);

    // Generate unique booking reference
    let bookingRef: string;
    let refExists = true;
    do {
      bookingRef = generateBookingReference();
      refExists = !!(await Booking.findOne({ bookingReference: bookingRef }));
    } while (refExists);

    // Create booking
    const booking = await Booking.create({
      bookingReference: bookingRef,
      user: authResult.user._id,
      flights: flights.map((f: any, i: number) => ({ flight: f._id, direction: i === 0 ? "outbound" : "return" })),
      passengers: passengers.map((p: any) => ({ ...p, cabinClass })),
      cabinClass,
      status: "pending",
      payment: { status: "pending", method: paymentMethod, amount: breakdown.total, currency: "USD", breakdown },
      addOns: addOns || {},
      contactEmail,
      contactPhone,
      loyaltyPointsEarned: calculatePointsEarned(breakdown.total),
      source: "generated",
    });

    // Deduct seats
    for (const flight of flights) {
      const seatIdx = flight.seatMap.findIndex((s: any) => s.class === cabinClass);
      if (seatIdx >= 0) {
        flight.seatMap[seatIdx].availableSeats -= passengers.length;
        await flight.save();
      }
    }

    // ── Handle payment ──
    let paymentResult: any = {};

    if (paymentMethod === "card" && isStripeConfigured()) {
      const intent = await createPaymentIntent({
        amount: breakdown.total,
        bookingReference: bookingRef,
        customerEmail: contactEmail,
        metadata: { bookingId: booking._id.toString(), cabinClass },
      });

      booking.payment.stripePaymentIntentId = intent.paymentIntentId;
      booking.payment.status = "processing";
      await booking.save();

      paymentResult = { clientSecret: intent.clientSecret, paymentIntentId: intent.paymentIntentId, requiresAction: true };
    } else if (paymentMethod === "crypto") {
      paymentResult = { requiresAction: true, method: "crypto" };
    } else {
      // Legacy: complete payment immediately
      booking.payment.status = "completed";
      booking.payment.paidAt = new Date();
      booking.payment.transactionId = "TXN-" + Date.now().toString(36).toUpperCase();
      booking.status = "confirmed";
      await booking.save();

      const user = await User.findById(authResult.user._id);
      if (user) {
        user.loyaltyPoints += booking.loyaltyPointsEarned;
        user.totalFlights += 1;
        user.totalSpent += breakdown.total;
        await user.save();
      }

      // Send confirmation email
      const pf = flights[0];
      try {
        await sendEmail({
          to: contactEmail,
          subject: `SKYLUX Airways - Booking Confirmed ${bookingRef}`,
          html: bookingConfirmationEmail({
            name: `${passengers[0].firstName} ${passengers[0].lastName}`,
            bookingRef,
            flightNumber: pf.flightNumber,
            from: `${pf.departure.city} (${pf.departure.airportCode})`,
            to: `${pf.arrival.city} (${pf.arrival.airportCode})`,
            date: new Date(pf.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            cabin: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1),
            total: `$${breakdown.total.toLocaleString()}`,
          }),
        });
        booking.eTicketSent = true;
        await booking.save();
      } catch (e) {
        console.error("Email failed:", e);
      }
    }

    const populated = await Booking.findById(booking._id)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status aircraft airline" })
      .populate("user", "firstName lastName email")
      .lean();

    console.log("[Booking] SUCCESS — ref:", bookingRef, "source: generated");
    return NextResponse.json({
      success: true,
      data: {
        booking: populated,
        payment: paymentResult,
        source: "generated",
      },
      message: paymentResult.requiresAction
        ? `Booking ${bookingRef} created — complete payment to confirm`
        : `Booking ${bookingRef} confirmed`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ success: false, error: error.message || "Booking failed" }, { status: 500 });
  }
}
