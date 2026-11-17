export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Order } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatMoney } from '@/lib/money';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { can, requireStoreAccess } from '@/lib/tenant';
import { updateOrderStatusAction } from '@/lib/actions/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/enums';
import { OrderNotesForm } from '@/components/admin/order-notes-form';

export const metadata: Metadata = { title: 'Detalle del pedido' };

function whatsappHref(phone: string, message: string | null): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 9) {
    digits = `51${digits}`;
  }
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const access = await requireStoreAccess(slug, 'orders');
  const writable = !access.readOnly && can(access, 'orders');

  const order = await Order.findOne({ _id: id, storeId: access.store._id }).lean();
  if (!order) {
    notFound();
  }

  const locale = access.store.locale;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/tienda/${slug}/administracion/pedidos`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Volver a pedidos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pedido #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.createdAt)} · {order.channel === 'whatsapp' ? 'WhatsApp' : 'Online'} ·{' '}
            {order.items.length} ítem{order.items.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={ORDER_STATUS_VARIANTS[order.status as OrderStatus]}>
            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
          </Badge>
          <Badge variant="outline">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
          <Button asChild variant="outline" size="sm">
            <a
              href={whatsappHref(order.customerInfo.phone, order.whatsapp?.message ?? null)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              Escribir al cliente
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Productos</h2>
            <ul className="divide-y divide-border">
              {order.items.map((item, index) => (
                <li key={`${String(item.productId)}-${index}`} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantLabel ? `${item.variantLabel} · ` : ''}Cantidad {item.qty}
                      {item.sku ? ` · ${item.sku}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatMoney(item.price * item.qty, order.currency, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-1 border-t border-border px-4 py-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatMoney(order.totals.subtotal, order.currency, locale)}</dd>
              </div>
              {order.totals.shipping > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd>{formatMoney(order.totals.shipping, order.currency, locale)}</dd>
                </div>
              ) : null}
              {order.totals.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Descuento</dt>
                  <dd>-{formatMoney(order.totals.discount, order.currency, locale)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatMoney(order.totals.total, order.currency, locale)}</dd>
              </div>
            </dl>
          </section>

          {order.customerNotes ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Nota del cliente</h2>
              <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                {order.customerNotes}
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Historial</h2>
            <ol className="mt-3 space-y-3">
              {(order.statusHistory ?? []).map((event, index) => (
                <li key={`${event.status}-${index}`} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  <div>
                    <p className="font-medium">{ORDER_STATUS_LABELS[event.status as OrderStatus]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.at)}
                      {event.note ? ` · ${event.note}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Cliente</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Nombre</dt>
                <dd className="font-medium">{order.customerInfo.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">WhatsApp</dt>
                <dd>{order.customerInfo.phone}</dd>
              </div>
              {order.customerInfo.email ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Correo</dt>
                  <dd>{order.customerInfo.email}</dd>
                </div>
              ) : null}
              {order.customerInfo.address ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Dirección</dt>
                  <dd>{order.customerInfo.address}</dd>
                </div>
              ) : null}
              {order.customerInfo.city ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Ciudad</dt>
                  <dd>{order.customerInfo.city}</dd>
                </div>
              ) : null}
              {order.customerInfo.documentId ? (
                <div>
                  <dt className="text-xs text-muted-foreground">DNI / RUC</dt>
                  <dd>{order.customerInfo.documentId}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {writable ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Actualizar estado</h2>
              <form action={updateOrderStatusAction} className="mt-3 space-y-2.5">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="orderId" value={String(order._id)} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {ORDER_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
                <input
                  name="note"
                  maxLength={500}
                  placeholder="Nota opcional para el historial"
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
                />
                <Button type="submit" size="sm" className="w-full">
                  Guardar estado
                </Button>
              </form>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Notas internas</h2>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Solo las ve tu equipo.
            </p>
            {writable ? (
              <OrderNotesForm
                storeSlug={slug}
                orderId={String(order._id)}
                initialNotes={order.internalNotes ?? ''}
              />
            ) : (
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {order.internalNotes || 'Sin notas.'}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
