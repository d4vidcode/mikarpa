import { z } from 'zod';
import { GLOBAL_ROLES, USER_STATUSES } from '@/lib/enums';
import { objectIdSchema } from './common';

export const suspendStoreSchema = z.object({
  storeId: objectIdSchema,
  action: z.enum(['suspend', 'reactivate']),
  reason: z.string().trim().max(500).optional(),
});

export const updateUserSchema = z.object({
  userId: objectIdSchema,
  role: z.enum(GLOBAL_ROLES),
  status: z.enum(USER_STATUSES),
});

export const platformSettingsSchema = z.object({
  brandingName: z.string().trim().min(2, 'Escribe el nombre').max(60),
  brandingTagline: z.string().trim().max(140).optional(),
  supportEmail: z
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
  allowOwnerSignup: z.boolean(),
  maintenanceEnabled: z.boolean(),
  maintenanceMessage: z.string().trim().max(300).optional(),
});

export const storeCategoryInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  name: z.string().trim().min(2).max(60),
  icon: z.string().trim().max(48).default('package'),
  order: z.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});
