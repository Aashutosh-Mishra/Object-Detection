// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yoloApp';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // console.log('MongoDB: Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      // useNewUrlParser: true, // Deprecated but might be needed for older versions
      // useUnifiedTopology: true, // Deprecated but might be needed for older versions
    };

    console.log('MongoDB: Creating new connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB: Connection successful');
      return mongoose;
    }).catch(error => {
        console.error("MongoDB connection error:", error);
        // Clear the promise cache on error so subsequent attempts can try again
        cached.promise = null;
        throw error; // Re-throw error after logging
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
      cached.promise = null; // Clear promise cache on error
      throw error; // Re-throw error
  }
  return cached.conn;
}

export default dbConnect;

// Augment the NodeJS global type to include mongoose cache
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  }
}