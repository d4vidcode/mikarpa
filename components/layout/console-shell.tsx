import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { AdminBreadcrumb, AdminNav, type AdminNavItem } from './admin-nav';

type ConsoleShellProps = {
  /** Nombre del espacio de trabajo (plataforma o tienda). */
  workspaceLabel: string;
  workspaceHref: string;
  workspaceMeta: string;
  badge: string;
  brandIcon: React.ReactNode;
  nav: AdminNavItem[];
  userEmail: string;
  children: React.ReactNode;
  topActions?: React.ReactNode;
  notice?: React.ReactNode;
  sidebarFoot?: React.ReactNode;
};

/** Shell común de consola: rail lateral fijo, barra superior y contenido denso. */
export function ConsoleShell({
  workspaceLabel,
  workspaceHref,
  workspaceMeta,
  badge,
  brandIcon,
  nav,
  userEmail,
  children,
  topActions,
  notice,
  sidebarFoot,
}: ConsoleShellProps) {
  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      <div className="h-0.5 bg-primary lg:fixed lg:inset-x-0 lg:top-0 lg:z-50" />

      {/* Rail lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-card lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
          <Link
            href={workspaceHref}
            className="grid size-7 shrink-0 place-items-center rounded-[var(--r-sm)] bg-primary text-primary-foreground"
            aria-label="Ir al inicio de la consola"
          >
            {brandIcon}
          </Link>
          <div className="min-w-0">
            <p className="text-[13px] leading-tight font-semibold tracking-tight">mikarpa</p>
            <p className="section-label mt-0.5">{badge}</p>
          </div>
        </div>

        <div className="border-b border-line px-3 py-3">
          <Link
            href={workspaceHref}
            className="block rounded-[var(--r-sm)] border border-line bg-background px-2.5 py-2 transition-colors hover:bg-accent"
          >
            <p className="section-label">Espacio de trabajo</p>
            <p className="mt-1 truncate text-[12px] font-medium">{workspaceLabel}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">{workspaceMeta}</p>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="section-label px-2.5 pb-2">Menú</p>
          <AdminNav items={nav} />
        </div>

        {sidebarFoot ? <div className="border-t border-line px-3 py-3">{sidebarFoot}</div> : null}

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface font-mono text-[10px] font-medium text-muted-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium">Cuenta activa</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{userEmail}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="grid size-8 place-items-center rounded-[var(--r-sm)] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Barra móvil */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-card/95 px-3 backdrop-blur lg:hidden">
        <Link href={workspaceHref} className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-[var(--r-sm)] bg-primary text-primary-foreground">
            {brandIcon}
          </span>
          <span className="truncate text-[13px] font-semibold">{workspaceLabel}</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="grid size-9 place-items-center rounded-[var(--r-sm)] text-muted-foreground hover:bg-accent"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </form>
      </header>
      <div className="border-b border-line bg-card px-2 py-2 lg:hidden">
        <AdminNav items={nav} label="Navegación del panel (móvil)" orientation="horizontal" />
      </div>

      {/* Área de trabajo */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 hidden h-14 items-center justify-between gap-4 border-b border-line bg-background/90 px-5 backdrop-blur lg:flex">
          <AdminBreadcrumb items={nav} rootLabel={workspaceLabel} />
          <div className="flex items-center gap-2">{topActions}</div>
        </header>

        {notice}

        <main id="contenido" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
