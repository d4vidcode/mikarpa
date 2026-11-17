import { createHash } from 'node:crypto';

/**
 * Subida de imágenes.
 *
 * Contrato único (`lib/storage.ts`) para poder cambiar de proveedor sin tocar
 * la UI. Hoy: Cloudinary con firma generada en el servidor (el API secret
 * nunca llega al navegador). Si no hay credenciales, el panel permite pegar
 * una URL pública (útil en desarrollo).
 */

export const CLOUDINARY_FOLDER = 'mikarpa/products';

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/** Firma los parámetros que Cloudinary exige para una subida autenticada. */
export function createUploadSignature(folder = CLOUDINARY_FOLDER): UploadSignature | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1').update(`${params}${apiSecret}`).digest('hex');

  return { cloudName, apiKey, timestamp, folder, signature };
}
