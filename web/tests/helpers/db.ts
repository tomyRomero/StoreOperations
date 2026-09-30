import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongoose";

// Connects through the app's own helper, so tests exercise the real connection code
export async function connectTestDb() {
  await connectToDB();
  // Build indexes up front, so unique constraints exist and no single test pays for them
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
}

// Empties every collection, keeping indexes (unique constraints still apply)
export async function clearTestDb() {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
}
