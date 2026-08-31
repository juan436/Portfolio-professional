import type { IProject } from "@/models/project.model"
import type { ProjectCategoryValue } from "@/lib/actions/revalidation"

/**
 * Tipos y constantes compartidas por el módulo de Proyectos del Admin.
 * Recibe: nada (tipos + una fábrica `emptyProject`).
 * Produce: `AdminProject`, `CATEGORY_LABELS`, `CATEGORY_ORDER`, `emptyProject(category)`.
 */
export type AdminProject = Omit<IProject, keyof import("mongoose").Document> & {
  _id: string
  category: ProjectCategoryValue
}

export type { ProjectCategoryValue }

export const CATEGORY_LABELS: Record<ProjectCategoryValue, string> = {
  web: "Web",
  mobile: "Mobile",
  infra_backend: "Backend/Infra",
  laboratorio: "Laboratorio",
  automatizacion: "Automatización",
  agente: "Agente",
}

export const CATEGORY_ORDER: ProjectCategoryValue[] = [
  "web",
  "mobile",
  "infra_backend",
  "laboratorio",
  "automatizacion",
  "agente",
]

export function emptyProject(category: ProjectCategoryValue): Partial<AdminProject> {
  return {
    title: "",
    description: "",
    github: "",
    demo: "",
    tags: [],
    category,
    createdAt: new Date() as any,
  }
}
