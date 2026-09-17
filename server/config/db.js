import mongoose from "mongoose";
import dns from "node:dns";

// Configure DNS resolvers for SRV lookup resilience
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Fall back silently if setServers is not permitted
}

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/blog";

const connectDB = async () => {
  // Reuse existing connection if already connected (e.g. serverless)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (primaryUri) {
    try {
      console.log("Connecting to MongoDB Atlas...");
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging 30s
      });
      console.log(`✅ MongoDB Atlas connected successfully: (${conn.connection.host})`);
      return conn;
    } catch (primaryErr) {
      console.warn(
        `⚠️  Primary MongoDB connection failed (${primaryErr.message}).`
      );
      if (
        primaryErr.code === "ENOTFOUND" ||
        primaryErr.syscall === "querySrv" ||
        primaryErr.message.includes("buffering timed out") ||
        primaryErr.message.includes("ECONNREFUSED")
      ) {
        console.warn(
          "ℹ️  The MongoDB Atlas cluster domain was not found or is paused. Checking local MongoDB..."
        );
      }
    }
  } else {
    console.warn("⚠️  MONGODB_URI is not defined in environment variables.");
  }

  // Automatic Local MongoDB Fallback
  try {
    console.log(`Attempting fallback to local MongoDB (${LOCAL_MONGO_URI})...`);
    const localConn = await mongoose.connect(LOCAL_MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(
      `✅ Connected to local MongoDB successfully (${localConn.connection.host})`
    );
    return localConn;
  } catch (localErr) {
    console.error(
      "❌ All MongoDB connection attempts failed. Database is offline.",
      localErr.message
    );
    return null;
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

export default connectDB;