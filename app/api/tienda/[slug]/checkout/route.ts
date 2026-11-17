import type { NextRequest } from 'next/server';
import { Counter, Order, Product, Store } from '@/models';
import { apiError, apiOk } from '@/lib/api';
import { connectDB } from '@/lib/db';
import { formatMoney } from '@/lib/money';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { ORDER_NUMBER_START } from '@/lib/enums';
import { checkoutSchema } from '@/lib/validators/order';
import { fieldErrors } from '@/lib/validators/common';

type StockChange =
  | { kind: 'product'; productId: string; qty: number }
  | { kind: 'variant'; productId: string; variantId: string; qty: number };

function normalizeWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9) {
    return `51${digits}`;
  }
  return digits;
}

/**
 * Checkout por WhatsApp.
 *
 * El cliente SOLO envía ids y cantidades: precios, stock y totales se
 * recalculan aquí. El stock se descuenta con operaciones atómicas y se
 * revierte si algo falla después.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const ip = await getClientIp();
  const limit = checkRateLimit(`checkout:${slug}:${ip}`, 20, 10 * 60 * 1000);

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

  let store = await Store.findOne({ slug, deletedAt: null });
  if (!store) {
    store = await Store.findOne({ slugHistory: slug, deletedAt: null });
  }
  if (!store) {
    return apiError('store_not_found', 'La tienda no existe.', 404);
  }
  if (store.status !== 'active') {
    return apiError('store_unavailable', 'La tienda no está aceptando pedidos.', 409);
  }

  const whatsapp = store.paymentConfig?.whatsapp;
  if (!whatsapp?.enabled || !whatsapp.phone) {
    return apiError('checkout_disabled', 'La tienda aún no habilitó los pedidos.', 409);
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    storeId: store._id,
    status: 'active',
  });

  const productById = new Map(products.map((product) => [String(product._id), product]));

  const stockChanges: StockChange[] = [];
  const orderItems: {
    productId: string;
    variantId: string | null;
    variantLabel: string | null;
    name: string;
    sku: string | null;
    imageUrl: string | null;
    price: number;
    qty: number;
  }[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return apiError(
        'product_unavailable',
        'Uno de los productos ya no está disponible. Actualiza tu carrito.',
        409,
      );
    }

    const variants = product.variants ?? [];
    const hasVariants = variants.length > 0;

    if (hasVariants && !item.variantId) {
      return apiError('variant_required', `Elige una opción de ${product.name}.`, 422);
    }

    if (item.variantId) {
      const variant = variants.find((option) => String(option._id) === item.variantId);
      if (!variant || !variant.active) {
        return apiError(
          'variant_unavailable',
          `La opción elegida de ${product.name} ya no está disponible.`,
          409,
        );
      }

      const price = variant.price ?? product.price;
      const stock = variant.stock ?? 0;

      if (product.trackStock && stock < item.qty) {
        return apiError(
          'insufficient_stock',
          `No hay stock suficiente de ${product.name}${variant.sku ? ` (${variant.sku})` : ''}.`,
          409,
        );
      }

      const label = (variant.options ?? [])
        .map((option) => `${option.name} ${option.value}`)
        .join(' / ');

      orderItems.push({
        productId: String(product._id),
        variantId: String(variant._id),
        variantLabel: label || null,
        name: product.name,
        sku: variant.sku ?? product.sku ?? null,
        imageUrl: variant.imageUrl ?? product.images?.[0]?.url ?? null,
        price,
        qty: item.qty,
      });

      if (product.trackStock) {
        stockChanges.push({
          kind: 'variant',
          productId: String(product._id),
          variantId: String(variant._id),
          qty: item.qty,
        });
      }
    } else {
      if (product.trackStock && (product.stock ?? 0) < item.qty) {
        return apiError('insufficient_stock', `No hay stock suficiente de ${product.name}.`, 409);
      }

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

      if (product.trackStock) {
        stockChanges.push({ kind: 'product', productId: String(product._id), qty: item.qty });
      }
    }
  }

  // Descuento atómico de stock (con reversión compensatoria).
  const applied: StockChange[] = [];

  try {
    for (const change of stockChanges) {
      if (change.kind === 'product') {
        const result = await Product.updateOne(
          { _id: change.productId, storeId: store._id, stock: { $gte: change.qty } },
          { $inc: { stock: -change.qty } },
        );
        if (result.modifiedCount !== 1) {
          throw new Error('stock_conflict');
        }
      } else {
        const result = await Product.updateOne(
          {
            _id: change.productId,
            storeId: store._id,
            variants: { $elemMatch: { _id: change.variantId, stock: { $gte: change.qty } } },
          },
          { $inc: { 'variants.$[variant].stock': -change.qty } },
          { arrayFilters: [{ 'variant._id': change.variantId }] },
        );
        if (result.modifiedCount !== 1) {
          throw new Error('stock_conflict');
        }
      }
      applied.push(change);
    }
  } catch (error) {
    await rollbackStock(applied, String(store._id));
    console.error('[checkout] stock', error);
    return apiError(
      'insufficient_stock',
      'Alguien acaba de comprar la última unidad. Revisa tu carrito.',
      409,
    );
  }

  const subtotal = orderItems.reduce((total, item) => total + item.price * item.qty, 0);

  let orderNumber = ORDER_NUMBER_START;
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: `order:${String(store._id)}` },
      [
        {
          $set: {
            seq: { $add: [{ $ifNull: ['$seq', ORDER_NUMBER_START - 1] }, 1] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after', updatePipeline: true },
    ).lean();

    orderNumber = counter?.seq ?? ORDER_NUMBER_START;

    const locale = store.locale;
    const currency = store.currency;
    const lines = orderItems
      .map(
        (item) =>
          `• ${item.qty}× ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} — ${formatMoney(
            item.price * item.qty,
            currency,
            locale,
          )}`,
      )
      .join('\n');

    const total = formatMoney(subtotal, currency, locale);

    let header = `Hola ${store.name}, quiero confirmar mi pedido #${orderNumber}.`;
    if (whatsapp.messageTemplate) {
      header = whatsapp.messageTemplate
        .replaceAll('{pedido}', String(orderNumber))
        .replaceAll('{tienda}', store.name)
        .replaceAll('{cliente}', customer.name)
        .replaceAll('{total}', total);
    }

    const details = [
      header,
      '',
      lines,
      '',
      `Total: ${total}`,
      `Nombre: ${customer.name}`,
      `Teléfono: ${customer.phone}`,
      customer.address ? `Dirección: ${customer.address}` : null,
      customer.city ? `Ciudad: ${customer.city}` : null,
      customer.documentId ? `DNI/RUC: ${customer.documentId}` : null,
      notes ? `Notas: ${notes}` : null,
    ]
      .filter((line) => line !== null)
      .join('\n');

    await Order.create({
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
      totals: {
        subtotal,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
      },
      currency,
      channel: 'whatsapp',
      paymentProvider: null,
      status: 'pending',
      paymentStatus: 'unpaid',
      whatsapp: { message: details, openedAt: null },
      customerNotes: notes,
      source: 'storefront',
    });

    const phone = normalizeWhatsApp(whatsapp.phone);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(details)}`;

    return apiOk({ orderNumber, whatsappUrl }, { status: 201 });
  } catch (error) {
    await rollbackStock(applied, String(store._id));
    console.error('[checkout] order', error);
    return apiError('order_failed', 'No pudimos registrar el pedido. Inténtalo de nuevo.', 500);
  }
}

async function rollbackStock(changes: StockChange[], storeId: string): Promise<void> {
  for (const change of changes) {
    try {
      if (change.kind === 'product') {
        await Product.updateOne(
          { _id: change.productId, storeId },
          { $inc: { stock: change.qty } },
        );
      } else {
        await Product.updateOne(
          { _id: change.productId, storeId },
          { $inc: { 'variants.$[variant].stock': change.qty } },
          { arrayFilters: [{ 'variant._id': change.variantId }] },
        );
      }
    } catch (error) {
      console.error('[checkout] rollback', change, error);
    }
  }
}
