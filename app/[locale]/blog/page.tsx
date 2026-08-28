import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getBlogPosts } from "@/lib/data/blog"
import { BlogListView } from "@/components/blog/blog-list-view"
import { BlogJsonLd } from "@/components/blog/blog-json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.blog.title"),
    description: t("seo.blog.description"),
    path: "/blog",
    locale,
  })
}

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
