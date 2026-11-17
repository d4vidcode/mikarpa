export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Order } from '@/models';
import { getStoreBySlug } from '@/lib/tenant';
import { formatDate, formatMoney } from '@/lib/money';
import { ORDER_STATUS_LABELS } from '@/lib/labels';

export const metadata: Metadata = {
  title: 'Tu pedido',
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; orderNumber: string }>;
}) {
  const { slug, orderNumber } = await params;
  const store = await getStoreBySlug(slug);
  const number = Number(orderNumber);

  if (!store || store.status === 'archived' || !Number.isInteger(number)) {
    notFound();
  }

  const order = await Order.findOne({ storeId: store._id, orderNumber: number }).lean();
  if (!order) {
    notFound();
  }

  const whatsappPhone = store.paymentConfig?.whatsapp?.phone?.replace(/\D/g, '') ?? '';
  const normalizedPhone = whatsappPhone.length === 9 ? `51${whatsappPhone}` : whatsappPhone;
  const message =
    order.whatsapp?.message ??
    `Hola, quiero coordinar mi pedido #${order.orderNumber} en ${store.name}.`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-[var(--store-radius)] border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-sm font-medium text-emerald-700">Pedido registrado</p>
            <h1 className="mt-1 text-2xl font-semibold">Pedido #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {formatDate(order.createdAt)} · {ORDER_STATUS_LABELS[order.status]}
            </p>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-black/5 border-y border-black/5">
          {order.items.map((item, index) => (
            <li key={`${String(item.productId)}-${index}`} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.variantLabel ? `${item.variantLabel} · ` : ''}x{item.qty}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatMoney(item.price * item.qty, order.currency, store.locale)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(order.totals.total, order.currency, store.locale)}</span>
        </div>

        <p className="mt-6 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
          Guardamos tu pedido. Envía el mensaje por WhatsApp para coordinar el pago y la entrega con{' '}
          {store.name}.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {normalizedPhone ? (
            <a
              href={`https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--store-radius)] bg-[#25D366] px-5 text-sm font-semibold text-white"
            >
              <MessageCircle className="size-4" aria-hidden />
              Confirmar por WhatsApp
            </a>
          ) : null}
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--store-radius)] border border-black/10 px-5 text-sm font-medium"
          >
            Seguir comprando
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Guarda este enlace para revisar tu pedido más tarde.
        </p>
      </div>
    </div>
  );
}
