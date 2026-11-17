'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ArrowLeft, ImageIcon, Loader2, Save, Sparkles } from 'lucide-react';
import { saveProductAction, type ProductFormState } from '@/lib/actions/products';
import { parseMoneyInput } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './rich-text-editor';
import { ImageManager } from './image-manager';
import { VariantEditor } from './variant-editor';
import {
  parseOptionValues,
  type MediaDraft,
  type OptionDraft,
  type VariantDraft,
} from './product-types';

export type ProductFormInitial = {
  id: string | null;
  name: string;
  slug: string;
  categoryId: string | null;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: number;
  trackStock: boolean;
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  tagsText: string;
  images: MediaDraft[];
  options: OptionDraft[];
  variants: VariantDraft[];
};

const initialState: ProductFormState = {};

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export function ProductForm({
  storeSlug,
  categories,
  initial,
}: {
  storeSlug: string;
  categories: { id: string; name: string }[];
  initial: ProductFormInitial;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);
  const [form, setForm] = useState(initial);
  const [localError, setLocalError] = useState<string | null>(null);

  const fields = state.fields ?? {};

  function patch(values: Partial<ProductFormInitial>) {
    setForm((current) => ({ ...current, ...values }));
  }

  function buildPayload() {
    const price = parseMoneyInput(form.price);
    const compareAtPrice = form.compareAtPrice ? parseMoneyInput(form.compareAtPrice) : null;

    if (price === null) {
      return { error: 'Escribe un precio válido (ej. 49.90).' } as const;
    }
    if (form.compareAtPrice && compareAtPrice === null) {
      return { error: 'El precio anterior no es válido.' } as const;
    }
    if (compareAtPrice !== null && compareAtPrice <= price) {
      return { error: 'El precio anterior debe ser mayor al precio actual.' } as const;
    }

    const options = form.options
      .map((option) => ({ name: option.name.trim(), values: parseOptionValues(option.valuesText) }))
      .filter((option) => option.name.length > 0 && option.values.length > 0);

    const variants = form.variants.map((variant) => ({
      sku: variant.sku.trim() || null,
      options: variant.options,
      price: variant.price ? parseMoneyInput(variant.price) : null,
      compareAtPrice: variant.compareAtPrice ? parseMoneyInput(variant.compareAtPrice) : null,
      stock: variant.stock,
      imageUrl: variant.imageUrl || null,
      active: variant.active,
    }));

    for (const [index, variant] of variants.entries()) {
      if (variant.price !== null && variant.compareAtPrice !== null && variant.compareAtPrice <= variant.price) {
        return { error: `La variante ${index + 1} tiene un precio anterior menor o igual al precio.` } as const;
      }
      if (variant.price === null && variant.compareAtPrice !== null && variant.compareAtPrice <= price) {
        return { error: `La variante ${index + 1} tiene un precio anterior inválido.` } as const;
      }
    }

    return {
      payload: {
        id: form.id ?? undefined,
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        categoryId: form.categoryId || null,
        description: form.description || null,
        price,
        compareAtPrice,
        sku: form.sku.trim() || null,
        stock: form.stock,
        trackStock: form.trackStock,
        status: form.status,
        featured: form.featured,
        tags: form.tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 20),
        images: form.images.map((image) => ({
          url: image.url,
          publicId: image.publicId ?? null,
          alt: image.alt || null,
          width: image.width ?? null,
          height: image.height ?? null,
        })),
        options,
        variants,
      },
    } as const;
  }

  const built = buildPayload();

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        if ('error' in built) {
          event.preventDefault();
          setLocalError(built.error ?? 'Revisa los datos del producto.');
          return;
        }
        setLocalError(null);
      }}
    >
      <input type="hidden" name="slug" value={storeSlug} />
      <input type="hidden" name="payload" value={'payload' in built ? JSON.stringify(built.payload) : '{}'} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/tienda/${storeSlug}/administracion/productos`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Volver a productos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {initial.id ? 'Editar producto' : 'Nuevo producto'}
          </h1>
        </div>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {pending ? 'Guardando…' : 'Guardar producto'}
        </Button>
      </div>

      {localError || state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError ?? state.error}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Información básica</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nombre del producto" error={fields.name}>
              <input
                value={form.name}
                onChange={(event) => patch({ name: event.target.value })}
                required
                maxLength={200}
                className={inputClass}
                placeholder="Polo oversize de algodón"
              />
            </Field>
          </div>

          <Field label="Categoría" hint="Opcional. Se usa para filtrar en tu tienda.">
            <select
              value={form.categoryId ?? ''}
              onChange={(event) => patch({ categoryId: event.target.value || null })}
              className={inputClass}
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Etiquetas" hint="Separadas por coma: verano, algodón, básicos">
            <input
              value={form.tagsText}
              onChange={(event) => patch({ tagsText: event.target.value })}
              className={inputClass}
              placeholder="verano, algodón"
            />
          </Field>

          <Field label="Enlace (opcional)" hint="Se genera del nombre si lo dejas vacío.">
            <input
              value={form.slug}
              onChange={(event) => patch({ slug: event.target.value })}
              className={inputClass}
              placeholder="polo-oversize-algodon"
            />
          </Field>

          <Field label="SKU" hint="Código interno único (opcional).">
            <input
              value={form.sku}
              onChange={(event) => patch({ sku: event.target.value })}
              className={inputClass}
              placeholder="POLO-001"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Precio y stock</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Precio (S/)" error={fields.price}>
            <input
              value={form.price}
              onChange={(event) => patch({ price: event.target.value })}
              inputMode="decimal"
              required
              className={inputClass}
              placeholder="49.90"
            />
          </Field>

          <Field label="Precio anterior" hint="Para mostrar descuento." error={fields.compareAtPrice}>
            <input
              value={form.compareAtPrice}
              onChange={(event) => patch({ compareAtPrice: event.target.value })}
              inputMode="decimal"
              className={inputClass}
              placeholder="69.90"
            />
          </Field>

          <Field label="Stock" hint={form.variants.length > 0 ? 'Con variantes, el stock se maneja por variante.' : undefined}>
            <input
              type="number"
              min={0}
              max={1_000_000}
              value={form.stock}
              onChange={(event) => patch({ stock: Math.max(0, Number(event.target.value) || 0) })}
              className={inputClass}
            />
          </Field>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.trackStock}
                onChange={(event) => patch({ trackStock: event.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Controlar stock
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Descripción</h2>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          Materiales, medidas y cuidados. Se muestra en la página del producto.
        </p>
        <RichTextEditor value={form.description} onChange={(html) => patch({ description: html })} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">Imágenes</h2>
        </div>
        <div className="mt-4">
          <ImageManager images={form.images} onChange={(images) => patch({ images })} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">Variantes</h2>
        </div>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">
          Tallas, colores o materiales. Cada combinación puede tener su propio precio y stock.
        </p>
        <VariantEditor
          options={form.options}
          variants={form.variants}
          basePrice={form.price}
          onOptionsChange={(options) => patch({ options })}
          onVariantsChange={(variants) => patch({ variants })}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Publicación</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Estado">
            <select
              value={form.status}
              onChange={(event) => patch({ status: event.target.value as ProductFormInitial['status'] })}
              className={inputClass}
            >
              <option value="draft">Borrador (no visible)</option>
              <option value="active">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </Field>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => patch({ featured: event.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Destacar en la portada
            </label>
          </div>
        </div>

        {fields.description ? <p className="mt-2 text-xs text-red-600">{fields.description}</p> : null}
      </section>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {pending ? 'Guardando…' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  );
}
