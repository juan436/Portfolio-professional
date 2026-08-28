/**
 * Elige el valor de un campo según el idioma activo: si `langCode` es "es"
 * devuelve el valor base; si no, el de `entity.translations[langCode]` con
 * fallback al base. Consolida el patrón `x.translations?.[lang] …` que estaba
 * repetido en las 5 vistas de detalle + las 2 de blog + `use-translated-content`.
 */
type Lang = "es" | "en" | "fr" | "it"

interface Translatable {
  translations?: Partial<Record<Exclude<Lang, "es">, Record<string, unknown>>>
  [key: string]: unknown
}

/** Un solo campo. */
export function pickField<T extends Translatable>(entity: T, langCode: string, field: string): unknown {
  if (langCode === "es") return entity[field]
  const tr = entity.translations?.[langCode as Exclude<Lang, "es">]
  return (tr && tr[field] != null ? tr[field] : entity[field])
}

/** Varios campos a la vez → objeto `{ [field]: valor }`. */
export function pickTranslation<T extends Translatable>(
  entity: T,
  langCode: string,
  fields: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of fields) out[field] = pickField(entity, langCode, field)
  return out
}
