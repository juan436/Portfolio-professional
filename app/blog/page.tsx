import { getBlogPosts } from "@/lib/data/blog"
import { BlogListView } from "@/components/blog/blog-list-view"

/** Página `/blog` (Server Component). Recibe: nada. Produce: lista de posts publicados. */
export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <BlogListView posts={posts} />
}
