import type { StoreThemeTokens } from '@/types/storefront';
import { boutiqueTheme, darkTheme, minimalTheme, modernTheme, warmTheme } from './minimal';
import type { ThemeDefinition } from './types';

/**
 * Registro de plantillas de la tienda pública.
 *
 * La BD guarda `themeKey` + overrides de tokens; el código decide qué HTML y
 * estilos se renderizan. Si el key no existe, se usa `minimal` (nunca se rompe).
 * Este registro solo se consume desde /tienda/[slug] (público), nunca desde
 * /administracion ni /tienda/[slug]/administracion.
 */
export const THEMES: Record<string, ThemeDefinition> = {
  minimal: minimalTheme,
  modern: modernTheme,
  boutique: boutiqueTheme,
  dark: darkTheme,
  warm: warmTheme,
};

export const DEFAULT_THEME_KEY = 'minimal';

export function getTheme(key: string): ThemeDefinition {
  return THEMES[key] ?? THEMES[DEFAULT_THEME_KEY] ?? minimalTheme;
}

/** Plantillas disponibles en el selector de Apariencia. */
export function listThemes(): ThemeDefinition[] {
  return Object.values(THEMES);
}

/** Alias semántico: en la UI se llaman "plantillas de página web". */
export const listTemplates = listThemes;

/** Mezcla tokens por defecto de la plantilla con los overrides de la tienda. */
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
