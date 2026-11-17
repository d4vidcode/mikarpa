export const instant = false;
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { AuditLog, Store } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/money';
import { getStoreBySlug } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Auditoría' };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; accion?: string; tienda?: string }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim() ?? '';
  const accion = query.accion?.trim() ?? '';
  const tienda = query.tienda?.trim() ?? '';

  const filter: Record<string, unknown> = {};
  if (accion) {
    filter.action = accion;
  }
  if (tienda) {
    const store = await getStoreBySlug(tienda);
    if (store) {
      filter.storeId = store._id;
    }
  }
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    filter.$or = [
      { action: { $regex: safe, $options: 'i' } },
      { entityType: { $regex: safe, $options: 'i' } },
      { entityId: { $regex: safe, $options: 'i' } },
      { actorEmail: { $regex: safe, $options: 'i' } },
    ];
  }

  const [logs, actions, stores] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
    AuditLog.distinct('action'),
    Store.find({ deletedAt: null }).select('name slug').sort({ name: 1 }).limit(100).lean(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro inmutable de acciones sensibles de la plataforma.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por acción, entidad o correo…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="accion"
          defaultValue={accion}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todas las acciones</option>
          {actions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="tienda"
          defaultValue={tienda}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todas las tiendas</option>
          {stores.map((store) => (
            <option key={String(store._id)} value={store.slug}>
              {store.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium">Sin eventos en esta vista</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Fecha</th>
                <th className="px-3 py-2.5 text-left font-medium">Acción</th>
                <th className="px-3 py-2.5 text-left font-medium">Actor</th>
                <th className="px-3 py-2.5 text-left font-medium">Entidad</th>
                <th className="px-3 py-2.5 text-left font-medium">Tienda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={String(log._id)}>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{log.action}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm">{log.actorEmail ?? 'sistema'}</p>
                    <p className="text-xs text-muted-foreground">{log.actorRole ?? ''}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {log.entityType}
                    {log.entityId ? ` · ${log.entityId}` : ''}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {log.storeId ? String(log.storeId) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Los registros son inmutables: no se pueden editar ni eliminar.
      </p>
    </div>
  );
}