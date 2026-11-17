import Image from 'next/image';
import Link from 'next/link';
import type { StoreThemeTokens } from '@/types/storefront';
import type { ThemeDefaultSection, ThemeDefinition } from '../types';
import { CartIndicator } from '@/components/storefront/cart-indicator';

function styleFromTokens(tokens: StoreThemeTokens): React.CSSProperties {
  return {
    '--store-primary': tokens.primary ?? '#111827',
    '--store-accent': tokens.accent ?? '#2563eb',
    '--store-bg': tokens.background ?? '#ffffff',
    '--store-fg': tokens.foreground ?? '#111827',
    '--store-muted': tokens.muted ?? '#f3f4f6',
    '--store-radius': tokens.radius ?? '0.5rem',
    fontFamily: tokens.fontBody ?? undefined,
  } as React.CSSProperties;
}

function StoreShell({
  store,
  children,
}: {
  store: { name: string; slug: string; logoUrl: string | null; tokens: StoreThemeTokens };
  children: React.ReactNode;
}) {
  return (
    <div
      style={styleFromTokens(store.tokens)}
      className="flex min-h-dvh flex-col bg-[var(--store-bg)] text-[var(--store-fg)]"
    >
      <header className="sticky top-0 z-30 border-b border-[var(--store-fg)]/10 bg-[var(--store-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href={`/tienda/${store.slug}`}
            className="flex min-w-0 items-center gap-3"
            aria-label={`${store.name}, inicio`}
          >
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-lg object-cover"
              />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--store-primary)] text-sm font-bold text-white">
                {store.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="truncate text-base font-semibold">{store.name}</span>
          </Link>

          <Link
            href={`/tienda/${store.slug}/carrito`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--store-fg)]/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--store-primary)] hover:text-white"
          >
            Carrito
            <CartIndicator storeSlug={store.slug} />
          </Link>
        </div>
      </header>

      <main id="contenido" className="flex-1">{children}</main>
    </div>
  );
}

const storefrontSections: ThemeDefaultSection[] = [
  {
    key: 'hero',
    type: 'hero',
    enabled: true,
    order: 0,
    config: {
      title: 'Bienvenido a nuestra tienda',
      subtitle: 'Descubre nuestra selección de productos.',
      ctaLabel: 'Ver productos',
    },
  },
  {
    key: 'featured',
    type: 'featured',
    enabled: true,
    order: 1,
    config: { title: 'Destacados', limit: 8 },
  },
  {
    key: 'categories',
    type: 'categories',
    enabled: true,
    order: 2,
    config: { title: 'Categorías' },
  },
  {
    key: 'catalog',
    type: 'catalog',
    enabled: true,
    order: 3,
    config: { title: 'Catálogo', limit: 24 },
  },
  {
    key: 'newArrivals',
    type: 'newArrivals',
    enabled: true,
    order: 4,
    config: { title: 'Novedades', limit: 8 },
  },
  {
    key: 'whatsappFloat',
    type: 'whatsappFloat',
    enabled: true,
    order: 5,
    config: { message: 'Hola, quiero más información' },
  },
  {
    key: 'footer',
    type: 'footer',
    enabled: true,
    order: 6,
    config: { showSocial: true },
  },
];

export const minimalTheme: ThemeDefinition = {
  key: 'minimal',
  name: 'Minimal',
  description: 'Limpio, tipografía grande y mucho aire. Ideal para marcas modernas.',
  tokens: {
    primary: '#111827',
    secondary: '#6b7280',
    accent: '#2563eb',
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f3f4f6',
    radius: '0.5rem',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  },
  defaultSections: storefrontSections,
  Shell: StoreShell,
};

export const boutiqueTheme: ThemeDefinition = {
  key: 'boutique',
  name: 'Boutique',
  description: 'Cálido y editorial, con serif y tarjetas suaves. Para marcas con carácter.',
  tokens: {
    primary: '#7c2d12',
    secondary: '#a16207',
    accent: '#be123c',
    background: '#fffbf5',
    foreground: '#292524',
    muted: '#f5efe6',
    radius: '1rem',
    fontHeading: 'Fraunces',
    fontBody: 'Inter',
  },
  defaultSections: [
    {
      key: 'hero',
      type: 'hero',
      enabled: true,
      order: 0,
      config: {
        title: 'Piezas elegidas con cariño',
        subtitle: 'Una colección pequeña, pensada para durar.',
        ctaLabel: 'Explorar colección',
      },
    },
    {
      key: 'featured',
      type: 'featured',
      enabled: true,
      order: 1,
      config: { title: 'Favoritos', limit: 6 },
    },
    {
      key: 'categories',
      type: 'categories',
      enabled: true,
      order: 2,
      config: { title: 'Categorías' },
    },
    {
      key: 'catalog',
      type: 'catalog',
      enabled: true,
      order: 3,
      config: { title: 'Catálogo', limit: 24 },
    },
    {
      key: 'newArrivals',
      type: 'newArrivals',
      enabled: true,
      order: 4,
      config: { title: 'Recién llegado', limit: 6 },
    },
    {
      key: 'whatsappFloat',
      type: 'whatsappFloat',
      enabled: true,
      order: 5,
      config: { message: 'Hola, quiero más información' },
    },
    {
      key: 'footer',
      type: 'footer',
      enabled: true,
      order: 6,
      config: { showSocial: true },
    },
  ],
  Shell: StoreShell,
};
