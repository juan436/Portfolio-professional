import { ImageResponse } from "next/og"
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-frame"
import { AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Imagen Open Graph del listado `/blog` (`/blog/opengraph-image`).
 * Recibe: nada.
 * Produce: PNG 1200×630 con la plantilla de marca — para cuando se comparte
 * el link del blog entero.
 */
export const alt = `Blog de ${AUTHOR_DISPLAY_NAME}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return new ImageResponse(
    ogFrame({
      label: "BLOG",
      title: "Notas de desarrollo",
      subtitle: "Lo que voy aprendiendo mientras construyo software: decisiones técnicas, bugs y cambios de opinión.",
    }),
    { ...size }
  )
}
