import { z } from 'zod';
import { PRODUCT_STATUSES } from '@/lib/enums';
import {
  HTTP_URL_REGEX,
  moneyCentsSchema,
  objectIdSchema,
  optionalMoneyCentsSchema,
  optionalTextSchema,
} from './common';

export const productImageSchema = z.object({
  url: z.string().trim().max(2048).regex(HTTP_URL_REGEX, 'URL de imagen inválida'),
  publicId: z.string().trim().max(512).nullish(),
  alt: z.string().trim().max(200).nullish(),
  width: z.number().int().positive().max(10_000).nullish(),
  height: z.number().int().positive().max(10_000).nullish(),
});

export const variantInputSchema = z.object({
  sku: z
    .string()
    .trim()
    .max(64)
    .nullish()
    .transform((value) => (value ? value.toUpperCase() : null)),
  options: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        value: z.string().trim().min(1).max(40),
      }),
    )
    .max(3),
  price: optionalMoneyCentsSchema,
  compareAtPrice: optionalMoneyCentsSchema,
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: z
    .string()
    .trim()
    .max(2048)
    .nullish()
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || HTTP_URL_REGEX.test(value), 'URL inválida'),
  active: z.boolean().default(true),
});

export const productOptionSchema = z.object({
  name: z.string().trim().min(1).max(40),
  values: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
});

export const productInputSchema = z.object({
  id: objectIdSchema.nullish(),
  name: z.string().trim().min(2, 'Escribe el nombre del producto').max(200),
  slug: z.string().trim().max(200).nullish(),
  categoryId: objectIdSchema.nullish(),
  description: optionalTextSchema(20_000),
  price: moneyCentsSchema,
  compareAtPrice: optionalMoneyCentsSchema,
  sku: z
    .string()
    .trim()
    .max(64)
    .nullish()
    .transform((value) => (value ? value.toUpperCase() : null)),
  stock: z.number().int().min(0).max(1_000_000),
  trackStock: z.boolean().default(true),
  status: z.enum(PRODUCT_STATUSES),
  featured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  images: z.array(productImageSchema).max(10).default([]),
  options: z.array(productOptionSchema).max(3).default([]),
  variants: z.array(variantInputSchema).max(100).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productStatusSchema = z.object({ status: z.enum(PRODUCT_STATUSES) });

export const categoryInputSchema = z.object({
  id: objectIdSchema.nullish(),
  name: z.string().trim().min(2, 'Escribe el nombre').max(80),
  slug: z.string().trim().max(80).nullish(),
  description: optionalTextSchema(300),
  order: z.number().int().min(0).max(999).default(0),
});
