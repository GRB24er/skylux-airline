import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import "@/models/Aircraft";
import { AP, TZ, distanceNM } from "@/data/airports";
import { searchFlights as duffelSearch, isDuffelConfigured, parseDuration, mapCabinClass, type DuffelOffer } from "@/services/duffel";
import { carrierToDisplay, SKYLUX_IATA } from "@/config/airlines";

/* ═════════════════════════════════════════════════════════════════
   SKYLUX Flight Search — Real Airlines + Fallback Generation
   1. Duffel API (real flights from 300+ airlines)
   2. DB flights (SKYLUX-operated)
   3. Generated fallback (when APIs unavailable)
   ═════════════════════════════════════════════════════════════════ */

// ── Seeded RNG for deterministic fallback flights ──
function sRng(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return () => { h = (h * 16807) % 2147483647; return (h & 0x7fffffff) / 2147483647; };
}

function genFlights(fc: string, tc: string, ds: string) {
  const f = AP[fc], t = AP[tc];
  if (!f || !t || fc === tc) return [];
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
  const d = new Date(ds);
  if (isNaN(d.getTime())) return [];
  const n = Math.min(6, Math.max(3, 3 + Math.round(r() * 3)));
  const wins = [{ h: 6, m: 10 }, { h: 8, m: 40 }, { h: 11, m: 5 }, { h: 14, m: 20 }, { h: 17, m: 45 }, { h: 21, m: 10 }, { h: 23, m: 50 }];
  const ftz = TZ[fc] || "UTC", ttz = TZ[tc] || "UTC";
  const ac = [
    { nm: "Boeing 787-9 Dreamliner", mf: "Boeing", md: "787-9", ct: "widebody" },
    { nm: "Airbus A350-900", mf: "Airbus", md: "A350-900", ct: "widebody" },
  ];
  const out = [];
  for (let i = 0; i < n; i++) {
    const w = wins[i % wins.length];
    const dep = new Date(d); dep.setHours(w.h, w.m + Math.round(r() * 15), 0, 0);
    const arr = new Date(dep.getTime() + dur * 60000);
    const a = ac[i % ac.length];
    const pm = 0.88 + r() * 0.28;
    const ec = Math.round(eB * pm / 5) * 5, pe = Math.round(ec * 1.45 / 5) * 5, bz = Math.round(bB * pm / 5) * 5, fi = Math.round(fB * pm / 5) * 5;
    const fn = `SX ${String(100 + Math.round(r() * 899))}`;
    out.push({
      _id: `gen_${fc}_${tc}_${ds}_${i}`, flightNumber: fn, type: "commercial",
      airline: "SKYLUX Airways",
      operatingAirline: { code: SKYLUX_IATA, name: "SKYLUX Airways" },
      marketingAirline: { code: SKYLUX_IATA, name: "SKYLUX Airways" },
      isCodeshare: false,
      realFlightData: false,
      departure: { airportCode: fc, airport: f.n, city: f.c, country: f.co, terminal: `T${1 + Math.round(r() * 3)}`, gate: `${String.fromCharCode(65 + Math.round(r() * 5))}${1 + Math.round(r() * 30)}`, scheduledTime: dep.toISOString(), timezone: ftz },
      arrival: { airportCode: tc, airport: t.n, city: t.c, country: t.co, terminal: `T${1 + Math.round(r() * 2)}`, gate: `${String.fromCharCode(65 + Math.round(r() * 5))}${1 + Math.round(r() * 30)}`, scheduledTime: arr.toISOString(), timezone: ttz },
      duration: dur, distance: nm, status: "scheduled",
      aircraft: { name: a.nm, manufacturer: a.mf, model: a.md, category: a.ct, specs: { maxPassengers: 290 } },
      seatMap: [
        { class: "economy", price: ec, availableSeats: 100 + Math.round(r() * 80), totalSeats: 200 },
        { class: "premium", price: pe, availableSeats: 15 + Math.round(r() * 20), totalSeats: 40 },
        { class: "business", price: bz, availableSeats: 6 + Math.round(r() * 18), totalSeats: 28 },
        { class: "first", price: fi, availableSeats: 6 + Math.round(r() * 8), totalSeats: 8 },
      ],
      stops: 0, isActive: true, _generated: true,
    });
  }
  return out.sort((a, b) => new Date(a.departure.scheduledTime).getTime() - new Date(b.departure.scheduledTime).getTime());
}

/** Convert Duffel flight offer to SKYLUX internal format */
function mapDuffelOffer(offer: DuffelOffer): any {
  const slice = offer.slices[0];
  const firstSegment = slice.segments[0];
  const lastSegment = slice.segments[slice.segments.length - 1];

  const marketingCode = firstSegment.marketing_carrier.iata_code;
  const operatingCode = firstSegment.operating_carrier.iata_code;
  const carrierInfo = carrierToDisplay(marketingCode);
  const operatingInfo = carrierToDisplay(operatingCode);

  const depCode = firstSegment.origin.iata_code;
  const arrCode = lastSegment.destination.iata_code;
  const depAirport = AP[depCode];
  const arrAirport = AP[arrCode];

  const durationMin = parseDuration(slice.duration);
  const nm = depAirport && arrAirport
    ? distanceNM(depAirport.la, depAirport.lo, arrAirport.la, arrAirport.lo)
    : 0;

  const totalPrice = parseFloat(offer.total_amount);
  const perPersonPrice = totalPrice / Math.max(1, offer.passengers.length);

  // Get cabin class from first segment
  const cabinFromSegment = firstSegment.passengers?.[0]?.cabin_class || firstSegment.cabin_class || "economy";
  const skyluxCabin = mapCabinClass(cabinFromSegment);

  // Build seatMap with real price for searched cabin, estimated for others
  const seatMap = [
    { class: "economy", price: skyluxCabin === "economy" ? perPersonPrice : Math.round(perPersonPrice * 0.6), availableSeats: 9, totalSeats: 200 },
    { class: "premium", price: skyluxCabin === "premium" ? perPersonPrice : Math.round(perPersonPrice * 0.85), availableSeats: 9, totalSeats: 40 },
    { class: "business", price: skyluxCabin === "business" ? perPersonPrice : Math.round(perPersonPrice * 1.8), availableSeats: 9, totalSeats: 28 },
    { class: "first", price: skyluxCabin === "first" ? perPersonPrice : Math.round(perPersonPrice * 3.5), availableSeats: 4, totalSeats: 8 },
  ];

  const isCodeshare = marketingCode !== SKYLUX_IATA;
  const flightNumber = `${marketingCode} ${firstSegment.marketing_carrier_flight_number}`;

  // Get baggage info
  const baggageInfo = firstSegment.passengers?.[0]?.baggages || [];
  const checkedBags = baggageInfo.find((b: any) => b.type === "checked")?.quantity || 0;

  return {
    _id: `duffel_${offer.id}`,
    duffelOfferId: offer.id,
    flightNumber,
    skyluxFlightNumber: isCodeshare ? `SX ${firstSegment.marketing_carrier_flight_number}` : undefined,
    type: "commercial",
    airline: offer.owner.name,
    airlineLogo: offer.owner.logo_symbol_url,
    operatingAirline: { code: operatingCode, name: operatingInfo.name },
    marketingAirline: { code: marketingCode, name: carrierInfo.name },
    isCodeshare,
    realFlightData: true,
    departure: {
      airportCode: depCode,
      airport: firstSegment.origin.name || depAirport?.n || depCode,
      city: firstSegment.origin.city_name || depAirport?.c || depCode,
      country: depAirport?.co || firstSegment.origin.iata_country_code || "",
      terminal: "",
      gate: "",
      scheduledTime: firstSegment.departing_at,
      timezone: firstSegment.origin.time_zone || TZ[depCode] || "UTC",
    },
    arrival: {
      airportCode: arrCode,
      airport: lastSegment.destination.name || arrAirport?.n || arrCode,
      city: lastSegment.destination.city_name || arrAirport?.c || arrCode,
      country: arrAirport?.co || lastSegment.destination.iata_country_code || "",
      terminal: "",
      gate: "",
      scheduledTime: lastSegment.arriving_at,
      timezone: lastSegment.destination.time_zone || TZ[arrCode] || "UTC",
    },
    duration: durationMin,
    distance: nm,
    status: "scheduled",
    aircraft: firstSegment.aircraft ? {
      name: firstSegment.aircraft.name || firstSegment.aircraft.iata_code,
      manufacturer: "",
      model: firstSegment.aircraft.iata_code,
      category: "widebody",
    } : { name: "Unknown", manufacturer: "", model: "", category: "widebody" },
    seatMap,
    stops: slice.segments.length - 1,
    stopDetails: slice.segments.length > 1
      ? slice.segments.slice(0, -1).map((seg) => ({
          airport: seg.destination.name || seg.destination.iata_code,
          airportCode: seg.destination.iata_code,
          duration: 0,
        }))
      : [],
    isActive: true,
    _generated: false,
    _duffelRaw: offer, // preserve raw offer for booking
    expiresAt: offer.expires_at,
    conditions: offer.conditions,
    price: {
      currency: offer.total_currency,
      total: offer.total_amount,
      base: offer.base_amount,
      tax: offer.tax_amount,
      perPerson: perPersonPrice,
    },
    emissions: offer.total_emissions_kg ? parseFloat(offer.total_emissions_kg) : null,
    baggage: { checked: checkedBags },
  };
}

export async function GET(req: NextRequest) {
  try {
    let dbConnected = false;
    try { await connectDB(); dbConnected = true; } catch { console.warn("MongoDB unavailable — using Duffel/generated flights only"); }

    const sp = req.nextUrl.searchParams;
    const from = sp.get("from")?.toUpperCase();
    const to = sp.get("to")?.toUpperCase();
    const departDate = sp.get("departDate");
    const type = sp.get("type");
    const cabinClass = sp.get("cabinClass");
    const passengers = parseInt(sp.get("passengers") || "1");
    const maxPrice = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : undefined;
    const sortBy = sp.get("sortBy") || "departure";
    const page = parseInt(sp.get("page") || "1");
    const limit = Math.min(parseInt(sp.get("limit") || "20"), 50);

    let flights: any[] = [];
    let duffelUsed = false;

    // ── 1. Try Duffel API for REAL flights ──
    if (isDuffelConfigured() && from && to && departDate) {
      try {
        const duffelOffers = await duffelSearch({
          origin: from,
          destination: to,
          departDate,
          adults: passengers,
          cabinClass: cabinClass || undefined,
          maxConnections: 1,
        });

        if (duffelOffers.length > 0) {
          flights = duffelOffers.map(mapDuffelOffer);
          duffelUsed = true;
        }
      } catch (duffelError) {
        console.error("Duffel search failed, falling back:", duffelError);
      }
    }

    // ── 2. Try real DB flights (SKYLUX-operated) ──
    if (dbConnected) {
      const q: any = { isActive: true, status: { $nin: ["cancelled", "arrived"] } };
      if (from) {
        q.$or = [{ "departure.airportCode": from }, { "departure.city": { $regex: from, $options: "i" } }];
      }
      if (to) {
        const tq = [{ "arrival.airportCode": to }, { "arrival.city": { $regex: to, $options: "i" } }];
        if (q.$or) { q.$and = [{ $or: q.$or }, { $or: tq }]; delete q.$or; } else { q.$or = tq; }
      }
      if (departDate) {
        const dt = new Date(departDate);
        if (!isNaN(dt.getTime())) {
          const nx = new Date(dt); nx.setDate(nx.getDate() + 1);
          q["departure.scheduledTime"] = { $gte: dt, $lt: nx };
        }
      }
      if (type) q.type = type;

      let sort: any = {};
      switch (sortBy) {
        case "price": sort = { "seatMap.price": 1 }; break;
        case "duration": sort = { duration: 1 }; break;
        default: sort = { "departure.scheduledTime": 1 };
      }

      const dbFlights = await Flight.find(q).populate("aircraft", "name manufacturer model category specs").sort(sort).skip((page - 1) * limit).limit(limit).lean();

      for (const dbf of dbFlights) {
        const existing = flights.find((f: any) => f.flightNumber === (dbf as any).flightNumber);
        if (!existing) {
          flights.push({
            ...dbf,
            realFlightData: true,
            operatingAirline: { code: SKYLUX_IATA, name: "SKYLUX Airways" },
            marketingAirline: { code: SKYLUX_IATA, name: "SKYLUX Airways" },
            isCodeshare: false,
          });
        }
      }
    }

    // ── 3. Fallback: Generate flights if nothing found ──
    if (flights.length === 0 && from && to && departDate) {
      flights = genFlights(from, to, departDate);
    }
    if (flights.length > 0 && flights.length < 3 && from && to && departDate && !duffelUsed) {
      const gen = genFlights(from, to, departDate);
      const existing = new Set(flights.map((f: any) => f.flightNumber));
      for (const g of gen) {
        if (!existing.has(g.flightNumber) && flights.length < 6) {
          flights.push(g);
          existing.add(g.flightNumber);
        }
      }
    }

    // ── Post-filter ──
    let filtered = flights.filter((f: any) => {
      if (passengers > 1) {
        const ok = f.seatMap?.some((s: any) => s.availableSeats >= passengers);
        if (!ok) return false;
      }
      if (maxPrice && cabinClass) {
        const s = f.seatMap?.find((s: any) => s.class === cabinClass);
        if (!s || s.price > maxPrice) return false;
      }
      return true;
    });

    if (sortBy === "price") filtered.sort((a: any, b: any) => (a.seatMap?.[0]?.price || 0) - (b.seatMap?.[0]?.price || 0));
    else if (sortBy === "duration") filtered.sort((a: any, b: any) => (a.duration || 0) - (b.duration || 0));

    return NextResponse.json({
      success: true,
      data: {
        flights: filtered,
        source: duffelUsed ? "duffel" : flights.some((f: any) => f._generated) ? "generated" : "database",
      },
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    });
  } catch (error: any) {
    console.error("Flight search error:", error);
    return NextResponse.json({ success: false, error: error.message || "Search failed" }, { status: 500 });
  }
}
