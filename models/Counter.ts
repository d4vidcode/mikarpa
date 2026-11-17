import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/**
 * Contadores atómicos (por ejemplo numeración de pedidos por tienda).
 *
 * `_id` es un string con namespace: `order:<storeId>`.
 * Se usa con findOneAndUpdate + $inc para evitar colisiones en serverless.
 */
const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0, required: true },
  },
  { timestamps: true, versionKey: false },
);

export type CounterShape = InferSchemaType<typeof counterSchema>;
export type CounterDocument = CounterShape;

export const Counter: Model<CounterDocument> =
  models.Counter ?? model<CounterDocument>('Counter', counterSchema);
