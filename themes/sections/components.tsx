import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import type { PublicProduct } from '@/types/storefront';
import { ProductCard } from '@/components/storefront/product-card';

export const heroConfigSchema = z.object({
  title: z.string().trim().max(120).default('Bienvenido a nuestra tienda'),
  subtitle: z.string().trim().max(240).default('Descubre nuestra selección de productos.'),
  ctaLabel: z.string().trim().max(40).default('Ver productos'),
  imageUrl: z.string().trim().max(2048).optional(),
});

export function HeroSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: { store: { name: string; description: string | null } };
}) {
  const parsed = heroConfigSchema.safeParse(config);
  const hero = parsed.success ? parsed.data : heroConfigSchema.parse({});

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4">
      <div className="relative overflow-hidden rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 py-14 text-white sm:px-12 sm:py-20">
        {hero.imageUrl ? (
          <Image
            src={hero.imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none object-cover opacity-25"
            aria-hidden
          />
        ) : null}
        <div className="relative max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{hero.subtitle}</p>
          <Link
            href="#productos"
            className="mt-7 inline-flex h-11 items-center rounded-[var(--store-radius)] bg-white px-6 text-sm font-semibold text-[var(--store-primary)] transition-opacity hover:opacity-90"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </div>
      {data.store.description ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-neutral-600">
          {data.store.description}
        </p>
      ) : null}
    </section>
  );
}

const listConfigSchema = z.object({
  title: z.string().trim().max(80).default('Productos'),
  limit: z.coerce.number().int().min(1).max(24).default(8),
});

export function FeaturedSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: {
    store: { slug: string; currency: string; locale: string };
    products: PublicProduct[];
  };
}) {
  const parsed = listConfigSchema.safeParse(config);
  const { title, limit } = parsed.success ? parsed.data : listConfigSchema.parse({});
  const products = data.products.filter((product) => product.featured).slice(0, limit);

  if (products.length === 0) {
    return null;
  }

  return (
    <section id="productos" className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-xl font-semibold text-[var(--store-fg)] sm:text-2xl">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={data.store.currency}
            locale={data.store.locale}
            storeSlug={data.store.slug}
          />
        ))}
      </div>
    </section>
  );
}

const catalogConfigSchema = z.object({
  title: z.string().trim().max(80).default('Catálogo'),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export function CatalogSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: {
    store: { slug: string; currency: string; locale: string };
    products: PublicProduct[];
  };
}) {
  const parsed = catalogConfigSchema.safeParse(config);
  const { title, limit } = parsed.success ? parsed.data : catalogConfigSchema.parse({});
  const products = data.products.slice(0, limit);

  return (
    <section id="productos" className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-xl font-semibold text-[var(--store-fg)] sm:text-2xl">{title}</h2>
      {products.length === 0 ? (
        <p className="rounded-[var(--store-radius)] border border-dashed border-[var(--store-fg)]/20 px-6 py-12 text-center text-sm text-neutral-500">
          Todavía no hay productos publicados. Vuelve pronto.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={data.store.currency}
              locale={data.store.locale}
              storeSlug={data.store.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function NewArrivalsSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: {
    store: { slug: string; currency: string; locale: string };
    products: PublicProduct[];
  };
}) {
  const parsed = listConfigSchema.safeParse(config);
  const { title, limit } = parsed.success ? parsed.data : listConfigSchema.parse({});
  const products = [...data.products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-xl font-semibold text-[var(--store-fg)] sm:text-2xl">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={data.store.currency}
            locale={data.store.locale}
            storeSlug={data.store.slug}
          />
        ))}
      </div>
    </section>
  );
}

export function CategoriesSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: {
    store: { slug: string };
    categories: { id: string; name: string; slug: string }[];
  };
}) {
  const parsed = z
    .object({ title: z.string().trim().max(80).default('Categorías') })
    .safeParse(config);
  const { title } = parsed.success ? parsed.data : { title: 'Categorías' };

  if (data.categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold text-[var(--store-fg)] sm:text-2xl">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {data.categories.map((category) => (
          <Link
            key={category.id}
            href={`/tienda/${data.store.slug}?categoria=${category.slug}`}
            className="rounded-full border border-[var(--store-fg)]/15 px-4 py-2 text-sm text-[var(--store-fg)] transition-colors hover:bg-[var(--store-primary)] hover:text-white"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FooterSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: {
    store: {
      name: string;
      contact: { phone: string | null; email: string | null; address: string | null; city: string | null };
      social: { instagram: string | null; facebook: string | null; tiktok: string | null; website: string | null };
    };
  };
}) {
  const showSocial = config.showSocial !== false;
  const { contact, social } = data.store;
  const socials = [
    { label: 'Instagram', href: social.instagram },
    { label: 'Facebook', href: social.facebook },
    { label: 'TikTok', href: social.tiktok },
    { label: 'Web', href: social.website },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-12 border-t border-black/5 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <p className="text-base font-semibold text-[var(--store-fg)]">{data.store.name}</p>
          <div className="mt-3 space-y-1 text-sm text-neutral-600">
            {contact.address ? <p>{contact.address}</p> : null}
            {contact.city ? <p>{contact.city}</p> : null}
            {contact.phone ? <p>{contact.phone}</p> : null}
            {contact.email ? <p>{contact.email}</p> : null}
          </div>
        </div>

        {showSocial && socials.length > 0 ? (
          <div className="sm:text-right">
            <p className="text-sm font-medium text-[var(--store-fg)]">Síguenos</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-600 sm:justify-end">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-black/5 py-4 text-center text-xs text-neutral-500">
        © 2026 {data.store.name} · Tienda creada con{' '}
        <Link href="/" className="font-medium underline-offset-4 hover:underline">
          mikarpa
        </Link>
      </div>
    </footer>
  );
}

export function WhatsAppFloatSection({
  config,
  data,
}: {
  config: Record<string, unknown>;
  data: { store: { whatsapp: { enabled: boolean; phone: string | null; messageTemplate: string | null } } };
}) {
  if (!data.store.whatsapp.enabled || !data.store.whatsapp.phone) {
    return null;
  }

  const message =
    typeof config.message === 'string' && config.message.trim()
      ? config.message.trim()
      : (data.store.whatsapp.messageTemplate ?? 'Hola, quiero más información');

  const phone = data.store.whatsapp.phone.replace(/[^\d]/g, '');

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.4-.7-2.3-1.3-3.2-2.8-.2-.4 0-.5.1-.7.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
      </svg>
    </a>
  );
}
