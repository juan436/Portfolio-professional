"use server"

import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Project from "@/models/project.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"
import { slugify, uniqueSlug } from "@/lib/slug"
import { revalidateForCategory, type ProjectCategoryValue } from "./revalidation"

export type { ProjectCategoryValue }

const TRANSLATABLE_FIELDS = ["title", "description"] as const

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

// Server Actions no pasan por el matcher de middleware.ts (son POSTs a un
// endpoint interno de Next) — cada una verifica la sesión por su cuenta con
// la misma función que usa el middleware (lib/auth/jwt.ts).

// Merge por idioma en vez de reemplazo — el flujo viejo (services/api/projects.ts
// + createItemHandlers) hacía `item.set({ translations: {...} })` con solo los
// idiomas/campos recién traducidos, lo que borraba traducciones previas de
// otros campos. Acá se preserva lo que ya había y solo se pisa lo nuevo.
function mergeTranslations(existing: any, incoming: any) {
  if (!incoming) return existing
  const merged: Record<string, any> = { ...(existing || {}) }
  for (const lang of Object.keys(incoming)) {
    merged[lang] = { ...(existing?.[lang] || {}), ...incoming[lang] }
  }
  return merged
}

export async function createProjectAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const fieldsToTranslate = TRANSLATABLE_FIELDS.filter((f) => typeof data[f] === "string" && data[f].trim() !== "")
  const withTranslations =
    fieldsToTranslate.length > 0
      ? await translateAndAddToObject(data, "es", ["en", "fr", "it"], fieldsToTranslate as any)
      : data

  const baseSlug = slugify(data.slug || data.title || "")
  const slug = await uniqueSlug(Project, baseSlug)

  const project = new Project({ ...withTranslations, slug })
  await project.save()

  revalidateForCategory(project.category as ProjectCategoryValue, project.slug)
  return JSON.parse(JSON.stringify(project))
}

export async function updateProjectAction(id: string, data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const existing = await Project.findById(id)
  if (!existing) throw new Error("Proyecto no encontrado")

  const oldSlug = existing.slug
  const fieldsToTranslate = TRANSLATABLE_FIELDS.filter(
    (f) => f in data && typeof data[f] === "string" && data[f].trim() !== ""
  )

  const patch: Record<string, any> = { ...data }
  if (typeof data.slug === "string" && data.slug.trim() !== "" && slugify(data.slug) !== existing.slug) {
    patch.slug = await uniqueSlug(Project, slugify(data.slug), id)
  } else {
    delete patch.slug
  }

  if (fieldsToTranslate.length > 0) {
    const { translations: incomingTranslations, ...rest } = await translateAndAddToObject(
      patch,
      "es",
      ["en", "fr", "it"],
      fieldsToTranslate as any
    )
    existing.set(rest)
    existing.translations = mergeTranslations(existing.translations, incomingTranslations)
  } else {
    existing.set(patch)
  }

  await existing.save()

  const category = (data.category as ProjectCategoryValue) || (existing.category as ProjectCategoryValue)
  revalidateForCategory(category, oldSlug)
  if (existing.slug !== oldSlug) revalidateForCategory(category, existing.slug)
  return JSON.parse(JSON.stringify(existing))
}

export async function deleteProjectAction(id: string, category: ProjectCategoryValue, slug: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await Project.findByIdAndDelete(id)
  if (!deleted) throw new Error("Proyecto no encontrado")

  revalidateForCategory(category, slug)
  return true
}
