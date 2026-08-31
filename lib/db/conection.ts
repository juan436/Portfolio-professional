import mongoose from 'mongoose';

/**
 * Conexión Mongoose cacheada en `global` (sobrevive Fast Refresh en dev).
 * Recibe: nada.
 * Produce: `dbConnect()` — reusa la conexión existente o crea/espera una nueva.
 */
const dbUri = process.env.MONGODB_URI;

const MONGODB_URI = dbUri || 'mongodb://localhost:27017/portfolioNew';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
let cached: MongooseCache = global.mongoose;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
