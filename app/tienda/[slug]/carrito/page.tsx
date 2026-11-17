export const instant = false;
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCachedStore } from '@/lib/cache/store';
import { CartView } from '@/components/storefront/cart-view';

export const metadata: Metadata = { title: 'Carrito' };

export default async function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getCachedStore(slug);

  if (!store || store.status !== 'active') {
    notFound();
  }

  const publicStore = store;

  if (!publicStore.whatsapp.enabled || !publicStore.whatsapp.phone) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Pedidos no disponibles</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {store.name} aún no habilitó los pedidos por WhatsApp. Vuelve pronto.
        </p>
      </div>
    );
  }

  return (
    <CartView
      storeSlug={slug}
      storeName={store.name}
      currency={publicStore.currency}
      locale={publicStore.locale}
    />
  );
}
