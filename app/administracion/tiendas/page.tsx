export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Search } from 'lucide-react';
import { Store, User } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/money';
import { STORE_STATUS_LABELS } from '@/lib/labels';
import { STORE_STATUSES, type StoreStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Tiendas' };

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim() ?? '';
  const status = (STORE_STATUSES as readonly string[]).includes(query.estado ?? '')
    ? (query.estado as StoreStatus)
    : null;

  const filter: Record<string, unknown> = { deletedAt: null };
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { slug: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    ];
  }

  const stores = await Store.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const owners = await User.find({ _id: { $in: stores.map((store) => store.ownerId) } })
    .select('name email')
    .lean();
  const ownerById = new Map(owners.map((owner) => [String(owner._id), owner]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tiendas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa, suspende o reactiva tiendas de la plataforma.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre o enlace…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="estado"
          defaultValue={status ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los estados</option>
          {STORE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STORE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {stores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium">No hay tiendas en esta vista</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Tienda</th>
                <th className="px-3 py-2.5 text-left font-medium">Rubro</th>
                <th className="px-3 py-2.5 text-left font-medium">Propietario</th>
                <th className="px-3 py-2.5 text-left font-medium">Estado</th>
                <th className="px-3 py-2.5 text-left font-medium">Creada</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stores.map((store) => {
                const owner = ownerById.get(String(store.ownerId));
                return (
                  <tr key={String(store._id)}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{store.name}</p>
                      <p className="text-xs text-muted-foreground">/tienda/{store.slug}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{store.category}</td>
                    <td className="px-3 py-3">
                      <p className="text-sm">{owner?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{owner?.email ?? ''}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          store.status === 'active'
                            ? 'success'
                            : store.status === 'suspended'
                              ? 'warning'
                              : 'outline'
                        }
                      >
                        {STORE_STATUS_LABELS[store.status]}
                      </Badge>
                      {store.suspension?.reason ? (
                        <p className="mt-1 max-w-40 truncate text-[11px] text-muted-foreground">
                          {store.suspension.reason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(store.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/administracion/tiendas/${String(store._id)}`}>Detalle</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/tienda/${store.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-3.5" aria-hidden />
                            Ver
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
