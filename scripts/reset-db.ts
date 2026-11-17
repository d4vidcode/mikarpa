import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import '@/models';
import { connectDB, disconnectDB } from '@/lib/db';

/**
 * Borra TODOS los datos de la base configurada en MONGODB_URI.
 *
 * Guardas de seguridad (las tres deben cumplirse):
 *   1. CONFIRM_RESET=1 en el entorno.
 *   2. NODE_ENV !== 'production'.
 *   3. El nombre de la base no contiene 'prod' ni 'production'.
 *
 * Uso: $env:CONFIRM_RESET="1"; npm run db:reset
 *
 * Después de resetear, vuelve a ejecutar `npm run db:seed`.
 */

const FORBIDDEN_DB_PATTERNS = [/prod/i, /production/i, /live/i];

async function main() {
  loadEnvConfig(process.cwd());

  if (process.env.CONFIRM_RESET !== '1') {
    throw new Error(
      'Negado. Esta operación borra toda la base. Ejecuta con CONFIRM_RESET=1 (PowerShell: $env:CONFIRM_RESET="1").',
    );
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Negado. db:reset no puede ejecutarse con NODE_ENV=production.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI. Copia .env.example a .env.local.');
  }

  const instance = await connectDB();
  const { name, host } = instance.connection;

  if (!name) {
    throw new Error('La conexión no expone el nombre de la base de datos.');
  }

  if (FORBIDDEN_DB_PATTERNS.some((pattern) => pattern.test(name))) {
    throw new Error(`Negado. El nombre de la base ("${name}") parece de producción.`);
  }

  const collections = await instance.connection.db?.collections();

  console.log(`Base: ${name} @ ${host}`);
  console.log(`Colecciones a borrar: ${collections?.length ?? 0}\n`);

  if (collections && collections.length > 0) {
    for (const collection of collections) {
      const deleted = await instance.connection.db
        ?.collection(collection.collectionName)
        .deleteMany({});
      console.log(`✓ ${collection.collectionName}: ${deleted?.deletedCount ?? 0} documentos`);
    }
  }

  // Recrea los índices declarados en los esquemas (los documentos ya no están).
  for (const modelName of mongoose.modelNames()) {
    await mongoose.model(modelName).syncIndexes();
  }

  console.log('\nBase vacía e índices recreados.');
  console.log('Siguiente paso: npm run db:seed');
}

void main()
  .catch((error: unknown) => {
    console.error('\n✗ Reset abortado');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
