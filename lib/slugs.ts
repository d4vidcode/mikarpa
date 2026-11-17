import { RESERVED_SLUGS, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_REGEX } from './enums';

/** 'Polo Oversize de Algodón' → 'polo-oversize-de-algodon' */
export function slugify(input: string, maxLength = SLUG_MAX_LENGTH): string {
  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug.slice(0, maxLength).replace(/-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return (
    slug.length >= SLUG_MIN_LENGTH &&
    slug.length <= SLUG_MAX_LENGTH &&
    SLUG_REGEX.test(slug)
  );
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase());
}
