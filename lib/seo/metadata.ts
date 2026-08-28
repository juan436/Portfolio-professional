import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/site-config"

/**
 * Construye el bloque de metadata (title/description/canonical/OG/Twitter) de una página.
 * Recibe: título corto (el template del layout raíz agrega " | Juan Villegas"), descripción,
 * `path` relativo (se resuelve contra `metadataBase` del layout) e imagen opcional.
 * Produce: objeto `Metadata` listo para exportar desde `generateMetadata`.
 */

interface BuildMetadataInput {
  title: string
  description: string
  path: string
  image?: string
  /** `"article"` para posts de blog — agrega `article:published_time`/`author` al OG. Default `"website"`. */
  type?: "website" | "article"
  publishedTime?: string
  authorName?: string
}

export function buildMetadata({ title, description, path, image, type = "website", publishedTime, authorName }: BuildMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "es_ES",
      ...(type === "article"
        ? {
            type: "article",
            ...(publishedTime ? { publishedTime } : {}),
            ...(authorName ? { authors: [authorName] } : {}),
          }
        : { type: "website" }),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

// Para slugs que no existen: metadata propia (no la del layout) y `noindex`,
// así una URL fantasma nunca compite por posicionar con la real.
export const NOT_FOUND_METADATA: Metadata = {
  title: "No encontrado",
  description: "El contenido que buscás no existe o fue movido.",
  robots: { index: false, follow: false },
}
