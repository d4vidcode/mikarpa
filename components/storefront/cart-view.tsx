'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { cartSubtotal, useCartStore } from '@/lib/cart-store';
import { formatMoney } from '@/lib/money';

type CheckoutSuccess = {
  orderNumber: number;
  whatsappUrl: string | null;
};

export function CartView({
  storeSlug,
  storeName,
  currency,
  locale,
}: {
  storeSlug: string;
  storeName: string;
  currency: string;
  locale: string;
}) {
  const lines = useCartStore((state) => state.carts[storeSlug]) ?? [];
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);

  const subtotal = cartSubtotal(lines);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (lines.length === 0) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      items: lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        qty: line.qty,
      })),
      customer: {
        name: String(formData.get('name') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim() || null,
        address: String(formData.get('address') ?? '').trim() || null,
        city: String(formData.get('city') ?? '').trim() || null,
        documentId: String(formData.get('documentId') ?? '').trim() || null,
      },
      notes: String(formData.get('notes') ?? '').trim() || null,
    };

    setPending(true);

    try {
      const response = await fetch(`/api/tienda/${storeSlug}/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as
        | { ok: true; data: { orderNumber: number; whatsappUrl: string | null } }
        | { ok: false; error: { message: string } };

      if (!response.ok || !json.ok) {
        setError(!json.ok ? json.error.message : 'No se pudo crear el pedido.');
        return;
      }

      clear(storeSlug);
      setSuccess(json.data);
    } catch {
      setError('No pudimos conectar con la tienda. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
        <div className="rounded-[var(--store-radius)] border border-black/10 bg-white p-8">
          <p className="text-sm font-medium text-emerald-600">Pedido registrado</p>
          <h1 className="mt-2 text-2xl font-semibold">Pedido #{success.orderNumber}</h1>
          <p className="mt-3 text-sm text-neutral-600">
            Guardamos tu pedido en {storeName}. Envíanos el mensaje por WhatsApp para coordinar el
            pago y la entrega.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {success.whatsappUrl ? (
              <a
                href={success.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--store-radius)] bg-[#25D366] px-6 text-sm font-semibold text-white"
              >
                <MessageCircle className="size-4" aria-hidden />
                Confirmar por WhatsApp
              </a>
            ) : null}
            <Link
              href={`/tienda/${storeSlug}/pedido/${success.orderNumber}`}
              className="inline-flex h-11 items-center justify-center rounded-[var(--store-radius)] border border-black/10 px-6 text-sm font-medium"
            >
              Ver detalle del pedido
            </Link>
            <Link
              href={`/tienda/${storeSlug}`}
              className="text-sm text-neutral-500 underline-offset-4 hover:underline"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Explora el catálogo de {storeName} y añade productos.
        </p>
        <Link
          href={`/tienda/${storeSlug}`}
          className="mt-6 inline-flex h-11 items-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-semibold text-white"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <h1 className="text-2xl font-semibold">Tu carrito</h1>
        <ul className="mt-6 divide-y divide-black/5 rounded-[var(--store-radius)] border border-black/10 bg-white">
          {lines.map((line) => (
            <li key={`${line.productId}:${line.variantId ?? 'base'}`} className="flex gap-4 p-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt={line.name}
                    width={160}
                    height={160}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/tienda/${storeSlug}/producto/${line.productId}`}
                  className="line-clamp-2 text-sm font-medium hover:underline"
                >
                  {line.name}
                </Link>
                {line.variantLabel ? (
                  <p className="mt-0.5 text-xs text-neutral-500">{line.variantLabel}</p>
                ) : null}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-md border border-black/10">
                    <button
                      type="button"
                      onClick={() =>
                        setQty(storeSlug, line.productId, line.variantId, line.qty - 1)
                      }
                      className="p-1.5"
                      aria-label="Quitar una unidad"
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <span className="min-w-7 text-center text-xs font-medium">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQty(storeSlug, line.productId, line.variantId, line.qty + 1)
                      }
                      className="p-1.5"
                      aria-label="Añadir una unidad"
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatMoney(line.price * line.qty, currency, locale)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(storeSlug, line.productId, line.variantId)}
                      className="text-neutral-400 hover:text-red-600"
                      aria-label={`Quitar ${line.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-[var(--store-radius)] bg-[var(--store-muted)] px-4 py-3 text-sm">
          <span className="font-medium">Subtotal</span>
          <span className="text-base font-semibold">{formatMoney(subtotal, currency, locale)}</span>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          El envío y el método de pago se coordinan por WhatsApp.
        </p>
      </section>

      <section className="rounded-[var(--store-radius)] border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Tus datos</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium">
              Nombre y apellido *
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs font-medium">
                WhatsApp *
              </label>
              <input
                id="phone"
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="987654321"
                className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block text-xs font-medium">
              Dirección de entrega
            </label>
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="mb-1 block text-xs font-medium">
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                autoComplete="address-level2"
                defaultValue="Lima"
                className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
              />
            </div>
            <div>
              <label htmlFor="documentId" className="mb-1 block text-xs font-medium">
                DNI / RUC
              </label>
              <input
                id="documentId"
                name="documentId"
                inputMode="numeric"
                className="h-10 w-full rounded-md border border-black/15 px-3 text-sm outline-none focus:border-[var(--store-primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-xs font-medium">
              Notas para la tienda
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--store-primary)]"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-[var(--store-radius)] bg-[var(--store-primary)] px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Creando pedido…' : 'Hacer pedido por WhatsApp'}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-neutral-500">
            Al confirmar aceptas que la tienda se comunique contigo por WhatsApp.
          </p>
        </form>
      </section>
    </div>
  );
}
