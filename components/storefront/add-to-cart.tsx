'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { useCartStore } from '@/lib/cart-store';
import type { PublicProduct } from '@/types/storefront';

export function AddToCartForm({
  product,
  storeSlug,
  currency,
  locale,
}: {
  product: PublicProduct;
  storeSlug: string;
  currency: string;
  locale: string;
}) {
  const add = useCartStore((state) => state.add);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((item) => item.id === variantId) ?? null;
  const price = variant?.price ?? product.price;
  const stock = product.trackStock ? (variant ? variant.stock : product.stock) : null;
  const soldOut = stock !== null && stock <= 0;
  const maxQty = stock === null ? 999 : Math.max(1, Math.min(stock, 999));

  function handleAdd() {
    if (soldOut) {
      return;
    }

    add(storeSlug, {
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      name: product.name,
      slug: product.slug,
      imageUrl: variant?.imageUrl ?? product.imageUrl,
      price,
      stock,
      trackStock: product.trackStock,
      qty: Math.min(Math.max(qty, 1), maxQty),
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-2xl font-semibold">{formatMoney(price, currency, locale)}</p>
        {product.compareAtPrice && product.compareAtPrice > price ? (
          <p className="text-sm text-neutral-400 line-through">
            {formatMoney(product.compareAtPrice, currency, locale)}
          </p>
        ) : null}
        {stock !== null ? (
          <p className="mt-1 text-xs text-neutral-500">
            {stock > 0 ? `${stock} disponibles` : 'Sin stock'}
          </p>
        ) : null}
      </div>

      {product.variants.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Elige una opción</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((item) => {
              const disabled = product.trackStock && item.stock <= 0;
              const selected = item.id === variantId;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setVariantId(item.id)}
                  aria-pressed={selected}
                  className={`rounded-[var(--store-radius)] border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? 'border-[var(--store-primary)] bg-[var(--store-primary)] text-white'
                      : 'border-[var(--store-fg)]/20 hover:border-[var(--store-primary)]'
                  } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {item.label || 'Única'}
                  {disabled ? ' · agotado' : ''}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-[var(--store-radius)] border border-[var(--store-fg)]/20">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            className="p-2 disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Quitar una unidad"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(maxQty, value + 1))}
            className="p-2 disabled:opacity-40"
            disabled={qty >= maxQty}
            aria-label="Añadir una unidad"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="size-4" aria-hidden /> Añadido
            </>
          ) : soldOut ? (
            'Agotado'
          ) : (
            'Añadir al carrito'
          )}
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Coordinamos el pago y la entrega por WhatsApp al confirmar el pedido.
      </p>
    </div>
  );
}
