export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireStoreAccess } from '@/lib/tenant';
import { StoreSettingsForm } from '@/components/admin/store-settings-form';

export const metadata: Metadata = { title: 'Configuración' };

export default async function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'settings');
  const store = access.store;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos de contacto, redes, WhatsApp y SEO de tu tienda.
        </p>
      </div>

      <StoreSettingsForm
        storeSlug={slug}
        readOnly={access.readOnly}
        initial={{
          slug,
          name: store.name,
          description: store.description ?? '',
          logoUrl: store.logoUrl ?? '',
          contactPhone: store.contact?.phone ?? '',
          contactEmail: store.contact?.email ?? '',
          address: store.contact?.address ?? '',
          city: store.contact?.city ?? '',
          instagram: store.social?.instagram ?? '',
          facebook: store.social?.facebook ?? '',
          tiktok: store.social?.tiktok ?? '',
          website: store.social?.website ?? '',
          whatsappEnabled: store.paymentConfig?.whatsapp?.enabled ?? false,
          whatsappPhone: store.paymentConfig?.whatsapp?.phone ?? '',
          whatsappTemplate: store.paymentConfig?.whatsapp?.messageTemplate ?? '',
          seoTitle: store.seo?.title ?? '',
          seoDescription: store.seo?.description ?? '',
          businessHours: (store.businessHours ?? []).map((hour) => ({
            day: hour.day,
            closed: hour.closed,
            open: hour.open,
            close: hour.close,
          })),
        }}
      />

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Enlace de tu tienda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparte este enlace en tus redes y en tu bio de Instagram.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-3 py-2 text-sm">/tienda/{slug}</code>
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            Abrir tienda
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          El cambio de enlace (slug) se habilitará cuando exista redirección automática, para no
          romper enlaces compartidos.
        </p>
      </section>
    </div>
  );
}
