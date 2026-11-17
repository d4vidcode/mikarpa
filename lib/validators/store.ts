import { z } from 'zod';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_REGEX, STORE_STATUSES } from '@/lib/enums';
import { optionalPhoneSchema, optionalTextSchema, optionalUrlSchema } from './common';

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN_LENGTH, `Mínimo ${SLUG_MIN_LENGTH} caracteres`)
  .max(SLUG_MAX_LENGTH, `Máximo ${SLUG_MAX_LENGTH} caracteres`)
  .regex(SLUG_REGEX, 'Solo minúsculas, números y guiones');

export const createStoreSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre de la tienda').max(80),
  slug: slugSchema,
  category: z.string().trim().min(2, 'Elige un rubro').max(48),
  themeKey: z.string().trim().min(2).max(48),
  description: optionalTextSchema(500),
  whatsappPhone: optionalPhoneSchema,
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const storeSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre').max(80),
  slug: slugSchema.optional(),
  description: optionalTextSchema(500),
  logoUrl: optionalUrlSchema(),
  contactPhone: optionalPhoneSchema,
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .nullish()
    .transform((value) => (value ? value : null))
    .refine(
      (value) => value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Correo inválido',
    ),
  address: optionalTextSchema(200),
  city: optionalTextSchema(80),
  instagram: optionalUrlSchema(300),
  facebook: optionalUrlSchema(300),
  tiktok: optionalUrlSchema(300),
  website: optionalUrlSchema(300),
  whatsappEnabled: z.boolean(),
  whatsappPhone: optionalPhoneSchema,
  whatsappTemplate: optionalTextSchema(1000),
  seoTitle: optionalTextSchema(70),
  seoDescription: optionalTextSchema(160),
  businessHours: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        closed: z.boolean(),
        open: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/, 'Hora inválida'),
        close: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/, 'Hora inválida'),
      }),
    )
    .max(7)
    .optional(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const appearanceSchema = z.object({
  themeKey: z.string().trim().min(2).max(48),
  primary: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').nullish(),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').nullish(),
  background: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').nullish(),
  foreground: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').nullish(),
  radius: z.string().trim().max(16).nullish(),
  sections: z.array(
    z.object({
      key: z.string().min(1).max(64),
      enabled: z.boolean(),
      order: z.number().int().min(0).max(100),
    }),
  ),
});

export const storeStatusSchema = z.object({
  status: z.enum(STORE_STATUSES),
  reason: z.string().trim().max(500).optional(),
});
