import { ImageResponse } from "next/og"
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-frame"

/**
 * Imagen Open Graph de la home (`/opengraph-image`) — la que se ve al compartir
 * `jevy.dev` en LinkedIn/WhatsApp/etc. `generateMetadata` de las páginas
 * internas fija su propia imagen; esta es el respaldo global de la marca.
 * Recibe: nada.
 * Produce: PNG 1200×630 con la plantilla de marca.
 */
export const alt = "Juan Villegas — Arquitecto de Soluciones y Dev Full Stack"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    ogFrame({
      label: "JEVY",
      title: "Juan Villegas",
      subtitle: "Arquitecto de Soluciones y Desarrollador Full Stack. Sistemas completos, infraestructura, automatizaciones y agentes de IA en producción.",
    }),
    { ...size }
  )
}
