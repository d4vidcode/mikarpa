import type { ComponentType } from 'react';
import type { StorefrontData, StoreThemeTokens } from '@/types/storefront';

export type SectionComponentProps = {
  /** Config de la sección; cada componente la valida con su propio schema. */
  config: Record<string, unknown>;
  data: StorefrontData;
};

export type SectionDefinition = {
  type: string;
  label: string;
  /** Defaults cuando la tienda no tiene config guardada. */
  defaults: Record<string, unknown>;
  Component: ComponentType<SectionComponentProps>;
};

/** Sección copiada a Store.sections al crear una tienda. */
export type ThemeDefaultSection = {
  key: string;
  type: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
};

export type ThemeDefinition = {
  key: string;
  name: string;
  description: string;
  tokens: StoreThemeTokens;
  /** Secciones iniciales del storefront (se pueden reordenar/desactivar). */
  defaultSections: ThemeDefaultSection[];
  Shell: ComponentType<{ store: StorefrontData['store']; children: React.ReactNode }>;
};
