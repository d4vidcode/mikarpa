import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Store } from '@/models';
import { getCachedStore } from '@/lib/cache/store';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getCachedStore(slug);

  if (!store) {
    return { title: 'Tienda no encontrada' };
  }

  const description =
    store.seo?.description ??
    store.description ??
    `Visita ${store.name} y descubre su catálogo.`;

  return {
    title: store.seo?.title ?? store.name,
    description,
    robots: store.status === 'active' ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: store.seo?.title ?? store.name,
      description,
      images: store.seo?.ogImageUrl ?? store.logoUrl ?? undefined,
      type: 'website',
    },
  };
}

function SuspendedStore({ name }: { name: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 text-neutral-900">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">Tienda pausada</p>
        <h1 className="mt-2 text-2xl font-semibold">{name}</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Esta tienda no está disponible por el momento. Si eres su propietario, revisa tu correo o
          contacta con el soporte de mikarpa.
        </p>
        <Link href="/explorar" className="mt-6 inline-block text-sm underline underline-offset-4">
          Ver otras tiendas
        </Link>
      </div>
    </div>
  );
}

/**
 * Layout compartido solo para validación/metadata.
 *
 * Importante: NO aplica el Shell ni variables --store-* aquí. Si se aplicara,
 * también envolvería /tienda/[slug]/administracion/* porque Next.js hereda los
 * layouts por segmento. El Shell del storefront vive en (tienda)/layout.tsx.
 */
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getCachedStore(slug);

  if (!store || store.status === 'archived') {
    await connectDB();
    const previous = await Store.findOne({ slugHistory: slug, deletedAt: null })
      .select('slug')
      .lean();
    if (previous?.slug) {
      permanentRedirect(`/tienda/${previous.slug}`);
    }
    notFound();
  }

  if (store.status === 'suspended') {
    return <SuspendedStore name={store.name} />;
  }

  return <>{children}</>;
}
