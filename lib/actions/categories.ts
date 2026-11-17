'use server';

import { revalidatePath } from 'next/cache';
import { Category, Product } from '@/models';
import { recordAudit } from '@/lib/audit';
import { connectDB } from '@/lib/db';
import { slugify } from '@/lib/slugs';
import { requireStoreAccess, toActionResultError } from '@/lib/tenant';
import { isDuplicateKeyError } from '@/lib/api';
import { categoryInputSchema } from '@/lib/validators/product';
import { fieldErrors } from '@/lib/validators/common';

export type CategoryFormState = {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function saveCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'categories', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  const parsed = categoryInputSchema.safeParse({
    id: text(formData, 'categoryId') || null,
    name: text(formData, 'name'),
    slug: text(formData, 'categorySlug') || null,
    description: text(formData, 'description') || null,
    order: Number(text(formData, 'order') || 0),
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const base = slugify(data.slug || data.name) || 'categoria';

  await connectDB();

  const clash = await Category.findOne({
    storeId: access.store._id,
    slug: base,
    ...(data.id ? { _id: { $ne: data.id } } : {}),
  })
    .select('_id')
    .lean();

  if (clash) {
    return { error: 'Ya existe una categoría con ese enlace.', fields: { categorySlug: 'Enlace en uso' } };
  }

  try {
    if (data.id) {
      const category = await Category.findOne({
        _id: data.id,
        storeId: access.store._id,
      });
      if (!category) {
        return { error: 'La categoría no existe.' };
      }

      category.set({
        name: data.name,
        slug: base,
        description: data.description,
        order: data.order,
      });
      await category.save();

      await recordAudit({
        actor: access.user,
        storeId: String(access.store._id),
        action: 'category.update',
        entityType: 'Category',
        entityId: String(category._id),
        after: { name: category.name, slug: category.slug },
      });
    } else {
      const category = await Category.create({
        storeId: access.store._id,
        name: data.name,
        slug: base,
        description: data.description,
        order: data.order,
      });

      await recordAudit({
        actor: access.user,
        storeId: String(access.store._id),
        action: 'category.create',
        entityType: 'Category',
        entityId: String(category._id),
        after: { name: category.name, slug: category.slug },
      });
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: 'Ya existe una categoría con ese enlace.' };
    }
    console.error('[category.save]', error);
    return { error: 'No pudimos guardar la categoría.' };
  }

  revalidatePath(`/tienda/${slug}/administracion/categorias`);
  revalidatePath(`/tienda/${slug}`);
  return { ok: true, message: 'Categoría guardada.' };
}

export async function setCategoryStatusAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const categoryId = text(formData, 'categoryId');
  const status = text(formData, 'status');

  if (!['active', 'archived'].includes(status)) {
    return;
  }

  const access = await requireStoreAccess(slug, 'categories', { write: true });

  const category = await Category.findOne({
    _id: categoryId,
    storeId: access.store._id,
  })
    .select('_id name status')
    .lean();

  if (!category) {
    return;
  }

  await Category.updateOne(
    { _id: category._id, storeId: access.store._id },
    { $set: { status } },
  );

  // Al archivar, los productos quedan sin categoría visible.
  if (status === 'archived') {
    await Product.updateMany(
      { storeId: access.store._id, categoryId: category._id },
      { $set: { categoryId: null } },
    );
  }

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'category.status_change',
    entityType: 'Category',
    entityId: categoryId,
    before: { status: category.status },
    after: { status },
  });

  revalidatePath(`/tienda/${slug}/administracion/categorias`);
  revalidatePath(`/tienda/${slug}`);
}
