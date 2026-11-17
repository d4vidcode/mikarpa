export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Order } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatMoney } from '@/lib/money';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { requireStoreAccess } from '@/lib/tenant';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Pedidos' };

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const access = await requireStoreAccess(slug, 'orders');

  const status = (ORDER_STATUSES as readonly string[]).includes(query.estado ?? '')
    ? (query.estado as OrderStatus)
    : null;
  const search = query.q?.trim() ?? '';

  const filter: Record<string, unknown> = { storeId: access.store._id };
  if (status) {
    filter.status = status;
  }
  if (search) {
    if (/^\d+$/.test(search)) {
      filter.orderNumber = Number(search);
    } else {
      filter['customerInfo.name'] = {
        $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los pedidos creados desde tu tienda llegan aquí con el detalle completo.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por número o cliente…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="estado"
          defaultValue={status ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium">No hay pedidos en esta vista</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando alguien compre desde tu tienda, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Pedido</th>
                <th className="px-3 py-2.5 text-left font-medium">Cliente</th>
                <th className="px-3 py-2.5 text-left font-medium">Fecha</th>
                <th className="px-3 py-2.5 text-left font-medium">Canal</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                <th className="px-3 py-2.5 text-left font-medium">Estado</th>
                <th className="px-3 py-2.5 text-left font-medium">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={String(order._id)} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tienda/${slug}/administracion/pedidos/${String(order._id)}`}
                      className="font-medium hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{order.customerInfo?.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customerInfo?.phone}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {order.channel === 'whatsapp' ? 'WhatsApp' : 'Online'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">
                    {formatMoney(order.totals.total, order.currency, access.store.locale)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={ORDER_STATUS_VARIANTS[order.status as OrderStatus]}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
