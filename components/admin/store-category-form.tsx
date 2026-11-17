'use client';

import { useActionState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { saveStoreCategoryAction, type AdminFormState } from '@/lib/actions/admin';
import { MASTER_CATEGORY_ICONS } from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const initialState: AdminFormState = {};

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export type MasterCategoryRow = {
  slug: string;
  name: string;
  icon: string;
  order: number;
  active: boolean;
};

export function StoreCategoryForm({ categories }: { categories: MasterCategoryRow[] }) {
  const [state, formAction, pending] = useActionState(saveStoreCategoryAction, initialState);
  const fields = state.fields ?? {};

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nombre</span>
            <input name="name" required maxLength={60} placeholder="Ropa" className={inputClass} />
            {fields.name ? <span className="mt-1 block text-xs text-red-600">{fields.name}</span> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Slug</span>
            <input
              name="slug"
              required
              maxLength={48}
              placeholder="ropa"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Usa el mismo slug para editar un rubro existente.
            </span>
            {fields.slug ? <span className="mt-1 block text-xs text-red-600">{fields.slug}</span> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Icono</span>
            <select name="icon" defaultValue="package" className={inputClass}>
              {MASTER_CATEGORY_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Orden</span>
            <input name="order" type="number" min={0} max={999} defaultValue={0} className={inputClass} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="size-4 accent-[var(--color-primary)]"
          />
          Activo en el directorio y en el wizard
        </label>

        {state.error ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>
        ) : null}

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
          {pending ? 'Guardando…' : 'Guardar rubro'}
        </Button>
      </form>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {categories.map((category) => (
          <li key={category.slug} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                /{category.slug} · icono {category.icon} · orden {category.order}
              </p>
            </div>
            {category.active ? <Badge variant="success">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}
