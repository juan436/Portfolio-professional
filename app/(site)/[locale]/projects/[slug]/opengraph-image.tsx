import { ImageResponse } from "next/og"
import { getProjectBySlug } from "@/lib/data/projects"
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-frame"
import { getServerT } from "@/lib/i18n/server-dict"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import { AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * OG image de respaldo por ficha de proyecto (`/[locale]/projects/[slug]/opengraph-image`).
 * Solo se usa si la ficha NO tiene `image` real (si la tiene, `buildMetadata` fija
 * `openGraph.images` y esa gana). Ver portfolio: planes/compartir-fichas-linkedin-2026-08-27.
 */
export const alt = `Proyecto de ${AUTHOR_DISPLAY_NAME}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const project = await getProjectBySlug(slug)
  const t = getServerT(locale)
  const label = String(t(`seo.ogLabel.${project?.category || "web"}`)).toUpperCase()
  const title = project ? pickLocalized(project, locale, "title") : "Portfolio"
  return new ImageResponse(ogFrame({ label, title }), { ...size })
}
