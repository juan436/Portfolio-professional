"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import OtherSkill from "@/models/other-skills.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

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
