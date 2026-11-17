import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { GLOBAL_ROLES, USER_STATUSES } from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Usuario de la plataforma.
 *
 * - `role` es el rol GLOBAL (superadmin | owner | staff | customer).
 * - La pertenencia a tiendas vive en StoreMember (fuente de verdad del tenant).
 * - `passwordHash` nunca se proyecta por defecto (`select: false`).
 * - `tokenVersion` permite invalidar JWTs al cambiar rol o suspender la cuenta.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    },
    passwordHash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
    },
    role: {
      type: String,
      enum: [...GLOBAL_ROLES],
      default: 'customer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [...USER_STATUSES],
      default: 'active',
      required: true,
    },
    image: { type: String, default: null, trim: true, maxlength: 2048 },
    phone: { type: String, default: null, trim: true, maxlength: 20 },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },

    /** Se incrementa al cambiar rol, estado o permisos para invalidar sesiones. */
    tokenVersion: { type: Number, default: 0, required: true },

    /** Recuperación de contraseña: se guarda el hash, nunca el token plano. */
    passwordReset: {
      tokenHash: { type: String, default: null, select: false },
      expiresAt: { type: Date, default: null, select: false },
    },

    /** Soft delete: se anonimiza antes de marcar la fecha. */
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

/** Listados de superadmin (filtro por estado + orden por fecha). */
userSchema.index({ status: 1, createdAt: -1 });

export type UserShape = InferSchemaType<typeof userSchema>;
export type UserDocument = WithTimestamps<UserShape>;

export const User: Model<UserDocument> =
  models.User ?? model<UserDocument>('User', userSchema);
