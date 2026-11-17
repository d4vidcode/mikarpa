'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Carrito multi-tenant en el cliente.
 *
 * Las líneas se agrupan por tienda (`storeSlug`) y la clave es
 * producto + variante. Los precios son solo informativos: el checkout
 * recalcula todo en el servidor.
 */

export type CartLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  qty: number;
  stock: number | null;
  trackStock: boolean;
};

type CartState = {
  carts: Record<string, CartLine[]>;
  add: (storeSlug: string, line: Omit<CartLine, 'qty'> & { qty?: number }) => void;
  setQty: (storeSlug: string, productId: string, variantId: string | null, qty: number) => void;
  remove: (storeSlug: string, productId: string, variantId: string | null) => void;
  clear: (storeSlug: string) => void;
};

export function lineKey(productId: string, variantId: string | null): string {
  return `${productId}::${variantId ?? 'base'}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      carts: {},

      add: (storeSlug, line) =>
        set((state) => {
          const current = state.carts[storeSlug] ?? [];
          const key = lineKey(line.productId, line.variantId);
          const existing = current.find((item) => lineKey(item.productId, item.variantId) === key);
          const qty = Math.max(1, line.qty ?? 1);
          const max = line.trackStock && line.stock !== null ? line.stock : Number.POSITIVE_INFINITY;

          const next = existing
            ? current.map((item) =>
                lineKey(item.productId, item.variantId) === key
                  ? { ...item, qty: Math.min(item.qty + qty, max) }
                  : item,
              )
            : [
                ...current,
                {
                  productId: line.productId,
                  variantId: line.variantId,
                  variantLabel: line.variantLabel,
                  name: line.name,
                  slug: line.slug,
                  imageUrl: line.imageUrl,
                  price: line.price,
                  qty: Math.min(qty, max),
                  stock: line.stock,
                  trackStock: line.trackStock,
                },
              ];

          return { carts: { ...state.carts, [storeSlug]: next } };
        }),

      setQty: (storeSlug, productId, variantId, qty) =>
        set((state) => {
          const current = state.carts[storeSlug] ?? [];
          const key = lineKey(productId, variantId);
          const next = current
            .map((item) => {
              if (lineKey(item.productId, item.variantId) !== key) {
                return item;
              }
              const max = item.trackStock && item.stock !== null ? item.stock : 999;
              return { ...item, qty: Math.min(Math.max(qty, 1), max, 999) };
            })
            .filter((item) => item.qty > 0);

          return { carts: { ...state.carts, [storeSlug]: next } };
        }),

      remove: (storeSlug, productId, variantId) =>
        set((state) => {
          const key = lineKey(productId, variantId);
          const current = state.carts[storeSlug] ?? [];
          return {
            carts: {
              ...state.carts,
              [storeSlug]: current.filter(
                (item) => lineKey(item.productId, item.variantId) !== key,
              ),
            },
          };
        }),

      clear: (storeSlug) =>
        set((state) => ({ carts: { ...state.carts, [storeSlug]: [] } })),
    }),
    {
      name: 'mikarpa-cart',
      version: 1,
    },
  ),
);

export function cartCount(lines: CartLine[] | undefined): number {
  return (lines ?? []).reduce((total, line) => total + line.qty, 0);
}

export function cartSubtotal(lines: CartLine[] | undefined): number {
  return (lines ?? []).reduce((total, line) => total + line.price * line.qty, 0);
}
