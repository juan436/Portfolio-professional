import { ImageResponse } from "next/og"
import { ogFrame, OG_SIZE } from "@/lib/seo/og-frame"
import { getServerT } from "@/lib/i18n/server-dict"
import { AUTHOR_NAME } from "@/lib/site-config"

/**
 * Imagen Open Graph por defecto del sitio (`/og?l=<locale>`) — la que se ve al
 * compartir `jevy.dev`, `/work`, `/contact`, etc. en LinkedIn/WhatsApp/Slack.
 * Recibe: `?l=` con el locale (es|en|fr|it), default es.
 * Produce: PNG 1200×630 con la plantilla de marca, subtítulo en ese idioma.
 *
 * Es un route handler y NO el archivo-convención `opengraph-image.tsx` porque
 * ese último no cascada a las páginas: cada `generateMetadata` devuelve su
 * propio bloque `openGraph` y Next lo reemplaza entero, borrando cualquier
 * imagen heredada del segmento padre. Con una URL estable acá, `buildMetadata`
 * la fija explícitamente en cada página que no trae imagen propia.
 */
const LOCALES = new Set(["es", "en", "fr", "it"])

export function GET(req: Request) {
  const l = new URL(req.url).searchParams.get("l")
  const locale = l && LOCALES.has(l) ? l : "es"
  const t = getServerT(locale)
  return new ImageResponse(
    ogFrame({
      label: "JEVY",
      title: AUTHOR_NAME,
      subtitle: String(t("seo.home.description")),
    }),
    {
      ...OG_SIZE,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    }
  )
}
