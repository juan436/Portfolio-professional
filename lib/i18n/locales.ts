/**
 * Códigos de locale para `toLocaleDateString` / `Intl`, por idioma de la app.
 * Antes estaba copiado en blog-list-view, blog-detail-view, certificate-detail-view
 * y (con `es-VE`) en los demos de chat.
 */
export const LOCALES: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
}

/** Locale de `Intl` para un código de idioma; cae a `es-ES`. */
export function localeFor(langCode: string): string {
  return LOCALES[langCode] || "es-ES"
}
