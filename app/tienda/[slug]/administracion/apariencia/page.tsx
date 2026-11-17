import type { Metadata } from 'next';
import { requireStoreAccess } from '@/lib/tenant';
import { getTheme, listTemplates } from '@/themes/registry';
import { flattenThemeTokens } from '@/lib/theme-tokens';
import { getSectionDefinition } from '@/themes/sections/registry';
import { AppearanceForm } from '@/components/admin/appearance-form';

export const metadata: Metadata = { title: 'Apariencia' };

export const instant = false;

export default async function AppearancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await requireStoreAccess(slug, 'appearance');
  const store = access.store;

  const currentTemplateKey = store.theme?.themeKey ?? 'minimal';
  const template = getTheme(currentTemplateKey);
  const overrides = flattenThemeTokens(store.theme?.tokens);

  const colors = {
    primary: overrides.primary ?? template.tokens.primary ?? '#111827',
    accent: overrides.accent ?? template.tokens.accent ?? '#2563eb',
    background: overrides.background ?? template.tokens.background ?? '#ffffff',
    foreground: overrides.foreground ?? template.tokens.foreground ?? '#111827',
    radius: overrides.radius ?? template.tokens.radius ?? '0.5rem',
  };

  const templates = listTemplates().map((item) => ({
    key: item.key,
    name: item.name,
    description: item.description,
    tokens: {
      primary: item.tokens.primary ?? '#111827',
      accent: item.tokens.accent ?? '#2563eb',
      background: item.tokens.background ?? '#ffffff',
      foreground: item.tokens.foreground ?? '#111827',
      radius: item.tokens.radius ?? '0.5rem',
      secondary: item.tokens.secondary ?? '#6b7280',
      muted: item.tokens.muted ?? '#f3f4f6',
    },
  }));

  // Se listan las secciones guardadas + las de la plantilla actual que aún no existan.
  const sections = [...(store.sections ?? [])].map((section) => ({
    key: section.key,
    type: section.type,
    label: getSectionDefinition(section.type)?.label ?? section.type,
    enabled: section.enabled,
  }));

  for (const defaultSection of template.defaultSections) {
    if (!sections.some((section) => section.key === defaultSection.key)) {
      sections.push({
        key: defaultSection.key,
        type: defaultSection.type,
        label: getSectionDefinition(defaultSection.type)?.label ?? defaultSection.type,
        enabled: defaultSection.enabled,
      });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apariencia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige la plantilla, los colores y las secciones de tu tienda.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Estos cambios solo afectan la vista pública (/tienda/{slug}). El panel de administración
          mantiene el diseño de mikarpa.
        </p>
      </div>

      <AppearanceForm
        storeSlug={slug}
        templates={templates}
        initialTemplateKey={currentTemplateKey}
        initialColors={colors}
        sections={sections}
        readOnly={access.readOnly}
      />
    </div>
  );
}
