import type { StoreThemeTokens } from '@/types/storefront';

/**
 * La base de datos guarda los tokens anidados (`colors`, `fonts`, `radius`)
 * porque así los comparte el modelo Theme y el override de Store.
 * El storefront, en cambio, los consume planos para armar variables CSS.
 */

export type NestedThemeTokens = {
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
    foreground?: string | null;
    muted?: string | null;
  } | null;
  fonts?: { heading?: string | null; body?: string | null } | null;
  radius?: string | null;
};

function clean(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

/** Acepta el formato anidado (actual) y el plano (por compatibilidad). */
export function flattenThemeTokens(input: unknown): StoreThemeTokens {
  const source = (input ?? {}) as Record<string, unknown>;
  const colors = (source.colors ?? {}) as Record<string, unknown>;
  const fonts = (source.fonts ?? {}) as Record<string, unknown>;

  return {
    primary: clean(colors.primary) ?? clean(source.primary),
    secondary: clean(colors.secondary) ?? clean(source.secondary),
    accent: clean(colors.accent) ?? clean(source.accent),
    background: clean(colors.background) ?? clean(source.background),
    foreground: clean(colors.foreground) ?? clean(source.foreground),
    muted: clean(colors.muted) ?? clean(source.muted),
    radius: clean(source.radius),
    fontHeading: clean(fonts.heading) ?? clean(source.fontHeading),
    fontBody: clean(fonts.body) ?? clean(source.fontBody),
  };
}

/** Descarta valores vacíos para no sobreescribir los defaults del tema. */
export function compactThemeTokens(tokens: StoreThemeTokens): StoreThemeTokens {
  const result: StoreThemeTokens = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      result[key as keyof StoreThemeTokens] = value;
    }
  }
  return result;
}

export function nestThemeTokens(tokens: StoreThemeTokens): NestedThemeTokens {
  return {
    colors: {
      primary: tokens.primary ?? null,
      secondary: tokens.secondary ?? null,
      accent: tokens.accent ?? null,
      background: tokens.background ?? null,
      foreground: tokens.foreground ?? null,
      muted: tokens.muted ?? null,
    },
    fonts: {
      heading: tokens.fontHeading ?? null,
      body: tokens.fontBody ?? null,
    },
    radius: tokens.radius ?? null,
  };
}
