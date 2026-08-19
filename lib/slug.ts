import type { Model } from "mongoose"

// Compartido entre Project/Certificate/BlogPost — antes vivía duplicado
// dentro de lib/actions/blog.ts, consolidado acá al necesitarse una 2da y
// 3ra vez (Server Actions de projects.ts y certificates.ts).
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function uniqueSlug(model: Model<any>, base: string, excludeId?: string): Promise<string> {
  let slug = base || "item"
  let counter = 1
  while (true) {
    const query: Record<string, any> = { slug }
    if (excludeId) query._id = { $ne: excludeId }
    const existing = await model.findOne(query)
    if (!existing) return slug
    counter += 1
    slug = `${base}-${counter}`
  }
}
