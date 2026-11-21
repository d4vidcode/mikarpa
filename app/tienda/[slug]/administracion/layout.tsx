import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Store as StoreModel } from '@/models';
import { ExternalLink, Eye, Store } from 'lucide-react';
import { STORE_ADMIN_NAV } from '@/lib/permissions';
import { can, getSessionUser, getStoreAccess, getStoreBySlug } from '@/lib/tenant';
import { ConsoleShell } from '@/components/layout/console-shell';
import type { AdminNavItem } from '@/components/layout/admin-nav';

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
  const nav: AdminNavItem[] = STORE_ADMIN_NAV.filter(
    (item) => item.permission === null || can(access, item.permission),
  ).map((item) => ({
    href: `${base}${item.href}`,
    label: item.label,
  }));

  return (
    <ConsoleShell
      workspaceLabel={store.name}
      workspaceHref={base}
      workspaceMeta={`/tienda/${slug}`}
      badge={access.role === 'owner' ? 'Propietario' : 'Trabajador'}
      brandIcon={<Store className="size-3.5" aria-hidden />}
      nav={nav}
      userEmail={user.email}
      topActions={
        <>
          <span className="font-mono text-[10px] text-muted-foreground">{user.email}</span>
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--r-sm)] border border-line-strong bg-card px-3 text-[11px] font-medium transition-colors hover:bg-accent"
          >
            <ExternalLink className="size-3" aria-hidden />
            Ver tienda
          </Link>
        </>
      }
      notice={
        access.readOnly ? (
          <div className="border-b border-amber-200 bg-amber-50">
            <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-4 py-2 text-[11px] text-amber-900 sm:px-5 lg:px-6">
              <Eye className="size-3.5 shrink-0" aria-hidden />
              Acceso de solo lectura como superadmin. Los cambios están deshabilitados.
            </div>
          </div>
        ) : undefined
      }
      sidebarFoot={
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          <p className="section-label mb-1.5">Tu enlace público</p>
          <Link
            href={`/tienda/${slug}`}
            className="block truncate font-mono text-[10px] text-foreground underline-offset-4 hover:underline"
          >
            /tienda/{slug}
          </Link>
          <p className="mt-2">Los pedidos llegan por WhatsApp.</p>
        </div>
      }
    >
      {children}
    </ConsoleShell>
  );
}
