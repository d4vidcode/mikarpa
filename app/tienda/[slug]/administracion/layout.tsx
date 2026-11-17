import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Store as StoreModel } from '@/models';
import { ExternalLink, Eye, LogOut, Store } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { STORE_ADMIN_NAV } from '@/lib/permissions';
import { can, getSessionUser, getStoreAccess, getStoreBySlug } from '@/lib/tenant';

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
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={base}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-label="Ir al resumen"
            >
              <Store className="size-4" aria-hidden />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{store.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                Panel de administración · {access.role === 'owner' ? 'Propietario' : 'Trabajador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 font-medium hover:bg-accent"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Ver tienda
            </Link>
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:inline">
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

      {access.readOnly ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 text-xs text-amber-900">
            <Eye className="size-3.5" aria-hidden />
            Estás viendo esta tienda como superadmin: solo lectura. Los cambios están deshabilitados.
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-background p-2 lg:sticky lg:top-4 lg:flex-col lg:overflow-visible">
            {nav.map((item) => (
              <Link
                key={item.href || 'resumen'}
                href={`${base}${item.href}`}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 hidden rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground lg:block">
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
