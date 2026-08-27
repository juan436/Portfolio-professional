import dbConnect from "@/lib/db/conection"
import BlogPost from "@/models/blog.model"

/**
 * Lectura server-only de posts de blog, directo a Mongo.
 * Recibe: `getBlogPosts()` sin args; `getBlogPostBySlug(slug, { includeDrafts })`;
 * `getRelatedPosts(slug, tags, limit)`.
 * Produce: posts publicados (lista ordenada por fecha, uno por slug, o relacionados).
 * `includeDrafts` es solo para la vista previa del Admin (`?preview=1` con sesión válida).
 */
export async function getBlogPosts() {
  await dbConnect()
  const posts = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1 }).lean()
  return JSON.parse(JSON.stringify(posts))
}

export async function getBlogPostBySlug(slug: string, options: { includeDrafts?: boolean } = {}) {
  await dbConnect()
  const filter = options.includeDrafts ? { slug } : { slug, status: "published" }
  const post = await BlogPost.findOne(filter).lean()
  return post ? JSON.parse(JSON.stringify(post)) : null
}

/**
 * Posts relacionados: publicados, distintos al actual, priorizando los que
 * comparten más `tags`; rellena con los más recientes si no alcanza.
 */
export async function getRelatedPosts(slug: string, tags: string[] = [], limit = 3) {
  await dbConnect()
  const others = await BlogPost.find({ status: "published", slug: { $ne: slug } })
    .sort({ publishedAt: -1 })
    .lean()

  const tagSet = new Set(tags)
  const scored = others
    .map((post: any) => ({
      post,
      shared: (post.tags || []).filter((tag: string) => tagSet.has(tag)).length,
    }))
    .sort((a, b) => b.shared - a.shared) // el sort de Mongo (fecha desc) se mantiene entre empates

  return JSON.parse(JSON.stringify(scored.slice(0, limit).map((entry) => entry.post)))
}
