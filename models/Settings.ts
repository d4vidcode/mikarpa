import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import {
  CURRENCY_REGEX,
  DEFAULT_CURRENCY,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Configuración global de la plataforma (documento singleton, `key = 'platform'`).
 * La edita únicamente el superadmin en /administracion/configuracion.
 *
 * Los rubros maestros viven en StoreCategory (colección propia) y los temas
 * disponibles en Theme, para poder listarlos y paginarlos sin cargar todo.
 */
const platformSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: 'platform',
      unique: true,
      immutable: true,
      required: true,
    },
    branding: {
      name: { type: String, default: 'mikarpa', trim: true, maxlength: 60 },
      tagline: { type: String, default: 'Tu tienda virtual, lista en minutos', trim: true, maxlength: 140 },
      logoUrl: { type: String, default: null, trim: true, maxlength: 2048 },
      faviconUrl: { type: String, default: null, trim: true, maxlength: 2048 },
      primaryColor: { type: String, default: '#111827', maxlength: 32 },
      supportEmail: { type: String, default: null, lowercase: true, trim: true, maxlength: 254 },
    },

    /** Valores por defecto al crear una tienda nueva. */
    defaults: {
      currency: {
        type: String,
        default: DEFAULT_CURRENCY,
        uppercase: true,
        match: [CURRENCY_REGEX, 'Moneda ISO 4217 inválida'],
      },
      locale: { type: String, default: DEFAULT_LOCALE, trim: true, maxlength: 10 },
      timezone: { type: String, default: DEFAULT_TIMEZONE, trim: true, maxlength: 64 },
      featureFlags: {
        type: Map,
        of: Boolean,
        default: () => new Map(Object.entries(DEFAULT_FEATURE_FLAGS)),
      },
    },

    signup: {
      allowOwnerSignup: { type: Boolean, default: true },
      allowCustomerSignup: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
    },

    maintenance: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'Estamos haciendo mantenimiento. Volvemos en unos minutos.',
        maxlength: 300,
      },
    },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false },
);

export type PlatformSettingsShape = InferSchemaType<typeof platformSettingsSchema>;
export type PlatformSettingsDocument = WithTimestamps<PlatformSettingsShape>;

export const PlatformSettings: Model<PlatformSettingsDocument> =
  models.PlatformSettings ??
  model<PlatformSettingsDocument>('PlatformSettings', platformSettingsSchema);
