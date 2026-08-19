import dbConnect from "@/lib/db/conection"
import BlogPost from "@/models/blog.model"

export async function getBlogPosts() {
  await dbConnect()
  const posts = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1 }).lean()
  return JSON.parse(JSON.stringify(posts))
}

export async function getBlogPostBySlug(slug: string) {
  await dbConnect()
  const post = await BlogPost.findOne({ slug, status: "published" }).lean()
  return post ? JSON.parse(JSON.stringify(post)) : null
}
