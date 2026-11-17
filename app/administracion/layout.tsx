import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, ShieldCheck, Store, Users, FileText } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { getSessionUser } from '@/lib/tenant';

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
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/administracion"
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-label="Panel de plataforma"
            >
              <ShieldCheck className="size-4" aria-hidden />
            </Link>
            <div>
              <p className="text-sm font-semibold">mikarpa · plataforma</p>
              <p className="text-xs text-muted-foreground">Superadmin</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" aria-hidden />
                <span className="sr-only sm:not-sr-only">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-background p-2 lg:sticky lg:top-4 lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 hidden rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground lg:block">
            <Link href="/explorar" className="font-medium text-foreground underline-offset-4 hover:underline">
              Ver directorio público
            </Link>
            <p className="mt-2">Acceso de solo lectura a los paneles de tienda.</p>
          </div>
        </aside>

        <main id="contenido" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
