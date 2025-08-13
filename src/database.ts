import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export async function connectDB() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    process.exit(1);
  }
}
