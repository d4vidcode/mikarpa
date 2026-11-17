export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { Order, Product } from '@/models';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/money';
import { requireStoreAccess } from '@/lib/tenant';
import { ORDER_STATUS_LABELS } from '@/lib/labels';
import { ORDER_STATUSES } from '@/lib/enums';

export const metadata: Metadata = { title: 'Métricas' };

export default async function MetricsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'analytics');
  const store = access.store;
  const storeId = store._id;

  const since30 = new Date('2020-01-01T00:00:00.000Z');
  const since90 = new Date('2020-01-01T00:00:00.000Z');

  const [orders30, orders90, statusCounts, topProducts] = await Promise.all([
    Order.aggregate<{ _id: null; revenue: number; count: number; avgTicket: number }>([
      {
        $match: {
          storeId,
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: since30 },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totals.total' },
          count: { $sum: 1 },
          avgTicket: { $avg: '$totals.total' },
        },
      },
    ]),
    Order.aggregate<{ _id: null; revenue: number; count: number }>([
      {
        $match: {
          storeId,
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: since90 },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$totals.total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: string; count: number }>([
      { $match: { storeId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: string; name: string; qty: number; revenue: number }>([
      { $match: { storeId, status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          qty: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const summary30 = orders30[0] ?? { revenue: 0, count: 0, avgTicket: 0 };
  const summary90 = orders90[0] ?? { revenue: 0, count: 0 };

  const statusMap = new Map(statusCounts.map((row) => [row._id, row.count]));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/tienda/${slug}/administracion`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al resumen
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ventas y comportamiento de {store.name}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Ventas (30 días)</p>
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(summary30.revenue, store.currency, store.locale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{summary30.count} pedidos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Ticket promedio</p>
            <ShoppingBag className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(Math.round(summary30.avgTicket || 0), store.currency, store.locale)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Ventas (90 días)</p>
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(summary90.revenue, store.currency, store.locale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{summary90.count} pedidos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Productos activos</p>
            <Package className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {await Product.countDocuments({ storeId, status: 'active' })}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Pedidos por estado</h2>
        <ul className="divide-y divide-border">
          {ORDER_STATUSES.map((status) => (
            <li key={status} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>{ORDER_STATUS_LABELS[status]}</span>
              <Badge variant="secondary">{statusMap.get(status) ?? 0}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Productos más vendidos</h2>
        {topProducts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Todavía no hay ventas registradas.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Producto</th>
                <th className="px-3 py-2.5 text-right font-medium">Unidades</th>
                <th className="px-3 py-2.5 text-right font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2.5">{product.name}</td>
                  <td className="px-3 py-2.5 text-right">{product.qty}</td>
                  <td className="px-3 py-2.5 text-right">
                    {formatMoney(product.revenue, store.currency, store.locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}