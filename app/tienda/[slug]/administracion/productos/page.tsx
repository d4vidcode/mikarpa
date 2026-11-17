export const instant = false;
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Category, Product } from '@/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { formatMoney } from '@/lib/money';
import { can, requireStoreAccess } from '@/lib/tenant';
import { setProductStatusAction, deleteProductAction } from '@/lib/actions/products';
import type { ProductStatus } from '@/lib/enums';

export const metadata: Metadata = { title: 'Productos' };

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Borrador',
  active: 'Publicado',
  archived: 'Archivado',
};

const STATUS_VARIANTS: Record<ProductStatus, 'secondary' | 'success' | 'outline'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'outline',
};

function stockOf(product: {
  stock: number;
  variants: { stock: number; active: boolean }[];
}): number {
  const activeVariants = product.variants.filter((variant) => variant.active);
  if (activeVariants.length > 0) {
    return activeVariants.reduce((total, variant) => total + variant.stock, 0);
  }
  return product.stock;
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; estado?: string; guardado?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const access = await requireStoreAccess(slug, 'products');
  const writable = !access.readOnly && can(access, 'products');

  const search = query.q?.trim() ?? '';
  const status = ['draft', 'active', 'archived'].includes(query.estado ?? '')
    ? (query.estado as ProductStatus)
    : null;

  const filter: Record<string, unknown> = { storeId: access.store._id };
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const [products, categories] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
    Category.find({ storeId: access.store._id, status: 'active' }).select('name').lean(),
  ]);

  const categoryName = new Map(categories.map((category) => [String(category._id), category.name]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} producto{products.length === 1 ? '' : 's'} en esta vista.
          </p>
        </div>
        {writable ? (
          <Button asChild>
            <Link href={`/tienda/${slug}/administracion/productos/nuevo`}>
              <Plus className="size-4" aria-hidden />
              Nuevo producto
            </Link>
          </Button>
        ) : null}
      </div>

      {query.guardado ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Producto guardado.
        </p>
      ) : null}

      <form className="flex flex-wrap items-center gap-2" method="get">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="estado"
          defaultValue={status ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="active">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium">Todavía no hay productos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publica tu primer producto para que aparezca en tu tienda.
          </p>
          {writable ? (
            <Button asChild className="mt-4">
              <Link href={`/tienda/${slug}/administracion/productos/nuevo`}>Crear producto</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Producto</th>
                <th className="px-3 py-2.5 text-left font-medium">Categoría</th>
                <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                <th className="px-3 py-2.5 text-right font-medium">Stock</th>
                <th className="px-3 py-2.5 text-left font-medium">Estado</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const images = product.images ?? [];
                const first = images[0];
                const stock = stockOf({
                  stock: product.stock ?? 0,
                  variants: (product.variants ?? []).map((variant) => ({
                    stock: variant.stock ?? 0,
                    active: variant.active ?? true,
                  })),
                });

                return (
                  <tr key={String(product._id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                          {first ? (
                            <Image
                              src={first.url}
                              alt={first.alt || product.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/tienda/${slug}/administracion/productos/${String(product._id)}`}
                            className="line-clamp-1 font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {product.variants.length > 0
                              ? `${product.variants.length} variantes`
                              : 'Producto simple'}
                            {product.featured ? ' · Destacado' : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {product.categoryId ? (categoryName.get(String(product.categoryId)) ?? '—') : '—'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-medium">
                        {formatMoney(product.price, access.store.currency, access.store.locale)}
                      </span>
                      {product.compareAtPrice ? (
                        <span className="block text-xs text-muted-foreground line-through">
                          {formatMoney(product.compareAtPrice, access.store.currency, access.store.locale)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {product.trackStock ? stock : '∞'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={STATUS_VARIANTS[product.status as ProductStatus]}>
                        {STATUS_LABELS[product.status as ProductStatus]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/tienda/${slug}/administracion/productos/${String(product._id)}`}>
                            Editar
                          </Link>
                        </Button>

                        {writable && product.status !== 'active' ? (
                          <form action={setProductStatusAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="productId" value={String(product._id)} />
                            <input type="hidden" name="status" value="active" />
                            <Button type="submit" variant="ghost" size="sm">
                              Publicar
                            </Button>
                          </form>
                        ) : null}

                        {writable && product.status !== 'archived' ? (
                          <form action={setProductStatusAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="productId" value={String(product._id)} />
                            <input type="hidden" name="status" value="archived" />
                            <ConfirmButton
                              message={`¿Archivar "${product.name}"? Dejará de mostrarse en la tienda.`}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              Archivar
                            </ConfirmButton>
                          </form>
                        ) : null}

                        {writable && product.status === 'archived' ? (
                          <form action={deleteProductAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="productId" value={String(product._id)} />
                            <ConfirmButton
                              message={`¿Eliminar "${product.name}" definitivamente? Los pedidos anteriores conservan su copia.`}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </ConfirmButton>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
