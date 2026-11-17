import type { GlobalRole, StorePermission } from '@/lib/enums';

/** Membresía mínima que viaja en el JWT y en la sesión. */
export type SessionMembership = {
  storeId: string;
  slug: string;
  name: string;
  role: 'owner' | 'staff';
  permissions: StorePermission[];
};

/** Datos de sesión que la UI puede leer sin consultar la base. */
export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: GlobalRole;
  memberships: SessionMembership[];
};

/** Imagen de producto o logo. */
export type MediaItem = {
  url: string;
  publicId?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Resultado estándar de una Server Action de formulario. */
export type ActionResult =
  | { ok: true; message?: string; redirectTo?: string }
  | { ok: false; error: string; fields?: Record<string, string> };
