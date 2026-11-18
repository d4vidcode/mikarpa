import Image from 'next/image';
import Link from 'next/link';
import type { StoreThemeTokens } from '@/types/storefront';
import type { ThemeDefaultSection, ThemeDefinition } from '../types';
import { CartIndicator } from '@/components/storefront/cart-indicator';

/* Las fuentes guardadas antes del rediseño se resuelven al sistema único,
   sin romper los overrides que el dueño de la tienda haya elegido. */
const FONT_STACKS: Record<string, string> = {
  Inter: 'var(--font-grotesk), system-ui, sans-serif',
  Fraunces: 'var(--font-grotesk), system-ui, sans-serif',
  'Familjen Grotesk': 'var(--font-grotesk), system-ui, sans-serif',
  'IBM Plex Mono': 'var(--font-plex-mono), ui-monospace, monospace',
};

function fontStack(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return FONT_STACKS[value] ?? value;
}

function styleFromTokens(tokens: StoreThemeTokens): React.CSSProperties {
  return {
    '--store-primary': tokens.primary ?? '#111827',
    '--store-accent': tokens.accent ?? '#2563eb',
    '--store-bg': tokens.background ?? '#ffffff',
    '--store-fg': tokens.foreground ?? '#111827',
    '--store-muted': tokens.muted ?? '#f3f4f6',
    '--store-radius': tokens.radius ?? '12px',
    '--store-font-heading': fontStack(tokens.fontHeading) ?? 'var(--font-grotesk), system-ui, sans-serif',
    '--store-font-body': fontStack(tokens.fontBody) ?? 'var(--font-grotesk), system-ui, sans-serif',
    fontFamily: fontStack(tokens.fontBody) ?? 'var(--font-grotesk), system-ui, sans-serif',
  } as React.CSSProperties;
}

type ShellProps = {
  store: { name: string; slug: string; logoUrl: string | null; tokens: StoreThemeTokens };
  children: React.ReactNode;
};

/** Plantilla 1 · Por defecto: header sticky, logo a la izquierda, carrito a la derecha. */
function StoreShell({ store, children }: ShellProps) {
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

      <main id="contenido" className="flex-1">
        {children}
      </main>
    </div>
  );
}

/** Plantilla 2 · Moderna: barra compacta con buscador y acento de color. */
function ModernShell({ store, children }: ShellProps) {
  return (
    <div
      style={styleFromTokens(store.tokens)}
      className="flex min-h-dvh flex-col bg-[var(--store-bg)] text-[var(--store-fg)]"
    >
      <div className="h-1 w-full bg-[var(--store-primary)]" />
      <header className="sticky top-0 z-30 border-b border-[var(--store-fg)]/10 bg-[var(--store-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href={`/tienda/${store.slug}`} className="flex items-center gap-2" aria-label={`${store.name}, inicio`}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--store-primary)] text-xs font-bold text-white">
              {store.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-base font-semibold tracking-tight">{store.name}</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-[var(--store-fg)]/15 px-4 py-2 text-sm text-[var(--store-fg)]/60">
              Buscar productos…
            </div>
          </div>

          <Link
            href={`/tienda/${store.slug}/carrito`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Carrito
            <CartIndicator storeSlug={store.slug} />
          </Link>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>
    </div>
  );
}

/** Plantilla 3 · Boutique: cabecera editorial centrada, serif y pie de página propio. */
function BoutiqueShell({ store, children }: ShellProps) {
  return (
    <div
      style={styleFromTokens(store.tokens)}
      className="flex min-h-dvh flex-col bg-[var(--store-bg)] text-[var(--store-fg)]"
    >
      <header className="border-b border-[var(--store-fg)]/10 bg-[var(--store-bg)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/tienda/${store.slug}`}
            className="flex items-center justify-center gap-3 sm:justify-start"
            aria-label={`${store.name}, inicio`}
          >
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-11 items-center justify-center rounded-full bg-[var(--store-primary)] font-display text-lg text-white">
                {store.name.slice(0, 1)}
              </span>
            )}
            <span className="font-display text-2xl tracking-tight">{store.name}</span>
          </Link>

          <nav className="flex items-center justify-center gap-6 text-sm">
            <Link
              href={`/tienda/${store.slug}`}
              className="text-[var(--store-fg)]/70 hover:text-[var(--store-primary)]"
            >
              Colección
            </Link>
            <Link
              href={`/tienda/${store.slug}/carrito`}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--store-primary)] px-4 py-2 font-medium text-[var(--store-primary)] hover:bg-[var(--store-primary)] hover:text-white"
            >
              Carrito
              <CartIndicator storeSlug={store.slug} />
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[var(--store-fg)]/10 bg-[var(--store-muted)]/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 text-center text-sm text-[var(--store-fg)]/60">
          © {store.name} · Tienda creada con mikarpa
        </div>
      </footer>
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
  name: 'Predeterminada',
  description: 'Diseño clásico de mikarpa: cabecera fija, logo y carrito. El más versátil.',
  tokens: {
    primary: '#111827',
    secondary: '#6b7280',
    accent: '#2563eb',
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f3f4f6',
    radius: '12px',
    fontHeading: 'Familjen Grotesk',
    fontBody: 'Familjen Grotesk',
  },
  defaultSections: storefrontSections,
  Shell: StoreShell,
};

export const modernTheme: ThemeDefinition = {
  key: 'modern',
  name: 'Moderna',
  description: 'Cabecera compacta con buscador y franja de color. Ideal para tecnología y lifestyle.',
  tokens: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    radius: '12px',
    fontHeading: 'Familjen Grotesk',
    fontBody: 'Familjen Grotesk',
  },
  defaultSections: storefrontSections,
  Shell: ModernShell,
};

export const boutiqueTheme: ThemeDefinition = {
  key: 'boutique',
  name: 'Boutique',
  description: 'Cabecera editorial centrada, tipografía serif y pie de página propio.',
  tokens: {
    primary: '#7c2d12',
    secondary: '#a16207',
    accent: '#be123c',
    background: '#fffbf5',
    foreground: '#292524',
    muted: '#f5efe6',
    radius: '20px',
    fontHeading: 'Familjen Grotesk',
    fontBody: 'Familjen Grotesk',
  },
  defaultSections: storefrontSections.map((section) => {
    if (section.key === 'hero') {
      return {
        ...section,
        config: {
          title: 'Piezas elegidas con cariño',
          subtitle: 'Una colección pequeña, pensada para durar.',
          ctaLabel: 'Explorar colección',
        },
      };
    }
    if (section.key === 'featured') {
      return { ...section, config: { title: 'Favoritos', limit: 6 } };
    }
    if (section.key === 'newArrivals') {
      return { ...section, config: { title: 'Recién llegado', limit: 6 } };
    }
    return section;
  }),
  Shell: BoutiqueShell,
};

export const darkTheme: ThemeDefinition = {
  key: 'dark',
  name: 'Oscura',
  description: 'Variante oscura de la plantilla por defecto, con acentos vivos.',
  tokens: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#38bdf8',
    background: '#10131a',
    foreground: '#f7f8fa',
    muted: '#1d2027',
    radius: '12px',
    fontHeading: 'Familjen Grotesk',
    fontBody: 'Familjen Grotesk',
  },
  defaultSections: storefrontSections,
  Shell: StoreShell,
};

export const warmTheme: ThemeDefinition = {
  key: 'warm',
  name: 'Cálida',
  description: 'Variante cálida de la plantilla por defecto, con tonos tierra.',
  tokens: {
    primary: '#b45309',
    secondary: '#78716c',
    accent: '#dc2626',
    background: '#fef7ed',
    foreground: '#292524',
    muted: '#fde68a',
    radius: '20px',
    fontHeading: 'Familjen Grotesk',
    fontBody: 'Familjen Grotesk',
  },
  defaultSections: storefrontSections,
  Shell: StoreShell,
};
