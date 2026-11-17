'use client';

import { useActionState, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, Check, GripVertical, Loader2, Palette } from 'lucide-react';
import { updateAppearanceAction, type StoreFormState } from '@/lib/actions/stores';
import { Button } from '@/components/ui/button';

export type AppearanceThemeOption = {
  key: string;
  name: string;
  description: string;
  tokens: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    radius: string;
    secondary?: string;
    muted?: string;
  };
};

export type AppearanceSection = {
  key: string;
  type: string;
  label: string;
  enabled: boolean;
};

const initialState: StoreFormState = {};

const RADIUS_OPTIONS = [
  { value: '0rem', label: 'Cuadrado' },
  { value: '0.25rem', label: 'Suave' },
  { value: '0.5rem', label: 'Redondeado' },
  { value: '0.75rem', label: 'Más redondeado' },
  { value: '1rem', label: 'Muy redondeado' },
  { value: '9999px', label: 'Pastilla' },
];

function SortableSectionRow({
  section,
  index,
  total,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  section: AppearanceSection;
  index: number;
  total: number;
  onToggle: (key: string, checked: boolean) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 px-3 py-2.5"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing"
          aria-label={`Arrastrar ${section.label}`}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
        <label className="flex min-w-0 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={section.enabled}
            onChange={(event) => onToggle(section.key, event.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          <span className="truncate">{section.label}</span>
        </label>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
          aria-label={`Subir ${section.label}`}
        >
          <ArrowUp className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
          aria-label={`Bajar ${section.label}`}
        >
          <ArrowDown className="size-3.5" aria-hidden />
        </button>
      </div>
    </li>
  );
}

export function AppearanceForm({
  storeSlug,
  themes,
  initialThemeKey,
  initialColors,
  sections,
  readOnly,
}: {
  storeSlug: string;
  themes: AppearanceThemeOption[];
  initialThemeKey: string;
  initialColors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    radius: string;
  };
  sections: AppearanceSection[];
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateAppearanceAction, initialState);
  const [themeKey, setThemeKey] = useState(initialThemeKey);
  const [colors, setColors] = useState(initialColors);
  const [list, setList] = useState(sections);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: { active: { id: string | number }; over: { id: string | number } | null }) {
    if (!event.over || event.active.id === event.over.id) {
      return;
    }
    setList((items) => {
      const oldIndex = items.findIndex((item) => item.key === event.active.id);
      const newIndex = items.findIndex((item) => item.key === event.over!.id);
      if (oldIndex < 0 || newIndex < 0) {
        return items;
      }
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function selectTheme(theme: AppearanceThemeOption) {
    setThemeKey(theme.key);
    setColors({
      primary: theme.tokens.primary,
      accent: theme.tokens.accent,
      background: theme.tokens.background,
      foreground: theme.tokens.foreground,
      radius: theme.tokens.radius,
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) {
      return;
    }
    const next = [...list];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setList(next);
  }

  const payload = {
    themeKey,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    foreground: colors.foreground,
    radius: colors.radius,
    sections: list.map((section, index) => ({
      key: section.key,
      enabled: section.enabled,
      order: index,
    })),
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="slug" value={storeSlug} />
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <fieldset disabled={readOnly} className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Tema</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            El tema define la estructura visual. Los colores se pueden afinar debajo.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {themes.map((theme) => {
              const selected = theme.key === themeKey;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => selectTheme(theme)}
                  aria-pressed={selected}
                  className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 ${
                    selected
                      ? 'border-transparent ring-2 ring-blue-600 shadow-xl shadow-blue-500/10'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5'
                  }`}
                >
                  {selected ? (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                      <Check className="size-3" aria-hidden />
                      Activo
                    </span>
                  ) : null}

                  {/* Mini browser mockup */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden border-b border-slate-100"
                    style={{ backgroundColor: theme.tokens.background }}
                  >
                    <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">
                      <span className="size-2 rounded-full bg-red-400/80" />
                      <span className="size-2 rounded-full bg-amber-400/80" />
                      <span className="size-2 rounded-full bg-emerald-400/80" />
                      <span
                        className="ml-2 h-2 flex-1 rounded-full"
                        style={{ backgroundColor: theme.tokens.muted }}
                      />
                    </div>

                    <div className="space-y-2 p-3">
                      <div
                        className="h-2.5 w-2/3 rounded-full"
                        style={{ backgroundColor: theme.tokens.primary }}
                      />
                      <div
                        className="h-2 w-1/2 rounded-full"
                        style={{ backgroundColor: theme.tokens.secondary, opacity: 0.6 }}
                      />
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-md"
                            style={{
                              backgroundColor: index === 1 ? theme.tokens.accent : theme.tokens.muted,
                              opacity: index === 1 ? 0.9 : 1,
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="mt-2 h-6 w-20 rounded-md"
                        style={{ backgroundColor: theme.tokens.primary }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{theme.name}</h3>
                      <div className="flex gap-1">
                        {[
                          theme.tokens.primary,
                          theme.tokens.accent,
                          theme.tokens.background,
                          theme.tokens.muted,
                        ].map((color) => (
                          <span
                            key={color}
                            className="size-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                            aria-hidden
                          />
                        ))}
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold">Colores y bordes</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['primary', 'Principal'],
                ['accent', 'Acento'],
                ['background', 'Fondo'],
                ['foreground', 'Texto'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-medium">{label}</span>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background p-1.5">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(event) => setColors({ ...colors, [key]: event.target.value })}
                    className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label={label}
                  />
                  <input
                    value={colors[key]}
                    onChange={(event) => setColors({ ...colors, [key]: event.target.value })}
                    className="h-7 min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
                    aria-label={`${label} (hex)`}
                  />
                </div>
              </label>
            ))}

            <label className="block">
              <span className="mb-1 block text-xs font-medium">Bordes</span>
              <select
                value={colors.radius}
                onChange={(event) => setColors({ ...colors, radius: event.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
              >
                {RADIUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Secciones de la portada</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Activa lo que quieres mostrar y ordena con las flechas.
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={list.map((section) => section.key)} strategy={verticalListSortingStrategy}>
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {list.map((section, index) => (
                  <SortableSectionRow
                    key={section.key}
                    section={section}
                    index={index}
                    total={list.length}
                    onToggle={(key, checked) =>
                      setList((items) =>
                        items.map((item) => (item.key === key ? { ...item, enabled: checked } : item)),
                      )
                    }
                    onMoveUp={(position) => move(position, -1)}
                    onMoveDown={(position) => move(position, 1)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </section>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.message}</p>
      ) : null}

      {readOnly ? null : (
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? 'Guardando…' : 'Guardar apariencia'}
        </Button>
      )}
    </form>
  );
}
