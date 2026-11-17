'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { Check, Loader2, Pencil, Plus, X } from 'lucide-react';
import {
  saveCategoryAction,
  setCategoryStatusAction,
  type CategoryFormState,
} from '@/lib/actions/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  status: 'active' | 'archived';
  productCount: number;
};

const initialState: CategoryFormState = {};

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export function CategoryManager({
  storeSlug,
  categories,
  writable,
}: {
  storeSlug: string;
  categories: CategoryRow[];
  writable: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  useEffect(() => {
    if (state.ok) {
      // Sincroniza el formulario con el resultado de la Server Action.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(null);
    }
  }, [state.ok]);

  const fields = state.fields ?? {};

  return (
    <div className="space-y-5">
      {writable ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {editing ? `Editar “${editing.name}”` : 'Nueva categoría'}
            </h2>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
                Cancelar
              </button>
            ) : null}
          </div>

          <form key={editing?.id ?? 'new'} action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="slug" value={storeSlug} />
            <input type="hidden" name="categoryId" value={editing?.id ?? ''} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="category-name" className="mb-1 block text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="category-name"
                  name="name"
                  defaultValue={editing?.name ?? ''}
                  required
                  maxLength={80}
                  placeholder="Polos"
                  className={inputClass}
                />
                {fields.name ? <p className="mt-1 text-xs text-red-600">{fields.name}</p> : null}
              </div>

              <div>
                <label htmlFor="category-slug" className="mb-1 block text-sm font-medium">
                  Enlace <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="category-slug"
                  name="categorySlug"
                  defaultValue={editing?.slug ?? ''}
                  placeholder="polos"
                  className={inputClass}
                />
                {fields.categorySlug ? (
                  <p className="mt-1 text-xs text-red-600">{fields.categorySlug}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="category-order" className="mb-1 block text-sm font-medium">
                  Orden
                </label>
                <input
                  id="category-order"
                  name="order"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={editing?.order ?? 0}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="category-description" className="mb-1 block text-sm font-medium">
                  Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="category-description"
                  name="description"
                  defaultValue={editing?.description ?? ''}
                  maxLength={300}
                  className={inputClass}
                />
              </div>
            </div>

            {state.error ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {state.error}
              </p>
            ) : null}
            {state.ok && state.message ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {state.message}
              </p>
            ) : null}

            <Button type="submit" disabled={pending} size="sm">
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : editing ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Plus className="size-3.5" aria-hidden />
              )}
              {pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Añadir categoría'}
            </Button>
          </form>
        </section>
      ) : null}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium">Aún no hay categorías</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Organiza tus productos para que tus clientes encuentren más rápido.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{category.name}</p>
                  {category.status === 'archived' ? <Badge variant="outline">Archivada</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  /{category.slug} · {category.productCount} producto
                  {category.productCount === 1 ? '' : 's'}
                </p>
                {category.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
              </div>

              {writable ? (
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(category)}>
                    <Pencil className="size-3.5" aria-hidden />
                    Editar
                  </Button>

                  <form action={setCategoryStatusAction}>
                    <input type="hidden" name="slug" value={storeSlug} />
                    <input type="hidden" name="categoryId" value={category.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={category.status === 'active' ? 'archived' : 'active'}
                    />
                    {category.status === 'active' ? (
                      <ConfirmButton
                        message={`¿Archivar "${category.name}"? Sus productos quedarán sin categoría.`}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                      >
                        Archivar
                      </ConfirmButton>
                    ) : (
                      <Button type="submit" variant="ghost" size="sm">
                        Reactivar
                      </Button>
                    )}
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
