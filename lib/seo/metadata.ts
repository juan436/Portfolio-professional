import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/site-config"

/**
 * Construye el bloque de metadata (title/description/canonical/OG/Twitter/hreflang) de una página.
 * Recibe: título corto (el template del layout raíz agrega " | Juan Villegas"), descripción,
 * `path` relativo SIN prefijo de idioma (`/work`, `/projects/x`), `locale`, imagen opcional.
 * Produce: `Metadata` con `canonical` a la versión del propio idioma + `alternates.languages`
 * (hreflang) a las 4 versiones + `x-default`. Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Stage 3).
 */
const HREFLANG_LOCALES = ["es", "en", "fr", "it"] as const
const OG_LOCALE: Record<string, string> = { es: "es_ES", en: "en_US", fr: "fr_FR", it: "it_IT" }

interface BuildMetadataInput {
  title: string
  description: string
  path: string
  locale?: string
  titleAbsolute?: boolean
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  authorName?: string
}

export function buildMetadata({ title, description, path, locale = "es", titleAbsolute, image, type = "website", publishedTime, authorName }: BuildMetadataInput): Metadata {
  const clean = (path.startsWith("/") ? path : `/${path}`).replace(/\/$/, "")
  const localized = (l: string) => `/${l}${clean}` || `/${l}`
  const languages: Record<string, string> = {}
  for (const l of HREFLANG_LOCALES) languages[l] = localized(l)
  languages["x-default"] = localized("es")

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localized(locale),
      languages,
    },
    openGraph: {
      title,
      description,
      url: localized(locale),
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale] ?? "es_ES",
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

export const NOT_FOUND_METADATA: Metadata = {
  title: "No encontrado",
  description: "El contenido que buscás no existe o fue movido.",
  robots: { index: false, follow: false },
}
