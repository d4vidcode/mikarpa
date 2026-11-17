/** DTOs serializables que viajan del servidor al storefront. */

export type StoreThemeTokens = {
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
  background?: string | null;
  foreground?: string | null;
  muted?: string | null;
  radius?: string | null;
  fontHeading?: string | null;
  fontBody?: string | null;
};

export type StoreSectionDto = {
  key: string;
  type: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
};

export type PublicStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  currency: string;
  locale: string;
  category: string;
  themeKey: string;
  tokens: StoreThemeTokens;
  sections: StoreSectionDto[];
  contact: {
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
  };
  social: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    x: string | null;
    website: string | null;
  };
  whatsapp: { enabled: boolean; phone: string | null; messageTemplate: string | null };
  seo: { title: string | null; description: string | null; ogImageUrl: string | null };
  status: 'active' | 'suspended' | 'archived';
};

export type PublicProductVariant = {
  id: string;
  sku: string | null;
  options: { name: string; value: string }[];
  label: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  active: boolean;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  descriptionText: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: { url: string; alt: string | null }[];
  categoryId: string | null;
  stock: number;
  trackStock: boolean;
  featured: boolean;
  status: 'draft' | 'active' | 'archived';
  sku: string | null;
  variants: PublicProductVariant[];
  createdAt: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
};

export type StorefrontData = {
  store: PublicStore;
  products: PublicProduct[];
  categories: PublicCategory[];
};
