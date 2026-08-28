/**
 * Helpers de texto para posts de blog (cuerpo en HTML de Tiptap).
 * Recibe: HTML de `BlogPost.body` (o traducción).
 * Produce: texto plano, extracto derivado, descripción larga del listado y tiempo de lectura.
 * Antes `deriveExcerpt` vivía en blog-editor-page.tsx y `deriveLongDescription` en
 * blog-list-view.tsx — consolidado acá al necesitarse también para el tiempo de lectura.
 */

/** Quita todas las etiquetas y colapsa espacios. */
export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Texto plano truncado a `maxLen` con `…`. Devuelve `""` si no hay contenido. */
function truncatePlain(html: string, maxLen: number): string {
  const text = stripHtml(html)
  if (!text) return ""
  return text.length > maxLen ? `${text.slice(0, maxLen).trimEnd()}…` : text
}

/** Extracto corto (SEO / meta description / JSON-LD). Cae al título si el cuerpo está vacío. */
export const deriveExcerpt = (html: string, maxLen = 160): string => truncatePlain(html, maxLen)

/** Descripción larga (3-4 líneas) para las tarjetas del listado `/blog`. */
export const deriveLongDescription = (html: string): string => truncatePlain(html, 380)

const WORDS_PER_MINUTE = 200

/** Minutos de lectura estimados a partir del cuerpo HTML — mínimo 1. */
export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
