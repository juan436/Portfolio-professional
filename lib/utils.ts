import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind resolviendo conflictos (mismo patrón shadcn/ui).
 * @param inputs - Clases condicionales (string, objeto, array, etc.).
 * @returns `string` de clases final, sin duplicados/conflictos.
 */
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

/**
 * Entradas no vacías de `techStack` (`[categoría, items[]]`), para renderizar la
 * tarjeta de stack en las vistas de detalle. Idéntico en project- y
 * laboratory-detail-view (auditoría 2026-08-27 §4.14).
 */
export function techStackEntries(techStack?: Record<string, unknown>): [string, string[]][] {
  return Object.entries(techStack || {}).filter(
    ([, items]) => Array.isArray(items) && items.length > 0,
  ) as [string, string[]][]
}
