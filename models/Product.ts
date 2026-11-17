import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { PRODUCT_STATUSES, SLUG_REGEX } from '@/lib/enums';
import {
  integerMoneyValidator,
  mediaSchema,
  type WithTimestamps,
} from './common';
const productSeoSchema = new Schema(
  {
    title: { type: String, default: null, trim: true, maxlength: 70 },
    description: { type: String, default: null, trim: true, maxlength: 160 },
  },
  { _id: false },
);

const productOptionSchema = new Schema(
  {
    /** 'Talla', 'Color', 'Material'… */
    name: { type: String, required: true, trim: true, maxlength: 40 },
    values: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) =>
          values.length > 0 &&
          values.length <= 20 &&
          new Set(values.map((value) => value.trim().toLowerCase())).size === values.length,
        message: 'Cada opción necesita valores únicos (máx. 20)',
      },
    },
  },
  { _id: false },
);

const variantOptionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    value: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const productVariantSchema = new Schema(
  {
    sku: { type: String, default: null, trim: true, uppercase: true, maxlength: 64 },
    /** Combinación concreta: [{name:'Talla', value:'M'}, {name:'Color', value:'Negro'}] */
    options: {
      type: [variantOptionSchema],
      default: [],
      validate: {
        validator: (values: unknown[]) => values.length <= 3,
        message: 'Máximo 3 opciones por variante',
      },
    },
    /** Override del precio; null = usa Product.price. */
    price: { type: Number, default: null, min: 0, validate: integerMoneyValidator },
    compareAtPrice: { type: Number, default: null, min: 0, validate: integerMoneyValidator },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: 'El stock debe ser un entero',
      },
    },
    imageUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    active: { type: Boolean, default: true },
  },
  { _id: true },
);

/**
 * Producto de una tienda (tenant-scoped).
 *
 * Dinero: `price` y `compareAtPrice` son enteros en la unidad menor de la
 * moneda de la tienda (Store.currency). Ej: 1999 = S/ 19,99 PEN.
 */
const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      match: [SLUG_REGEX, 'Slug inválido'],
    },

    description: { type: String, default: null, maxlength: 20_000 },
    /** Texto plano derivado del rich text: SEO, extractos y búsqueda. */
    descriptionText: { type: String, default: null, maxlength: 5000 },

    /** Opciones para el constructor de variantes (Talla, Color…). */
    options: {
      type: [productOptionSchema],
      default: [],
      validate: {
        validator: (values: unknown[]) => values.length <= 3,
        message: 'Máximo 3 opciones por producto',
      },
    },
    /** Variantes concretas. Si existe al menos una, el stock vive por variante. */
    variants: {
      type: [productVariantSchema],
      default: [],
      validate: {
        validator: (values: unknown[]) => values.length <= 100,
        message: 'Máximo 100 variantes por producto',
      },
    },

    price: { type: Number, required: true, min: 0, validate: integerMoneyValidator },
    compareAtPrice: { type: Number, default: null, min: 0, validate: integerMoneyValidator },

    sku: { type: String, default: null, trim: true, uppercase: true, maxlength: 64 },

    stock: { type: Number, default: 0, min: 0, validate: {
      validator: (value: number) => Number.isInteger(value),
      message: 'El stock debe ser un entero',
    } },
    /** Si es false, el stock no se descuenta ni bloquea la compra. */
    trackStock: { type: Boolean, default: true },

    status: { type: String, enum: [...PRODUCT_STATUSES], default: 'draft', required: true },

    images: {
      type: [mediaSchema],
      default: [],
      validate: {
        validator: (images: unknown[]) => images.length <= 10,
        message: 'Máximo 10 imágenes por producto',
      },
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 20,
        message: 'Máximo 20 etiquetas',
      },
    },

    /** Sección "Destacados" del storefront. */
    featured: { type: Boolean, default: false },
    position: { type: Number, default: 0 },

    seo: { type: productSeoSchema, default: () => ({}) },

    /** Contador denormalizado para ordenar por más vendidos (Fase 3). */
    soldCount: { type: Number, default: 0, min: 0 },

    archivedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

/** Slug único por tienda (no global). */
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
/** Listado del panel y storefront. */
productSchema.index({ storeId: 1, status: 1, createdAt: -1 });
productSchema.index({ storeId: 1, categoryId: 1, status: 1, position: 1 });
/** Destacados. */
productSchema.index({ storeId: 1, featured: 1, status: 1, position: 1 });
/** Búsqueda dentro de la tienda (la query siempre filtra por storeId). */
productSchema.index(
  { name: 'text', descriptionText: 'text', tags: 'text' },
  {
    default_language: 'spanish',
    weights: { name: 10, tags: 5, descriptionText: 1 },
    name: 'product_text',
  },
);
/** SKU único cuando existe. */
productSchema.index(
  { storeId: 1, sku: 1 },
  { unique: true, partialFilterExpression: { sku: { $type: 'string' } } },
);

productSchema.pre('validate', async function () {
  if (this.compareAtPrice !== null && this.compareAtPrice !== undefined) {
    if (this.compareAtPrice <= this.price) {
      this.invalidate('compareAtPrice', 'El precio anterior debe ser mayor al precio actual');
    }
  }

  // Opciones: sin nombres repetidos.
  const optionNames = (this.options ?? []).map((option) => option.name.trim().toLowerCase());
  if (new Set(optionNames).size !== optionNames.length) {
    this.invalidate('options', 'Las opciones no pueden repetir nombre');
  }

  // Variantes: sin combinaciones duplicadas y con precio anterior coherente.
  const variants = this.variants ?? [];
  const combos = variants.map((variant) =>
    (variant.options ?? [])
      .map((option) => `${option.name.trim().toLowerCase()}:${option.value.trim().toLowerCase()}`)
      .sort()
      .join('|'),
  );
  if (new Set(combos).size !== combos.length) {
    this.invalidate('variants', 'Hay variantes duplicadas (misma combinación de opciones)');
  }
  for (const variant of variants) {
    const effectivePrice = variant.price ?? this.price;
    if (variant.compareAtPrice !== null && variant.compareAtPrice !== undefined) {
      if (variant.compareAtPrice <= effectivePrice) {
        this.invalidate(
          'variants',
          'El precio anterior de una variante debe ser mayor a su precio',
        );
        break;
      }
    }
  }

  if (this.status === 'archived' && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  if (this.status !== 'archived' && this.archivedAt) {
    this.archivedAt = null;
  }
});

export type ProductShape = InferSchemaType<typeof productSchema>;
export type ProductDocument = WithTimestamps<ProductShape>;

export const Product: Model<ProductDocument> =
  models.Product ?? model<ProductDocument>('Product', productSchema);
