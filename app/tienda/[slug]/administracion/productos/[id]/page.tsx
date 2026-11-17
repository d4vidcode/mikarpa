export const instant = false;
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Category, Product } from '@/models';
import { can, getStoreAccess } from '@/lib/tenant';
import { centsToInput } from '@/lib/money';
import { ProductForm } from '@/components/admin/product-form';
import { variantKey } from '@/components/admin/product-types';

export const metadata: Metadata = { title: 'Editar producto' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const access = await getStoreAccess(slug);

  if (!access) {
    notFound();
  }
  if (!can(access, 'products')) {
    notFound();
  }
  if (access.readOnly) {
    redirect(`/tienda/${slug}/administracion/productos`);
  }

  const [product, categories] = await Promise.all([
    Product.findOne({ _id: id, storeId: access.store._id }).lean(),
    Category.find({ storeId: access.store._id, status: 'active' })
      .sort({ order: 1, name: 1 })
      .select('name')
      .lean(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      storeSlug={slug}
      categories={categories.map((category) => ({ id: String(category._id), name: category.name }))}
      initial={{
        id: String(product._id),
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId ? String(product.categoryId) : null,
        description: product.description ?? '',
        price: centsToInput(product.price),
        compareAtPrice: centsToInput(product.compareAtPrice),
        sku: product.sku ?? '',
        stock: product.stock ?? 0,
        trackStock: product.trackStock ?? true,
        status: product.status,
        featured: product.featured ?? false,
        tagsText: (product.tags ?? []).join(', '),
        images: (product.images ?? []).map((image) => ({
          url: image.url,
          alt: image.alt ?? '',
          publicId: image.publicId ?? null,
          width: image.width ?? null,
          height: image.height ?? null,
        })),
        options: (product.options ?? []).map((option) => ({
          name: option.name,
          valuesText: (option.values ?? []).join(', '),
        })),
        variants: (product.variants ?? []).map((variant) => {
          const options = (variant.options ?? []).map((option) => ({
            name: option.name,
            value: option.value,
          }));
          return {
            key: variantKey(options),
            options,
            sku: variant.sku ?? '',
            price: centsToInput(variant.price),
            compareAtPrice: centsToInput(variant.compareAtPrice),
            stock: variant.stock ?? 0,
            imageUrl: variant.imageUrl ?? '',
            active: variant.active ?? true,
          };
        }),
      }}
    />
  );
}
