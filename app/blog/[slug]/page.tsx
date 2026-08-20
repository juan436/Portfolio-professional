import { getBlogPostBySlug } from "@/lib/data/blog"
import { BlogDetailView } from "@/components/blog/blog-detail-view"

/** Página `/blog/[slug]` (Server Component). Recibe: `params.slug`. Produce: el post publicado con ese slug, o `null`. */
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  return <BlogDetailView post={post} />
}
