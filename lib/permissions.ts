import type { StorePermission } from './enums';

/** Etiqueta humana de cada permiso (navegación y UI de equipo). */
export const PERMISSION_LABELS: Record<StorePermission, string> = {
  products: 'Productos',
  categories: 'Categorías',
  orders: 'Pedidos',
  messages: 'Mensajes',
  appearance: 'Apariencia',
  payments: 'Pagos',
  team: 'Equipo',
  settings: 'Configuración',
  analytics: 'Métricas',
};

/** Modules shown in the store admin sidebar. */
export const STORE_ADMIN_NAV = [
  { href: '', label: 'Resumen', permission: null },
  { href: '/productos', label: 'Productos', permission: 'products' },
  { href: '/categorias', label: 'Categorías', permission: 'categories' },
  { href: '/pedidos', label: 'Pedidos', permission: 'orders' },
  { href: '/metricas', label: 'Métricas', permission: 'analytics' },
  { href: '/apariencia', label: 'Apariencia', permission: 'appearance' },
  { href: '/pagos', label: 'Pagos', permission: 'payments' },
  { href: '/trabajadores', label: 'Trabajadores', permission: 'team' },
  { href: '/configuracion', label: 'Configuración', permission: 'settings' },
] as const satisfies readonly {
  href: string;
  label: string;
  permission: StorePermission | null;
}[];

export function hasPermission(
  permissions: readonly StorePermission[],
  permission: StorePermission,
): boolean {
  return permissions.includes(permission);
}
