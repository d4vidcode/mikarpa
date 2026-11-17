import type { SectionDefinition } from '../types';
import {
  CatalogSection,
  CategoriesSection,
  FeaturedSection,
  FooterSection,
  HeroSection,
  NewArrivalsSection,
  WhatsAppFloatSection,
} from './components';

/**
 * Registry de secciones disponibles.
 *
 * Añadir una sección = añadir una entrada aquí + su componente. No requiere
 * migración: las secciones desconocidas se omiten al renderizar.
 */
export const SECTIONS: Record<string, SectionDefinition> = {
  hero: {
    type: 'hero',
    label: 'Portada',
    defaults: {
      title: 'Bienvenido a nuestra tienda',
      subtitle: 'Descubre nuestra selección de productos.',
      ctaLabel: 'Ver productos',
    },
    Component: HeroSection as SectionDefinition['Component'],
  },
  featured: {
    type: 'featured',
    label: 'Destacados',
    defaults: { title: 'Destacados', limit: 8 },
    Component: FeaturedSection as SectionDefinition['Component'],
  },
  categories: {
    type: 'categories',
    label: 'Categorías',
    defaults: { title: 'Categorías' },
    Component: CategoriesSection as SectionDefinition['Component'],
  },
  catalog: {
    type: 'catalog',
    label: 'Catálogo completo',
    defaults: { title: 'Catálogo', limit: 24 },
    Component: CatalogSection as SectionDefinition['Component'],
  },
  newArrivals: {
    type: 'newArrivals',
    label: 'Novedades',
    defaults: { title: 'Novedades', limit: 8 },
    Component: NewArrivalsSection as SectionDefinition['Component'],
  },
  whatsappFloat: {
    type: 'whatsappFloat',
    label: 'Botón WhatsApp',
    defaults: { message: 'Hola, quiero más información' },
    Component: WhatsAppFloatSection as SectionDefinition['Component'],
  },
  footer: {
    type: 'footer',
    label: 'Pie de página',
    defaults: { showSocial: true },
    Component: FooterSection as SectionDefinition['Component'],
  },
};

export function getSectionDefinition(type: string): SectionDefinition | null {
  return SECTIONS[type] ?? null;
}

export function listSectionDefinitions(): SectionDefinition[] {
  return Object.values(SECTIONS);
}

/** Orden por defecto al crear una tienda nueva. */
export function getDefaultSections(): SectionDefinition[] {
  const order = ['hero', 'featured', 'categories', 'catalog', 'newArrivals', 'whatsappFloat', 'footer'];
  return order.flatMap((type) => {
    const definition = SECTIONS[type];
    return definition ? [definition] : [];
  });
}
