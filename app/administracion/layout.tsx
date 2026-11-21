import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, LayoutDashboard, Settings, ShieldCheck, Store, Users } from 'lucide-react';
import { getSessionUser } from '@/lib/tenant';
import { ConsoleShell } from '@/components/layout/console-shell';
import type { AdminNavItem } from '@/components/layout/admin-nav';

const NAV: AdminNavItem[] = [
  { href: '/administracion', label: 'Resumen', icon: <LayoutDashboard className="size-3.5" /> },
  { href: '/administracion/tiendas', label: 'Tiendas', icon: <Store className="size-3.5" /> },
  { href: '/administracion/usuarios', label: 'Usuarios', icon: <Users className="size-3.5" /> },
  { href: '/administracion/auditoria', label: 'Auditoría', icon: <FileText className="size-3.5" /> },
  { href: '/administracion/configuracion', label: 'Configuración', icon: <Settings className="size-3.5" /> },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/iniciar-sesion?callbackUrl=/administracion');
  }

  if (user.role !== 'superadmin') {
    redirect('/explorar?denied=admin');
  }

  return (
    <ConsoleShell
      workspaceLabel="Plataforma"
      workspaceHref="/administracion"
      workspaceMeta="/administracion"
      badge="Superadmin"
      brandIcon={<ShieldCheck className="size-3.5" aria-hidden />}
      nav={NAV}
      userEmail={user.email}
      topActions={
        <>
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
           Producción
          </span>
          <Link
            href="/explorar"
            className="inline-flex h-8 items-center rounded-[var(--r-sm)] border border-line-strong bg-card px-3 text-[11px] font-medium transition-colors hover:bg-accent"
          >
            Directorio público
          </Link>
        </>
      }
      sidebarFoot={
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          <p className="section-label mb-1.5">Acceso</p>
          <p>Control global de tiendas, usuarios y auditoría.</p>
          <Link
            href="/explorar"
            className="mt-2 inline-flex font-medium text-foreground underline-offset-4 hover:underline"
          >
            Ver directorio público ↗
          </Link>
        </div>
      }
    >
      {children}
    </ConsoleShell>
  );
}
