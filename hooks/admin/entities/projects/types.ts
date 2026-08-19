import type { IProject } from "@/models/project.model"
import type { ProjectCategoryValue } from "@/lib/actions/projects"

// Derivado del schema real de Mongo (IProject) en vez de redefinir los ~25
// campos a mano — se mantiene en sync solo. `import type` se borra en build,
// no mete mongoose en el bundle del cliente.
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
