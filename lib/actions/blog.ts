"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db/conection"
import BlogPost from "@/models/blog.model"
import { requireAdminSession, mergeTranslations } from "@/lib/actions/shared"
import { translateAndAddToObject, translateHtml, type SupportedLanguage } from "@/lib/translate"
import { slugify, uniqueSlug } from "@/lib/slug"
import { sanitizeBlogHtml } from "@/lib/blog/sanitize"

/**
 * Server Actions CRUD de posts de blog (Admin).
 * Recibe: payload del form de Admin (`Record<string, any>`) en create/update; `id`/`slug` en delete/list.
 * Procesa: slug único, sanitiza el cuerpo (y las traducciones), autotraduce
 * title/excerpt/body a EN/FR/IT, respeta las traducciones editadas a mano
 * (ganan sobre la autotraducción), marca `publishedAt` al publicar la primera vez.
 * Produce: el post creado/actualizado (plano) / `true` al borrar / lista completa para el Admin.
 */
const TARGET_LANGUAGES: SupportedLanguage[] = ["en", "fr", "it"]

function revalidateBlog(slug?: string) {
  revalidatePath("/blog")
  if (slug) revalidatePath(`/blog/${slug}`)
}

async function translateBody(body: string) {
  if (!body || body.trim() === "") return undefined
  const entries = await Promise.all(TARGET_LANGUAGES.map(async (lang) => [lang, await translateHtml(body, lang)] as const))
  const translations: Record<string, { body: string }> = {}
  for (const [lang, translated] of entries) translations[lang] = { body: sanitizeBlogHtml(translated) }
  return translations
}

/**
 * Traducciones que el usuario editó a mano en el Admin — solo los campos con
 * contenido real. Ganan sobre la autotraducción al mergear. El body se sanitiza.
 */
function manualTranslations(raw: any): Record<string, any> | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const out: Record<string, any> = {}
  for (const lang of TARGET_LANGUAGES) {
    const entry = raw[lang]
    if (!entry || typeof entry !== "object") continue
    const clean: Record<string, string> = {}
    if (typeof entry.title === "string" && entry.title.trim() !== "") clean.title = entry.title
    if (typeof entry.excerpt === "string" && entry.excerpt.trim() !== "") clean.excerpt = entry.excerpt
    if (typeof entry.body === "string" && entry.body.trim() !== "") clean.body = sanitizeBlogHtml(entry.body)
    if (Object.keys(clean).length > 0) out[lang] = clean
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export async function createBlogPostAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const baseSlug = slugify(data.slug || data.title || "")
  const slug = await uniqueSlug(BlogPost, baseSlug)

  const manual = manualTranslations(data.translations)
  data = { ...data, body: sanitizeBlogHtml(data.body), translations: undefined }

  const fieldsToTranslate = ["title", "excerpt"].filter((f) => typeof data[f] === "string" && data[f].trim() !== "")
  const [withTranslations, bodyTranslations] = await Promise.all([
    fieldsToTranslate.length > 0
      ? translateAndAddToObject(data, "es", TARGET_LANGUAGES, fieldsToTranslate as any)
      : Promise.resolve(data),
    translateBody(data.body),
  ])

  if (bodyTranslations) {
    withTranslations.translations = mergeTranslations(withTranslations.translations, bodyTranslations)
  }
  if (manual) {
    withTranslations.translations = mergeTranslations(withTranslations.translations, manual)
  }

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

  const oldSlug = existing.slug

  const manual = manualTranslations(data.translations)

  const patch: Record<string, any> = { ...data }
  delete patch.translations
  if (typeof data.body === "string") patch.body = sanitizeBlogHtml(data.body)

  if (typeof data.slug === "string" && data.slug.trim() !== "" && slugify(data.slug) !== existing.slug) {
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
  const [translationResult, bodyTranslations] = await Promise.all([
    fieldsToTranslate.length > 0
      ? translateAndAddToObject(patch, "es", TARGET_LANGUAGES, fieldsToTranslate as any)
      : Promise.resolve(null),
    typeof patch.body === "string" ? translateBody(patch.body) : Promise.resolve(undefined),
  ])

  if (translationResult) {
    const { translations: incoming, ...rest } = translationResult
    existing.set(rest)
    existing.translations = mergeTranslations(existing.translations, incoming)
  } else {
    existing.set(patch)
  }

  if (bodyTranslations) {
    existing.translations = mergeTranslations(existing.translations, bodyTranslations)
  }
  if (manual) {
    existing.translations = mergeTranslations(existing.translations, manual)
  }

  await existing.save()

  revalidateBlog(oldSlug)
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

export async function getBlogPostByIdAction(id: string) {
  await requireAdminSession()
  await dbConnect()
  const post = await BlogPost.findById(id).lean()
  if (!post) throw new Error("Post no encontrado")
  return JSON.parse(JSON.stringify(post))
}

/**
 * Retraduce un solo idioma desde el español (title/excerpt/body) — para el
 * botón "Retraducir este idioma" del editor. No guarda nada: devuelve los
 * campos para que el form los cargue y el usuario los revise antes de guardar.
 */
export async function retranslateBlogLocaleAction(
  lang: SupportedLanguage,
  source: { title?: string; excerpt?: string; body?: string }
) {
  await requireAdminSession()
  if (!TARGET_LANGUAGES.includes(lang)) throw new Error("Idioma no soportado")

  const [title, excerpt, body] = await Promise.all([
    source.title?.trim() ? translateHtml(source.title, lang) : Promise.resolve(""),
    source.excerpt?.trim() ? translateHtml(source.excerpt, lang) : Promise.resolve(""),
    source.body?.trim() ? translateHtml(source.body, lang) : Promise.resolve(""),
  ])

  return {
    title: title || undefined,
    excerpt: excerpt || undefined,
    body: body ? sanitizeBlogHtml(body) : undefined,
  }
}
