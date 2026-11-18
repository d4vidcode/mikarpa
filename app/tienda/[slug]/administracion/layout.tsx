import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Store as StoreModel } from '@/models';
import { ExternalLink, Eye, LogOut, Store } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { STORE_ADMIN_NAV } from '@/lib/permissions';
import { can, getSessionUser, getStoreAccess, getStoreBySlug } from '@/lib/tenant';
import { AdminNav } from '@/components/layout/admin-nav';

export default async function StoreAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/iniciar-sesion?callbackUrl=/tienda/${slug}/administracion`);
  }

  const store = await getStoreBySlug(slug);
  if (!store || store.status === 'archived') {
    await connectDB();
    const previous = await StoreModel.findOne({ slugHistory: slug, deletedAt: null })
      .select('slug')
      .lean();
    if (previous?.slug) {
      permanentRedirect(`/tienda/${previous.slug}/administracion`);
    }
    notFound();
  }

  const access = await getStoreAccess(slug);
  if (!access) {
    redirect(`/explorar?denied=${encodeURIComponent(slug)}`);
  }

  const base = `/tienda/${slug}/administracion`;
  const nav = STORE_ADMIN_NAV.filter(
    (item) => item.permission === null || can(access, item.permission),
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-line bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={base}
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--r-btn)] bg-primary text-primary-foreground"
              aria-label="Ir al resumen"
            >
              <Store className="size-[18px]" aria-hidden />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium tracking-tight">{store.name}</p>
              <p className="truncate font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Panel de administración · {access.role === 'owner' ? 'Propietario' : 'Trabajador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--r-btn)] border border-line-strong px-3 font-medium transition-colors duration-150 hover:bg-accent"
            >
              <ExternalLink className="size-4" aria-hidden />
              Ver tienda
            </Link>
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:inline">
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

      {access.readOnly ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 text-xs text-amber-900">
            <Eye className="size-4" aria-hidden />
            Estás viendo esta tienda como superadmin: solo lectura. Los cambios están deshabilitados.
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <AdminNav
            items={nav.map((item) => ({
              href: `${base}${item.href}`,
              label: item.label,
              icon: null,
            }))}
          />

          <div className="mt-3 hidden rounded-[var(--r-md)] border border-border bg-card p-4 text-xs text-muted-foreground lg:block">
            Tu tienda pública:
            <Link
              href={`/tienda/${slug}`}
              className="mt-1 block truncate font-medium text-foreground underline-offset-4 hover:underline"
            >
              /tienda/{slug}
            </Link>
          </div>
        </aside>

        <main id="contenido" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
