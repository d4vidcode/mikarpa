import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { MEMBER_STATUSES, STORE_PERMISSIONS, STORE_ROLES } from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Relación usuario ↔ tienda. Es la FUENTE DE VERDAD del aislamiento multi-tenant.
 *
 * Invariantes:
 *  - único (storeId, userId)
 *  - role 'owner' => permissions = todas (normalizado en el hook)
 *  - role 'staff' => permissions ⊆ STORE_PERMISSIONS
 *  - siempre debe existir al menos un owner activo por tienda
 *    (validado en la capa de servicio dentro de una transacción)
 */
const storeMemberSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    role: { type: String, enum: [...STORE_ROLES], required: true },

    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) =>
          Array.isArray(values) &&
          values.every((value) => (STORE_PERMISSIONS as readonly string[]).includes(value)),
        message: 'Permiso inválido',
      },
    },

    status: { type: String, enum: [...MEMBER_STATUSES], default: 'active', required: true },

    invitedEmail: { type: String, default: null, lowercase: true, trim: true, maxlength: 254 },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    inviteTokenHash: { type: String, default: null, select: false },
    inviteExpiresAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    lastAccessAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

/** Un usuario solo puede ser miembro una vez por tienda. */
storeMemberSchema.index({ storeId: 1, userId: 1 }, { unique: true });
/** "Mis tiendas" y middleware de sesión. */
storeMemberSchema.index({ userId: 1, status: 1 });
storeMemberSchema.index({ storeId: 1, role: 1, status: 1 });
/** Token de invitación único (solo cuando existe). */
storeMemberSchema.index(
  { inviteTokenHash: 1 },
  { unique: true, partialFilterExpression: { inviteTokenHash: { $type: 'string' } } },
);

/** Los owner siempre tienen todos los permisos. */
storeMemberSchema.pre('validate', async function () {
  if (this.role === 'owner') {
    this.permissions = [...STORE_PERMISSIONS];
  }
  // Staff sin permisos puede ver el dashboard pero no operar módulos.
});

export type StoreMemberShape = InferSchemaType<typeof storeMemberSchema>;
export type StoreMemberDocument = WithTimestamps<StoreMemberShape>;

export const StoreMember: Model<StoreMemberDocument> =
  models.StoreMember ?? model<StoreMemberDocument>('StoreMember', storeMemberSchema);
