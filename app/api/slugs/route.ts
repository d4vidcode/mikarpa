import type { NextRequest } from 'next/server';
import { Store } from '@/models';
import { apiError, apiOk } from '@/lib/api';
import { connectDB } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isReservedSlug, isValidSlug, slugify } from '@/lib/slugs';

/** Comprobación de disponibilidad del enlace público de la tienda. */

export async function GET(request: NextRequest) {
  const ip = await getClientIp();
  const limit = checkRateLimit(`slug:${ip}`, 60, 60 * 1000);
  if (!limit.ok) {
    return apiError('rate_limited', `Espera ${limit.retryAfterSeconds} segundos.`, 429);
  }

  const params = request.nextUrl.searchParams;
  const raw = params.get('slug') ?? params.get('name') ?? '';
  const slug = slugify(raw);

  if (!slug) {
    return apiError('invalid_slug', 'Escribe un nombre o enlace.', 400);
  }

  if (!isValidSlug(slug)) {
    return apiError('invalid_slug', 'Usa entre 3 y 48 caracteres: minúsculas, números y guiones.', 400);
  }

  if (isReservedSlug(slug)) {
    return apiOk({ available: false, slug, reason: 'reserved', suggestions: [] });
  }

  await connectDB();

  const taken = await Store.findOne({ slug }).select('_id').lean();

  if (!taken) {
    return apiOk({ available: true, slug, reason: null, suggestions: [] });
  }

  const suggestions: string[] = [];
  for (let index = 2; suggestions.length < 3 && index < 60; index += 1) {
    const candidate = `${slug}-${index}`;
    if (isReservedSlug(candidate)) {
      continue;
    }
    const clash = await Store.findOne({ slug: candidate }).select('_id').lean();
    if (!clash) {
      suggestions.push(candidate);
    }
  }

  return apiOk({ available: false, slug, reason: 'taken', suggestions });
}
