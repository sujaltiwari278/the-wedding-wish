import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Check your .env.local file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
      })
      .then((instance) => instance);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Atlas connected successfully!");
    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error("MongoDB connection failed:");

    if (error instanceof Error) {
      console.error(error.message);
    }

    throw error;
  }
}
