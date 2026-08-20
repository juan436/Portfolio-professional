import dbConnect from "@/lib/db/conection"
import Project from "@/models/project.model"
import Testimonial from "@/models/testimonial.model"
import ProjectStats from "@/models/project-stats.model"

/**
 * Lectura server-only del detalle de un proyecto (project + testimonios + métricas).
 * Recibe: `getProjectDetail(slug)`.
 * Procesa: 1 query por slug + 2 queries en paralelo (testimonios "resultado" ligados, stats).
 * Produce: `ProjectDetailData` o `null` si no existe/hay error de consulta.
 */
export interface ProjectDetailData {
  project: any
  testimonials: any[]
  metrics: { label: string; value: string }[]
}

// Server-only: consulta Mongo directo, sin round-trip HTTP a la propia API.
// Reemplaza el waterfall client-side (fetchProjectById -> then testimonials+stats)
// que corría en cada navegación a /projects/[slug]. Busca por slug (URL
// pública) — el _id de Mongo sigue siendo la clave interna para
// Testimonial/ProjectStats, nunca se expone en la URL.
export async function getProjectDetail(slug: string): Promise<ProjectDetailData | null> {
  await dbConnect()

  let project: any
  try {
    project = await Project.findOne({ slug }).lean()
  } catch {
    // Error de consulta -> mismo tratamiento que "no encontrado"
    return null
  }

  if (!project) return null

  const projectId = project._id.toString()

  const [testimonials, stats] = await Promise.all([
    Testimonial.find({ type: "resultado", "links.ref": projectId }).sort({ createdAt: -1 }).lean(),
    ProjectStats.findOne({ "link.ref": projectId }).lean(),
  ])

  return JSON.parse(
    JSON.stringify({
      project,
      testimonials,
      metrics: (stats as any)?.metrics || [],
    })
  )
}
