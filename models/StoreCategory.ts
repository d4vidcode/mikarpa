import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { SLUG_REGEX } from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Rubro / categoría MAESTRA de la plataforma (nivel superadmin).
 * Se usa para:
 *  - clasificar tiendas en /explorar (Store.category guarda este `slug`)
 *  - el wizard de creación de tienda
 *
 * No confundir con `Category`, que es la categoría de productos de UNA tienda.
 */
const storeCategorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [SLUG_REGEX, 'Slug inválido'],
      maxlength: 48,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    /** Nombre de icono lucide-react (string libre: el registry lo valida). */
    icon: { type: String, default: 'package', trim: true, maxlength: 48 },
    description: { type: String, default: null, trim: true, maxlength: 200 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

storeCategorySchema.index({ active: 1, order: 1 });

export type StoreCategoryShape = InferSchemaType<typeof storeCategorySchema>;
export type StoreCategoryDocument = WithTimestamps<StoreCategoryShape>;

export const StoreCategory: Model<StoreCategoryDocument> =
  models.StoreCategory ?? model<StoreCategoryDocument>('StoreCategory', storeCategorySchema);
