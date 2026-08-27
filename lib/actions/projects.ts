"use server"

import dbConnect from "@/lib/db/conection"
import Project from "@/models/project.model"
import { requireAdminSession, mergeTranslations } from "@/lib/actions/shared"
import { translateAndAddToObject } from "@/lib/translate"
import { slugify, uniqueSlug } from "@/lib/slug"
import { revalidateForCategory, type ProjectCategoryValue } from "./revalidation"

/**
 * Server Actions CRUD de proyectos (Admin) — cubre todas las categorías
 * (web/mobile/infra_backend/laboratorio/automatizacion/agente).
 * Recibe: payload del form de Admin en create/update; `id`(+`category`+`slug`) en delete.
 * Procesa: slug único, traduce title/description si vinieron, revalida la(s) ruta(s) pública(s) según categoría.
 * Produce: el proyecto creado/actualizado (plano) / `true` al borrar.
 */
const TRANSLATABLE_FIELDS = ["title", "description"] as const

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
