import sanitizeHtml from 'sanitize-html';

/**
 * Allowlist del rich text de descripciones.
 *
 * Se aplica SIEMPRE en el servidor antes de guardar. No se permiten
 * imágenes inline (van en la galería), ni estilos, ni scripts/iframes.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'code',
  'pre',
  'hr',
];

export function sanitizeRichText(html: string | null | undefined): string | null {
  if (!html) {
    return null;
  }

  const clean = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      }),
      b: 'strong',
      i: 'em',
    },
    disallowedTagsMode: 'discard',
    parser: { lowerCaseTags: true },
  }).trim();

  return clean.length > 0 ? clean : null;
}

/** Texto plano derivado (SEO, extractos y búsqueda). */
export function richTextToPlainText(html: string | null | undefined, maxLength = 5000): string | null {
  if (!html) {
    return null;
  }

  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}
