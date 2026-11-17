export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Truck } from 'lucide-react';
import { getCachedStore, getCachedProduct, getCachedRelatedProducts, getCachedCategories } from '@/lib/cache/store';
import { toPublicProduct, toPublicStore, effectiveStock } from '@/lib/storefront';
import { ProductCard } from '@/components/storefront/product-card';
import { AddToCartForm } from '@/components/storefront/add-to-cart';
import { ProductGallery } from '@/components/storefront/product-gallery';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const store = await getCachedStore(slug);
  if (!store) {
    return { title: 'Producto no encontrado' };
  }

  const product = await getCachedProduct(String(store._id), id);

  if (!product) {
    return { title: 'Producto no encontrado' };
  }

  return {
    title: `${product.name} · ${store.name}`,
    description: product.descriptionText ?? store.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.descriptionText ?? undefined,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const store = await getCachedStore(slug);

  if (!store || store.status !== 'active') {
    notFound();
  }

  const productDoc = await getCachedProduct(String(store._id), id);

  if (!productDoc) {
    notFound();
  }

  const categories = await getCachedCategories(String(store._id));
  const category = productDoc.categoryId
    ? categories.find((item) => String(item._id) === String(productDoc.categoryId)) ?? null
    : null;

  const relatedDocs = await getCachedRelatedProducts(
    String(store._id),
    productDoc.categoryId ? String(productDoc.categoryId) : null,
    id,
  );

  const publicStore = toPublicStore(store);
  const product = toPublicProduct(productDoc);
  const stock = effectiveStock(product);
  const related = relatedDocs.map(toPublicProduct);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-neutral-500" aria-label="Ruta">
        <Link href={`/tienda/${slug}`} className="hover:underline">
          Inicio
        </Link>
        {category ? (
          <>
            <ChevronRight className="size-3" aria-hidden />
            <Link href={`/tienda/${slug}?categoria=${category.slug}`} className="hover:underline">
              {category.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="size-3" aria-hidden />
        <span className="line-clamp-1 text-neutral-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--store-fg)] sm:text-3xl">
            {product.name}
          </h1>

          {product.featured ? (
            <span className="mt-2 inline-block rounded-full bg-[var(--store-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--store-accent)]">
              Destacado
            </span>
          ) : null}

          <div className="mt-5">
            <AddToCartForm
              product={product}
              storeSlug={slug}
              currency={publicStore.currency}
              locale={publicStore.locale}
            />
          </div>

          {product.trackStock && stock > 0 && stock <= 5 ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ¡Quedan pocas unidades! ({stock} disponibles)
            </p>
          ) : null}

          <div className="mt-5 flex items-start gap-2 rounded-[var(--store-radius)] bg-[var(--store-muted)] px-3 py-2.5 text-xs text-neutral-600">
            <Truck className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Coordinamos el envío y el pago por WhatsApp. {store.contact?.city ? `Entrega desde ${store.contact.city}.` : ''}
            </p>
          </div>

          {product.description ? (
            <div className="mt-8 border-t border-black/5 pt-6">
              <h2 className="text-sm font-semibold">Detalles</h2>
              <div
                className="mt-2 text-sm leading-relaxed text-neutral-700 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          ) : null}

          <dl className="mt-6 space-y-1 border-t border-black/5 pt-4 text-xs text-neutral-500">
            {product.sku ? (
              <div className="flex gap-2">
                <dt className="font-medium text-neutral-600">SKU:</dt>
                <dd>{product.sku}</dd>
              </div>
            ) : null}
            {category ? (
              <div className="flex gap-2">
                <dt className="font-medium text-neutral-600">Categoría:</dt>
                <dd>{category.name}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-[var(--store-fg)]">También te puede gustar</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                currency={publicStore.currency}
                locale={publicStore.locale}
                storeSlug={slug}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
