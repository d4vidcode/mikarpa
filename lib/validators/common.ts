import { z } from 'zod';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
export const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;
export const HTTP_URL_REGEX = /^https?:\/\/\S+$/i;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Máximo 254 caracteres')
  .regex(EMAIL_REGEX, 'Correo inválido');

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, 'Teléfono inválido: 7 a 15 dígitos, puede empezar con +');

export const optionalPhoneSchema = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || PHONE_REGEX.test(value), 'Teléfono inválido');

export const objectIdSchema = z.string().regex(OBJECT_ID_REGEX, 'Identificador inválido');

export const optionalUrlSchema = (max = 2048) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || HTTP_URL_REGEX.test(value), 'URL inválida (http/https)');

export const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .nullish()
    .transform((value) => (value ? value : null));

export const moneyCentsSchema = z
  .number()
  .int('El monto debe estar en centavos (entero)')
  .min(0)
  .max(100_000_000_00);

export const optionalMoneyCentsSchema = z
  .number()
  .int()
  .min(0)
  .max(100_000_000_00)
  .nullish()
  .transform((value) => value ?? null);

/** Convierte FormData a objeto plano (repetidos → array). */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const entries: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      continue;
    }
    const existing = entries[key];
    if (existing === undefined) {
      entries[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      entries[key] = [existing, value];
    }
  }
  return entries;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'form';
    result[path] ??= issue.message;
  }
  return result;
}
