const fs = require("fs");
const file = "src/app/api/bookings/boarding-pass/route.ts";
let content = fs.readFileSync(file, "utf8");
const old = `qrData: JSON.stringify({
        ref: booking.bookingReference,
        fn: flight.flightNumber,
        pax: \`\${passenger.lastName}/\${passenger.firstName}\`,
        seat: seatNumber,
        dep: flight.departure?.airportCode,
        arr: flight.arrival?.airportCode,
        date: departureTime.toISOString().split("T")[0],
        seq: String(paxIndex + 1).padStart(3, "0"),
      })`;
const replacement = "qrData: `${process.env.NEXT_PUBLIC_APP_URL || \"https://skylux.pro\"}/verify?ref=${booking.bookingReference}&fn=${encodeURIComponent(flight.flightNumber)}&pax=${encodeURIComponent(passenger.lastName + \"/\" + passenger.firstName)}&seat=${seatNumber}&dep=${flight.departure?.airportCode}&arr=${flight.arrival?.airportCode}&date=${departureTime.toISOString().split(\"T\")[0]}&seq=${String(paxIndex + 1).padStart(3, \"0\")}`";
if (content.includes("JSON.stringify")) {
  content = content.replace(old, replacement);
  fs.writeFileSync(file, content, "utf8");
  console.log("Fixed QR data to verification URL");
} else {
  console.log("Already fixed or pattern not found");
}
