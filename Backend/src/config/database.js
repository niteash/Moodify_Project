const mongoose = require("mongoose");

async function ConnectToDB() {
  try {
    const mongoURI = process.env.MONGO_URI?.trim();

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");
    console.log("Database name:", mongoose.connection.name);
    console.log("Database host:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = ConnectToDB;
