import { ImageResponse } from "next/og"
import { getBlogPostBySlug } from "@/lib/data/blog"
import { ogFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-frame"
import { AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Imagen Open Graph dinámica por artículo (`/blog/[slug]/opengraph-image`).
 * Recibe: `params.slug`.
 * Produce: PNG 1200×630 con el título del post sobre la plantilla de marca —
 * respaldo cuando el post no tiene `coverImage` (si lo tiene, `generateMetadata`
 * fija `openGraph.images` con la portada y esa gana sobre este archivo).
 */
export const alt = `Artículo del blog de ${AUTHOR_DISPLAY_NAME}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  return new ImageResponse(ogFrame({ label: "BLOG", title: post?.title || "Blog" }), { ...size })
}
