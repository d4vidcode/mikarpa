import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import '@/models'; // registra todos los modelos y sus índices
import { connectDB, disconnectDB } from '@/lib/db';

/**
 * Crea/sincroniza los índices declarados en los esquemas.
 *
 * Por qué existe: en producción corremos con `autoIndex: false` para no pagar
 * la creación de índices en cada cold start. Este script se ejecuta a mano
 * (o en un paso del deploy) cuando cambian los esquemas.
 *
 * Uso: npm run db:indexes
 */

type IndexReport = {
  model: string;
  created: string[];
  dropped: string[];
};

async function main() {
  loadEnvConfig(process.cwd());

  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI. Copia .env.example a .env.local.');
  }

  const instance = await connectDB();

  console.log(
    `Conectado a ${instance.connection.host}/${instance.connection.name}\n`,
  );

  const reports: IndexReport[] = [];
  const failures: { model: string; error: unknown }[] = [];

  for (const modelName of mongoose.modelNames()) {
    const model = mongoose.model(modelName);

    try {
      const result = await model.syncIndexes();
      reports.push({
        model: modelName,
        created: [...result],
        dropped: [],
      });

      const indexes = model.schema.indexes();
      console.log(`✓ ${modelName} (${indexes.length} índice${indexes.length === 1 ? '' : 's'})`);

      for (const [spec, options] of indexes) {
        const name = options?.name ?? JSON.stringify(spec);
        console.log(`    · ${name}`);
      }
    } catch (error) {
      failures.push({ model: modelName, error });
      console.error(`✗ ${modelName}`);
      console.error(error);
    }
  }

  console.log(`\nModelos procesados: ${reports.length}/${mongoose.modelNames().length}`);

  if (failures.length > 0) {
    throw new Error(
      `No se pudieron sincronizar ${failures.length} modelo(s): ${failures
        .map((failure) => failure.model)
        .join(', ')}`,
    );
  }

  console.log('Índices sincronizados correctamente.');
}

void main()
  .catch((error: unknown) => {
    console.error('\n✗ Sincronización de índices falló');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
