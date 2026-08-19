import { Dispatch, SetStateAction } from "react"
import { updateContent } from "@/services/api"
import { Content, Skills } from "../../types"

/**
 * Actualiza la sección Skills en el estado local y en el servidor
 */
export const updateSkills = async (
  skills: Skills,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  setIsLoading(true)
  try {
    const response = await updateContent('skills', skills)
    if (response.success) {
      setContent((prev) => ({ ...prev, skills }))
    }
  } catch (error) {
    console.error("Error actualizando skills:", error)
  }
  setIsLoading(false)
}

// createSkillItem / updateSkillItem / deleteSkillItem migraron a Server
// Actions (lib/actions/skills.ts, Fase 4) — ver
// vault/portfolio: planes/rediseno-admin-server-actions. El Admin de
// Habilidades ya no pasa por este Context.
