'use client';

import { Layers, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  buildCombinations,
  parseOptionValues,
  variantKey,
  variantLabel,
  type OptionDraft,
  type VariantDraft,
} from './product-types';

export function VariantEditor({
  options,
  variants,
  basePrice,
  onOptionsChange,
  onVariantsChange,
}: {
  options: OptionDraft[];
  variants: VariantDraft[];
  basePrice: string;
  onOptionsChange: (options: OptionDraft[]) => void;
  onVariantsChange: (variants: VariantDraft[]) => void;
}) {
  const combos = buildCombinations(options);
  const canGenerate = combos.length > 0 && combos.length <= 100;

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    onOptionsChange(options.map((option, position) => (position === index ? { ...option, ...patch } : option)));
  }

  function generate() {
    const existing = new Map(variants.map((variant) => [variant.key, variant]));
    const next = combos.map((combination) => {
      const key = variantKey(combination);
      const previous = existing.get(key);
      return {
        key,
        options: combination,
        sku: previous?.sku ?? '',
        price: previous?.price ?? '',
        compareAtPrice: previous?.compareAtPrice ?? '',
        stock: previous?.stock ?? 0,
        imageUrl: previous?.imageUrl ?? '',
        active: previous?.active ?? true,
      } satisfies VariantDraft;
    });
    onVariantsChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex flex-wrap items-start gap-2 rounded-lg border border-border p-2.5">
            <input
              value={option.name}
              onChange={(event) => updateOption(index, { name: event.target.value })}
              placeholder="Opción (Talla, Color…)"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none sm:w-40"
              aria-label={`Nombre de la opción ${index + 1}`}
            />
            <input
              value={option.valuesText}
              onChange={(event) => updateOption(index, { valuesText: event.target.value })}
              placeholder="Valores separados por coma: S, M, L"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none"
              aria-label={`Valores de la opción ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => onOptionsChange(options.filter((_, position) => position !== index))}
              className="rounded p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              aria-label="Quitar opción"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}

        {options.length < 3 ? (
          <button
            type="button"
            onClick={() => onOptionsChange([...options, { name: '', valuesText: '' }])}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden />
            Añadir opción
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {options.length === 0
            ? 'Sin variantes: el producto usa precio y stock únicos.'
            : `${combos.length} combinación${combos.length === 1 ? '' : 'es'} detectada${combos.length === 1 ? '' : 's'}.`}
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerate}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Generar variantes
        </button>
      </div>

      {variants.length === 0 ? null : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Combinación</th>
                <th className="px-2 py-2 text-left font-medium">SKU</th>
                <th className="px-2 py-2 text-left font-medium">Precio</th>
                <th className="px-2 py-2 text-left font-medium">Stock</th>
                <th className="px-2 py-2 text-center font-medium">Activa</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((variant, index) => (
                <tr key={variant.key}>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Layers className="size-3.5 text-muted-foreground" aria-hidden />
                      {variantLabel(variant.options)}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={variant.sku}
                      onChange={(event) =>
                        onVariantsChange(
                          variants.map((item, position) =>
                            position === index ? { ...item, sku: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Opcional"
                      className="h-8 w-24 rounded border border-input bg-background px-2 text-xs outline-none"
                      aria-label="SKU de la variante"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={variant.price}
                      onChange={(event) =>
                        onVariantsChange(
                          variants.map((item, position) =>
                            position === index ? { ...item, price: event.target.value } : item,
                          ),
                        )
                      }
                      inputMode="decimal"
                      placeholder={basePrice || 'Igual'}
                      className="h-8 w-24 rounded border border-input bg-background px-2 text-xs outline-none"
                      aria-label="Precio de la variante"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      max={1_000_000}
                      value={variant.stock}
                      onChange={(event) =>
                        onVariantsChange(
                          variants.map((item, position) =>
                            position === index
                              ? { ...item, stock: Math.max(0, Number(event.target.value) || 0) }
                              : item,
                          ),
                        )
                      }
                      className="h-8 w-20 rounded border border-input bg-background px-2 text-xs outline-none"
                      aria-label="Stock de la variante"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={variant.active}
                      onChange={(event) =>
                        onVariantsChange(
                          variants.map((item, position) =>
                            position === index ? { ...item, active: event.target.checked } : item,
                          ),
                        )
                      }
                      className="size-4 accent-[var(--color-primary)]"
                      aria-label="Variante activa"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onVariantsChange(variants.filter((_, position) => position !== index))}
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label="Quitar variante"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {options.some((option) => option.name.trim() && parseOptionValues(option.valuesText).length === 0) ? (
        <p className="text-xs text-amber-700">
          Hay una opción sin valores: completa sus valores para generar las variantes.
        </p>
      ) : null}
    </div>
  );
}
