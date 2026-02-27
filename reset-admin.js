const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
const uri = envContent.match(/MONGODB_URI=(.*)/)[1].trim().replace(/"/g, "");
async function run() {
  const hash = await bcrypt.hash("Admin@2026!", 12);
  console.log("New hash:", hash);
  const client = new MongoClient(uri);
  await client.connect();
  const result = await client.db().collection("users").updateOne(
    { email: "admin@skyluxairways.com" },
    { $set: { password: hash } }
  );
  console.log("Updated:", result.modifiedCount);
  await client.close();
}
run().catch(console.error);
