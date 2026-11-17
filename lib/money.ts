/**
 * Dinero en unidad menor (centavos) y su representación visual.
 * Regla del proyecto: NUNCA se guardan floats. 1999 = S/ 19,99.
 */

export function formatMoney(cents: number, currency = 'PEN', locale = 'es-PE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Convierte lo que escribe el usuario ("19.90", "19,90", "S/ 19.90") a centavos. */
export function parseMoneyInput(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) {
      return null;
    }
    return Math.round(input * 100);
  }

  const raw = input.trim();
  if (!raw) {
    return null;
  }

  let normalized = raw.replace(/[^\d.,-]/g, '');
  if (!normalized) {
    return null;
  }

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    // Formato es-PE: 1.234,56 → punto de miles, coma decimal.
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  }

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value * 100);
}

/** Centavos → texto editable ("19.90"). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return '';
  }
  return (cents / 100).toFixed(2);
}

export function computeDiscountPercent(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) {
    return null;
  }
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function formatNumber(value: number, locale = 'es-PE'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(date: Date | string, locale = 'es-PE', timeZone = 'America/Lima'): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(value);
}
