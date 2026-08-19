import { Dispatch, SetStateAction } from "react"
import { updateContent } from "@/services/api"
import { Content, Projects } from "../../types"

/**
 * Actualiza la sección Projects en el estado local y en el servidor
 */
export const updateProjects = async (
  projects: Projects,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  setIsLoading(true)
  try {
    const response = await updateContent('projects', projects)
    if (response.success) {
      setContent((prev) => ({ ...prev, projects }))
    }
  } catch (error) {
    console.error("Error actualizando projects:", error)
  }
  setIsLoading(false)
}

// createProjectItem / updateProjectItem / deleteProjectItem migraron a
// Server Actions (lib/actions/projects.ts, auditoría 2026-08-19) — ver
// vault/portfolio: planes/rediseno-admin-server-actions. El Admin de
// Proyectos ya no pasa por este Context.
