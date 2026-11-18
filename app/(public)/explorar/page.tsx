export const instant = false;
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search, Store as StoreIcon } from 'lucide-react';
import { Store, StoreCategory } from '@/models';
import { connectDB } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Explorar tiendas',
  description: 'Descubre tiendas peruanas: moda, hogar, tecnología, comida y más.',
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rubro?: string; denied?: string; orden?: string; pagina?: string }>;
}) {
  const query = await searchParams;
  const search = query.q?.trim() ?? '';
  const rubro = query.rubro?.trim() ?? '';
  const orden = query.orden === 'nombre' ? 'nombre' : 'recientes';
  const page = Math.max(1, Number(query.pagina) || 1);
  const pageSize = 12;

  await connectDB();

  const categories = await StoreCategory.find({ active: true }).sort({ order: 1, name: 1 }).lean();

  const filter: Record<string, unknown> = { status: 'active', deletedAt: null };
  if (rubro) {
    filter.category = rubro;
  }
  if (search) {
    filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const sortSpec = (orden === 'nombre' ? { name: 1 } : { createdAt: -1 }) as Record<string, 1 | -1>;

  const [total, stores] = await Promise.all([
    Store.countDocuments(filter),
    Store.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('name slug description logoUrl category createdAt')
      .lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const categoryName = new Map(categories.map((category) => [category.slug, category.name]));

  return (
    <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Explora tiendas</h1>
        <p className="mt-2 text-muted-foreground">
          Marcas peruanas con catálogo online y pedidos directos por WhatsApp.
        </p>
      </div>

      {query.denied ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No tienes acceso al panel de{' '}
          <span className="font-medium">/tienda/{query.denied}</span>. Si eres parte del equipo, pide
          acceso al propietario o inicia sesión con tu cuenta.
        </div>
      ) : null}

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar tiendas por nombre…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          name="rubro"
          defaultValue={rubro}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="">Todos los rubros</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="orden"
          defaultValue={orden}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
        >
          <option value="recientes">Más recientes</option>
          <option value="nombre">Nombre A-Z</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/explorar${search ? `?q=${encodeURIComponent(search)}` : ''}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            rubro ? 'border-border text-muted-foreground hover:bg-accent' : 'border-primary bg-primary text-primary-foreground'
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => {
          const active = category.slug === rubro;
          return (
            <Link
              key={category.slug}
              href={`/explorar?rubro=${category.slug}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {stores.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium">No encontramos tiendas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro rubro o crea la tuya en pocos minutos.
          </p>
          <Link
            href="/registrarse"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Crear mi tienda
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <li key={String(store._id)}>
              <Link
                href={`/tienda/${store.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3 border-b border-border p-4">
                  {store.logoUrl ? (
                    <Image
                      src={store.logoUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                      {store.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold group-hover:underline">{store.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {categoryName.get(store.category) ?? store.category}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {store.description ?? 'Catálogo online con pedidos por WhatsApp.'}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    Ver tienda
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
            const params = new URLSearchParams();
            if (search) params.set('q', search);
            if (rubro) params.set('rubro', rubro);
            if (orden) params.set('orden', orden);
            params.set('pagina', String(pageNumber));
            return (
              <Link
                key={pageNumber}
                href={`/explorar?${params.toString()}`}
                aria-current={pageNumber === page ? 'page' : undefined}
                className={`inline-flex size-9 items-center justify-center rounded-md border text-sm font-medium ${
                  pageNumber === page
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <section className="mt-14 rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
        <StoreIcon className="mx-auto size-6 text-muted-foreground" aria-hidden />
        <h2 className="mt-3 text-xl font-semibold">¿Tienes una marca?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Crea tu catálogo, comparte tu enlace y recibe pedidos por WhatsApp sin pagar comisiones.
        </p>
        <Link
          href="/registrarse"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Empezar gratis
        </Link>
      </section>
    </main>
  );
}
