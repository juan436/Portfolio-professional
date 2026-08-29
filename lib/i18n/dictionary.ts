import es from "@/public/locales/es/translation.json"
import en from "@/public/locales/en/translation.json"
import fr from "@/public/locales/fr/translation.json"
import it from "@/public/locales/it/translation.json"

/**
 * Traductor síncrono sobre los 4 JSON de traducción embebidos. Es la única
 * fuente de `t()` en todo el sitio: la usa `LanguageProvider` en el cliente y
 * `generateMetadata` en el server (vía `getServerT`).
 *
 * Reemplazó a i18next + react-i18next (2026-08-29): la única función que se
 * usaba era resolver una clave con punto, y react-i18next actualizaba su `t`
 * por un `useEffect` → al cambiar de idioma iba un render atrás y hacía falta
 * un `key={locale}` que remontaba medio árbol. Esto es una función pura,
 * correcta en el primer render (lo que ven los crawlers), sin remontar nada.
 *
 * Resolución: clave en el idioma pedido → fallback a `es` → la clave cruda.
 * `{{var}}` NO se interpola acá (el único caso, `blog.readingTime`, hace el
 * `.replace("{{min}}", …)` a mano en `use-blog-formatters`).
 */

const DICTS: Record<string, Record<string, unknown>> = { es, en, fr, it }
const FALLBACK = "es"

function resolveKey(dict: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    dict,
  )
}

/** `t()` — string por defecto; el objeto/array crudo con `{ returnObjects: true }`. */
export interface TranslateFn {
  (key: string): string
  (key: string, options: { returnObjects: true }): unknown
}

export function getTranslator(locale: string): TranslateFn {
  const dict = DICTS[locale] ?? DICTS[FALLBACK]
  function t(key: string): string
  function t(key: string, options: { returnObjects: true }): unknown
  function t(key: string, options?: { returnObjects?: boolean }): string | unknown {
    const value = resolveKey(dict, key) ?? resolveKey(DICTS[FALLBACK], key)
    if (options?.returnObjects) return value ?? key
    return typeof value === "string" ? value : key
  }
  return t
}
