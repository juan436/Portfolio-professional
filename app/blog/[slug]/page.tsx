import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/data/blog"
import { isAdminSession } from "@/lib/actions/shared"
import { highlightBlogHtml } from "@/lib/blog/highlight"
import { BlogDetailView } from "@/components/blog/blog-detail-view"
import { BlogPostingJsonLd } from "@/components/blog/blog-posting-json-ld"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

const AUTHOR_NAME = "Juan Villegas"

/** Cuerpo con resaltado de sintaxis por idioma (el switch de idioma es client-side). */
function highlightAllBodies(post: any): Record<string, string> {
  const map: Record<string, string> = { es: highlightBlogHtml(post.body) }
  for (const lang of ["en", "fr", "it"] as const) {
    const body = post.translations?.[lang]?.body
    if (body) map[lang] = highlightBlogHtml(body)
  }
  return map
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}): Promise<Metadata> {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams])
  const isPreview = preview === "1" && (await isAdminSession())
  const post = await getBlogPostBySlug(slug, { includeDrafts: isPreview })
  if (!post) return NOT_FOUND_METADATA

  if (isPreview) return { ...NOT_FOUND_METADATA, title: `Vista previa — ${post.title}` }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
    authorName: AUTHOR_NAME,
  })
}

/**
 * Página `/blog/[slug]` (Server Component). Recibe: `params.slug`, `searchParams.preview`.
 * Produce: el post publicado (o el borrador si `?preview=1` y hay sesión admin) + relacionados.
 * Un slug inexistente devuelve un 404 real (`notFound()`), no un 200 con mensaje suave.
 */
export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams])
  const isPreview = preview === "1" && (await isAdminSession())

  const post = await getBlogPostBySlug(slug, { includeDrafts: isPreview })
  if (!post) notFound()

  const bodyByLang = highlightAllBodies(post)
  const related = isPreview ? [] : await getRelatedPosts(slug, post.tags || [], 3)

  return (
    <>
      {!isPreview && <BlogPostingJsonLd post={post} />}
      <BlogDetailView post={post} bodyByLang={bodyByLang} related={related} isPreview={isPreview} />
    </>
  )
}
