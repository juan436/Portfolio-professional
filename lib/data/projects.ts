import { unstable_cache } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Project from "@/models/project.model"

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

// Búsqueda por slug — usada por las rutas públicas de detalle
// (/agents/[slug], /laboratory/[slug]). El _id sigue siendo la clave interna.
export const getProjectBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect()
    const project = await Project.findOne({ slug }).lean()
    return project ? JSON.parse(JSON.stringify(project)) : null
  },
  ["project-by-slug"],
  { tags: ["projects"], revalidate: 3600 },
)

export const getProjectsByCategory = unstable_cache(
  async (category: string) => {
    await dbConnect()
    const projects = await Project.find({ category }).sort({ createdAt: 1 }).lean()
    return JSON.parse(JSON.stringify(projects))
  },
  ["projects-by-category"],
  { tags: ["projects"], revalidate: 3600 },
)
