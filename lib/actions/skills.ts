"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Skill from "@/models/skill.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { translateAndAddToObject } from "@/lib/translate"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

function revalidateSkills() {
  revalidatePath("/")
}

export async function createSkillAction(data: { name: string; icon: string; colored?: boolean; category: string }) {
  await requireAdminSession()
  await dbConnect()

  const withTranslations = await translateAndAddToObject(data, "es", ["en", "fr", "it"], ["name"])
  const skill = new Skill(withTranslations)
  await skill.save()

  revalidateSkills()
  return JSON.parse(JSON.stringify(skill))
}

export async function updateSkillAction(id: string, data: { name: string; icon: string; colored?: boolean; category: string }) {
  await requireAdminSession()
  await dbConnect()

  const withTranslations = await translateAndAddToObject(data, "es", ["en", "fr", "it"], ["name"])
  const updated = await Skill.findByIdAndUpdate(id, withTranslations, { new: true })
  if (!updated) throw new Error("Habilidad no encontrada")

  revalidateSkills()
  return JSON.parse(JSON.stringify(updated))
}

export async function deleteSkillAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await Skill.findByIdAndDelete(id)
  if (!deleted) throw new Error("Habilidad no encontrada")

  revalidateSkills()
  return true
}
