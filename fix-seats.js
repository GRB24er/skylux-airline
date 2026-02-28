const mongoose = require("mongoose");
const fs = require("fs");
const uri = fs.readFileSync(".env.local","utf8").match(/MONGODB_URI=(.*)/)[1].trim().replace(/"/g,"");
async function run(){
  await mongoose.connect(uri);
  const r = await mongoose.connection.db.collection("flights").updateMany(
    { flightNumber: /^SX\s/ },
    { $set: {
      "seatMap.0.availableSeats": 150,
      "seatMap.1.availableSeats": 30,
      "seatMap.2.availableSeats": 20,
      "seatMap.3.availableSeats": 8,
    }}
  );
  console.log("Reset seats on", r.modifiedCount, "flights");
  await mongoose.disconnect();
}
run().catch(console.error);
