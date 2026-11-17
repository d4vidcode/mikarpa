export const instant = false;
import type { Metadata } from 'next';
import { Category, Product } from '@/models';
import { can, requireStoreAccess } from '@/lib/tenant';
import { CategoryManager, type CategoryRow } from '@/components/admin/category-manager';

export const metadata: Metadata = { title: 'Categorías' };

export default async function CategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'categories');
  const writable = !access.readOnly && can(access, 'categories');

  const [categories, counts] = await Promise.all([
    Category.find({ storeId: access.store._id }).sort({ order: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { storeId: access.store._id } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]),
  ]);

  const countByCategory = new Map(counts.map((row) => [String(row._id), row.count]));

  const rows: CategoryRow[] = categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    order: category.order ?? 0,
    status: category.status,
    productCount: countByCategory.get(String(category._id)) ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agrupa tus productos y crea filtros en tu tienda.
        </p>
      </div>

      <CategoryManager storeSlug={slug} categories={rows} writable={writable} />
    </div>
  );
}
