'use client';

import { useEffect, useState } from 'react';
import { cartCount, useCartStore } from '@/lib/cart-store';

/** Contador del carrito; evita desajustes de hidratación esperando al montaje. */
export function CartIndicator({ storeSlug }: { storeSlug: string }) {
  const [mounted, setMounted] = useState(false);
  const lines = useCartStore((state) => state.carts[storeSlug]);
  const count = cartCount(lines);

  useEffect(() => {
    // Patrón intencional: el contador del carrito se hidrata tras el montaje.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || count === 0) {
    return null;
  }

  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--store-accent)] text-xs font-semibold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
