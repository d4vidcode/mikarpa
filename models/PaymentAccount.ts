import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { PAYMENT_ACCOUNT_STATUSES, PAYMENT_PROVIDERS } from '@/lib/enums';
import type { WithTimestamps } from './common';

/**
 * Cuenta de cobro de una tienda en una pasarela (Mercado Pago, Culqi, Stripe).
 *
 * Por qué una colección aparte de Store:
 *  - los tokens de acceso son SECRETOS y no deben viajar en el documento de tienda
 *    que se lee en cada render del storefront;
 *  - permite rotar/desconectar credenciales sin tocar la configuración pública;
 *  - deja la puerta abierta a multi-proveedor por tienda en el futuro.
 *
 * Seguridad:
 *  - `accessTokenEnc` y `refreshTokenEnc` se guardan cifrados con AES-256-GCM
 *    usando `PAYMENT_TOKEN_KEY` (32 bytes) y `select: false`;
 *  - nunca se devuelven al cliente ni se registran en logs/auditoría;
 *  - el descifrado ocurre solo en el servidor, en el módulo de pagos.
 *
 * Estrategia por pasarela:
 *  - Mercado Pago: OAuth Marketplace → `providerUserId` = collector_id.
 *  - Culqi: credenciales de comercio + llave pública/privada.
 *  - Stripe: Connect → `providerUserId` = acct_... (solo países soportados).
 */
const paymentAccountSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
    },
    provider: { type: String, enum: [...PAYMENT_PROVIDERS], required: true },
    /** Id público del vendedor en la pasarela. */
    providerUserId: { type: String, required: true, trim: true, maxlength: 64 },

    status: {
      type: String,
      enum: [...PAYMENT_ACCOUNT_STATUSES],
      default: 'pending',
      required: true,
    },
    liveMode: { type: Boolean, default: true },
    scope: { type: String, default: null, trim: true, maxlength: 255 },

    accessTokenEnc: { type: String, required: true, select: false },
    refreshTokenEnc: { type: String, default: null, select: false },
    tokenExpiresAt: { type: Date, default: null },

    connectedAt: { type: Date, default: null },
    disconnectedAt: { type: Date, default: null },
    lastSyncAt: { type: Date, default: null },

    /** Datos no sensibles de la cuenta (nombre del comercio, país, etc.). */
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

paymentAccountSchema.index({ provider: 1, providerUserId: 1 });
paymentAccountSchema.index({ status: 1 });

export type PaymentAccountShape = InferSchemaType<typeof paymentAccountSchema>;
export type PaymentAccountDocument = WithTimestamps<PaymentAccountShape>;

export const PaymentAccount: Model<PaymentAccountDocument> =
  models.PaymentAccount ??
  model<PaymentAccountDocument>('PaymentAccount', paymentAccountSchema);
