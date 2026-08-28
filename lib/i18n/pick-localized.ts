/**
 * Toma el valor de un campo en el idioma pedido: `es` = el campo base;
 * otro idioma = `translations[locale][field]` con fallback al base.
 * Para metadata server-side (title/description) — las vistas de detalle
 * cliente tienen su propia lógica de traducción.
 */
export function pickLocalized(
  doc: Record<string, any> | null | undefined,
  locale: string,
  field: string,
): string {
  if (!doc) return ""
  if (locale === "es") return typeof doc[field] === "string" ? doc[field] : ""
  const t = doc.translations?.[locale]?.[field]
  return typeof t === "string" && t.trim() !== "" ? t : typeof doc[field] === "string" ? doc[field] : ""
}
