import { Dispatch, SetStateAction } from "react"
import {
  updateContent,
  createExperience as createExperienceApi,
  updateExperience as updateExperienceApi,
  deleteExperience as deleteExperienceApi
} from "@/services/api"
import { Content, Experience } from "../../types"

/**
 * Actualiza la sección Experience en el estado local y en el servidor
 */
export const updateExperience = async (
  experience: Experience[],
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  setIsLoading(true)
  try {
    const response = await updateContent('experience', experience)
    if (response.success) {
      setContent((prev) => ({ ...prev, experience }))
    }
  } catch (error) {
    console.error("Error actualizando experience:", error)
  }
  setIsLoading(false)
}

/**
 * Crea una nueva experiencia laboral
 */
export const createExperienceItem = async (
  experienceData: Omit<Experience, "_id">,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<Experience | null> => {
  setIsLoading(true)
  try {
    // Llamar a la API para crear la experiencia
    const response = await createExperienceApi(experienceData)

    if (response.success && response.data) {
      // Formatear la experiencia creada
      const newExperience: Experience = {
        _id: response.data._id,
        position: response.data.position,
        company: response.data.company,
        period: response.data.period,
        description: response.data.description,
        skills: response.data.skills,
        companyLogo: response.data.companyLogo,
        location: response.data.location,
        url: response.data.url
      }

      // Actualizar el estado local
      setContent(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience]
      }))

      setIsLoading(false)
      return newExperience
    }

    setIsLoading(false)
    return null
  } catch (error) {
    console.error("Error creando experiencia:", error)
    setIsLoading(false)
    return null
  }
}

/**
 * Actualiza una experiencia laboral existente
 */
export const updateExperienceItem = async (
  id: string,
  experience: Partial<Experience>,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  setIsLoading(true)
  try {
    // Extraer y eliminar _modifiedFields del objeto que enviaremos a la API
    const { _modifiedFields, ...dataToUpdate } = experience;
    // Llamar a la API para actualizar solo los campos necesarios
    const response = await updateExperienceApi(id, dataToUpdate);
    if (response.success) {
      // Actualizar el estado local
      setContent(prev => ({
        ...prev,
        experience: prev.experience.map(e => e._id === id ? {
          ...e,
          ...dataToUpdate,
          _id: id // Asegurar que el ID se mantiene
        } : e)
      }))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  } catch (error) {
    console.error("Error updating experience:", error)
    setIsLoading(false)
    return false
  }
}

/**
 * Elimina una experiencia laboral existente
 */
export const deleteExperienceItem = async (
  id: string,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  setIsLoading(true)
  try {
    // Llamar a la API para eliminar la experiencia
    const response = await deleteExperienceApi(id)
    if (response.success) {
      // Actualizar el estado local
      setContent(prev => ({
        ...prev,
        experience: prev.experience.filter(e => e._id !== id)
      }))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  } catch (error) {
    console.error("Error eliminando experiencia:", error)
    setIsLoading(false)
    return false
  }
}
