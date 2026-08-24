import type { Metadata } from "next"
import { getBlogPosts } from "@/lib/data/blog"
import { BlogListView } from "@/components/blog/blog-list-view"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "Artículos técnicos y aprendizajes reales de los proyectos de Juan Villegas.",
  path: "/blog",
})

/** Página `/blog` (Server Component). Recibe: nada. Produce: lista de posts publicados. */
export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <BlogListView posts={posts} />
}
