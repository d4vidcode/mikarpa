import type { StoreThemeTokens } from '@/types/storefront';
import { boutiqueTheme, darkTheme, minimalTheme, modernTheme, warmTheme } from './minimal';
import type { ThemeDefinition } from './types';

/**
 * Registry de temas.
 *
 * La base de datos guarda `themeKey` + overrides de tokens; el código decide
 * cómo se ve. Si el key no existe, se usa `minimal` (nunca se rompe el render).
 */
export const THEMES: Record<string, ThemeDefinition> = {
  minimal: minimalTheme,
  boutique: boutiqueTheme,
  modern: modernTheme,
  dark: darkTheme,
  warm: warmTheme,
};

export const DEFAULT_THEME_KEY = 'minimal';

export function getTheme(key: string): ThemeDefinition {
  return THEMES[key] ?? THEMES[DEFAULT_THEME_KEY] ?? minimalTheme;
}

export function listThemes(): ThemeDefinition[] {
  return Object.values(THEMES);
}

/** Mezcla tokens por defecto del tema con los overrides de la tienda. */
export function storefrontThemeTokens(
  themeKey: string,
  overrides?: StoreThemeTokens | null,
): StoreThemeTokens {
  const base = getTheme(themeKey).tokens;
  const merged: StoreThemeTokens = { ...base };

  if (overrides) {
    for (const key of Object.keys(overrides) as (keyof StoreThemeTokens)[]) {
      const value = overrides[key];
      if (value !== null && value !== undefined && value !== '') {
        merged[key] = value;
      }
    }
  }

  return merged;
}
