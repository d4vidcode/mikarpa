import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { CATEGORY_STATUSES, SLUG_REGEX } from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Categoría de productos DE UNA TIENDA (tenant-scoped).
 * El slug es único por tienda, no global.
 */
const categorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },

    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 80 },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      match: [SLUG_REGEX, 'Slug inválido'],
    },
    description: { type: String, default: null, trim: true, maxlength: 300 },
    imageUrl: { type: String, default: null, trim: true, maxlength: 2048 },

    /** Subcategoría opcional (un nivel; sin ciclos, validado en el servicio). */
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    order: { type: Number, default: 0 },
    status: { type: String, enum: [...CATEGORY_STATUSES], default: 'active', required: true },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ storeId: 1, slug: 1 }, { unique: true });
categorySchema.index({ storeId: 1, status: 1, order: 1 });
categorySchema.index({ storeId: 1, parentId: 1 });

export type CategoryShape = InferSchemaType<typeof categorySchema>;
export type CategoryDocument = WithTimestamps<CategoryShape>;

export const Category: Model<CategoryDocument> =
  models.Category ?? model<CategoryDocument>('Category', categorySchema);
