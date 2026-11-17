export const instant = false;
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import { getCachedStore, getCachedCategories, getCachedProducts } from '@/lib/cache/store';
import { getTheme } from '@/themes/registry';
import { getSectionDefinition } from '@/themes/sections/registry';
import { ProductCard } from '@/components/storefront/product-card';
import type { StoreSectionDto } from '@/types/storefront';

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const store = await getCachedStore(slug);

  if (!store || store.status !== 'active') {
    notFound();
  }

  const storeId = store.id;
  const search = query.q?.trim() ?? '';
  const categorySlug = query.categoria?.trim() ?? '';

  const categories = await getCachedCategories(storeId);

  let categoryId: string | null = null;
  let categoryMissing = false;

  if (categorySlug) {
    const category = categories.find((item) => item.slug === categorySlug);
    if (category) {
      categoryId = category.id;
    } else {
      categoryMissing = true;
    }
  }

  const allProducts = categoryMissing ? [] : await getCachedProducts(storeId);

  let products = allProducts;
  if (categoryId) {
    products = products.filter((product) => product.categoryId === categoryId);
  }
  if (search) {
    const safe = search.toLowerCase();
    products = products.filter((product) =>
      [product.name, product.descriptionText]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(safe)),
    );
  }
  products = products.slice(0, 120);

  const publicStore = store;
  const data = {
    store: publicStore,
    products,
    categories,
  };

  const filtered = Boolean(search || categorySlug);

  if (filtered) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {categorySlug
                ? (categories.find((category) => category.slug === categorySlug)?.name ?? 'Categoría')
                : 'Búsqueda'}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--store-fg)]">
              {search ? `Resultados para “${search}”` : 'Productos'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {data.products.length} producto{data.products.length === 1 ? '' : 's'}
            </p>
          </div>

          <form method="get" className="flex w-full max-w-sm items-center gap-2">
            {categorySlug ? <input type="hidden" name="categoria" value={categorySlug} /> : null}
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--store-radius)] border border-[var(--store-fg)]/15 px-3">
              <Search className="size-4 shrink-0 text-neutral-400" aria-hidden />
              <input
                name="q"
                defaultValue={search}
                placeholder="Buscar en la tienda…"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/tienda/${slug}${search ? `?q=${encodeURIComponent(search)}` : ''}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              categorySlug
                ? 'border-[var(--store-fg)]/15 text-neutral-600 hover:bg-[var(--store-primary)] hover:text-white'
                : 'border-[var(--store-primary)] bg-[var(--store-primary)] text-white'
            }`}
          >
            Todo
          </Link>
          {data.categories.map((category: { id: string; slug: string; name: string }) => {
            const active = category.slug === categorySlug;
            const searchParams = search ? `&q=${encodeURIComponent(search)}` : '';
            return (
              <Link
                key={category.id}
                href={`/tienda/${slug}?categoria=${category.slug}${searchParams}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? 'border-[var(--store-primary)] bg-[var(--store-primary)] text-white'
                    : 'border-[var(--store-fg)]/15 text-neutral-600 hover:bg-[var(--store-primary)] hover:text-white'
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        {data.products.length === 0 ? (
          <div className="mt-10 rounded-[var(--store-radius)] border border-dashed border-[var(--store-fg)]/20 px-6 py-16 text-center">
            <p className="text-sm font-medium">No encontramos productos</p>
            <p className="mt-1 text-sm text-neutral-500">Prueba con otra palabra o categoría.</p>
            <Link
              href={`/tienda/${slug}`}
              className="mt-5 inline-flex h-10 items-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-5 text-sm font-semibold text-white"
            >
              Ver toda la tienda
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={data.store.currency}
                locale={data.store.locale}
                storeSlug={slug}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const theme = getTheme(publicStore.themeKey);
  const configured: StoreSectionDto[] =
    (store.sections ?? []).length > 0
      ? (store.sections ?? []).map((section) => ({
          key: section.key,
          type: section.type,
          enabled: section.enabled,
          order: section.order,
          config: (section.config as Record<string, unknown>) ?? {},
        }))
      : theme.defaultSections.map((section) => ({ ...section, config: { ...section.config } }));

  const sections = configured
    .filter((section) => section.enabled)
    // La plantilla Boutique ya incluye su propio pie de página en el Shell.
    .filter((section) => !(theme.key === 'boutique' && section.type === 'footer'))
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sections.map((section) => {
        const definition = getSectionDefinition(section.type);
        if (!definition) {
          return null;
        }
        const Component = definition.Component;
        return (
          <Component
            key={section.key}
            config={{ ...definition.defaults, ...section.config }}
            data={data}
          />
        );
      })}
    </>
  );
}
