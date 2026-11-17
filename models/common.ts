import { Schema, Types } from 'mongoose';

/**
 * Sub-esquemas compartidos entre modelos.
 * Este archivo NO registra modelos en Mongoose.
 */

/* ------------------------------------------------------------------ */
/* Imagen / media                                                      */
/* ------------------------------------------------------------------ */

export const mediaSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    /** Identificador en el proveedor (Cloudinary public_id / Blob pathname). */
    publicId: { type: String, default: null, trim: true, maxlength: 512 },
    alt: { type: String, default: null, trim: true, maxlength: 200 },
    width: { type: Number, default: null, min: 1 },
    height: { type: Number, default: null, min: 1 },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ */
/* Tokens de tema                                                      */
/* ------------------------------------------------------------------ */

export const themeTokensSchema = new Schema(
  {
    colors: {
      primary: { type: String, default: null, maxlength: 32 },
      secondary: { type: String, default: null, maxlength: 32 },
      accent: { type: String, default: null, maxlength: 32 },
      background: { type: String, default: null, maxlength: 32 },
      foreground: { type: String, default: null, maxlength: 32 },
      muted: { type: String, default: null, maxlength: 32 },
    },
    fonts: {
      heading: { type: String, default: null, maxlength: 64 },
      body: { type: String, default: null, maxlength: 64 },
    },
    /** Radio de bordes como string CSS ('0rem', '0.5rem', '9999px'). */
    radius: { type: String, default: null, maxlength: 16 },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ */
/* Secciones de la tienda                                              */
/* ------------------------------------------------------------------ */

/**
 * `type` es la clave del componente en el registry de código
 * (`themes/sections/registry.ts`). No se valida con `enum` en Mongo a
 * propósito: añadir una sección nueva no debe requerir migración de datos.
 */
export const sectionSchema = new Schema(
  {
    /** Identificador de la instancia dentro de la tienda (único por tienda). */
    key: { type: String, required: true, trim: true, maxlength: 64 },
    type: { type: String, required: true, trim: true, maxlength: 64 },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    /** Config específica del tipo de sección; validada con Zod contra el registry. */
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

export type SectionConfig = {
  key: string;
  type: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Validador reutilizable para dinero en unidad menor (entero >= 0; null = sin valor). */
export const integerMoneyValidator = {
  validator: (value: number | null | undefined) =>
    value === null || value === undefined || (Number.isInteger(value) && value >= 0),
  message: 'El monto debe ser un entero >= 0 en la unidad menor de la moneda',
};

export type WithTimestamps<T> = T & {
  /** Mongoose siempre asigna `_id` al documento raíz. */
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
