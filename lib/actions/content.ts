"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Content from "@/models/content.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

// Content es un documento único (Content.findOne()) — hero/about/contact son
// sub-objetos anidados, no colecciones propias. Si todavía no existe (primera
// vez), se crea.
async function getOrCreateContent() {
  await dbConnect()
  let doc = await Content.findOne()
  if (!doc) doc = new Content({})
  return doc
}

function mergeTranslations(existing: any, incoming: any) {
  if (!incoming) return existing
  const merged: Record<string, any> = { ...(existing || {}) }
  for (const lang of Object.keys(incoming)) {
    merged[lang] = { ...(existing?.[lang] || {}), ...incoming[lang] }
  }
  return merged
}

function plainOf(sub: any) {
  return sub && typeof sub.toObject === "function" ? sub.toObject() : sub || {}
}

// Página home ya no depende del ContentProvider client-fetch (hidratación
// server-side, ver ContentHydrator) — igual hay que revalidar el caché de
// Next para que el cambio se vea sin esperar el próximo deploy/restart.
function revalidateHome() {
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

// services es un array embebido — cada item se matchea por _id (existente =
// merge, sin _id = nuevo). Mismo criterio que el PATCH viejo de /api/content
// (updateNestedFields), reescrito acá sin la recursión genérica.
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
