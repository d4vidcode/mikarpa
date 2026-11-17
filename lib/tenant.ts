import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { StorePermission } from '@/lib/enums';
import { STORE_PERMISSIONS } from '@/lib/enums';
import { auth } from './auth';
import { connectDB } from './db';
import { Store, StoreMember, User } from '@/models';
import { hasPermission } from './permissions';

/**
 * Acceso autoritativo al tenant.
 *
 * El proxy solo mira el JWT; aquí se consulta MongoDB en cada request para
 * reflejar revocaciones, suspensiones y cambios de permisos al instante.
 */

export class AccessError extends Error {
  readonly status: 401 | 403 | 404;

  constructor(status: 401 | 403 | 404, message: string) {
    super(message);
    this.name = 'AccessError';
    this.status = status;
  }
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'owner' | 'staff' | 'customer';
};

export type StoreAccess = {
  store: NonNullable<Awaited<ReturnType<typeof getStoreBySlug>>>;
  user: SessionUser;
  /** Rol efectivo dentro de la tienda (superadmin se trata como lector). */
  role: 'owner' | 'staff';
  permissions: StorePermission[];
  /** El superadmin puede mirar, pero no escribir por defecto. */
  readOnly: boolean;
};

function normalizePermissions(values: readonly string[]): StorePermission[] {
  return values.filter((value): value is StorePermission =>
    (STORE_PERMISSIONS as readonly string[]).includes(value),
  );
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const user = await User.findOne({ _id: session.user.id, deletedAt: null })
    .select('name email role status')
    .lean();

  if (!user || user.status !== 'active') {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
});

export const getStoreBySlug = cache(async (slug: string) => {
  await connectDB();
  return Store.findOne({ slug, deletedAt: null });
});

export async function getStoreAccess(slug: string): Promise<StoreAccess | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const store = await getStoreBySlug(slug);
  if (!store || store.status === 'archived') {
    return null;
  }

  if (user.role === 'superadmin') {
    return {
      store,
      user,
      role: 'owner',
      permissions: [
        'products',
        'categories',
        'orders',
        'messages',
        'appearance',
        'payments',
        'team',
        'settings',
        'analytics',
      ],
      readOnly: true,
    };
  }

  const membership = await StoreMember.findOne({
    storeId: store._id,
    userId: user.id,
    status: 'active',
  }).select('role permissions');

  if (!membership) {
    return null;
  }

  return {
    store,
    user,
    role: membership.role === 'owner' ? 'owner' : 'staff',
    permissions:
      membership.role === 'owner'
        ? [
            'products',
            'categories',
            'orders',
            'messages',
            'appearance',
            'payments',
            'team',
            'settings',
            'analytics',
          ]
        : normalizePermissions(membership.permissions),
    readOnly: false,
  };
}

/** Para Server Actions y Route Handlers: lanza AccessError en vez de redirigir. */
export async function requireStoreAccess(
  slug: string,
  permission?: StorePermission,
  options: { write?: boolean } = {},
): Promise<StoreAccess> {
  const user = await getSessionUser();
  if (!user) {
    throw new AccessError(401, 'Debes iniciar sesión.');
  }

  const access = await getStoreAccess(slug);
  if (!access) {
    throw new AccessError(404, 'Tienda no encontrada.');
  }

  if (options.write && access.readOnly) {
    throw new AccessError(403, 'El superadmin no puede modificar tiendas desde el panel.');
  }

  if (permission && !can(access, permission)) {
    throw new AccessError(403, 'No tienes permiso para esta sección.');
  }

  return access;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AccessError(401, 'Debes iniciar sesión.');
  }
  return user;
}

export async function requireSuperadmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AccessError(401, 'Debes iniciar sesión.');
  }
  if (user.role !== 'superadmin') {
    throw new AccessError(403, 'Solo el superadmin puede acceder a esta sección.');
  }
  return user;
}

export function can(access: StoreAccess, permission: StorePermission): boolean {
  if (access.role === 'owner') {
    return true;
  }
  return hasPermission(access.permissions, permission);
}

/** Redirección para páginas (RSC), no para acciones. */
export function redirectToLogin(): never {
  redirect('/iniciar-sesion');
}

export function toActionResultError(error: unknown): { ok: false; error: string } {
  if (error instanceof AccessError) {
    return { ok: false, error: error.message };
  }
  console.error('[action] error inesperado', error);
  return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
}
