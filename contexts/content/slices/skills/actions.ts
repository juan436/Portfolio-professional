import { Dispatch, SetStateAction } from "react"
import { 
  updateContent,
  createSkill as createSkillApi,
  updateSkill as updateSkillApi,
  deleteSkill as deleteSkillApi
} from "@/services/api"
import { Content, Skill, Skills } from "../../types"

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

/**
 * Crea una nueva habilidad técnica
 */
export const createSkillItem = async (
  skillData: Omit<Skill, "_id">,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<Skill | null> => {
  setIsLoading(true)
  try {
    // Llamar a la API para crear la skill
    const response = await createSkillApi(skillData)

    if (response.success && response.data) {
      // Formatear la skill creada
      const newSkill: Skill = {
        _id: response.data._id,
        name: response.data.name,
        icon: response.data.icon,
        category: response.data.category,
        colored: response.data.colored
      }

      setContent(prev => {
        const updatedSkills = { ...prev.skills };

        if (newSkill.category === 'frontend') {
          updatedSkills.frontend = [...updatedSkills.frontend, newSkill];
        } else if (newSkill.category === 'backend') {
          updatedSkills.backend = [...updatedSkills.backend, newSkill];
        } else if (newSkill.category === 'database') {
          updatedSkills.database = [...updatedSkills.database, newSkill];
        } else if (newSkill.category === 'devops') {
          updatedSkills.devops = [...updatedSkills.devops, newSkill];
        }

        return {
          ...prev,
          skills: updatedSkills
        };
      });

      setIsLoading(false)
      return newSkill
    }

    setIsLoading(false)
    return null
  } catch (error) {
    console.error("Error creando skill:", error)
    setIsLoading(false)
    return null
  }
}

/**
 * Actualiza una habilidad técnica existente
 */
export const updateSkillItem = async (
  id: string, 
  skill: Skill,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  setIsLoading(true)
  try {
    const response = await updateSkillApi(id, skill)

    if (response.success) {
      setContent(prev => {
        const updatedSkills = { ...prev.skills };
        const category = skill.category;
        if (category === 'frontend') {
          updatedSkills.frontend = updatedSkills.frontend.map(s => {
            const skillId = s._id || '';
            return (skillId?.toString() || '') === id ? skill : s;
          });
        } else if (category === 'backend') {
          updatedSkills.backend = updatedSkills.backend.map(s => {
            const skillId = s._id || '';
            return (skillId?.toString() || '') === id ? skill : s;
          });
        } else if (category === 'database') {
          updatedSkills.database = updatedSkills.database.map(s => {
            const skillId = s._id || '';
            return (skillId?.toString() || '') === id ? skill : s;
          });
        } else if (category === 'devops') {
          updatedSkills.devops = updatedSkills.devops.map(s => {
            const skillId = s._id || '';
            return (skillId?.toString() || '') === id ? skill : s;
          });
        }

        return {
          ...prev,
          skills: updatedSkills
        };
      });

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  } catch (error) {
    console.error("Error actualizando skill:", error)
    setIsLoading(false)
    return false
  }
}

/**
 * Elimina una habilidad técnica existente
 */
export const deleteSkillItem = async (
  id: string,
  content: Content,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  // Verificar que el ID sea válido
  if (!id) {
    console.error('Se intentó eliminar una skill con ID undefined');
    return false;
  }

  setIsLoading(true)
  try {
    let skillCategory = '';
    let skillFound = false;

    for (const category of ['frontend', 'backend', 'database', 'devops'] as const) {
      const found = content.skills[category].find(s => s._id === id);
      if (found) {
        skillCategory = category;
        skillFound = true;
        break;
      }
    }

    if (!skillFound) {
      console.error(`No se encontró la skill con ID ${id} en ninguna categoría`);
      setIsLoading(false);
      return false;
    }

    const response = await deleteSkillApi(id);

    if (response.success) {
      setContent(prev => {
        const updatedSkills = { ...prev.skills };

        if (skillCategory === 'frontend') {
          updatedSkills.frontend = updatedSkills.frontend.filter(s => s._id !== id);
        } else if (skillCategory === 'backend') {
          updatedSkills.backend = updatedSkills.backend.filter(s => s._id !== id);
        } else if (skillCategory === 'database') {
          updatedSkills.database = updatedSkills.database.filter(s => s._id !== id);
        } else if (skillCategory === 'devops') {
          updatedSkills.devops = updatedSkills.devops.filter(s => s._id !== id);
        }

        return {
          ...prev,
          skills: updatedSkills
        };
      });

      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  } catch (error) {
    console.error("Error eliminando skill:", error);
    setIsLoading(false);
    return false;
  }
}
