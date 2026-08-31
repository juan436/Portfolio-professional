"use server"

import { revalidatePath, updateTag } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Content from "@/models/content.model"
import { requireAdminSession, mergeTranslations } from "@/lib/actions/shared"
import { translateAndAddToObject } from "@/lib/translate"

/**
 * Server Actions del contenido único de la home (Hero/About/Contact/Services).
 * Recibe: `data` del form de Admin por sección (`update*Action`); `services[]` completo (`updateServicesAction`); `id` (`deleteServiceAction`).
 * Procesa: crea el documento único si no existe, traduce los campos que cambiaron, mergea `services[]` por `_id`.
 * Produce: la sección actualizada (plana) / lista de servicios / `true` al borrar un servicio.
 */
async function getOrCreateContent() {
  await dbConnect()
  let doc = await Content.findOne()
  if (!doc) doc = new Content({})
  return doc
}

function plainOf(sub: any) {
  return sub && typeof sub.toObject === "function" ? sub.toObject() : sub || {}
}

function revalidateHome() {
  updateTag("home")
  revalidatePath("/")
  revalidatePath("/contact")
}

async function updateSection(
  section: "hero" | "about" | "contact",
  data: Record<string, any>,
  translatableFields: string[]
) {
  await requireAdminSession()
  const doc = await getOrCreateContent()

  const fieldsToTranslate = translatableFields.filter((f) => f in data && typeof data[f] === "string" && data[f].trim() !== "")
  const current = plainOf((doc as any)[section])

  if (fieldsToTranslate.length > 0) {
    const { translations: incoming, ...rest } = await translateAndAddToObject(data, "es", ["en", "fr", "it"], fieldsToTranslate as any)
    ;(doc as any)[section] = { ...current, ...rest, translations: mergeTranslations(current.translations, incoming) }
  } else {
    ;(doc as any)[section] = { ...current, ...data }
  }

  await doc.save()
  revalidateHome()
  return JSON.parse(JSON.stringify((doc as any)[section]))
}

export async function updateHeroAction(data: Record<string, any>) {
  return updateSection("hero", data, ["title", "subtitle", "description"])
}

export async function updateAboutAction(data: Record<string, any>) {
  return updateSection("about", data, ["paragraph1", "paragraph2", "paragraph3"])
}

export async function updateContactAction(data: Record<string, any>) {
  return updateSection("contact", data, ["location"])
}

export async function updateServicesAction(services: Record<string, any>[]) {
  await requireAdminSession()
  const doc = await getOrCreateContent()

  const currentServices: any[] = (doc.services || []).map((s: any) => plainOf(s))
  const result: any[] = [...currentServices]

  for (const incoming of services) {
    const fieldsToTranslate = ["title", "description"].filter(
      (f) => f in incoming && typeof incoming[f] === "string" && incoming[f].trim() !== ""
    )

    if (incoming._id) {
      const index = result.findIndex((s) => s._id?.toString() === incoming._id.toString())
      if (index === -1) continue
      if (fieldsToTranslate.length > 0) {
        const { translations: newT, ...rest } = await translateAndAddToObject(incoming, "es", ["en", "fr", "it"], fieldsToTranslate as any)
        result[index] = { ...result[index], ...rest, translations: mergeTranslations(result[index].translations, newT) }
      } else {
        result[index] = { ...result[index], ...incoming }
      }
    } else {
      const withTranslations =
        fieldsToTranslate.length > 0
          ? await translateAndAddToObject(incoming, "es", ["en", "fr", "it"], fieldsToTranslate as any)
          : incoming
      result.push(withTranslations)
    }
  }

  doc.services = result as any
  await doc.save()
  revalidateHome()
  return JSON.parse(JSON.stringify(doc.services))
}

export async function deleteServiceAction(id: string) {
  await requireAdminSession()
  const doc = await getOrCreateContent()

  if (!id || id.trim() === "") throw new Error("ID de servicio inválido")

  doc.services = (doc.services || []).filter((s: any) => s._id?.toString() !== id.toString()) as any
  await doc.save()

  revalidateHome()
  return true
}
