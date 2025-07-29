import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://janirudraksh228:YE8BjPlHJwMmI52h@cluster0.lw1uesm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
