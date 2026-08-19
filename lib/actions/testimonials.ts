"use server"

import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Testimonial from "@/models/testimonial.model"
import Project from "@/models/project.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { revalidateForCategory, type ProjectCategoryValue } from "./revalidation"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

// Un testimonio puede citar varios proyectos/automatizaciones (links[]) —
// revalida la ficha pública de cada uno según su categoría real (no todos
// los "proyecto" son /projects/[id]: puede ser laboratorio/agente también).
async function revalidateLinks(links: { type: "proyecto" | "automatizacion"; ref: string }[] | undefined) {
  if (!links) return
  for (const link of links) {
    const project = await Project.findById(link.ref).select("category")
    if (project) {
      revalidateForCategory(project.category as ProjectCategoryValue, link.ref)
    }
  }
}

export async function createTestimonialAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const testimonial = new Testimonial(data)
  await testimonial.save()
  await revalidateLinks(testimonial.links)

  return JSON.parse(JSON.stringify(testimonial))
}

export async function updateTestimonialAction(id: string, data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const existing = await Testimonial.findById(id)
  if (!existing) throw new Error("Testimonio no encontrado")

  existing.set(data)
  await existing.save()
  await revalidateLinks(existing.links)

  return JSON.parse(JSON.stringify(existing))
}

export async function deleteTestimonialAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await Testimonial.findByIdAndDelete(id)
  if (!deleted) throw new Error("Testimonio no encontrado")
  await revalidateLinks(deleted.links)

  return true
}
