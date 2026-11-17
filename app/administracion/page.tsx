export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Order, Store, User } from '@/models';
import { connectDB } from '@/lib/db';
import { formatDate, formatMoney } from '@/lib/money';
import { STORE_STATUS_LABELS } from '@/lib/labels';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Plataforma' };

export default async function AdminDashboardPage() {
  await connectDB();
  const since = new Date('2020-01-01T00:00:00.000Z');

  const [users, activeStores, suspendedStores, ordersLast30, revenue, recentStores] =
    await Promise.all([
      User.countDocuments({ deletedAt: null }),
      Store.countDocuments({ status: 'active', deletedAt: null }),
      Store.countDocuments({ status: 'suspended', deletedAt: null }),
      Order.countDocuments({ createdAt: { $gte: since } }),
      Order.aggregate<{ total: number; count: number }>([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$totals.total' }, count: { $sum: 1 } } },
      ]),
      Store.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name slug status category createdAt')
        .lean(),
    ]);

  const gmv = revenue[0]?.total ?? 0;
  const paidOrders = revenue[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen de la plataforma</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado general de mikarpa: usuarios, tiendas y pedidos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Usuarios</p>
            <Users className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">{users}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Tiendas activas</p>
            <Building2 className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">{activeStores}</p>
          {suspendedStores > 0 ? (
            <p className="mt-1 text-xs text-amber-700">{suspendedStores} suspendidas</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Pedidos (30 días)</p>
            <ShoppingBag className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">{ordersLast30}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">GMV histórico</p>
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(gmv, 'PEN', 'es-PE')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{paidOrders} pedidos válidos</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Tiendas recientes</h2>
          <Link
            href="/administracion/tiendas"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Ver todas <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {recentStores.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Todavía no hay tiendas creadas.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentStores.map((store) => (
              <li key={String(store._id)}>
                <Link
                  href={`/administracion/tiendas/${String(store._id)}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-accent/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /tienda/{store.slug} · {formatDate(store.createdAt)}
                    </p>
                  </div>
                  <Badge variant={store.status === 'active' ? 'success' : 'warning'}>
                    {STORE_STATUS_LABELS[store.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/administracion/usuarios" className="rounded-xl border border-border bg-card p-4 hover:bg-accent">
          <p className="text-sm font-semibold">Gestionar usuarios</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Roles globales, suspensiones y accesos.
          </p>
        </Link>
        <Link href="/administracion/configuracion" className="rounded-xl border border-border bg-card p-4 hover:bg-accent">
          <p className="text-sm font-semibold">Configuración de plataforma</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Marca, registro y rubros maestros.
          </p>
        </Link>
      </div>
    </div>
  );
}
