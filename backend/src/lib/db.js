import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Call this immediately after import
dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI); // debug log
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
