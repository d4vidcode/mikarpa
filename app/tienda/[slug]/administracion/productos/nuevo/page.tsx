export const instant = false;
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Category } from '@/models';
import { getStoreAccess, can } from '@/lib/tenant';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = { title: 'Nuevo producto' };

export default async function NewProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const categories = await Category.find({ storeId: access.store._id, status: 'active' })
    .sort({ order: 1, name: 1 })
    .select('name')
    .lean();

  return (
    <ProductForm
      storeSlug={slug}
      categories={categories.map((category) => ({ id: String(category._id), name: category.name }))}
      initial={{
        id: null,
        name: '',
        slug: '',
        categoryId: null,
        description: '',
        price: '',
        compareAtPrice: '',
        sku: '',
        stock: 0,
        trackStock: true,
        status: 'draft',
        featured: false,
        tagsText: '',
        images: [],
        options: [],
        variants: [],
      }}
    />
  );
}
