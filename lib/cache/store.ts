import { cacheTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Store, Category, Product } from '@/models';

/** Cachea la tienda por slug (invalidar con `revalidateTag('store-<slug>')`). */
export async function getCachedStore(slug: string) {
  'use cache';
  cacheTag(`store-${slug}`);
  await connectDB();
  return Store.findOne({ slug, deletedAt: null }).lean();
}

export async function getCachedCategories(storeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  return Category.find({ storeId, status: 'active' }).sort({ order: 1, name: 1 }).lean();
}

export async function getCachedProducts(storeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  return Product.find({ storeId, status: 'active' }).sort({ position: 1, createdAt: -1 }).limit(120).lean();
}

export async function getCachedProduct(storeId: string, productId: string) {
  'use cache';
  cacheTag(`product-${productId}`);
  cacheTag(`store-${storeId}`);
  await connectDB();
  return Product.findOne({ _id: productId, storeId, status: 'active' }).lean();
}

export async function getCachedRelatedProducts(storeId: string, categoryId: string | null, excludeId: string) {
  'use cache';
  cacheTag(`store-${storeId}`);
  await connectDB();
  return Product.find({
    storeId,
    status: 'active',
    _id: { $ne: excludeId },
    ...(categoryId ? { categoryId } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
}