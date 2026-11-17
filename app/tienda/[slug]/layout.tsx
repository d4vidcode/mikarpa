import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Store } from '@/models';
import { getStoreBySlug } from '@/lib/tenant';
import { toPublicStore } from '@/lib/storefront';
import { getTheme } from '@/themes/registry';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

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

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

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

  const publicStore = toPublicStore(store);
  const Shell = getTheme(publicStore.themeKey).Shell;

  return <Shell store={publicStore}>{children}</Shell>;
}
