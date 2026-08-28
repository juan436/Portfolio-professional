import type { Metadata } from "next"
import { getBlogPosts } from "@/lib/data/blog"
import { BlogListView } from "@/components/blog/blog-list-view"
import { BlogJsonLd } from "@/components/blog/blog-json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "Artículos técnicos y aprendizajes reales de los proyectos de Juan Villegas.",
  path: "/blog",
})

/**
 * Página `/blog` (Server Component). Recibe: `searchParams.tag` opcional.
 * Produce: lista de posts publicados, filtrada por etiqueta si viene `?tag=`.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const [posts, { tag }] = await Promise.all([getBlogPosts(), searchParams])
  return (
    <>
      <BlogJsonLd posts={posts} />
      <BlogListView posts={posts} activeTag={tag} />
    </>
  )
}
