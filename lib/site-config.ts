/**
 * Constantes de identidad del sitio — fuente única. Antes estos literales
 * estaban repetidos en ~13 archivos (feed, sitemap, los JSON-LD, las vistas de
 * blog, las plantillas OG).
 *
 * Nota sobre el nombre: `AUTHOR_NAME` ("Juan Villegas") es el nombre para
 * schema.org y metadata; `AUTHOR_DISPLAY_NAME` ("Ing. Juan Villegas") es el de
 * cara al visitante (membretes, firmas). La diferencia es intencional.
 */
export const SITE_URL = "https://jevy.dev"
export const SITE_NAME = "Jevy"

export const AUTHOR_NAME = "Juan Villegas"
export const AUTHOR_DISPLAY_NAME = "Ing. Juan Villegas"
export const AUTHOR_PHOTO =
  "https://pub-d91a1ed93264439dbe0ee07372704cca.r2.dev/profile/1788178517277-22gr8l-perfil-jero.webp"

export const SAME_AS = [
  "https://github.com/juan436",
  "https://www.linkedin.com/in/juan-villegas-aaa05b20a/",
]

/**
 * URL absoluta de la imagen OG de marca por defecto (route handler `app/og`).
 * La usan las páginas sin imagen propia (home, `/work`, `/contact`, listados)
 * — la fijan explícito en `buildMetadata` porque el archivo-convención
 * `opengraph-image.tsx` no cascada (ver `app/og/route.tsx`). Las fichas de
 * detalle pasan su propia imagen o usan su `opengraph-image.tsx` de segmento.
 */
export const siteOgImage = (locale = "es") => `${SITE_URL}/og?l=${locale}`
