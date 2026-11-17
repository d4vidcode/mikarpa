import { NextRequest } from 'next/server';
import { Counter, Order, Product, Store } from '@/models';
import { PaymentAccount } from '@/models';
import { apiError, apiOk } from '@/lib/api';
import { connectDB } from '@/lib/db';
import { decryptSecret } from '@/lib/crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { ORDER_NUMBER_START } from '@/lib/enums';
import { checkoutSchema } from '@/lib/validators/order';
import { fieldErrors } from '@/lib/validators/common';
import { createMPPreference } from '@/lib/payments/mercadopago';

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const ip = await getClientIp();
  const limit = checkRateLimit(`checkout-online:${slug}:${ip}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return apiError('rate_limited', `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.`, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('invalid_json', 'No pudimos leer el pedido.', 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('invalid_payload', 'Revisa los datos del pedido.', 422, fieldErrors(parsed.error));
  }

  const { items, customer, notes } = parsed.data;

  await connectDB();

  const store = await Store.findOne({ slug, deletedAt: null });
  if (!store || store.status !== 'active') {
    return apiError('store_unavailable', 'La tienda no está disponible.', 409);
  }

  const account = await PaymentAccount.findOne({ storeId: store._id, provider: 'mercadopago', status: 'active' }).lean();
  if (!account) {
    return apiError('payments_not_configured', 'La tienda no acepta pagos online aún.', 409);
  }

  const accessToken = decryptSecret(account.accessTokenEnc);

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: productIds }, storeId: store._id, status: 'active' });
  const productById = new Map(products.map((product) => [String(product._id), product]));

  const orderItems: { productId: string; variantId: string | null; variantLabel: string | null; name: string; sku: string | null; imageUrl: string | null; price: number; qty: number }[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return apiError('product_unavailable', 'Uno de los productos ya no está disponible.', 409);
    }

    const variants = product.variants ?? [];
    if (item.variantId) {
      const variant = variants.find((option) => String(option._id) === item.variantId);
      if (!variant || !variant.active) {
        return apiError('variant_unavailable', `La opción elegida de ${product.name} ya no está disponible.`, 409);
      }
      orderItems.push({
        productId: String(product._id),
        variantId: String(variant._id),
        variantLabel: (variant.options ?? []).map((o) => `${o.name} ${o.value}`).join(' / ') || null,
        name: product.name,
        sku: variant.sku ?? product.sku ?? null,
        imageUrl: variant.imageUrl ?? product.images?.[0]?.url ?? null,
        price: variant.price ?? product.price,
        qty: item.qty,
      });
    } else {
      orderItems.push({
        productId: String(product._id),
        variantId: null,
        variantLabel: null,
        name: product.name,
        sku: product.sku ?? null,
        imageUrl: product.images?.[0]?.url ?? null,
        price: product.price,
        qty: item.qty,
      });
    }
  }

  const subtotal = orderItems.reduce((total, item) => total + item.price * item.qty, 0);

  const counter = await Counter.findOneAndUpdate(
    { _id: `order:${String(store._id)}` },
    [{ $set: { seq: { $add: [{ $ifNull: ['$seq', ORDER_NUMBER_START - 1] }, 1] } } }],
    { upsert: true, returnDocument: 'after' },
  ).lean();

  const orderNumber = counter?.seq ?? ORDER_NUMBER_START;

  const currency = store.currency;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const order = await Order.create({
    storeId: store._id,
    orderNumber,
    customerId: null,
    customerInfo: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      documentId: customer.documentId,
    },
    items: orderItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
      name: item.name,
      sku: item.sku,
      imageUrl: item.imageUrl,
      price: item.price,
      qty: item.qty,
    })),
    totals: { subtotal, shipping: 0, tax: 0, discount: 0, total: subtotal },
    currency,
    channel: 'online',
    paymentProvider: 'mercadopago',
    status: 'pending',
    paymentStatus: 'pending',
    customerNotes: notes,
    source: 'storefront',
    payment: { provider: 'mercadopago', externalId: null, paidAt: null },
  });

  const preference = await createMPPreference({
    accessToken,
    items: orderItems.map((item) => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price / 100,
      currency_id: currency,
    })),
    externalReference: `${String(store._id)}:${orderNumber}`,
    backUrls: {
      success: `${appUrl}/tienda/${store.slug}/pedido/${orderNumber}?pago=ok`,
      failure: `${appUrl}/tienda/${store.slug}/carrito?pago=error`,
      pending: `${appUrl}/tienda/${store.slug}/pedido/${orderNumber}?pago=pendiente`,
    },
    notificationUrl: `${appUrl}/api/webhooks/mercadopago`,
  });

  await Order.updateOne({ _id: order._id }, { $set: { 'payment.externalId': preference.id } });

  return apiOk({ orderNumber, checkoutUrl: preference.initPoint }, { status: 201 });
}