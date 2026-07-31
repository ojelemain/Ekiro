import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill in a real connection string, or set it as a Railway Variable."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log("[ekiro-backend] Connected to MongoDB");

  mongoose.connection.on("error", (err) => {
    console.error("[ekiro-backend] MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[ekiro-backend] MongoDB disconnected");
  });
}
