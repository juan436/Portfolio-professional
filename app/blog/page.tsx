import { getBlogPosts } from "@/lib/data/blog"
import { BlogListView } from "@/components/blog/blog-list-view"

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <BlogListView posts={posts} />
}
