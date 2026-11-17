'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Category, Product } from '@/models';
import { recordAudit } from '@/lib/audit';
import { connectDB } from '@/lib/db';
import { richTextToPlainText, sanitizeRichText } from '@/lib/sanitize';
import { slugify } from '@/lib/slugs';
import { requireStoreAccess, toActionResultError } from '@/lib/tenant';
import { isDuplicateKeyError } from '@/lib/api';
import { productInputSchema } from '@/lib/validators/product';
import { fieldErrors } from '@/lib/validators/common';
import type { ProductDocument } from '@/models/Product';

export type ProductFormState = {
  error?: string;
  fields?: Record<string, string>;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

async function uniqueSlug(
  storeId: string,
  base: string,
  excludeId?: string | null,
): Promise<string> {
  const root = slugify(base) || 'producto';
  let candidate = root;
  let counter = 2;

  for (;;) {
    const clash = await Product.findOne({
      storeId,
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('_id')
      .lean();

    if (!clash) {
      return candidate;
    }

    candidate = `${root}-${counter}`;
    counter += 1;

    if (counter > 50) {
      return `${root}-${Date.now().toString(36)}`;
    }
  }
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'products', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text(formData, 'payload') || '{}');
  } catch {
    return { error: 'Los datos del producto no se pudieron leer. Recarga la página.' };
  }

  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Revisa los datos del producto.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  if (data.compareAtPrice !== null && data.compareAtPrice <= data.price) {
    return {
      error: 'El precio anterior debe ser mayor al precio actual.',
      fields: { compareAtPrice: 'Debe ser mayor al precio' },
    };
  }

  if (data.variants.length > 0 && data.options.length === 0) {
    return { error: 'Define las opciones (talla, color…) antes de las variantes.' };
  }

  await connectDB();

  if (data.categoryId) {
    const category = await Category.findOne({
      _id: data.categoryId,
      storeId: access.store._id,
    })
      .select('_id')
      .lean();
    if (!category) {
      return { error: 'La categoría elegida no existe en esta tienda.' };
    }
  }

  const description = sanitizeRichText(data.description);
  const descriptionText = richTextToPlainText(description);

  const images = data.images.map((image) => ({
    url: image.url,
    publicId: image.publicId ?? null,
    alt: image.alt ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
  }));

  const variants = data.variants.map((variant) => ({
    sku: variant.sku,
    options: variant.options,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    imageUrl: variant.imageUrl,
    active: variant.active,
  }));

  const fields = {
    name: data.name,
    categoryId: data.categoryId ?? null,
    description,
    descriptionText,
    price: data.price,
    compareAtPrice: data.compareAtPrice,
    sku: data.sku,
    stock: data.stock,
    trackStock: data.trackStock,
    status: data.status,
    featured: data.featured,
    tags: data.tags,
    images,
    options: data.options,
    variants,
  };

  try {
    if (data.id) {
      const product = await Product.findOne({
        _id: data.id,
        storeId: access.store._id,
      });

      if (!product) {
        return { error: 'El producto no existe.' };
      }

      const nextSlug = await uniqueSlug(
        String(access.store._id),
        data.slug || data.name,
        String(product._id),
      );

      const before: Partial<ProductDocument> = {
        name: product.name,
        price: product.price,
        status: product.status as ProductDocument['status'],
      };

      product.set({ ...fields, slug: nextSlug });
      await product.save();

      await recordAudit({
        actor: access.user,
        storeId: String(access.store._id),
        action: 'product.update',
        entityType: 'Product',
        entityId: String(product._id),
        before,
        after: { name: product.name, price: product.price, status: product.status },
      });
    } else {
      const baseSlug = await uniqueSlug(String(access.store._id), data.slug || data.name);

      const product = await Product.create({
        ...fields,
        slug: baseSlug,
        storeId: access.store._id,
      });

      await recordAudit({
        actor: access.user,
        storeId: String(access.store._id),
        action: 'product.create',
        entityType: 'Product',
        entityId: String(product._id),
        after: { name: product.name, slug: product.slug, price: product.price },
      });
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: 'El SKU o el enlace ya está en uso. Prueba con otro.', fields: { sku: 'SKU duplicado' } };
    }
    console.error('[product.save]', error);
    return { error: 'No pudimos guardar el producto.' };
  }

  revalidatePath(`/tienda/${slug}`);
  revalidatePath(`/tienda/${slug}/administracion/productos`);
  redirect(`/tienda/${slug}/administracion/productos?guardado=1`);
}

export async function setProductStatusAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const productId = text(formData, 'productId');
  const status = text(formData, 'status');

  if (!['draft', 'active', 'archived'].includes(status)) {
    return;
  }

  const access = await requireStoreAccess(slug, 'products', { write: true });

  const product = await Product.findOne({
    _id: productId,
    storeId: access.store._id,
  })
    .select('_id name status')
    .lean();

  if (!product) {
    return;
  }

  await Product.updateOne(
    { _id: product._id, storeId: access.store._id },
    { $set: { status, archivedAt: status === 'archived' ? new Date() : null } },
  );

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'product.status_change',
    entityType: 'Product',
    entityId: productId,
    before: { status: product.status },
    after: { status },
  });

  revalidatePath(`/tienda/${slug}`);
  revalidatePath(`/tienda/${slug}/administracion/productos`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const productId = text(formData, 'productId');

  const access = await requireStoreAccess(slug, 'products', { write: true });

  const product = await Product.findOne({
    _id: productId,
    storeId: access.store._id,
  })
    .select('_id name slug')
    .lean();

  if (!product) {
    return;
  }

  await Product.deleteOne({ _id: product._id, storeId: access.store._id });

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'product.delete',
    entityType: 'Product',
    entityId: productId,
    before: { name: product.name, slug: product.slug },
  });

  revalidatePath(`/tienda/${slug}`);
  revalidatePath(`/tienda/${slug}/administracion/productos`);
}
