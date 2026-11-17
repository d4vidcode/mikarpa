import { apiError, apiOk } from '@/lib/api';
import { createUploadSignature, isStorageConfigured } from '@/lib/storage';
import { AccessError, requireUser } from '@/lib/tenant';

/**
 * Firma de subida a Cloudinary.
 * Solo usuarios autenticados; el secreto nunca se envía al navegador.
 */
export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AccessError) {
      return apiError('unauthorized', error.message, error.status);
    }
    return apiError('unauthorized', 'Debes iniciar sesión.', 401);
  }

  if (!isStorageConfigured()) {
    return apiError(
      'storage_unconfigured',
      'La subida de imágenes no está configurada. Pega una URL pública o define CLOUDINARY_* en el entorno.',
      503,
    );
  }

  const signature = createUploadSignature();
  if (!signature) {
    return apiError('storage_unconfigured', 'No se pudo firmar la subida.', 503);
  }

  return apiOk(signature);
}
