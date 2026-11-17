export const instant = false;
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { User } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/money';
import { getSessionUser } from '@/lib/tenant';
import { GLOBAL_ROLES, USER_STATUSES, type GlobalRole } from '@/lib/enums';
import { UserRowForm } from '@/components/admin/user-row-form';

export const metadata: Metadata = { title: 'Usuarios' };

const ROLE_LABELS: Record<GlobalRole, string> = {
  superadmin: 'Superadmin',
  owner: 'Propietario',
  staff: 'Trabajador',
  customer: 'Cliente',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rol?: string; estado?: string }>;
}) {
  const query = await searchParams;
  const actor = await getSessionUser();

  const search = query.q?.trim() ?? '';
  const role = (GLOBAL_ROLES as readonly string[]).includes(query.rol ?? '')
    ? query.rol
    : null;
  const status = (USER_STATUSES as readonly string[]).includes(query.estado ?? '')
    ? query.estado
    : null;

  const filter: Record<string, unknown> = { deletedAt: null };
  if (role) {
    filter.role = role;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).limit(150).lean();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Roles globales y estado de las cuentas. Los permisos por tienda viven en cada panel.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre o correo…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="rol"
          defaultValue={role ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los roles</option>
          {GLOBAL_ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          name="estado"
          defaultValue={status ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium">No hay usuarios en esta vista</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {users.map((user) => (
            <li key={String(user._id)} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <Badge variant={user.role === 'superadmin' ? 'success' : 'secondary'}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                  {user.status === 'suspended' ? <Badge variant="destructive">Suspendida</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Registro: {formatDate(user.createdAt)}
                  {user.lastLoginAt ? ` · Último acceso: ${formatDate(user.lastLoginAt)}` : ''}
                </p>
              </div>

              <UserRowForm
                userId={String(user._id)}
                role={user.role}
                status={user.status}
                isSelf={user._id.toString() === actor?.id}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Al cambiar rol o estado se incrementa `tokenVersion` para forzar la renovación del JWT en el
        siguiente acceso.
      </p>
    </div>
  );
}
