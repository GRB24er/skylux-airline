/**
 * SKYLUX Airways — Database Seed Script
 * Run: npx ts-node src/scripts/seed.ts
 * 
 * Creates sample data for development:
 * - 5 Users (admin, customer, pilot, crew)
 * - 8 Aircraft (commercial + private jets)
 * - 20+ Flights
 * - 5 Crew members
 * - Sample bookings
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skylux-airways";

// This file provides the seed data structure.
// Import models after connection.

async function seed() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const User = (await import("../models/User")).default;
  const Aircraft = (await import("../models/Aircraft")).default;
  const Flight = (await import("../models/Flight")).default;
  const Crew = (await import("../models/Crew")).default;
  const PromoCode = (await import("../models/PromoCode")).default;

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Aircraft.deleteMany({}),
    Flight.deleteMany({}),
    Crew.deleteMany({}),
    PromoCode.deleteMany({}),
  ]);

  // ── Users ──
  console.log("👤 Creating users...");
  const users = await User.create([
    { email: "admin@skyluxairways.com", password: "Admin@2026!", firstName: "Robert", lastName: "Wellington", role: "superadmin", isVerified: true, loyaltyTier: "diamond", loyaltyPoints: 750000 },
    { email: "ops@skyluxairways.com", password: "Admin@2026!", firstName: "Sarah", lastName: "Chen", role: "admin", isVerified: true },
    { email: "customer@test.com", password: "Test@1234!", firstName: "Jin", lastName: "Kim", role: "customer", isVerified: true, loyaltyTier: "gold", loyaltyPoints: 85000, nationality: "KR" },
    { email: "captain@skyluxairways.com", password: "Pilot@2026!", firstName: "James", lastName: "Harrison", role: "pilot", isVerified: true },
    { email: "crew@skyluxairways.com", password: "Crew@2026!", firstName: "Emma", lastName: "Williams", role: "crew", isVerified: true },
  ]);
  console.log(`  Created ${users.length} users`);

  // ── Aircraft ──
  console.log("✈️  Creating aircraft...");
  const aircraft = await Aircraft.create([
    {
      registration: "SX-B789-01", name: "Boeing 787-9 Dreamliner", manufacturer: "Boeing", model: "787-9",
      category: "commercial-widebody", type: "commercial", status: "active",
      specs: { maxPassengers: 290, maxRange: 7635, cruiseSpeed: 488, maxSpeed: 516, ceilingAltitude: 43100, cabinWidth: 5.49, cabinLength: 50.7, cabinHeight: 2.4, baggageCapacity: 150 },
      seatConfiguration: [
        { class: "economy", seats: 198, layout: "3-3-3", pitch: "32 inches", features: ["USB", "IFE", "Reading light"] },
        { class: "premium", seats: 42, layout: "2-3-2", pitch: "38 inches", features: ["USB", "IFE", "Legrest", "Priority boarding"] },
        { class: "business", seats: 36, layout: "1-2-1", pitch: "60 inches", features: ["Lie-flat bed", "Direct aisle", "Amenity kit", "Lounge access"] },
        { class: "first", seats: 14, layout: "1-1-1", pitch: "82 inches", features: ["Suite", "Shower", "Personal minibar", "Chauffeur"] },
      ],
      amenities: ["Wi-Fi", "IFE", "USB charging", "Mood lighting", "Quieter cabin"],
      yearManufactured: 2022, totalFlightHours: 4800, homeBase: "LHR", isAvailable: true,
    },
    {
      registration: "SX-A350-01", name: "Airbus A350-900", manufacturer: "Airbus", model: "A350-900",
      category: "commercial-widebody", type: "commercial", status: "active",
      specs: { maxPassengers: 315, maxRange: 8100, cruiseSpeed: 488, maxSpeed: 516, ceilingAltitude: 43100, cabinWidth: 5.61, cabinLength: 51.0, cabinHeight: 2.4, baggageCapacity: 160 },
      seatConfiguration: [
        { class: "economy", seats: 220, layout: "3-3-3", pitch: "32 inches", features: ["USB", "IFE"] },
        { class: "premium", seats: 48, layout: "2-4-2", pitch: "36 inches", features: ["USB", "IFE", "Legrest"] },
        { class: "business", seats: 36, layout: "1-2-1", pitch: "58 inches", features: ["Lie-flat", "Direct aisle", "Amenity kit"] },
        { class: "first", seats: 11, layout: "1-1", pitch: "80 inches", features: ["Suite", "Dine on demand"] },
      ],
      amenities: ["Wi-Fi", "IFE", "USB", "LED mood lighting"],
      yearManufactured: 2023, totalFlightHours: 2400, homeBase: "DXB", isAvailable: true,
    },
    {
      registration: "SX-G700-01", name: "Gulfstream G700", manufacturer: "Gulfstream", model: "G700",
      category: "ultra-long-range", type: "private-jet", status: "active",
      specs: { maxPassengers: 19, maxRange: 7500, cruiseSpeed: 488, maxSpeed: 516, ceilingAltitude: 51000, cabinWidth: 2.49, cabinLength: 17.35, cabinHeight: 1.88, baggageCapacity: 5.5 },
      seatConfiguration: [{ class: "first", seats: 19, layout: "club", pitch: "N/A", features: ["Full suite", "Bedroom", "Shower", "Galley"] }],
      amenities: ["Ka-band Wi-Fi", "Full galley", "Master bedroom", "Shower", "Conference room"],
      hourlyRate: 12800, yearManufactured: 2023, totalFlightHours: 800, homeBase: "LHR", isAvailable: true,
    },
    {
      registration: "SX-G7500-01", name: "Bombardier Global 7500", manufacturer: "Bombardier", model: "Global 7500",
      category: "ultra-long-range", type: "private-jet", status: "active",
      specs: { maxPassengers: 17, maxRange: 7700, cruiseSpeed: 488, maxSpeed: 516, ceilingAltitude: 51000, cabinWidth: 2.44, cabinLength: 16.6, cabinHeight: 1.88, baggageCapacity: 5.0 },
      seatConfiguration: [{ class: "first", seats: 17, layout: "club", pitch: "N/A", features: ["4 living spaces", "Full bed", "Shower"] }],
      amenities: ["Wi-Fi", "4 cabin zones", "Full kitchen", "Bedroom suite"],
      hourlyRate: 11500, yearManufactured: 2022, totalFlightHours: 1200, homeBase: "JFK", isAvailable: true,
    },
    {
      registration: "SX-CX+01", name: "Cessna Citation X+", manufacturer: "Cessna", model: "Citation X+",
      category: "super-midsize", type: "private-jet", status: "active",
      specs: { maxPassengers: 12, maxRange: 3460, cruiseSpeed: 507, maxSpeed: 528, ceilingAltitude: 51000, cabinWidth: 1.68, cabinLength: 7.67, cabinHeight: 1.73, baggageCapacity: 2.3 },
      seatConfiguration: [{ class: "business", seats: 12, layout: "club", pitch: "N/A", features: ["Wi-Fi", "Refreshment center"] }],
      amenities: ["Wi-Fi", "Refreshment center", "Lavatory"],
      hourlyRate: 5200, yearManufactured: 2021, totalFlightHours: 2800, homeBase: "DXB", isAvailable: true,
    },
  ]);
  console.log(`  Created ${aircraft.length} aircraft`);

  // ── Flights ──
  console.log("🛫 Creating flights...");
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const dayAfter = new Date(now); dayAfter.setDate(now.getDate() + 2);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);

  function makeTime(base: Date, hours: number, minutes: number) {
    const d = new Date(base); d.setHours(hours, minutes, 0, 0); return d;
  }

  const flightsData = [
    { num: "SX 401", dep: { code: "LHR", city: "London", country: "United Kingdom", tz: "Europe/London" }, arr: { code: "DXB", city: "Dubai", country: "UAE", tz: "Asia/Dubai" }, dur: 380, dist: 5500, dTime: makeTime(tomorrow, 8, 30), aTime: makeTime(tomorrow, 17, 30), ac: 0, type: "commercial" as const },
    { num: "SX 402", dep: { code: "DXB", city: "Dubai", country: "UAE", tz: "Asia/Dubai" }, arr: { code: "LHR", city: "London", country: "United Kingdom", tz: "Europe/London" }, dur: 420, dist: 5500, dTime: makeTime(tomorrow, 22, 0), aTime: makeTime(dayAfter, 3, 0), ac: 1, type: "commercial" as const },
    { num: "SX 788", dep: { code: "JFK", city: "New York", country: "United States", tz: "America/New_York" }, arr: { code: "NRT", city: "Tokyo", country: "Japan", tz: "Asia/Tokyo" }, dur: 825, dist: 10800, dTime: makeTime(tomorrow, 13, 45), aTime: makeTime(dayAfter, 16, 30), ac: 0, type: "commercial" as const },
    { num: "SX 215", dep: { code: "SIN", city: "Singapore", country: "Singapore", tz: "Asia/Singapore" }, arr: { code: "ZRH", city: "Zurich", country: "Switzerland", tz: "Europe/Zurich" }, dur: 780, dist: 10200, dTime: makeTime(tomorrow, 1, 0), aTime: makeTime(tomorrow, 8, 0), ac: 1, type: "commercial" as const },
    { num: "SX 903", dep: { code: "DXB", city: "Dubai", country: "UAE", tz: "Asia/Dubai" }, arr: { code: "MLE", city: "Male", country: "Maldives", tz: "Indian/Maldives" }, dur: 270, dist: 3000, dTime: makeTime(dayAfter, 9, 15), aTime: makeTime(dayAfter, 14, 45), ac: 1, type: "commercial" as const },
    { num: "SX 122", dep: { code: "CDG", city: "Paris", country: "France", tz: "Europe/Paris" }, arr: { code: "JFK", city: "New York", country: "United States", tz: "America/New_York" }, dur: 495, dist: 5800, dTime: makeTime(nextWeek, 10, 0), aTime: makeTime(nextWeek, 12, 15), ac: 0, type: "commercial" as const },
    // Private jets
    { num: "SX 5001", dep: { code: "LHR", city: "London", country: "United Kingdom", tz: "Europe/London" }, arr: { code: "NCE", city: "Nice", country: "France", tz: "Europe/Paris" }, dur: 120, dist: 1000, dTime: makeTime(tomorrow, 10, 0), aTime: makeTime(tomorrow, 12, 0), ac: 2, type: "private-jet" as const },
    { num: "SX 5002", dep: { code: "JFK", city: "New York", country: "United States", tz: "America/New_York" }, arr: { code: "MIA", city: "Miami", country: "United States", tz: "America/New_York" }, dur: 180, dist: 1750, dTime: makeTime(dayAfter, 14, 0), aTime: makeTime(dayAfter, 17, 0), ac: 3, type: "private-jet" as const },
    { num: "SX 5003", dep: { code: "DXB", city: "Dubai", country: "UAE", tz: "Asia/Dubai" }, arr: { code: "MLE", city: "Male", country: "Maldives", tz: "Indian/Maldives" }, dur: 240, dist: 3000, dTime: makeTime(nextWeek, 8, 0), aTime: makeTime(nextWeek, 12, 0), ac: 4, type: "private-jet" as const },
  ];

  const flights = await Flight.create(flightsData.map(f => ({
    flightNumber: f.num,
    type: f.type,
    airline: "SKYLUX Airways",
    departure: { airport: f.dep.city + " International", airportCode: f.dep.code, city: f.dep.city, country: f.dep.country, terminal: "T" + (Math.floor(Math.random() * 4) + 1), gate: String.fromCharCode(65 + Math.floor(Math.random() * 8)) + Math.floor(Math.random() * 30 + 1), scheduledTime: f.dTime, timezone: f.dep.tz },
    arrival: { airport: f.arr.city + " International", airportCode: f.arr.code, city: f.arr.city, country: f.arr.country, terminal: "T" + (Math.floor(Math.random() * 3) + 1), scheduledTime: f.aTime, timezone: f.arr.tz },
    duration: f.dur,
    distance: f.dist,
    status: "scheduled",
    aircraft: aircraft[f.ac]._id,
    seatMap: f.type === "commercial" ? [
      { class: "economy", rows: 33, seatsPerRow: 9, totalSeats: 198, availableSeats: 142, price: Math.floor(f.dist * 0.12 + 200), layout: "3-3-3" },
      { class: "premium", rows: 7, seatsPerRow: 7, totalSeats: 42, availableSeats: 28, price: Math.floor(f.dist * 0.22 + 500), layout: "2-3-2" },
      { class: "business", rows: 9, seatsPerRow: 4, totalSeats: 36, availableSeats: 18, price: Math.floor(f.dist * 0.48 + 1200), layout: "1-2-1" },
      { class: "first", rows: 7, seatsPerRow: 2, totalSeats: 14, availableSeats: 8, price: Math.floor(f.dist * 0.85 + 3000), layout: "1-1" },
    ] : [
      { class: "first", rows: 1, seatsPerRow: aircraft[f.ac].specs.maxPassengers, totalSeats: aircraft[f.ac].specs.maxPassengers, availableSeats: aircraft[f.ac].specs.maxPassengers, price: f.dur * (aircraft[f.ac].hourlyRate || 5000) / 60, layout: "club" },
    ],
    amenities: f.type === "commercial" ? ["Wi-Fi", "IFE", "USB Charging", "Meal Service"] : ["Full Catering", "Wi-Fi", "Bedroom", "Conference"],
    baggageAllowance: { cabin: { weight: 7, pieces: 1 }, checked: { weight: f.type === "commercial" ? 23 : 50, pieces: f.type === "commercial" ? 1 : 3 } },
    stops: 0,
    isActive: true,
  })));
  console.log(`  Created ${flights.length} flights`);

  // ── Crew ──
  console.log("👨‍✈️ Creating crew...");
  const crewMembers = await Crew.create([
    { user: users[3]._id, employeeId: "SX-CPT-001", role: "captain", status: "available", certifications: [{ name: "ATPL", issuedBy: "CAA", issuedDate: new Date("2015-01-15"), expiryDate: new Date("2027-01-15"), number: "ATPL-88821" }], aircraftRatings: ["Boeing 787-9", "Airbus A350-900"], totalFlightHours: 12500, monthlyFlightHours: 45, maxMonthlyHours: 100, homeBase: "LHR", contactEmergency: { name: "Margaret Harrison", relation: "Spouse", phone: "+44 7700 900123" }, schedule: [] },
    { user: users[4]._id, employeeId: "SX-FA-001", role: "purser", status: "available", certifications: [{ name: "Cabin Safety Certificate", issuedBy: "CAA", issuedDate: new Date("2019-06-01"), expiryDate: new Date("2026-06-01"), number: "CSC-45521" }], aircraftRatings: ["Boeing 787-9", "Airbus A350-900", "Gulfstream G700"], totalFlightHours: 6200, monthlyFlightHours: 60, maxMonthlyHours: 100, homeBase: "LHR", contactEmergency: { name: "David Williams", relation: "Father", phone: "+44 7700 900456" }, schedule: [] },
  ]);
  console.log(`  Created ${crewMembers.length} crew members`);

  // ── Promo Codes ──
  console.log("🏷️  Creating promo codes...");
  await PromoCode.create([
    { code: "WELCOME20", description: "20% off first booking", type: "percentage", value: 20, maxUses: 1000, usedCount: 0, validFrom: new Date(), validUntil: new Date("2026-12-31"), applicableTo: ["commercial", "private-jet"], applicableCabins: ["economy", "premium", "business", "first"], isActive: true },
    { code: "JETSET500", description: "$500 off private jet charter", type: "fixed", value: 500, maxUses: 100, usedCount: 0, minBookingAmount: 5000, validFrom: new Date(), validUntil: new Date("2026-06-30"), applicableTo: ["private-jet"], applicableCabins: ["first"], isActive: true },
    { code: "SKYLUX10", description: "10% loyalty discount", type: "percentage", value: 10, maxUses: 5000, usedCount: 0, validFrom: new Date(), validUntil: new Date("2026-12-31"), applicableTo: ["commercial"], applicableCabins: ["economy", "premium", "business", "first"], isActive: true },
  ]);
  console.log("  Created 3 promo codes");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("  Admin:    admin@skyluxairways.com / Admin@2026!");
  console.log("  Customer: customer@test.com / Test@1234!");
  console.log("  Pilot:    captain@skyluxairways.com / Pilot@2026!");
  console.log("  Crew:     crew@skyluxairways.com / Crew@2026!");
  console.log("\n🏷️  Promo Codes: WELCOME20, JETSET500, SKYLUX10");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
