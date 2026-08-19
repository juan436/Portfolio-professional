"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Experience from "@/models/experience.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

const TRANSLATABLE_FIELDS = ["position", "description", "location"] as const

function mergeTranslations(existing: any, incoming: any) {
  if (!incoming) return existing
  const merged: Record<string, any> = { ...(existing || {}) }
  for (const lang of Object.keys(incoming)) {
    merged[lang] = { ...(existing?.[lang] || {}), ...incoming[lang] }
  }
  return merged
}

function revalidateExperience() {
  revalidatePath("/")
}

export async function createExperienceAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const fieldsToTranslate = TRANSLATABLE_FIELDS.filter((f) => typeof data[f] === "string" && data[f].trim() !== "")
  const withTranslations =
    fieldsToTranslate.length > 0
      ? await translateAndAddToObject(data, "es", ["en", "fr", "it"], fieldsToTranslate as any)
      : data

  const experience = new Experience(withTranslations)
  await experience.save()

  revalidateExperience()
  return JSON.parse(JSON.stringify(experience))
}

export async function updateExperienceAction(id: string, data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const existing = await Experience.findById(id)
  if (!existing) throw new Error("Experiencia no encontrada")

  const fieldsToTranslate = TRANSLATABLE_FIELDS.filter(
    (f) => f in data && typeof data[f] === "string" && data[f].trim() !== ""
  )

  if (fieldsToTranslate.length > 0) {
    const { translations: incoming, ...rest } = await translateAndAddToObject(data, "es", ["en", "fr", "it"], fieldsToTranslate as any)
    existing.set(rest)
    existing.translations = mergeTranslations(existing.translations, incoming)
  } else {
    existing.set(data)
  }

  await existing.save()

  revalidateExperience()
  return JSON.parse(JSON.stringify(existing))
}

export async function deleteExperienceAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await Experience.findByIdAndDelete(id)
  if (!deleted) throw new Error("Experiencia no encontrada")

  revalidateExperience()
  return true
}
