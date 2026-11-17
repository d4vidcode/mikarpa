import { storefrontThemeTokens } from '@/themes/registry';
import { flattenThemeTokens } from './theme-tokens';
import type {
  PublicCategory,
  PublicProduct,
  PublicProductVariant,
  PublicStore,
  StoreSectionDto,
} from '@/types/storefront';
import type { CategoryDocument } from '@/models/Category';
import type { ProductDocument } from '@/models/Product';
import type { StoreDocument } from '@/models/Store';
import { formatMoney } from './money';

/** Mapea documentos Mongoose a DTOs serializables para el storefront. */

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function toPublicStore(store: StoreDocument): PublicStore {
  const resolvedTokens = storefrontThemeTokens(
    store.theme?.themeKey ?? 'minimal',
    flattenThemeTokens(store.theme?.tokens),
  );

  const sections: StoreSectionDto[] = (store.sections ?? []).map((section) => ({
    key: section.key,
    type: section.type,
    enabled: section.enabled,
    order: section.order,
    config: (section.config as Record<string, unknown>) ?? {},
  }));

  return {
    id: String(store._id),
    name: store.name,
    slug: store.slug,
    description: stringOrNull(store.description),
    logoUrl: stringOrNull(store.logoUrl),
    currency: store.currency,
    locale: store.locale,
    category: store.category,
    themeKey: store.theme?.themeKey ?? 'minimal',
    tokens: resolvedTokens,
    sections,
    contact: {
      phone: stringOrNull(store.contact?.phone),
      email: stringOrNull(store.contact?.email),
      address: stringOrNull(store.contact?.address),
      city: stringOrNull(store.contact?.city),
    },
    social: {
      instagram: stringOrNull(store.social?.instagram),
      facebook: stringOrNull(store.social?.facebook),
      tiktok: stringOrNull(store.social?.tiktok),
      x: stringOrNull(store.social?.x),
      website: stringOrNull(store.social?.website),
    },
    whatsapp: {
      enabled: store.paymentConfig?.whatsapp?.enabled ?? false,
      phone: stringOrNull(store.paymentConfig?.whatsapp?.phone),
      messageTemplate: stringOrNull(store.paymentConfig?.whatsapp?.messageTemplate),
    },
    seo: {
      title: stringOrNull(store.seo?.title),
      description: stringOrNull(store.seo?.description),
      ogImageUrl: stringOrNull(store.seo?.ogImageUrl),
    },
    status: store.status,
  };
}

function toVariant(variant: ProductDocument['variants'][number]): PublicProductVariant {
  const options = (variant.options ?? []).map((option) => ({
    name: option.name,
    value: option.value,
  }));

  return {
    id: String(variant._id),
    sku: stringOrNull(variant.sku),
    options,
    label: options.map((option) => `${option.name} ${option.value}`).join(' / '),
    price: variant.price ?? 0,
    compareAtPrice: variant.compareAtPrice ?? null,
    stock: variant.stock ?? 0,
    imageUrl: stringOrNull(variant.imageUrl),
    active: variant.active ?? true,
  };
}

export function toPublicProduct(product: ProductDocument): PublicProduct {
  const firstImage = product.images?.[0];

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: stringOrNull(product.description),
    descriptionText: stringOrNull(product.descriptionText),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    imageUrl: stringOrNull(firstImage?.url),
    images: (product.images ?? []).map((image) => ({
      url: image.url,
      alt: stringOrNull(image.alt),
    })),
    categoryId: product.categoryId ? String(product.categoryId) : null,
    stock: product.stock ?? 0,
    trackStock: product.trackStock ?? true,
    featured: product.featured ?? false,
    status: product.status,
    sku: stringOrNull(product.sku),
    variants: (product.variants ?? []).map(toVariant),
    createdAt: product.createdAt.toISOString(),
  };
}

export function toPublicCategory(category: CategoryDocument): PublicCategory {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    imageUrl: stringOrNull(category.imageUrl),
    description: stringOrNull(category.description),
  };
}

export function displayPrice(amount: number, currency: string, locale: string): string {
  return formatMoney(amount, currency, locale);
}

/** Stock efectivo: por variante si existen; si no, el del producto. */
export function effectiveStock(product: PublicProduct): number {
  const activeVariants = product.variants.filter((variant) => variant.active);
  if (activeVariants.length > 0) {
    return activeVariants.reduce((total, variant) => total + variant.stock, 0);
  }
  return product.stock;
}
