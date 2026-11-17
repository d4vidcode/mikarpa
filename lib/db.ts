import mongoose from 'mongoose';

/**
 * Conexión a MongoDB cacheada para entornos serverless.
 *
 * En Vercel cada invocación puede reutilizar el proceso; guardamos la conexión
 * en `globalThis` para no abrir un pool por request. `bufferCommands: false`
 * evita que las queries se encolen silenciosamente si la conexión falló.
 */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  _mikarpaMongoose?: MongooseCache;
};

const cached: MongooseCache = (globalWithMongoose._mikarpaMongoose ??= {
  conn: null,
  promise: null,
});

const CONNECT_TIMEOUT_MS = 5_000;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'Falta MONGODB_URI. Copia .env.example a .env.local y define la cadena de MongoDB Atlas.',
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    const dbName = process.env.MONGODB_DB;

    cached.promise = mongoose
      .connect(uri, {
        ...(dbName ? { dbName } : {}),
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
        socketTimeoutMS: 45_000,
        // En producción los índices se crean con `npm run db:indexes`.
        autoIndex: process.env.NODE_ENV !== 'production',
      })
      .catch((error: unknown) => {
        // Permitir reintentos en la siguiente invocación.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (!cached.conn) {
    return;
  }

  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
}
