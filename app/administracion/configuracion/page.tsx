export const instant = false;
import type { Metadata } from 'next';
import { PlatformSettings, StoreCategory } from '@/models';
import { connectDB } from '@/lib/db';
import { PlatformSettingsForm } from '@/components/admin/platform-settings-form';
import { StoreCategoryForm, type MasterCategoryRow } from '@/components/admin/store-category-form';

export const metadata: Metadata = { title: 'Configuración de plataforma' };

export default async function AdminSettingsPage() {
  await connectDB();

  const [settings, categories] = await Promise.all([
    PlatformSettings.findOne({ key: 'platform' }).lean(),
    StoreCategory.find({}).sort({ order: 1, name: 1 }).lean(),
  ]);

  const rows: MasterCategoryRow[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    icon: category.icon,
    order: category.order ?? 0,
    active: category.active,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca de la plataforma, registro y rubros maestros.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Plataforma</h2>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">
          Estos valores se usan en la landing, el directorio y el wizard de creación de tiendas.
        </p>
        <PlatformSettingsForm
          initial={{
            brandingName: settings?.branding?.name ?? 'mikarpa',
            brandingTagline: settings?.branding?.tagline ?? 'Tu tienda virtual, lista en minutos',
            supportEmail: settings?.branding?.supportEmail ?? '',
            allowOwnerSignup: settings?.signup?.allowOwnerSignup ?? true,
            maintenanceEnabled: settings?.maintenance?.enabled ?? false,
            maintenanceMessage:
              settings?.maintenance?.message ??
              'Estamos haciendo mantenimiento. Volvemos en unos minutos.',
          }}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Rubros maestros</h2>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">
          Clasifican las tiendas en /explorar y alimentan el paso «rubro» del onboarding.
        </p>
        <StoreCategoryForm categories={rows} />
      </section>
    </div>
  );
}
