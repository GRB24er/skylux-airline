const fs = require("fs");
const file = "src/app/api/bookings/boarding-pass/route.ts";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/qrData:\s*JSON\.stringify\(\{[\s\S]*?\}\)/m,
  "qrData: `${process.env.NEXT_PUBLIC_APP_URL || \"https://skylux.pro\"}/verify?ref=${booking.bookingReference}&fn=${encodeURIComponent(flight.flightNumber)}&pax=${encodeURIComponent(passenger.lastName + \"/\" + passenger.firstName)}&seat=${seatNumber}&dep=${flight.departure?.airportCode}&arr=${flight.arrival?.airportCode}&date=${departureTime.toISOString().split(\"T\")[0]}&seq=${String(paxIndex + 1).padStart(3, \"0\")}`"
);
fs.writeFileSync(file, c, "utf8");
console.log("Done. Checking:");
const check = fs.readFileSync(file, "utf8");
const line = check.split("\n").find(l => l.includes("qrData"));
console.log(line?.trim());
