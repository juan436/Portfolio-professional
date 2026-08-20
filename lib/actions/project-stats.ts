"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/db/conection"
import ProjectStats from "@/models/project-stats.model"
import Project from "@/models/project.model"
import { requireAdminSession } from "@/lib/actions/shared"
import { revalidateForCategory, type ProjectCategoryValue } from "./revalidation"

/**
 * Server Actions de métricas de proyecto/automatización (Admin).
 * Recibe: `{ link, metrics }` en upsert; `id`+`ref` en delete; nada en list.
 * Procesa: upsert por `link.ref` (un solo documento de métricas por proyecto/automatización).
 * Produce: lista completa (Admin) / el documento de stats guardado / `true` al borrar;
 * siempre revalida también el resumen acumulado de la home.
 */
// Métricas de un proyecto/automatización puntual alimentan también el
// resumen acumulado que se muestra en la home (StatType, /api/stat-types/summary).
async function revalidateForRef(ref: string) {
  const project = await Project.findById(ref).select("category")
  if (project) revalidateForCategory(project.category as ProjectCategoryValue, ref)
  revalidatePath("/")
}

// La API vieja (/api/project-stats) exige `ref` — no hay listado general.
// El Admin necesita ver todas las métricas cargadas, así que esta lectura
// también vive como Server Action (consistente con el resto del patrón,
// en vez de agregar una ruta GET nueva solo para esto).
export async function listProjectStatsAction() {
  await requireAdminSession()
  await dbConnect()
  const stats = await ProjectStats.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(stats))
}

// Un solo documento por `link.ref` (upsert) — mismo contrato que la API
// vieja (findOneAndUpdate con upsert), ahora vía Server Action.
export async function upsertProjectStatsAction(data: { link: { type: "proyecto" | "automatizacion"; ref: string }; metrics: { label: string; value: string; statType?: string }[] }) {
  await requireAdminSession()
  await dbConnect()

  const stats = await ProjectStats.findOneAndUpdate(
    { "link.ref": data.link.ref },
    { link: data.link, metrics: data.metrics || [] },
    { upsert: true, new: true }
  )

  await revalidateForRef(data.link.ref)
  return JSON.parse(JSON.stringify(stats))
}

export async function deleteProjectStatsAction(id: string, ref: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await ProjectStats.findByIdAndDelete(id)
  if (!deleted) throw new Error("Métrica no encontrada")

  await revalidateForRef(ref)
  return true
}
