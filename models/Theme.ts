import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { THEME_STATUSES } from '@/lib/enums';
import { sectionSchema, themeTokensSchema, type WithTimestamps } from './common';

/**
 * Tema disponible en la plataforma.
 *
 * IMPORTANTE: el CÓDIGO del tema (componentes React) vive en `/themes/<key>/`.
 * Esta colección solo guarda metadatos, tokens por defecto y qué secciones
 * ofrece, para poder activar/desactivar temas sin desplegar.
 * Si el `key` no existe en `/themes/registry.ts`, el tema se ignora al renderizar.
 */
const themeSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 48,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: null, trim: true, maxlength: 300 },
    previewImageUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    status: { type: String, enum: [...THEME_STATUSES], default: 'active', required: true },
    version: { type: String, default: '1.0.0', trim: true, maxlength: 20 },

    /** Tokens por defecto; Store.theme.tokens los sobreescribe parcialmente. */
    tokens: { type: themeTokensSchema, default: () => ({}) },

    /** Secciones que el owner puede activar para este tema. */
    sectionsAvailable: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) => new Set(values).size === values.length,
        message: 'sectionsAvailable no puede tener duplicados',
      },
    },

    /** Config inicial que se copia a Store.sections al crear la tienda. */
    defaultSections: {
      type: [sectionSchema],
      default: [],
      validate: {
        validator: (sections: { key: string }[]) =>
          new Set(sections.map((s) => s.key)).size === sections.length,
        message: 'defaultSections no puede repetir "key"',
      },
    },
  },
  { timestamps: true, versionKey: false },
);

themeSchema.index({ status: 1, name: 1 });

export type ThemeShape = InferSchemaType<typeof themeSchema>;
export type ThemeDocument = WithTimestamps<ThemeShape>;

export const Theme: Model<ThemeDocument> =
  models.Theme ?? model<ThemeDocument>('Theme', themeSchema);
