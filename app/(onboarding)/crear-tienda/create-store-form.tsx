'use client';

import { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { Check, Loader2, Sparkles, X } from 'lucide-react';
import { createStoreAction, type StoreFormState } from '@/lib/actions/stores';
import { Button } from '@/components/ui/button';

type CategoryOption = { slug: string; name: string; description: string | null };
type ThemeOption = {
  key: string;
  name: string;
  description: string;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  radius: string;
};

const initialState: StoreFormState = {};

function slugifyClient(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function CreateStoreForm({
  categories,
  themes,
  defaultCategory,
}: {
  categories: CategoryOption[];
  themes: ThemeOption[];
  defaultCategory: string;
}) {
  const [state, formAction, pending] = useActionState(createStoreAction, initialState);
  const fields = state.fields ?? {};

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [themeKey, setThemeKey] = useState(themes[0]?.key ?? 'minimal');

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mientras el usuario no edite el enlace, se deriva del nombre (sin effects).
  const visibleSlug = slugTouched ? slug : slugifyClient(name);
  const effectiveSlug = useMemo(() => slugifyClient(visibleSlug), [visibleSlug]);
  const shownStatus = effectiveSlug.length < 3 ? 'idle' : slugStatus;

  useEffect(() => {
    if (effectiveSlug.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const response = await fetch(`/api/slugs?slug=${encodeURIComponent(effectiveSlug)}`, {
          signal: controller.signal,
        });
        const json = (await response.json()) as
          | { ok: true; data: { available: boolean; suggested?: string[]; suggestions?: string[] } }
          | { ok: false; error: { message: string } };

        if (!json.ok) {
          setSlugStatus('idle');
          return;
        }

        setSlugStatus(json.data.available ? 'free' : 'taken');
        setSuggestions(json.data.suggestions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSlugStatus('idle');
        }
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [effectiveSlug]);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">1. Tu marca</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El nombre y el enlace con los que te encontrarán tus clientes.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nombre de la tienda
            </label>
            <input
              id="name"
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Casa Lino"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
            {fields.name ? <p className="mt-1 text-xs text-red-600">{fields.name}</p> : null}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              Enlace de tu tienda
            </label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                mikarpa.xyz/tienda/
              </span>
              <input
                id="slug"
                name="slug"
                required
                value={visibleSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder="casa-lino"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <span aria-hidden>
                {shownStatus === 'checking' ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : shownStatus === 'free' ? (
                  <Check className="size-4 text-emerald-600" />
                ) : shownStatus === 'taken' ? (
                  <X className="size-4 text-red-600" />
                ) : null}
              </span>
            </div>
            {fields.slug ? <p className="mt-1 text-xs text-red-600">{fields.slug}</p> : null}
            {shownStatus === 'taken' ? (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Ese enlace ya está en uso. Prueba con:</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSlugTouched(true);
                        setSlug(suggestion);
                      }}
                      className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground hover:bg-accent"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : shownStatus === 'free' ? (
              <p className="mt-1 text-xs text-emerald-600">Enlace disponible.</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Descripción corta <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={500}
              placeholder="Qué vendes y por qué elegirte."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
          </div>

          <div>
            <label htmlFor="whatsappPhone" className="mb-1 block text-sm font-medium">
              WhatsApp para pedidos
            </label>
            <input
              id="whatsappPhone"
              name="whatsappPhone"
              inputMode="tel"
              placeholder="987654321"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Aquí llegarán los pedidos. Puedes cambiarlo después.
            </p>
            {fields.whatsappPhone ? (
              <p className="mt-1 text-xs text-red-600">{fields.whatsappPhone}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">2. Tu rubro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ayuda a que te encuentren en el directorio de tiendas.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.slug}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-checked:border-primary has-checked:bg-accent"
            >
              <input
                type="radio"
                name="category"
                value={category.slug}
                defaultChecked={category.slug === defaultCategory}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="font-medium">{category.name}</span>
            </label>
          ))}
        </div>
        {fields.category ? <p className="mt-2 text-xs text-red-600">{fields.category}</p> : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">3. Tu estilo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige un punto de partida. Podrás cambiar colores y secciones cuando quieras.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {themes.map((theme) => {
            const selected = theme.key === themeKey;
            return (
              <button
                key={theme.key}
                type="button"
                onClick={() => setThemeKey(theme.key)}
                aria-pressed={selected}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{theme.name}</span>
                  {selected ? <Check className="size-4 text-primary" aria-hidden /> : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{theme.description}</p>
                <div className="mt-3 flex gap-1.5">
                  {[theme.primary, theme.accent, theme.background, theme.foreground].map((color) => (
                    <span
                      key={color}
                      className="size-6 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <input type="hidden" name="themeKey" value={themeKey} />
        {fields.themeKey ? <p className="mt-2 text-xs text-red-600">{fields.themeKey}</p> : null}
      </section>

      {state.error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Creando tienda…
            </>
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden /> Crear mi tienda
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Al crearla entras directo al panel para publicar tus primeros productos.
        </p>
      </div>
    </form>
  );
}
