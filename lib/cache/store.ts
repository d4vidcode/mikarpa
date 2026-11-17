import { cacheTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Store, Category, Product } from '@/models';
import { toPublicProduct, toPublicStore, toPublicCategory } from '@/lib/storefront';

/** Cachea la tienda por slug (invalidar con `revalidateTag('store-<slug>')`). */
export async function getCachedStore(slug: string) {
  'use cache';
  cacheTag(`store-${slug}`);
  await connectDB();
  const store = await Store.findOne({ slug, deletedAt: null }).lean();
  return store ? toPublicStore(store) : null;
}

export async function getCachedCategories(storeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  const categories = await Category.find({ storeId, status: 'active' }).sort({ order: 1, name: 1 }).lean();
  return categories.map(toPublicCategory);
}

export async function getCachedProducts(storeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  const products = await Product.find({ storeId, status: 'active' }).sort({ position: 1, createdAt: -1 }).limit(120).lean();
  return products.map(toPublicProduct);
}

export async function getCachedProduct(storeId: string, productId: string) {
  'use cache';
  cacheTag(`product-${productId}`);
  cacheTag(`store-${storeId}`);
  await connectDB();
  const product = await Product.findOne({ _id: productId, storeId, status: 'active' }).lean();
  return product ? toPublicProduct(product) : null;
}

export async function getCachedRelatedProducts(storeId: string, categoryId: string | null, excludeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  const products = await Product.find({
    storeId,
    status: 'active',
    _id: { $ne: excludeId },
    ...(categoryId ? { categoryId } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  return products.map(toPublicProduct);
}