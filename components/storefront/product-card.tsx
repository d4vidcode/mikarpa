'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/money';
import type { PublicProduct } from '@/types/storefront';

export function ProductCard({
  product,
  currency,
  locale,
  storeSlug,
}: {
  product: PublicProduct;
  currency: string;
  locale: string;
  storeSlug: string;
}) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;
  const soldOut = product.trackStock && product.stock <= 0 && product.variants.length === 0;

  const imageSrc = product.imageUrl
    ? product.imageUrl.includes('res.cloudinary.com') && product.imageUrl.includes('/upload/')
      ? product.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,c_scale,w_800/')
      : product.imageUrl
    : null;

  return (
    <div className="group dealt-card">
      <Link
        href={`/tienda/${storeSlug}/producto/${product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-[var(--store-radius)] border border-[var(--store-fg)]/10 bg-[var(--store-bg)] shadow-sm"
      >
        <div className="dealt-zoom relative aspect-square overflow-hidden bg-[var(--store-muted)]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              width={600}
              height={600}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground/60">
              Sin imagen
            </div>
          )}
          {discount !== null && discount > 0 ? (
            <span className="absolute top-2 left-2 rounded-[var(--r-xs)] bg-[var(--store-accent)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
              -{discount}%
            </span>
          ) : null}
          {soldOut ? (
            <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center font-mono text-[10px] font-medium text-white">
              Agotado
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 p-3">
          <h3 className="line-clamp-2 text-[12px] leading-snug font-medium text-[var(--store-fg)]">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-1.5 pt-1.5">
            <span className="num text-[13px] font-semibold tracking-tight text-[var(--store-fg)]">
              {formatMoney(product.price, currency, locale)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="num text-[10px] text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice, currency, locale)}
              </span>
            ) : null}
          </div>
          {product.variants.length > 0 ? (
            <span className="font-mono text-[10px] text-muted-foreground">
              {product.variants.length} variante{product.variants.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
