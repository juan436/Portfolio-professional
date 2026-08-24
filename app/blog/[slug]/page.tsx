import type { Metadata } from "next"
import { getBlogPostBySlug } from "@/lib/data/blog"
import { BlogDetailView } from "@/components/blog/blog-detail-view"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return NOT_FOUND_METADATA

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.coverImage,
  })
}

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
