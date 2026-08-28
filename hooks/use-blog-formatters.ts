import { useLanguage } from "@/hooks/use-language"
import { localeFor } from "@/lib/i18n/locales"
import { readingMinutes } from "@/lib/blog/text"

/**
 * Formateadores compartidos por las 2 vistas de blog (listado y detalle):
 * fecha larga en el idioma activo + etiqueta de tiempo de lectura.
 * Antes estaban copiados idénticos en ambos componentes.
 */
export function useBlogFormatters() {
  const { language, t } = useLanguage()

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(localeFor(language.code), { year: "numeric", month: "long", day: "numeric" })
      : ""

  const readingLabel = (html: string) =>
    String(t("blog.readingTime") || "{{min}} min de lectura").replace("{{min}}", String(readingMinutes(html)))

  return { formatDate, readingLabel, langCode: language.code }
}
