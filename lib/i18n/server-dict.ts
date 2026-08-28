import es from "@/public/locales/es/translation.json"
import en from "@/public/locales/en/translation.json"
import fr from "@/public/locales/fr/translation.json"
import it from "@/public/locales/it/translation.json"

/**
 * Resolución de traducciones server-side (para `generateMetadata`, que no puede
 * usar el hook `useLanguage`). Lee los mismos JSON embebidos que el cliente.
 * `t("seo.pages.work.title")` → string, con fallback a `es` y a la key cruda.
 */
const DICTS: Record<string, Record<string, unknown>> = { es, en, fr, it }

export function getServerT(locale: string) {
  const dict = DICTS[locale] ?? DICTS.es
  return (key: string): string => {
    const resolve = (d: Record<string, unknown>) =>
      key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), d)
    const val = resolve(dict) ?? resolve(DICTS.es)
    return typeof val === "string" ? val : key
  }
}
