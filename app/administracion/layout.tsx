import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, ShieldCheck, Store, Users, FileText } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { getSessionUser } from '@/lib/tenant';
import { AdminNav } from '@/components/layout/admin-nav';

const NAV = [
  { href: '/administracion', label: 'Resumen', icon: LayoutDashboard },
  { href: '/administracion/tiendas', label: 'Tiendas', icon: Store },
  { href: '/administracion/usuarios', label: 'Usuarios', icon: Users },
  { href: '/administracion/auditoria', label: 'Auditoría', icon: FileText },
  { href: '/administracion/configuracion', label: 'Configuración', icon: Settings },
] as const;

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
    <div className="min-h-dvh bg-background">
      <header className="border-b border-line bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/administracion"
              className="flex size-10 items-center justify-center rounded-[var(--r-btn)] bg-primary text-primary-foreground"
              aria-label="Panel de plataforma"
            >
              <ShieldCheck className="size-[18px]" aria-hidden />
            </Link>
            <div>
              <p className="text-[15px] font-medium tracking-tight">mikarpa · plataforma</p>
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Superadmin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-[var(--r-btn)] px-3 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <AdminNav
            items={NAV.map((item) => ({
              href: item.href,
              label: item.label,
              icon: <item.icon className="size-4" aria-hidden />,
            }))}
          />

          <div className="mt-3 hidden rounded-[var(--r-md)] border border-border bg-card p-4 text-xs text-muted-foreground lg:block">
            <Link href="/explorar" className="font-medium text-foreground underline-offset-4 hover:underline">
              Ver directorio público
            </Link>
            <p className="mt-2 leading-relaxed">Acceso de solo lectura a los paneles de tienda.</p>
          </div>
        </aside>

        <main id="contenido" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
