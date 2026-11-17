import { NextRequest } from 'next/server';
import { Order, PaymentAccount, Product, Store } from '@/models';
import { apiError, apiOk } from '@/lib/api';
import { connectDB } from '@/lib/db';
import { decryptSecret } from '@/lib/crypto';
import { getMPPayment } from '@/lib/payments/mercadopago';

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  await connectDB();

  const { searchParams } = request.nextUrl;
  let paymentId = searchParams.get('id') ?? searchParams.get('data.id');

  if (!paymentId) {
    try {
      const body = (await request.json()) as { data?: { id?: string }; id?: string };
      paymentId = body.data?.id ?? body.id ?? null;
    } catch {
      paymentId = null;
    }
  }

  if (!paymentId) {
    return apiError('missing_payment_id', 'Falta el id del pago.', 400);
  }

  // El external_reference se consulta después de obtener el pago, porque
  // Mercado Pago no lo envía en el webhook. Primero necesitamos el token.
  // Buscamos la cuenta por el storeId embebido en external_reference, pero
  // aún no lo conocemos: iteramos? En su lugar, recibimos el payment y
  // resolvemos la tienda desde el pago (external_reference = storeId:orderNumber).
  // Para obtener el token necesitamos la tienda, así que primero leemos el
  // pago con un token "descubierto" no es posible. Solución: guardamos el
  // access token en variables de entorno para el webhook (MERCADOPAGO_ACCESS_TOKEN)
  // o buscamos por todas las cuentas activas. Usamos la segunda opción.
  const accounts = await PaymentAccount.find({ provider: 'mercadopago', status: 'active' }).lean();

  let payment: Awaited<ReturnType<typeof getMPPayment>> | null = null;
  let accessToken: string | null = null;

  for (const account of accounts) {
    try {
      const token = decryptSecret(account.accessTokenEnc);
      const result = await getMPPayment(token, paymentId);
      payment = result;
      accessToken = token;
      break;
    } catch {
      continue;
    }
  }

  if (!payment || !accessToken) {
    return apiError('payment_not_found', 'No pudimos obtener el pago.', 404);
  }

  const external = payment.externalReference;
  if (!external || !external.includes(':')) {
    return apiError('invalid_reference', 'Referencia externa inválida.', 422);
  }

  const [storeId, orderNumberRaw] = external.split(':');
  const orderNumber = Number(orderNumberRaw);

  const store = await Store.findOne({ _id: storeId, deletedAt: null });
  if (!store) {
    return apiError('store_not_found', 'Tienda no encontrada.', 404);
  }

  const order = await Order.findOne({ storeId: store._id, orderNumber });
  if (!order) {
    return apiError('order_not_found', 'Pedido no encontrado.', 404);
  }

  // Idempotencia: si ya está pagado, no repetimos.
  if (order.paymentStatus === 'paid') {
    return apiOk({ received: true, idempotent: true });
  }

  if (payment.status !== 'approved') {
    await Order.updateOne(
      { _id: order._id },
      { $set: { paymentStatus: payment.status === 'rejected' ? 'failed' : 'pending' } },
    );
    return apiOk({ received: true, status: payment.status });
  }

  // Descuento de stock (una sola vez).
  const stockChanges: { productId: string; variantId: string | null; qty: number }[] = [];
  for (const item of order.items) {
    stockChanges.push({
      productId: String(item.productId),
      variantId: item.variantId ? String(item.variantId) : null,
      qty: item.qty,
    });
  }

  for (const change of stockChanges) {
    try {
      if (change.variantId) {
        await Product.updateOne(
          { _id: change.productId, storeId: store._id },
          { $inc: { 'variants.$[v].stock': -change.qty } },
          { arrayFilters: [{ 'v._id': change.variantId }] },
        );
      } else {
        await Product.updateOne(
          { _id: change.productId, storeId: store._id },
          { $inc: { stock: -change.qty } },
        );
      }
    } catch (error) {
      console.error('[webhook] stock', error);
    }
  }

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        'payment.provider': 'mercadopago',
        'payment.externalId': paymentId,
        'payment.paidAt': new Date(),
      },
    },
  );

  return apiOk({ received: true, status: 'approved' });
}