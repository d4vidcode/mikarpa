import { getCachedStore } from '@/lib/cache/store';
import { getTheme } from '@/themes/registry';

/**
 * Layout exclusivo de la tienda PÚBLICA (/tienda/[slug]).
 *
 * Al vivir dentro del route group `(tienda)`, este Shell NO envuelve
 * /tienda/[slug]/administracion/*. Por eso la plantilla elegida cambia solo
 * la página pública y nunca el panel.
 */
export default async function PublicStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getCachedStore(slug);

  // El layout padre ya validó existencia/estado; aquí solo necesitamos el DTO.
  if (!store) {
    return <>{children}</>;
  }

  const Shell = getTheme(store.themeKey).Shell;
  return <Shell store={store}>{children}</Shell>;
}
