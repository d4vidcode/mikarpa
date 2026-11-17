export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Boxes, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Order, Product } from '@/models';
import { formatDate, formatMoney } from '@/lib/money';
import { can, requireStoreAccess } from '@/lib/tenant';
import type { OrderStatus } from '@/lib/enums';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Resumen' };

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const STATUS_VARIANTS: Record<OrderStatus, 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'secondary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'outline',
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function StoreDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bienvenida?: string; guardado?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const access = await requireStoreAccess(slug);
  const store = access.store;

  const since = new Date('2020-01-01T00:00:00.000Z');
  const storeId = store._id;

  const [activeProducts, draftProducts, openOrders, ordersLast30, recentOrders] =
    await Promise.all([
      Product.countDocuments({ storeId, status: 'active' }),
      Product.countDocuments({ storeId, status: 'draft' }),
      Order.countDocuments({
        storeId,
        status: { $in: ['pending', 'confirmed', 'processing'] },
      }),
      Order.countDocuments({ storeId, createdAt: { $gte: since } }),
      Order.find({ storeId }).sort({ createdAt: -1 }).limit(5).select('orderNumber status totals currency customerInfo createdAt').lean(),
    ]);

  const showRevenue = can(access, 'analytics');
  let revenue = 0;
  if (showRevenue) {
    const result = await Order.aggregate<{ total: number }>([
      {
        $match: {
          storeId,
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: since },
        },
      },
      { $group: { _id: null, total: { $sum: '$totals.total' } } },
    ]);
    revenue = result[0]?.total ?? 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {access.user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este es el resumen de {store.name}. Los pedidos llegan por WhatsApp y se gestionan aquí.
        </p>
      </div>

      {query.bienvenida ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">¡Tu tienda ya está online!</p>
            <p className="mt-0.5">
              Siguiente paso: publica tu primer producto y comparte{' '}
              <Link href={`/tienda/${slug}`} className="underline underline-offset-2">
                /tienda/{slug}
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      {query.guardado ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Cambios guardados.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Productos publicados"
          value={String(activeProducts)}
          hint={draftProducts > 0 ? `${draftProducts} en borrador` : 'Todo publicado'}
          icon={Boxes}
        />
        <StatCard label="Pedidos abiertos" value={String(openOrders)} hint="Pendientes o en proceso" icon={ShoppingBag} />
        <StatCard label="Pedidos (30 días)" value={String(ordersLast30)} icon={Package} />
        {showRevenue ? (
          <StatCard
            label="Ventas (30 días)"
            value={formatMoney(revenue, store.currency, store.locale)}
            hint="Sin cancelados ni reembolsos"
            icon={TrendingUp}
          />
        ) : (
          <StatCard label="Moneda" value={store.currency} hint={store.locale} icon={TrendingUp} />
        )}
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Últimos pedidos</h2>
          <Link
            href={`/tienda/${slug}/administracion/pedidos`}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Ver todos <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium">Todavía no hay pedidos</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Comparte tu enlace y los pedidos aparecerán aquí.
            </p>
            <Link
              href={`/tienda/${slug}`}
              className="mt-4 inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
            >
              Ver mi tienda
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => (
              <li key={String(order._id)}>
                <Link
                  href={`/tienda/${slug}/administracion/pedidos/${String(order._id)}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-accent/60"
                >
                  <div className="min-w-0">
                    <p className="font-medium">Pedido #{order.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerInfo?.name} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANTS[order.status as OrderStatus]}>
                      {STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {formatMoney(order.totals.total, order.currency, store.locale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href={`/tienda/${slug}/administracion/productos/nuevo`}
          className="rounded-xl border border-border bg-card p-4 hover:bg-accent"
        >
          <p className="text-sm font-semibold">Publicar un producto</p>
          <p className="mt-1 text-xs text-muted-foreground">Fotos, precio, stock y variantes.</p>
        </Link>
        <Link
          href={`/tienda/${slug}/administracion/apariencia`}
          className="rounded-xl border border-border bg-card p-4 hover:bg-accent"
        >
          <p className="text-sm font-semibold">Ajustar apariencia</p>
          <p className="mt-1 text-xs text-muted-foreground">Tema, colores y secciones.</p>
        </Link>
        <Link
          href={`/tienda/${slug}/administracion/configuracion`}
          className="rounded-xl border border-border bg-card p-4 hover:bg-accent"
        >
          <p className="text-sm font-semibold">Completar tu perfil</p>
          <p className="mt-1 text-xs text-muted-foreground">Contacto, redes y WhatsApp.</p>
        </Link>
      </div>
    </div>
  );
}
