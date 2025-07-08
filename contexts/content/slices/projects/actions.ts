import { Dispatch, SetStateAction } from "react"
import { 
  updateContent, 
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi
} from "@/services/api"
import { Content, Project, Projects } from "../../types"

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

/**
 * Crea un nuevo proyecto en la categoría especificada
 */
export const createProjectItem = async (
  projectData: Omit<Project, "id">, 
  category: 'fullstack' | 'backend',
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<Project | null> => {
  setIsLoading(true)
  try {
    // Preparar el proyecto para la API
    const projectToCreate = {
      ...projectData,
      category
    }

    // Llamar a la API para crear el proyecto
    const response = await createProjectApi(projectToCreate)

    if (response.success && response.data) {
      // Formatear el proyecto creado
      const newProject: Project = {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        image: response.data.image,
        tags: response.data.tags || [],
        github: response.data.github || "#",
        demo: response.data.demo || "#",
        createdAt: response.data.createdAt
      }

      // Actualizar el estado local
      if (category === 'fullstack') {
        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            fullstack: [...prev.projects.fullstack, newProject]
          }
        }))
      } else {
        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            backend: [...prev.projects.backend, newProject]
          }
        }))
      }

      setIsLoading(false)
      return newProject
    }

    setIsLoading(false)
    return null
  } catch (error) {
    console.error("Error creando proyecto:", error)
    setIsLoading(false)
    return null
  }
}

/**
 * Actualiza un proyecto existente en la categoría especificada
 */
export const updateProjectItem = async (
  id: string, 
  project: Partial<Project>, 
  category: 'fullstack' | 'backend',
  content: Content,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  setIsLoading(true)
  try {
    // Extraer _modifiedFields del objeto
    const { _modifiedFields = [], ...allData } = project;
    
    // Crear un objeto que solo contenga los campos modificados
    const dataToUpdate: Partial<Project> = {};
    
    // Solo incluir los campos que han sido modificados
    if (_modifiedFields && _modifiedFields.length > 0) {
      _modifiedFields.forEach(field => {
        if (field in allData && field !== '_modifiedFields') {
          (dataToUpdate as any)[field] = allData[field as keyof typeof allData];
        }
      });
    } else {
      Object.assign(dataToUpdate, allData);
    }
    
    const projectToUpdate = {
      ...dataToUpdate,
      category
    }

    const response = await updateProjectApi(id, projectToUpdate)

    if (response.success) {
      if (category === 'fullstack') {
        const updatedProjects = content.projects.fullstack.map(p =>
          p.id.toString() === id ? { ...p, ...dataToUpdate } : p
        )

        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            fullstack: updatedProjects
          }
        }))
      } else {
        const updatedProjects = content.projects.backend.map(p =>
          p.id.toString() === id ? { ...p, ...dataToUpdate } : p
        )

        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            backend: updatedProjects
          }
        }))
      }

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  } catch (error) {
    console.error("Error actualizando proyecto:", error)
    setIsLoading(false)
    return false
  }
}

/**
 * Elimina un proyecto existente de la categoría especificada
 */
export const deleteProjectItem = async (
  id: string, 
  category: 'fullstack' | 'backend',
  content: Content,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  setIsLoading(true)
  try {
    const response = await deleteProjectApi(id)

    if (response.success) {
      if (category === 'fullstack') {
        const filteredProjects = content.projects.fullstack.filter(
          p => p.id.toString() !== id
        )

        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            fullstack: filteredProjects
          }
        }))
      } else {
        const filteredProjects = content.projects.backend.filter(
          p => p.id.toString() !== id
        )

        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            backend: filteredProjects
          }
        }))
      }

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  } catch (error) {
    console.error("Error eliminando proyecto:", error)
    setIsLoading(false)
    return false
  }
}
