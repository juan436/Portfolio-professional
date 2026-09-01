import { unstable_cache } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Project from "@/models/project.model"
import { buildSafe } from "@/lib/data/build-safe"

/**
 * Lectura server-only de proyectos, sin round-trip HTTP (mismo patrón que project-detail.ts).
 * Recibe: `getProjectById(id)` / `getProjectBySlug(slug)` / `getProjectsByCategory(category)`.
 * Produce: el/los proyecto(s) planos (o `null`/`[]` si no hay match).
 * Cacheados con `unstable_cache` (tag "projects" — invalidado desde las Server
 * Actions del Admin con `revalidateTag`). `revalidate: 3600` = red de seguridad.
 */
export async function getProjectById(id: string) {
  await dbConnect()
  try {
    const project = await Project.findById(id).lean()
    return project ? JSON.parse(JSON.stringify(project)) : null
  } catch {
    return null
  }
}

export const getProjectBySlug = unstable_cache(
  (slug: string) =>
    buildSafe(async () => {
      await dbConnect()
      const project = await Project.findOne({ slug }).lean()
      return project ? JSON.parse(JSON.stringify(project)) : null
    }, null),
  ["project-by-slug"],
  { tags: ["projects"], revalidate: 3600 },
)

export const getProjectsByCategory = unstable_cache(
  (category: string) =>
    buildSafe(async () => {
      await dbConnect()
      const projects = await Project.find({ category }).sort({ createdAt: 1 }).lean()
      return JSON.parse(JSON.stringify(projects))
    }, [] as any[]),
  ["projects-by-category"],
  { tags: ["projects"], revalidate: 3600 },
)
