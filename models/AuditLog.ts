import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { GLOBAL_ROLES } from '@/lib/enums';

/**
 * Registro de auditoría (append-only).
 *
 * Se escriben acciones sensibles:
 *  - store.suspend / store.reactivate / store.delete
 *  - member.invite / member.update_permissions / member.remove
 *  - product.delete
 *  - user.role_change / user.suspend
 *  - settings.update
 *
 * Sin updatedAt: un log no se modifica. Los hooks bloquean updates/deletes.
 */
const auditLogSchema = new Schema(
  {
    /** Puede ser null para acciones del sistema (seed, cron, webhook). */
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    /** Snapshot: el usuario puede cambiar de rol o ser eliminado después. */
    actorEmail: { type: String, default: null, trim: true, lowercase: true, maxlength: 254 },
    actorRole: { type: String, enum: [...GLOBAL_ROLES], default: null },

    /** Tienda afectada, si aplica. Null en acciones globales. */
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', default: null },

    /** Notación con puntos: 'store.suspend', 'member.update_permissions'. */
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      match: [/^[a-z][a-z0-9]*(\.[a-z0-9_-]+)+$/, 'Formato de acción inválido'],
    },

    entityType: { type: String, required: true, trim: true, maxlength: 40 },
    entityId: { type: String, default: null, trim: true, maxlength: 64 },

    /** Estado antes/después (solo campos relevantes, sin secretos). */
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },

    metadata: {
      ip: { type: String, default: null, maxlength: 64 },
      userAgent: { type: String, default: null, maxlength: 512 },
      requestId: { type: String, default: null, maxlength: 100 },
      reason: { type: String, default: null, maxlength: 500 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

auditLogSchema.index({ storeId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

/** Append-only: se bloquea cualquier mutación posterior. */
auditLogSchema.pre(
  [
    'updateOne',
    'updateMany',
    'findOneAndUpdate',
    'findOneAndReplace',
    'replaceOne',
    'deleteOne',
    'deleteMany',
  ],
  async function () {
    throw new Error('AuditLog es inmutable: no se permite modificar ni eliminar registros');
  },
);

export type AuditLogShape = InferSchemaType<typeof auditLogSchema>;
export type AuditLogDocument = AuditLogShape & { createdAt: Date };

export const AuditLog: Model<AuditLogDocument> =
  models.AuditLog ?? model<AuditLogDocument>('AuditLog', auditLogSchema);
