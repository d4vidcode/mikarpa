/** Tipos compartidos por el editor de productos (solo cliente). */

export type MediaDraft = {
  url: string;
  alt: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
};

export type OptionDraft = {
  name: string;
  valuesText: string;
};

export type VariantOptionDraft = { name: string; value: string };

export type VariantDraft = {
  key: string;
  options: VariantOptionDraft[];
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: number;
  imageUrl: string;
  active: boolean;
};

export function parseOptionValues(valuesText: string): string[] {
  return valuesText
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, list) => list.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
    .slice(0, 20);
}

export function variantKey(options: VariantOptionDraft[]): string {
  return options
    .map((option) => `${option.name.trim().toLowerCase()}:${option.value.trim().toLowerCase()}`)
    .sort()
    .join('|');
}

export function variantLabel(options: VariantOptionDraft[]): string {
  return options.map((option) => `${option.name} ${option.value}`).join(' / ');
}

/** Producto cartesiano de las opciones válidas. */
export function buildCombinations(options: OptionDraft[]): VariantOptionDraft[][] {
  const valid = options
    .map((option) => ({ name: option.name.trim(), values: parseOptionValues(option.valuesText) }))
    .filter((option) => option.name.length > 0 && option.values.length > 0);

  if (valid.length === 0) {
    return [];
  }

  let combinations: VariantOptionDraft[][] = [[]];
  for (const option of valid) {
    const next: VariantOptionDraft[][] = [];
    for (const combination of combinations) {
      for (const value of option.values) {
        next.push([...combination, { name: option.name, value }]);
      }
    }
    combinations = next;
    if (combinations.length > 100) {
      combinations = combinations.slice(0, 100);
    }
  }

  return combinations;
}
