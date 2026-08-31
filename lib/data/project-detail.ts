import { unstable_cache } from "next/cache"
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

export const getProjectDetail = unstable_cache(
  async (slug: string): Promise<ProjectDetailData | null> => {
    await dbConnect()

    let project: any
    try {
      project = await Project.findOne({ slug }).lean()
    } catch {
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
  },
  ["project-detail"],
  { tags: ["projects", "testimonials"], revalidate: 3600 },
)
