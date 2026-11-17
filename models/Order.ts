import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import {
  ORDER_CHANNELS,
  ORDER_NUMBER_START,
  ORDER_SOURCES,
  ORDER_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from '@/lib/enums';
import { integerMoneyValidator, type WithTimestamps } from './common';

/* ------------------------------------------------------------------ */
/* Sub-esquemas                                                       */
/* ------------------------------------------------------------------ */

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    /** Variante comprada (null si el producto no tiene variantes). */
    variantId: { type: Schema.Types.ObjectId, default: null },
    /** Etiqueta legible: 'Talla M / Negro'. */
    variantLabel: { type: String, default: null, trim: true, maxlength: 120 },
    /** Snapshot: el pedido no cambia si el producto se edita o elimina. */
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, default: null, trim: true, maxlength: 64 },
    imageUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    price: { type: Number, required: true, min: 0, validate: integerMoneyValidator },
    qty: {
      type: Number,
      required: true,
      min: 1,
      max: 999,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: 'La cantidad debe ser un entero',
      },
    },
  },
  { _id: false },
);

const customerInfoSchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 120 },
    /** Obligatorio siempre: el canal WhatsApp lo necesita. */
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, default: null, trim: true, lowercase: true, maxlength: 254 },
    address: { type: String, default: null, trim: true, maxlength: 300 },
    city: { type: String, default: null, trim: true, maxlength: 80 },
    documentId: { type: String, default: null, trim: true, maxlength: 30 },
  },
  { _id: false },
);

const totalsSchema = new Schema(
  {
    subtotal: { type: Number, required: true, min: 0, validate: integerMoneyValidator },
    shipping: { type: Number, default: 0, min: 0, validate: integerMoneyValidator },
    tax: { type: Number, default: 0, min: 0, validate: integerMoneyValidator },
    discount: { type: Number, default: 0, min: 0, validate: integerMoneyValidator },
    total: { type: Number, required: true, min: 0, validate: integerMoneyValidator },
  },
  { _id: false },
);

const statusEventSchema = new Schema(
  {
    status: { type: String, enum: [...ORDER_STATUSES], required: true },
    at: { type: Date, default: () => new Date() },
    byUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, default: null, maxlength: 500 },
  },
  { _id: false },
);

const paymentOrderSchema = new Schema(
  {
    provider: { type: String, enum: [...PAYMENT_PROVIDERS], default: null },
    /** Id de la transacción en el proveedor (payment_id / charge_id / pi_...). */
    externalId: { type: String, default: null, trim: true, maxlength: 255 },
    /** Id de la preferencia/sesión de checkout. */
    preferenceId: { type: String, default: null, trim: true, maxlength: 255 },
    checkoutUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    receiptUrl: { type: String, default: null, trim: true, maxlength: 2048 },
    paidAt: { type: Date, default: null },
  },
  { _id: false },
);

const whatsappOrderSchema = new Schema(
  {
    /** Mensaje exacto enviado (o pre-armado) para trazabilidad. */
    message: { type: String, default: null, maxlength: 4000 },
    openedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ */
/* Pedido                                                             */
/* ------------------------------------------------------------------ */

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },

    /** Numeración visible por tienda (#1001). Generada con Counter atómico. */
    orderNumber: {
      type: Number,
      required: true,
      min: ORDER_NUMBER_START,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: 'orderNumber debe ser un entero',
      },
    },

    /** Usuario registrado que compró; null en checkout invitado. */
    customerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    customerInfo: { type: customerInfoSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: 'El pedido debe tener al menos un ítem',
      },
    },

    totals: { type: totalsSchema, required: true },

    /** Snapshot de la moneda al momento de la compra. */
    currency: { type: String, required: true, uppercase: true, trim: true, maxlength: 3 },

    channel: { type: String, enum: [...ORDER_CHANNELS], required: true },
    /** Pasarela usada cuando channel = 'online'. */
    paymentProvider: { type: String, enum: [...PAYMENT_PROVIDERS], default: null },
    status: { type: String, enum: [...ORDER_STATUSES], default: 'pending', required: true },
    paymentStatus: {
      type: String,
      enum: [...PAYMENT_STATUSES],
      default: 'unpaid',
      required: true,
    },

    statusHistory: {
      type: [statusEventSchema],
      default: [],
    },

    payment: { type: paymentOrderSchema, default: () => ({}) },
    whatsapp: { type: whatsappOrderSchema, default: () => ({}) },
    couponCode: { type: String, default: null, trim: true, uppercase: true, maxlength: 40 },

    customerNotes: { type: String, default: null, maxlength: 1000 },
    internalNotes: { type: String, default: null, maxlength: 2000 },

    source: { type: String, enum: [...ORDER_SOURCES], default: 'storefront', required: true },

    /** Referencia externa opcional (ej. id de webhook) para idempotencia. */
    externalRef: { type: String, default: null, trim: true, maxlength: 255 },
  },
  { timestamps: true, versionKey: false },
);

orderSchema.index({ storeId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index(
  { storeId: 1, 'payment.provider': 1, 'payment.externalId': 1 },
  {
    unique: true,
    partialFilterExpression: { 'payment.externalId': { $type: 'string' } },
  },
);
orderSchema.index(
  { externalRef: 1 },
  { unique: true, partialFilterExpression: { externalRef: { $type: 'string' } } },
);

orderSchema.pre('validate', async function () {
  // 1) Sin líneas duplicadas del mismo producto/variante (el carrito debe agrupar).
  const lineKeys = (this.items ?? []).map(
    (item) => `${String(item.productId)}::${item.variantId ? String(item.variantId) : 'base'}`,
  );
  if (new Set(lineKeys).size !== lineKeys.length) {
    this.invalidate(
      'items',
      'Hay líneas duplicadas: agrupa las cantidades del mismo producto y variante',
    );
  }

  // 2) Los totales deben cuadrar SIEMPRE (el servidor recalcula, nunca confía en el cliente).
  const totals = this.totals;
  if (totals) {
    const expected =
      (totals.subtotal ?? 0) + (totals.shipping ?? 0) + (totals.tax ?? 0) - (totals.discount ?? 0);
    if (Math.round(expected) !== Math.round(totals.total ?? 0)) {
      this.invalidate(
        'totals.total',
        'El total no coincide con subtotal + envío + impuestos - descuento',
      );
    }
  }

  // 3) La primera entrada del historial coincide con el estado inicial.
  if ((this.statusHistory ?? []).length === 0) {
    this.set('statusHistory', [
      { status: this.status, at: new Date(), note: 'Pedido creado' },
    ]);
  }
});

export type OrderShape = InferSchemaType<typeof orderSchema>;
export type OrderDocument = WithTimestamps<OrderShape>;

export const Order: Model<OrderDocument> =
  models.Order ?? model<OrderDocument>('Order', orderSchema);
