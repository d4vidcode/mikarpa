import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import {
  CURRENCY_REGEX,
  DEFAULT_CURRENCY,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_LOCALE,
  DEFAULT_PAYMENT_PROVIDER,
  DEFAULT_TIMEZONE,
  ORDER_CHANNELS,
  PAYMENT_ACCOUNT_STATUSES,
  PAYMENT_PROVIDERS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
  STORE_STATUSES,
} from '@/lib/enums';
import {
  sectionSchema,
  themeTokensSchema,
  type WithTimestamps,
} from './common';

/* ------------------------------------------------------------------ */
/* Sub-esquemas                                                       */
/* ------------------------------------------------------------------ */

const storeThemeSchema = new Schema(
  {
    /** Debe existir en `themes/registry.ts`; si no, la tienda usa el fallback. */
    themeKey: { type: String, required: true, lowercase: true, trim: true, maxlength: 48 },
    /** Overrides parciales sobre Theme.tokens. */
    tokens: { type: themeTokensSchema, default: () => ({}) },
  },
  { _id: false },
);

const whatsappConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    /** Formato E.164 sin espacios: +51987654321 o 987654321. */
    phone: {
      type: String,
      default: null,
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Teléfono WhatsApp inválido'],
    },
    /** Placeholder opcional para el mensaje pre-armado del checkout. */
    messageTemplate: { type: String, default: null, maxlength: 1000 },
  },
  { _id: false },
);

const onlinePaymentConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: [...PAYMENT_PROVIDERS],
      default: DEFAULT_PAYMENT_PROVIDER,
    },
    /** Estado de vinculación de la cuenta del vendedor (OAuth / onboarding). */
    status: {
      type: String,
      enum: [...PAYMENT_ACCOUNT_STATUSES],
      default: 'disconnected',
    },
    /**
     * Id público del vendedor en la pasarela (collector_id de Mercado Pago,
     * comercio de Culqi, acct_ de Stripe). Los tokens secretos NO viven aquí.
     */
    accountId: { type: String, default: null, trim: true, maxlength: 64 },
    connectedAt: { type: Date, default: null },
  },
  { _id: false },
);

const paymentConfigSchema = new Schema(
  {
    whatsapp: { type: whatsappConfigSchema, default: () => ({}) },
    online: { type: onlinePaymentConfigSchema, default: () => ({}) },
    defaultChannel: { type: String, enum: [...ORDER_CHANNELS], default: 'whatsapp' },
  },
  { _id: false },
);

const businessHourSchema = new Schema(
  {
    /** 0 = domingo ... 6 = sábado (Date.getDay()). */
    day: { type: Number, required: true, min: 0, max: 6 },
    closed: { type: Boolean, default: true },
    open: { type: String, default: '09:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    close: { type: String, default: '18:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  },
  { _id: false },
);

const storeContactSchema = new Schema(
  {
    phone: { type: String, default: null, trim: true, maxlength: 20 },
    email: { type: String, default: null, trim: true, lowercase: true, maxlength: 254 },
    address: { type: String, default: null, trim: true, maxlength: 200 },
    city: { type: String, default: null, trim: true, maxlength: 80 },
    /** ISO 3166-1 alpha-2. */
    country: { type: String, default: null, trim: true, uppercase: true, maxlength: 2 },
  },
  { _id: false },
);

const storeSocialSchema = new Schema(
  {
    instagram: { type: String, default: null, trim: true, maxlength: 300 },
    facebook: { type: String, default: null, trim: true, maxlength: 300 },
    tiktok: { type: String, default: null, trim: true, maxlength: 300 },
    x: { type: String, default: null, trim: true, maxlength: 300 },
    website: { type: String, default: null, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const storeSeoSchema = new Schema(
  {
    title: { type: String, default: null, trim: true, maxlength: 70 },
    description: { type: String, default: null, trim: true, maxlength: 160 },
    ogImageUrl: { type: String, default: null, trim: true, maxlength: 2048 },
  },
  { _id: false },
);

const suspensionSchema = new Schema(
  {
    reason: { type: String, default: null, trim: true, maxlength: 500 },
    at: { type: Date, default: null },
    by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ */
/* Tienda                                                             */
/* ------------------------------------------------------------------ */

const storeSchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 80 },

    /** Identificador público y multi-tenant: /tienda/[slug] */
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: SLUG_MIN_LENGTH,
      maxlength: SLUG_MAX_LENGTH,
      match: [SLUG_REGEX, 'Slug inválido: solo minúsculas, números y guiones'],
    },

    /** Slugs anteriores, para redirecciones 301 al cambiarlo. */
    slugHistory: { type: [String], default: [] },

    description: { type: String, default: null, trim: true, maxlength: 500 },
    logoUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    logoPublicId: { type: String, default: null, trim: true, maxlength: 512 },

    /** Slug de StoreCategory (rubro maestro de la plataforma). */
    category: { type: String, required: true, lowercase: true, trim: true, maxlength: 48 },

    /** Dueño principal. Debe existir también en StoreMember con role 'owner'. */
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    theme: { type: storeThemeSchema, required: true },

    /** Secciones activas/inactivas y su orden de render. */
    sections: {
      type: [sectionSchema],
      default: [],
      validate: {
        validator: (sections: { key: string }[]) =>
          new Set(sections.map((s) => s.key)).size === sections.length,
        message: 'Las secciones no pueden repetir "key"',
      },
    },

    contact: { type: storeContactSchema, default: () => ({}) },
    social: { type: storeSocialSchema, default: () => ({}) },
    businessHours: { type: [businessHourSchema], default: [] },

    currency: {
      type: String,
      default: DEFAULT_CURRENCY,
      uppercase: true,
      trim: true,
      match: [CURRENCY_REGEX, 'Moneda ISO 4217 inválida'],
    },
    locale: { type: String, default: DEFAULT_LOCALE, trim: true, maxlength: 10 },
    timezone: { type: String, default: DEFAULT_TIMEZONE, trim: true, maxlength: 64 },

    paymentConfig: { type: paymentConfigSchema, default: () => ({}) },

    /**
     * Feature flags embebidos: se leen junto con la tienda (0 queries extra).
     * Resolución: Store.featureFlags[key] ?? DEFAULT_FEATURE_FLAGS[key].
     */
    featureFlags: {
      type: Map,
      of: Boolean,
      default: () => new Map(Object.entries(DEFAULT_FEATURE_FLAGS)),
    },

    seo: { type: storeSeoSchema, default: () => ({}) },

    status: {
      type: String,
      enum: [...STORE_STATUSES],
      default: 'active',
      required: true,
    },
    suspension: { type: suspensionSchema, default: () => ({}) },

    onboardingCompletedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

/** Directorio /explorar: tiendas activas por rubro, más nuevas primero. */
storeSchema.index({ status: 1, category: 1, createdAt: -1 });
storeSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
storeSchema.index({ status: 1, deletedAt: 1, category: 1, createdAt: -1 });
/** Panel del owner: "mis tiendas". */
storeSchema.index({ ownerId: 1, status: 1 });
/** Búsqueda por nombre en /explorar (MVP). */
storeSchema.index(
  { name: 'text', description: 'text' },
  { default_language: 'spanish', weights: { name: 10, description: 1 }, name: 'store_text' },
);

/** Normaliza reglas que Mongo no puede expresar con `unique` por subdocumento. */
storeSchema.pre('validate', async function () {
  const sections = this.sections ?? [];
  const keys = sections.map((section) => section.key).filter(Boolean);
  if (new Set(keys).size !== keys.length) {
    this.invalidate('sections', 'Las secciones no pueden repetir "key"');
  }

  const days = (this.businessHours ?? []).map((hour) => hour.day);
  if (new Set(days).size !== days.length) {
    this.invalidate('businessHours', 'No puede haber dos horarios para el mismo día');
  }
});

export type StoreShape = InferSchemaType<typeof storeSchema>;
export type StoreDocument = WithTimestamps<StoreShape>;

export const Store: Model<StoreDocument> =
  models.Store ?? model<StoreDocument>('Store', storeSchema);
