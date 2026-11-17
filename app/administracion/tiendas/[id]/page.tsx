export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { AuditLog, Order, Product, Store, StoreMember, User } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { formatDate, formatMoney } from '@/lib/money';
import { STORE_STATUS_LABELS } from '@/lib/labels';
import { suspendStoreAction } from '@/lib/actions/admin';

export const metadata: Metadata = { title: 'Detalle de tienda' };

export default async function AdminStoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await Store.findOne({ _id: id, deletedAt: null }).lean();

  if (!store) {
    notFound();
  }

  const [owner, members, productCount, activeProductCount, orderCount, revenue, audit] =
    await Promise.all([
      User.findOne({ _id: store.ownerId }).select('name email status').lean(),
      StoreMember.countDocuments({ storeId: store._id, status: 'active' }),
      Product.countDocuments({ storeId: store._id }),
      Product.countDocuments({ storeId: store._id, status: 'active' }),
      Order.countDocuments({ storeId: store._id }),
      Order.aggregate<{ total: number }>([
        {
          $match: {
            storeId: store._id,
            status: { $nin: ['cancelled', 'refunded'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totals.total' } } },
      ]),
      AuditLog.find({ storeId: store._id }).sort({ createdAt: -1 }).limit(12).lean(),
    ]);

  const gmv = revenue[0]?.total ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/administracion/tiendas"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver a tiendas
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
          <Badge
            variant={
              store.status === 'active' ? 'success' : store.status === 'suspended' ? 'warning' : 'outline'
            }
          >
            {STORE_STATUS_LABELS[store.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          /tienda/{store.slug} · {store.category} · creada {formatDate(store.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`/tienda/${store.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" aria-hidden />
            Ver tienda
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/tienda/${store.slug}/administracion`}>
            <Lock className="size-3.5" aria-hidden />
            Panel (solo lectura)
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Productos</p>
          <p className="mt-1 text-xl font-semibold">
            {activeProductCount}
            <span className="text-sm font-normal text-muted-foreground"> / {productCount}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pedidos</p>
          <p className="mt-1 text-xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ventas válidas</p>
          <p className="mt-1 text-xl font-semibold">{formatMoney(gmv, 'PEN', 'es-PE')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Miembros activos</p>
          <p className="mt-1 text-xl font-semibold">{members}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Propietario</h2>
          <p className="mt-2 text-sm font-medium">{owner?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{owner?.email ?? ''}</p>
          {owner?.status === 'suspended' ? (
            <p className="mt-2 text-xs text-amber-700">La cuenta está suspendida.</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Acciones de plataforma</h2>

          {store.status === 'active' ? (
            <form action={suspendStoreAction} className="mt-3 space-y-2">
              <input type="hidden" name="storeId" value={String(store._id)} />
              <input type="hidden" name="action" value="suspend" />
              <input
                name="reason"
                maxLength={500}
                required
                placeholder="Motivo de la suspensión (visible en auditoría)"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
              />
              <ConfirmButton
                message={`¿Suspender "${store.name}"? La tienda dejará de ser visible y no aceptará pedidos.`}
                className="inline-flex h-9 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Suspender tienda
              </ConfirmButton>
            </form>
          ) : (
            <form action={suspendStoreAction} className="mt-3 space-y-2">
              <input type="hidden" name="storeId" value={String(store._id)} />
              <input type="hidden" name="action" value="reactivate" />
              {store.suspension?.reason ? (
                <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                  Motivo: {store.suspension.reason}
                </p>
              ) : null}
              <Button type="submit" size="sm">
                Reactivar tienda
              </Button>
            </form>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
          Auditoría reciente de esta tienda
        </h2>
        {audit.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sin eventos registrados.</p>
        ) : (
          <ul className="divide-y divide-border">
            {audit.map((event) => (
              <li key={String(event._id)} className="px-4 py-2.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.actorEmail ?? 'sistema'}
                  {event.metadata?.reason ? ` · ${event.metadata.reason}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Sobre la suspensión</p>
        <p className="mt-1">
          Una tienda suspendida deja de renderizar su storefront (pantalla «tienda pausada») y el
          checkout responde 409. La información no se borra: se puede reactivar en cualquier momento.
        </p>
      </section>
    </div>
  );
}
