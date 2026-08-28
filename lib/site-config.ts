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
  "https://images.jvserver.com/images/profile/perfil-1751953703604-489800455.jpeg"

export const SAME_AS = [
  "https://github.com/juan436",
  "https://www.linkedin.com/in/juan-villegas-aaa05b20a/",
]
