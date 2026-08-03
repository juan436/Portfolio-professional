import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fuente única para "tecnologías usadas" en un proyecto: aplana techStack
 * (frontend/backend/database/infra) si existe. Cae a tags solo para proyectos
 * viejos que todavía no tienen techStack clasificado.
 */
export function getProjectTechnologies(project: {
  techStack?: {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    infra?: string[]
  }
  tags?: string[]
}): string[] {
  const { techStack } = project
  const flattened = techStack
    ? [
        ...(techStack.frontend || []),
        ...(techStack.backend || []),
        ...(techStack.database || []),
        ...(techStack.infra || []),
      ]
    : []

  return flattened.length > 0 ? flattened : project.tags || []
}
