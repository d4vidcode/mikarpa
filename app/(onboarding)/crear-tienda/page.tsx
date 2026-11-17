export const instant = false;
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Store } from 'lucide-react';
import { getSessionUser } from '@/lib/tenant';
import { connectDB } from '@/lib/db';
import { StoreCategory } from '@/models';
import { listThemes } from '@/themes/registry';
import { CreateStoreForm } from './create-store-form';

export const metadata: Metadata = {
  title: 'Crear mi tienda',
  description: 'Elige nombre, enlace, rubro y tema. Tu tienda queda lista en un minuto.',
};

export default async function CreateStorePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/iniciar-sesion?callbackUrl=/crear-tienda');
  }

  await connectDB();

  const categories = await StoreCategory.find({ active: true })
    .sort({ order: 1, name: 1 })
    .select('slug name description')
    .lean();

  const themes = listThemes().map((theme) => ({
    key: theme.key,
    name: theme.name,
    description: theme.description,
    primary: theme.tokens.primary ?? '#111827',
    accent: theme.tokens.accent ?? '#2563eb',
    background: theme.tokens.background ?? '#ffffff',
    foreground: theme.tokens.foreground ?? '#111827',
    radius: theme.tokens.radius ?? '0.5rem',
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="size-4" aria-hidden />
        mikarpa
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Arma tu tienda</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Tres pasos y tu enlace queda listo para compartir. Después podrás subir productos, cambiar
        colores y configurar pagos.
      </p>

      <div className="mt-8">
        <CreateStoreForm
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
            description: category.description ?? null,
          }))}
          themes={themes}
          defaultCategory={categories.some((category) => category.slug === 'ropa') ? 'ropa' : (categories[0]?.slug ?? '')}
        />
      </div>
    </main>
  );
}
