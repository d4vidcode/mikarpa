import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/enums';
import { objectIdSchema, optionalTextSchema, phoneSchema } from './common';

export const checkoutItemSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema.nullish(),
  qty: z.number().int().min(1, 'Cantidad mínima: 1').max(999, 'Cantidad máxima: 999'),
});

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(120),
  phone: phoneSchema,
  email: z
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
  address: optionalTextSchema(300),
  city: optionalTextSchema(80),
  documentId: optionalTextSchema(30),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'El carrito está vacío').max(50),
  customer: checkoutCustomerSchema,
  notes: optionalTextSchema(1000),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
});

export const orderNotesSchema = z.object({
  internalNotes: optionalTextSchema(2000),
});
