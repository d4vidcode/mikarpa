'use server';

import crypto from 'node:crypto';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { PaymentAccount, Store, StoreCategory, StoreMember, User } from '@/models';
import { recordAudit } from '@/lib/audit';
import { connectDB } from '@/lib/db';
import { THEMES } from '@/themes/registry';
import { nestThemeTokens, compactThemeTokens } from '@/lib/theme-tokens';
import { encryptSecret } from '@/lib/crypto';
import { isReservedSlug, isValidSlug } from '@/lib/slugs';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireStoreAccess, requireUser, toActionResultError } from '@/lib/tenant';
import { STORE_PERMISSIONS, type StorePermission } from '@/lib/enums';
import { appearanceSchema, createStoreSchema, storeSettingsSchema } from '@/lib/validators/store';
import { fieldErrors } from '@/lib/validators/common';

export type StoreFormState = {
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

/**
 * Crea la tienda + la membresía owner.
 *
 * No usamos transacción (Atlas M0 standalone bloquea transacciones en algunos
 * planes): si la membresía falla, se elimina la tienda recién creada.
 */
export async function createStoreAction(
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    return toActionResultError(error);
  }

  const limit = checkRateLimit(`store:create:${user.id}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { error: `Demasiados intentos. Espera ${limit.retryAfterSeconds} segundos.` };
  }

  const parsed = createStoreSchema.safeParse({
    name: text(formData, 'name'),
    slug: text(formData, 'slug').toLowerCase(),
    category: text(formData, 'category'),
    themeKey: text(formData, 'themeKey') || 'minimal',
    description: text(formData, 'description') || null,
    whatsappPhone: text(formData, 'whatsappPhone') || null,
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  if (!isValidSlug(data.slug)) {
    return { error: 'Enlace inválido.', fields: { slug: 'Solo minúsculas, números y guiones' } };
  }
  if (isReservedSlug(data.slug)) {
    return { error: 'Ese enlace está reservado.', fields: { slug: 'Elige otro enlace' } };
  }

  const theme = THEMES[data.themeKey];
  if (!theme) {
    return { error: 'Elige un tema válido.', fields: { themeKey: 'Tema no disponible' } };
  }

  await connectDB();

  const category = await StoreCategory.findOne({ slug: data.category, active: true })
    .select('_id')
    .lean();
  if (!category) {
    return { error: 'Elige un rubro válido.', fields: { category: 'Rubro no disponible' } };
  }

  const existing = await Store.findOne({ slug: data.slug }).select('_id').lean();
  if (existing) {
    return { error: 'Ese enlace ya está en uso.', fields: { slug: 'Elige otro enlace' } };
  }

  const now = new Date();

  let store;
  try {
    store = await Store.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      ownerId: user.id,
      theme: { themeKey: theme.key, tokens: {} },
      sections: theme.defaultSections.map((section) => ({ ...section })),
      paymentConfig: {
        whatsapp: {
          enabled: Boolean(data.whatsappPhone),
          phone: data.whatsappPhone,
        },
      },
      status: 'active',
      onboardingCompletedAt: now,
      publishedAt: now,
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return { error: 'Ese enlace ya está en uso.', fields: { slug: 'Elige otro enlace' } };
    }
    console.error('[store.create]', error);
    return { error: 'No pudimos crear la tienda. Inténtalo de nuevo.' };
  }

  try {
    const membership = new StoreMember({
      storeId: store._id,
      userId: user.id,
      role: 'owner',
      permissions: [...STORE_PERMISSIONS],
      status: 'active',
      acceptedAt: now,
    });
    await membership.save();

    if (user.role === 'customer') {
      await User.updateOne({ _id: user.id, role: 'customer' }, { $set: { role: 'owner' } });
    }
  } catch (error) {
    console.error('[store.create] membresía falló, revirtiendo tienda', error);
    await Store.deleteOne({ _id: store._id }).catch(() => undefined);
    return { error: 'No pudimos asociar tu cuenta a la tienda. Inténtalo de nuevo.' };
  }

  await recordAudit({
    actor: user,
    storeId: String(store._id),
    action: 'store.create',
    entityType: 'Store',
    entityId: String(store._id),
    after: { name: store.name, slug: store.slug, category: store.category, theme: theme.key },
  });

  revalidatePath('/explorar');
  redirect(`/tienda/${store.slug}/administracion?bienvenida=1`);
}

/** Datos generales, contacto, redes, WhatsApp y SEO. */
export async function updateStoreSettingsAction(
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'settings', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  let businessHours: unknown;
  try {
    businessHours = JSON.parse(text(formData, 'businessHours') || 'null');
  } catch {
    businessHours = undefined;
  }

  const parsed = storeSettingsSchema.safeParse({
    name: text(formData, 'name'),
    slug: text(formData, 'slug') || undefined,
    description: text(formData, 'description') || null,
    logoUrl: text(formData, 'logoUrl') || null,
    contactPhone: text(formData, 'contactPhone') || null,
    contactEmail: text(formData, 'contactEmail') || null,
    address: text(formData, 'address') || null,
    city: text(formData, 'city') || null,
    instagram: text(formData, 'instagram') || null,
    facebook: text(formData, 'facebook') || null,
    tiktok: text(formData, 'tiktok') || null,
    website: text(formData, 'website') || null,
    whatsappEnabled: checkbox(formData, 'whatsappEnabled'),
    whatsappPhone: text(formData, 'whatsappPhone') || null,
    whatsappTemplate: text(formData, 'whatsappTemplate') || null,
    seoTitle: text(formData, 'seoTitle') || null,
    seoDescription: text(formData, 'seoDescription') || null,
    businessHours,
  });

  if (!parsed.success) {
    return { error: 'Revisa los datos.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const store = access.store;

  if (data.whatsappEnabled && !data.whatsappPhone) {
    return {
      error: 'Para activar los pedidos por WhatsApp necesitas un número.',
      fields: { whatsappPhone: 'Escribe el número de WhatsApp' },
    };
  }

  let nextSlug = store.slug;
  if (data.slug && data.slug !== store.slug) {
    await connectDB();
    const clash = await Store.findOne({ slug: data.slug, _id: { $ne: store._id } })
      .select('_id')
      .lean();
    if (clash) {
      return { error: 'Ese enlace ya está en uso.', fields: { slug: 'Enlace en uso' } };
    }
    nextSlug = data.slug;
  }

  const update: Record<string, unknown> = {
    $set: {
      slug: nextSlug,
      name: data.name,
      description: data.description,
      logoUrl: data.logoUrl,
      contact: {
        phone: data.contactPhone,
        email: data.contactEmail,
        address: data.address,
        city: data.city,
        country: store.contact?.country ?? 'PE',
      },
      social: {
        instagram: data.instagram,
        facebook: data.facebook,
        tiktok: data.tiktok,
        x: store.social?.x ?? null,
        website: data.website,
      },
      'paymentConfig.whatsapp': {
        enabled: data.whatsappEnabled,
        phone: data.whatsappPhone,
        messageTemplate: data.whatsappTemplate ?? store.paymentConfig?.whatsapp?.messageTemplate ?? null,
      },
      seo: {
        title: data.seoTitle,
        description: data.seoDescription,
        ogImageUrl: store.seo?.ogImageUrl ?? null,
      },
      businessHours: data.businessHours ?? store.businessHours ?? [],
    },
  };

  if (nextSlug !== store.slug) {
    update.$addToSet = { slugHistory: store.slug };
  }

  try {
    await Store.updateOne({ _id: store._id }, update);
  } catch (error) {
    console.error('[store.settings]', error);
    return { error: 'No pudimos guardar los cambios.' };
  }

  await recordAudit({
    actor: access.user,
    storeId: String(store._id),
    action: 'store.settings_update',
    entityType: 'Store',
    entityId: String(store._id),
    before: { name: store.name, description: store.description },
    after: { name: data.name, description: data.description },
  });

  revalidatePath(`/tienda/${nextSlug}`);
  revalidatePath(`/tienda/${nextSlug}/administracion/configuracion`);

  if (nextSlug !== store.slug) {
    redirect(`/tienda/${nextSlug}/administracion/configuracion?guardado=1`);
  }

  return { ok: true, message: 'Configuración guardada.' };
}

/** Tema, colores y secciones activas (payload JSON del editor visual). */
export async function updateAppearanceAction(
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'appearance', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text(formData, 'payload') || '{}');
  } catch {
    return { error: 'Datos de apariencia inválidos.' };
  }

  const parsed = appearanceSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Revisa los colores y las secciones.', fields: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const theme = THEMES[data.themeKey];
  if (!theme) {
    return { error: 'Elige un tema válido.' };
  }

  const tokens = compactThemeTokens({
    primary: data.primary ?? undefined,
    accent: data.accent ?? undefined,
    background: data.background ?? undefined,
    foreground: data.foreground ?? undefined,
    radius: data.radius ?? undefined,
  });

  const store = access.store;
  const byKey = new Map(data.sections.map((section) => [section.key, section]));
  const sections: {
    key: string;
    type: string;
    enabled: boolean;
    order: number;
    config: Record<string, unknown>;
  }[] = (store.sections ?? []).map((section) => {
    const current = section.toObject() as {
      key: string;
      type: string;
      enabled: boolean;
      order: number;
      config?: Record<string, unknown> | null;
    };
    const update = byKey.get(current.key);
    return {
      ...current,
      config: current.config ?? {},
      enabled: update ? update.enabled : current.enabled,
      order: update ? update.order : current.order,
    };
  });

  // Si la tienda cambia a un tema con secciones nuevas, se agregan las que falten.
  for (const defaultSection of theme.defaultSections) {
    if (!sections.some((section) => section.key === defaultSection.key)) {
      sections.push({ ...defaultSection });
    }
  }

  try {
    await Store.updateOne(
      { _id: store._id },
      {
        $set: {
          theme: { themeKey: theme.key, tokens: nestThemeTokens(tokens) },
          sections,
        },
      },
    );
  } catch (error) {
    console.error('[store.appearance]', error);
    return { error: 'No pudimos guardar la apariencia.' };
  }

  await recordAudit({
    actor: access.user,
    storeId: String(store._id),
    action: 'store.appearance_update',
    entityType: 'Store',
    entityId: String(store._id),
    before: { themeKey: store.theme?.themeKey, sections: store.sections?.length ?? 0 },
    after: { themeKey: theme.key, sections: sections.length },
  });

  // El DTO del storefront usa 'use cache' + cacheTag(`store-${slug}`).
  // updateTag garantiza read-your-own-writes: el siguiente request al storefront
  // obtiene el themeKey/tokens nuevos (revalidatePath solo no basta para el layout).
  updateTag(`store-${slug}`);
  revalidatePath(`/tienda/${slug}`);
  revalidatePath(`/tienda/${slug}/administracion/apariencia`);

  return { ok: true, message: 'Apariencia actualizada.' };
}

export type TeamFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
  inviteUrl?: string;
};

function parsePermissions(formData: FormData): StorePermission[] {
  const values = formData.getAll('permissions').map(String);
  return values.filter((value): value is StorePermission =>
    (STORE_PERMISSIONS as readonly string[]).includes(value),
  );
}

/** Añade a un usuario ya registrado como staff de la tienda. */
export async function addTeamMemberAction(
  _prevState: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'team', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  const email = text(formData, 'email').toLowerCase();
  const permissions = parsePermissions(formData);

  if (!email) {
    return { error: 'Escribe el correo del trabajador.' };
  }
  if (permissions.length === 0) {
    return { error: 'Elige al menos un permiso.' };
  }

  await connectDB();

  const user = await User.findOne({ email, deletedAt: null }).select('_id role status').lean();
  if (!user) {
    return { error: 'Ese correo no tiene cuenta en mikarpa. Pídele que se registre primero.' };
  }
  if (user.status !== 'active') {
    return { error: 'La cuenta de ese usuario está suspendida.' };
  }

  const existing = await StoreMember.findOne({
    storeId: access.store._id,
    userId: user._id,
  })
    .select('_id status role')
    .lean();

  if (existing && existing.status === 'active') {
    return { error: 'Ese usuario ya trabaja en tu tienda.' };
  }

  try {
    if (existing) {
      await StoreMember.updateOne(
        { _id: existing._id },
        { $set: { role: 'staff', permissions, status: 'active', acceptedAt: new Date() } },
      );
    } else {
      await StoreMember.create({
        storeId: access.store._id,
        userId: user._id,
        role: 'staff',
        permissions,
        status: 'active',
        invitedBy: access.user.id,
        acceptedAt: new Date(),
      });
    }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return { error: 'Ese usuario ya trabaja en tu tienda.' };
    }
    console.error('[team.add]', error);
    return { error: 'No pudimos añadir al trabajador.' };
  }

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'member.invite',
    entityType: 'StoreMember',
    entityId: email,
    after: { email, permissions },
  });

  revalidatePath(`/tienda/${slug}/administracion/trabajadores`);
  return { ok: true, message: 'Trabajador añadido. Debe volver a iniciar sesión para ver el panel.' };
}

export async function inviteTeamMemberAction(
  _prevState: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'team', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  const email = text(formData, 'email').toLowerCase();
  const permissions = parsePermissions(formData);

  if (!email) {
    return { error: 'Escribe el correo del trabajador.' };
  }
  if (permissions.length === 0) {
    return { error: 'Elige al menos un permiso.' };
  }

  await connectDB();

  const user = await User.findOne({ email, deletedAt: null }).select('_id status').lean();
  if (!user) {
    return { error: 'Ese correo no tiene cuenta en mikarpa. Pídele que se registre primero.' };
  }
  if (user.status !== 'active') {
    return { error: 'La cuenta de ese usuario está suspendida.' };
  }

  const existing = await StoreMember.findOne({
    storeId: access.store._id,
    userId: user._id,
  })
    .select('_id status role')
    .lean();

  if (existing && existing.status === 'active') {
    return { error: 'Ese usuario ya trabaja en tu tienda.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    if (existing) {
      await StoreMember.updateOne(
        { _id: existing._id },
        {
          $set: {
            role: 'staff',
            permissions,
            status: 'invited',
            invitedEmail: email,
            invitedBy: access.user.id,
            inviteTokenHash: tokenHash,
            inviteExpiresAt: expiresAt,
            acceptedAt: null,
          },
        },
      );
    } else {
      await StoreMember.create({
        storeId: access.store._id,
        userId: user._id,
        role: 'staff',
        permissions,
        status: 'invited',
        invitedEmail: email,
        invitedBy: access.user.id,
        inviteTokenHash: tokenHash,
        inviteExpiresAt: expiresAt,
      });
    }
  } catch (error) {
    console.error('[team.invite]', error);
    return { error: 'No pudimos crear la invitación.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invitacion/${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? 'mikarpa <onboarding@resend.dev>',
          to: email,
          subject: `Te invitaron a administrar ${access.store.name}`,
          html: `<p>Hola,</p><p>${access.user.name} te invitó a administrar <strong>${access.store.name}</strong> en mikarpa.</p><p><a href="${inviteUrl}">Aceptar invitación</a></p><p>El enlace caduca en 7 días.</p>`,
        }),
      });
    } catch (error) {
      console.error('[team.invite] email', error);
    }
  } else {
    console.info('[team.invite] enlace (sin Resend):', inviteUrl);
  }

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'member.invite',
    entityType: 'StoreMember',
    entityId: email,
    after: { email, permissions, inviteExpiresAt: expiresAt },
  });

  revalidatePath(`/tienda/${slug}/administracion/trabajadores`);
  return {
    ok: true,
    message: 'Invitación creada. Comparte el enlace con el trabajador.',
    inviteUrl,
  };
}

const MEMBER_ID_REGEX = /^[a-f0-9]{24}$/i;

export async function updateTeamMemberAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const access = await requireStoreAccess(slug, 'team', { write: true });
  const memberId = text(formData, 'memberId');

  if (!MEMBER_ID_REGEX.test(memberId)) {
    return;
  }

  const permissions = parsePermissions(formData);
  const status = text(formData, 'status') === 'revoked' ? 'revoked' : 'active';

  const member = await StoreMember.findOne({
    _id: memberId,
    storeId: access.store._id,
    role: 'staff',
  })
    .select('_id userId permissions')
    .lean();

  if (!member) {
    return;
  }

  await StoreMember.updateOne(
    { _id: member._id },
    { $set: { permissions, status } },
  );

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'member.update_permissions',
    entityType: 'StoreMember',
    entityId: memberId,
    before: { permissions: member.permissions },
    after: { permissions, status },
  });

  revalidatePath(`/tienda/${slug}/administracion/trabajadores`);
}

export async function removeTeamMemberAction(formData: FormData): Promise<void> {
  const slug = text(formData, 'slug');
  const access = await requireStoreAccess(slug, 'team', { write: true });
  const memberId = text(formData, 'memberId');

  if (!MEMBER_ID_REGEX.test(memberId)) {
    return;
  }

  const member = await StoreMember.findOne({
    _id: memberId,
    storeId: access.store._id,
    role: 'staff',
  })
    .select('_id userId')
    .lean();

  if (!member) {
    return;
  }

  await StoreMember.updateOne({ _id: member._id }, { $set: { status: 'revoked' } });

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'member.remove',
    entityType: 'StoreMember',
    entityId: memberId,
  });

  revalidatePath(`/tienda/${slug}/administracion/trabajadores`);
}
export async function connectMercadoPagoAction(
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  const slug = text(formData, 'slug');

  let access;
  try {
    access = await requireStoreAccess(slug, 'payments', { write: true });
  } catch (error) {
    return toActionResultError(error);
  }

  const accessToken = text(formData, 'accessToken');
  if (!accessToken) {
    return { error: 'Pega el access token de Mercado Pago.' };
  }

  await connectDB();

  let providerUserId: string;
  try {
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return { error: 'El token no es valido. Verifica en Mercado Pago.' };
    }
    const data = (await response.json()) as { id: number | string };
    providerUserId = String(data.id);
  } catch {
    return { error: 'No pudimos validar el token. Revisa tu conexion.' };
  }

  const encrypted = encryptSecret(accessToken);

  await PaymentAccount.updateOne(
    { storeId: access.store._id },
    {
      $set: {
        provider: 'mercadopago',
        providerUserId,
        accessTokenEnc: encrypted,
        refreshTokenEnc: null,
        tokenExpiresAt: null,
        status: 'active',
        liveMode: !accessToken.startsWith('TEST-'),
        connectedAt: new Date(),
        disconnectedAt: null,
      },
      $setOnInsert: { storeId: access.store._id },
    },
    { upsert: true },
  );

  await Store.updateOne(
    { _id: access.store._id },
    {
      $set: {
        'paymentConfig.online': {
          enabled: true,
          provider: 'mercadopago',
          status: 'active',
          accountId: providerUserId,
          connectedAt: new Date(),
        },
      },
    },
  );

  await recordAudit({
    actor: access.user,
    storeId: String(access.store._id),
    action: 'payment.connect',
    entityType: 'PaymentAccount',
    entityId: providerUserId,
    after: { provider: 'mercadopago', status: 'active' },
  });

  revalidatePath(`/tienda/${slug}/administracion/pagos`);
  return { ok: true, message: 'Mercado Pago conectado correctamente.' };
}
