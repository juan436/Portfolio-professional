"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db/conection"
import OtherSkill from "@/models/other-skills.model"
import { requireAdminSession } from "@/lib/actions/shared"
import { translateAndAddToObject } from "@/lib/translate"

/**
 * Server Actions CRUD de "otras habilidades" (Admin).
 * Recibe: `name` (string) en create/update; `id` en update/delete.
 * Procesa: traduce `name` a en/fr/it antes de guardar.
 * Produce: la skill creada/actualizada (plana) / `true` al borrar.
 */
function revalidateOtherSkills() {
  revalidatePath("/")
}

export async function createOtherSkillAction(name: string) {
  await requireAdminSession()
  await dbConnect()

  const withTranslations = await translateAndAddToObject({ name }, "es", ["en", "fr", "it"], ["name"])
  const skill = new OtherSkill(withTranslations)
  await skill.save()

  revalidateOtherSkills()
  return JSON.parse(JSON.stringify(skill))
}

export async function updateOtherSkillAction(id: string, name: string) {
  await requireAdminSession()
  await dbConnect()

  const withTranslations = await translateAndAddToObject({ name }, "es", ["en", "fr", "it"], ["name"])
  const updated = await OtherSkill.findByIdAndUpdate(id, withTranslations, { new: true })
  if (!updated) throw new Error("Habilidad no encontrada")

  revalidateOtherSkills()
  return JSON.parse(JSON.stringify(updated))
}

export async function deleteOtherSkillAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await OtherSkill.findByIdAndDelete(id)
  if (!deleted) throw new Error("Habilidad no encontrada")

  revalidateOtherSkills()
  return true
}
