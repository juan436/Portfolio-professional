"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import BlogPost from "@/models/blog.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"
import { slugify, uniqueSlug } from "@/lib/slug"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog")
  if (slug) revalidatePath(`/blog/${slug}`)
}

export async function createBlogPostAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const baseSlug = slugify(data.slug || data.title || "")
  const slug = await uniqueSlug(BlogPost, baseSlug)

  const fieldsToTranslate = ["title", "excerpt"].filter((f) => typeof data[f] === "string" && data[f].trim() !== "")
  const withTranslations =
    fieldsToTranslate.length > 0
      ? await translateAndAddToObject(data, "es", ["en", "fr", "it"], fieldsToTranslate as any)
      : data

  if (data.status === "published" && !data.publishedAt) {
    withTranslations.publishedAt = new Date()
  }

  const post = new BlogPost({ ...withTranslations, slug })
  await post.save()

  revalidateBlog(slug)
  return JSON.parse(JSON.stringify(post))
}

export async function updateBlogPostAction(id: string, data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const existing = await BlogPost.findById(id)
  if (!existing) throw new Error("Post no encontrado")

  const patch: Record<string, any> = { ...data }
  if (typeof data.slug === "string" && data.slug.trim() !== "") {
    patch.slug = await uniqueSlug(BlogPost, slugify(data.slug), id)
  } else {
    delete patch.slug
  }

  if (data.status === "published" && !existing.publishedAt && !data.publishedAt) {
    patch.publishedAt = new Date()
  }

  const fieldsToTranslate = ["title", "excerpt"].filter(
    (f) => f in patch && typeof patch[f] === "string" && patch[f].trim() !== ""
  )
  if (fieldsToTranslate.length > 0) {
    const { translations: incoming, ...rest } = await translateAndAddToObject(patch, "es", ["en", "fr", "it"], fieldsToTranslate as any)
    existing.set(rest)
    const merged: Record<string, any> = { ...(existing.translations || {}) }
    for (const lang of Object.keys(incoming || {})) {
      merged[lang] = { ...(merged[lang] || {}), ...(incoming as any)[lang] }
    }
    existing.translations = merged as any
  } else {
    existing.set(patch)
  }

  await existing.save()

  const oldSlug = existing.isModified("slug") ? undefined : existing.slug
  revalidateBlog(oldSlug || existing.slug)
  if (patch.slug) revalidateBlog(patch.slug)

  return JSON.parse(JSON.stringify(existing))
}

export async function deleteBlogPostAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await BlogPost.findByIdAndDelete(id)
  if (!deleted) throw new Error("Post no encontrado")
  revalidateBlog(deleted.slug)

  return true
}

export async function listBlogPostsAction() {
  await requireAdminSession()
  await dbConnect()
  const posts = await BlogPost.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(posts))
}
