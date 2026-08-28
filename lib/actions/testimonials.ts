"use server"

import { revalidatePath, updateTag } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Testimonial from "@/models/testimonial.model"
import Project from "@/models/project.model"
import ProjectStats from "@/models/project-stats.model"
import { requireAdminSession } from "@/lib/actions/shared"
import { revalidateForCategory, type ProjectCategoryValue } from "./revalidation"

/**
 * Server Actions CRUD de testimonios (Admin) + moderación de los que llegan por el form público
 * (app/api/testimonials/route.ts, siempre nacen `status: 'pending'`) + promoción de métricas sugeridas.
 * Recibe: payload del form de Admin (incl. `links[]` a proyectos/automatizaciones) en create/update; `id` en delete/aprobar.
 * Procesa: revalida la ficha pública de cada proyecto citado en `links[]`.
 * Produce: el testimonio creado/actualizado/aprobado (plano) / `true` al borrar / listado completo (todos los status, Admin).
 */
// El GET público (/api/testimonials) solo devuelve `status: 'approved'` — el
// Admin necesita ver también los `pending`, así que la lectura completa vive
// como Server Action (mismo patrón que listProjectStatsAction).
export async function listTestimonialsAction() {
  await requireAdminSession()
  await dbConnect()
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(testimonials))
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

  // Lo que Juan carga a mano desde el Admin es curado por él mismo — nace
  // 'approved' directo, sin pasar por la cola de moderación (a diferencia
  // del form público, que siempre fuerza 'pending').
  const testimonial = new Testimonial({ status: "approved", ...data })
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

// Aprobar un testimonio pending (llegado por el form público) lo hace visible
// en el GET público. "Rechazar" un pending no tiene un estado propio en el
// modelo — se resuelve borrándolo (deleteTestimonialAction), nunca llegó a
// mostrarse en el sitio.
export async function approveTestimonialAction(id: string) {
  await requireAdminSession()
  await dbConnect()

  const updated = await Testimonial.findByIdAndUpdate(id, { status: "approved" }, { new: true })
  if (!updated) throw new Error("Testimonio no encontrado")
  await revalidateLinks(updated.links)

  return JSON.parse(JSON.stringify(updated))
}

// Promueve una métrica sugerida (Step 2 del form público, sin verificar) a
// ProjectStats real — la suma al proyecto/automatización del primer link del
// testimonio y, si trae `statType`, al acumulado del home. La quita de
// `suggestedMetrics` para no promoverla dos veces.
export async function promoteSuggestedMetricAction(testimonialId: string, metricIndex: number) {
  await requireAdminSession()
  await dbConnect()

  const testimonial = await Testimonial.findById(testimonialId)
  if (!testimonial) throw new Error("Testimonio no encontrado")

  const metric = testimonial.suggestedMetrics?.[metricIndex]
  if (!metric) throw new Error("Métrica sugerida no encontrada")

  const link = testimonial.links?.[0]
  if (!link) throw new Error("El testimonio no tiene un proyecto vinculado")

  const stats = await ProjectStats.findOneAndUpdate(
    { "link.ref": link.ref },
    {
      $setOnInsert: { link: { type: link.type, ref: link.ref } },
      $push: { metrics: { label: metric.label, value: metric.value, statType: metric.statType } },
    },
    { upsert: true, new: true }
  )

  testimonial.suggestedMetrics = testimonial.suggestedMetrics.filter((_: unknown, i: number) => i !== metricIndex)
  await testimonial.save()

  const project = await Project.findById(link.ref).select("category")
  if (project) revalidateForCategory(project.category as ProjectCategoryValue, link.ref)
  updateTag("testimonials")
  revalidatePath("/")

  return {
    stats: JSON.parse(JSON.stringify(stats)),
    testimonial: JSON.parse(JSON.stringify(testimonial)),
  }
}
