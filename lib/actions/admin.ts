'use server';

import { revalidatePath } from 'next/cache';
import { PlatformSettings, Store, StoreCategory, User } from '@/models';
import { recordAudit } from '@/lib/audit';
import { connectDB } from '@/lib/db';
import { AccessError, requireSuperadmin } from '@/lib/tenant';
import { platformSettingsSchema, storeCategoryInputSchema, suspendStoreSchema, updateUserSchema } from '@/lib/validators/admin';
import { fieldErrors } from '@/lib/validators/common';

export type AdminFormState = {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
  message?: string;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function checkbox(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on' || formData.get(key) === 'true' || formData.get(key) === '1';
}

async function handleSuperadmin(): Promise<
  { ok: true; actor: Awaited<ReturnType<typeof requireSuperadmin>> } | { ok: false; error: string }
> {
  try {
    return { ok: true, actor: await requireSuperadmin() };
  } catch (error) {
    if (error instanceof AccessError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export async function suspendStoreAction(formData: FormData): Promise<void> {
  const actor = await requireSuperadmin();
  const parsed = suspendStoreSchema.safeParse({
    storeId: text(formData, 'storeId'),
    action: text(formData, 'action'),
    reason: text(formData, 'reason') || undefined,
  });

  if (!parsed.success) {
    return;
  }

  const { storeId, action, reason } = parsed.data;

  const store = await Store.findOne({ _id: storeId, deletedAt: null })
    .select('_id name slug status')
    .lean();

  if (!store) {
    return;
  }

  if (action === 'suspend') {
    await Store.updateOne(
      { _id: store._id },
      {
        $set: {
          status: 'suspended',
          suspension: { reason: reason ?? null, at: new Date(), by: actor.id },
        },
      },
    );
  } else {
    await Store.updateOne(
      { _id: store._id },
      { $set: { status: 'active', suspension: { reason: null, at: null, by: null } } },
    );
  }

  await recordAudit({
    actor,
    storeId: String(store._id),
    action: action === 'suspend' ? 'store.suspend' : 'store.reactivate',
    entityType: 'Store',
    entityId: String(store._id),
    before: { status: store.status },
    after: { status: action === 'suspend' ? 'suspended' : 'active' },
    reason: reason ?? null,
  });

  revalidatePath('/administracion');
  revalidatePath('/administracion/tiendas');
  revalidatePath(`/administracion/tiendas/${String(store._id)}`);
  revalidatePath(`/tienda/${store.slug}`);
  revalidatePath('/explorar');
}

export async function updateUserAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await handleSuperadmin();
  if (!auth.ok) {
    return { error: auth.error };
  }
  const actor = auth.actor;

  const parsed = updateUserSchema.safeParse({
    userId: text(formData, 'userId'),
    role: text(formData, 'role'),
    status: text(formData, 'status'),
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  const { userId, role, status } = parsed.data;

  if (userId === actor.id) {
    return { error: 'No puedes cambiar tu propio rol ni suspender tu cuenta.' };
  }

  await connectDB();

  const user = await User.findOne({ _id: userId, deletedAt: null })
    .select('_id name email role status')
    .lean();

  if (!user) {
    return { error: 'El usuario no existe.' };
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { role, status }, $inc: { tokenVersion: 1 } },
  );

  if (user.role !== role) {
    await recordAudit({
      actor,
      action: 'user.role_change',
      entityType: 'User',
      entityId: userId,
      before: { role: user.role },
      after: { role },
    });
  }

  if (user.status !== status) {
    await recordAudit({
      actor,
      action: status === 'suspended' ? 'user.suspend' : 'user.reactivate',
      entityType: 'User',
      entityId: userId,
      before: { status: user.status },
      after: { status },
    });
  }

  revalidatePath('/administracion/usuarios');
  return { ok: true, message: 'Usuario actualizado.' };
}

export async function updatePlatformSettingsAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await handleSuperadmin();
  if (!auth.ok) {
    return { error: auth.error };
  }

  const parsed = platformSettingsSchema.safeParse({
    brandingName: text(formData, 'brandingName'),
    brandingTagline: text(formData, 'brandingTagline'),
    supportEmail: text(formData, 'supportEmail') || null,
    allowOwnerSignup: checkbox(formData, 'allowOwnerSignup'),
    maintenanceEnabled: checkbox(formData, 'maintenanceEnabled'),
    maintenanceMessage: text(formData, 'maintenanceMessage'),
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  await connectDB();

  const current = await PlatformSettings.findOne({ key: 'platform' }).lean();

  await PlatformSettings.updateOne(
    { key: 'platform' },
    {
      $set: {
        'branding.name': data.brandingName,
        'branding.tagline': data.brandingTagline ?? '',
        'branding.supportEmail': data.supportEmail,
        'signup.allowOwnerSignup': data.allowOwnerSignup,
        'maintenance.enabled': data.maintenanceEnabled,
        'maintenance.message':
          data.maintenanceMessage ?? 'Estamos haciendo mantenimiento. Volvemos en unos minutos.',
        updatedBy: auth.actor.id,
      },
      $setOnInsert: { key: 'platform' },
    },
    { upsert: true },
  );

  await recordAudit({
    actor: auth.actor,
    action: 'settings.update',
    entityType: 'PlatformSettings',
    entityId: 'platform',
    before: {
      brandingName: current?.branding?.name ?? null,
      maintenance: current?.maintenance?.enabled ?? false,
    },
    after: {
      brandingName: data.brandingName,
      maintenance: data.maintenanceEnabled,
    },
  });

  revalidatePath('/administracion/configuracion');
  return { ok: true, message: 'Configuración guardada.' };
}

export async function saveStoreCategoryAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await handleSuperadmin();
  if (!auth.ok) {
    return { error: auth.error };
  }

  const parsed = storeCategoryInputSchema.safeParse({
    slug: text(formData, 'slug'),
    name: text(formData, 'name'),
    icon: text(formData, 'icon') || 'package',
    order: Number(text(formData, 'order') || 0),
    active: checkbox(formData, 'active'),
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  await connectDB();

  const existing = await StoreCategory.findOne({ slug: parsed.data.slug }).select('_id').lean();

  await StoreCategory.updateOne(
    { slug: parsed.data.slug },
    {
      $set: {
        name: parsed.data.name,
        icon: parsed.data.icon,
        order: parsed.data.order,
        active: parsed.data.active,
      },
      $setOnInsert: { slug: parsed.data.slug },
    },
    { upsert: true },
  );

  await recordAudit({
    actor: auth.actor,
    action: existing ? 'store_category.update' : 'store_category.create',
    entityType: 'StoreCategory',
    entityId: parsed.data.slug,
    after: parsed.data,
  });

  revalidatePath('/administracion/configuracion');
  revalidatePath('/explorar');
  revalidatePath('/crear-tienda');

  return { ok: true, message: 'Rubro guardado.' };
}
