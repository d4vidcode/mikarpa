import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

type HealthPayload =
  | { ok: true; db: 'ok'; latencyMs: number; timestamp: string }
  | { ok: false; db: 'unconfigured' | 'error'; message: string; timestamp: string };

export async function GET(): Promise<NextResponse<HealthPayload>> {
  const timestamp = new Date().toISOString();

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        ok: false,
        db: 'unconfigured',
        message: 'MONGODB_URI no está definida. Copia .env.example a .env.local.',
        timestamp,
      },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }

  const startedAt = Date.now();

  try {
    const mongooseInstance = await connectDB();
    await mongooseInstance.connection.db?.admin().ping();

    return NextResponse.json(
      {
        ok: true,
        db: 'ok',
        latencyMs: Date.now() - startedAt,
        timestamp,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error('[health] MongoDB ping falló', error);
    return NextResponse.json(
      {
        ok: false,
        db: 'error',
        message: 'No se pudo conectar a MongoDB.',
        timestamp,
      },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
