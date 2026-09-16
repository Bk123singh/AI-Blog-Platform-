import mongoose from "mongoose";
import dns from "node:dns";

// Use public DNS resolvers to prevent querySrv ENOTFOUND on Render and restricted networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Fall back silently if setServers is not permitted in the environment
}

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn("⚠️  MONGODB_URI is not defined in environment variables. Please check your .env configuration.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`Db is connected here..... (${conn.connection.host})`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.code === "ENOTFOUND" || error.syscall === "querySrv") {
      console.error(
        "DNS SRV lookup failed for the MongoDB Atlas cluster. Please check that:\n" +
        "1. In MongoDB Atlas, your cluster is active (not paused or deleted).\n" +
        "2. The cluster hostname in MONGODB_URI matches your current Atlas cluster.\n" +
        "3. Any special characters in the database password are URL-encoded.\n" +
        "4. If your network blocks SRV records, use the standard (non-SRV) connection string from Atlas."
      );
    }
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

export default connectDB;