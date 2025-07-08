import { useState, useCallback, useEffect } from "react";
import { useContent } from "@/contexts/content";
import { useToastNotifications } from "../../use-toast-notifications";
import type { Project } from "@/contexts/content/types";

// Tipo para las categorías de proyectos
export type ProjectCategory = 'fullstack' | 'backend';

/**
 * Hook específico para gestionar proyectos en el panel de administración
 * Mantiene toda la funcionalidad del ProjectsManager original
 * @param initialCategory Categoría inicial seleccionada
 * @returns Funciones y estado para gestionar proyectos
 */
export function useProjectsActions(initialCategory: ProjectCategory = 'fullstack') {
  const { content, createProjectItem, updateProjectItem, deleteProjectItem } = useContent();
  const toastNotifications = useToastNotifications();
  
  // Estados para manejar las pestañas y proyectos
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>(initialCategory);
  const [fullstackProjects, setFullstackProjects] = useState<Project[]>(content.projects.fullstack || []);
  const [backendProjects, setBackendProjects] = useState<Project[]>(content.projects.backend || []);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [lastSelectedFullstack, setLastSelectedFullstack] = useState<Project | null>(null);
  const [lastSelectedBackend, setLastSelectedBackend] = useState<Project | null>(null);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  // Obtener los proyectos actuales según la categoría activa
  const currentProjects = activeCategory === "fullstack" ? fullstackProjects : backendProjects;
  const lastSelected = activeCategory === "fullstack" ? lastSelectedFullstack : lastSelectedBackend;
  
  // Función para recordar el último proyecto seleccionado por categoría
  const setLastSelected = useCallback((project: Project | null) => {
    if (activeCategory === "fullstack") {
      setLastSelectedFullstack(project);
    } else {
      setLastSelectedBackend(project);
    }
  }, [activeCategory]);

  // Sincronizar proyectos con el contexto
  useEffect(() => {
    setFullstackProjects(content.projects.fullstack || []);
    setBackendProjects(content.projects.backend || []);
  }, [content.projects]);

  // Manejar cambios de pestaña y selección de proyectos
  useEffect(() => {
    if (selectedProject && !isTabChanging) {
      setLastSelected(selectedProject);
    }

    if (isTabChanging) {
      const lastProjectExists = lastSelected && 
        currentProjects.some(p => p.id === lastSelected.id);
      
      setSelectedProject(lastProjectExists ? lastSelected : null);
      setEditMode(false);
      setIsTabChanging(false);
    }
  }, [activeCategory, selectedProject, isTabChanging, currentProjects, lastSelected, setLastSelected]);

  /**
   * Cambia la categoría activa (pestaña)
   */
  const handleTabChange = useCallback((value: string) => {
    setIsTabChanging(true);
    setActiveCategory(value as ProjectCategory);
  }, []);

  /**
   * Crea un nuevo proyecto con valores predeterminados
   */
  const addNewProject = useCallback(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    
    // Crear un objeto de proyecto temporal mínimo
    // Los valores predeterminados se manejan en el ProjectForm
    const newProjectTemplate: Project = {
      id: -1,
      title: "",
      description: "",
      tags: [],
      github: "",
      demo: "",
      createdAt: currentDate,
      image: undefined
    };

    // Establecer el modo de creación
    setIsCreatingNewProject(true);
    
    // Seleccionar el proyecto temporal y activar el modo de edición
    setSelectedProject(newProjectTemplate);
    setEditMode(true);
  }, []);

  /**
   * Guarda los cambios en un proyecto (nuevo o existente)
   */
  const handleSaveEdit = useCallback(async (updatedProject: Project) => {
    // Si estamos creando un nuevo proyecto
    if (isCreatingNewProject) {
      setIsLoading(true);
      try {
        const newProject = await createProjectItem(updatedProject, activeCategory);
        
        if (newProject) {
          setSelectedProject(newProject);
          setEditMode(false);
          setIsCreatingNewProject(false);
          toastNotifications.showCreatedToast("Proyecto");
          
          // Actualizar la lista de proyectos correspondiente
          if (activeCategory === "fullstack") {
            setFullstackProjects(prev => [...prev, newProject]);
          } else {
            setBackendProjects(prev => [...prev, newProject]);
          }
        } else {
          toastNotifications.showErrorCreatingToast("proyecto");
        }
      } catch (error) {
        console.error("Error al crear proyecto:", error);
        toastNotifications.showErrorToast("Error", "Ocurrió un error al crear el proyecto.");
      } finally {
        setIsLoading(false);
      }
    } 
    // Si estamos editando un proyecto existente
    else {
      setIsLoading(true);
      try {
        // Enviar el objeto completo con _modifiedFields
        const success = await updateProjectItem(
          updatedProject.id.toString(), 
          updatedProject,
          activeCategory
        );

        if (success) {
          setSelectedProject(updatedProject);
          setEditMode(false);
          toastNotifications.showUpdatedToast("Proyecto");
        } else {
          toastNotifications.showErrorUpdatingToast("proyecto");
        }
      } catch (error) {
        console.error("Error al actualizar proyecto:", error);
        toastNotifications.showErrorToast("Error", "Ocurrió un error al actualizar el proyecto.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeCategory, createProjectItem, updateProjectItem, isCreatingNewProject, toastNotifications]);

  /**
   * Cancela la edición de un proyecto
   */
  const handleCancelEdit = useCallback(() => {
    if (isCreatingNewProject) {
      // Si estamos creando un nuevo proyecto, simplemente descartamos el proyecto temporal
      setSelectedProject(null);
      setIsCreatingNewProject(false);
    }
    
    setEditMode(false);
  }, [isCreatingNewProject]);

  /**
   * Abre el diálogo de confirmación para eliminar un proyecto
   */
  const handleOpenDeleteDialog = useCallback((id: number) => {
    setIsDeleteDialogOpen(true);
    setProjectToDelete(id);
  }, []);

  /**
   * Cierra el diálogo de confirmación para eliminar un proyecto
   */
  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  }, []);

  /**
   * Elimina un proyecto después de confirmar
   */
  const handleConfirmDelete = useCallback(async () => {
    if (projectToDelete !== null) {
      const success = await deleteProjectItem(projectToDelete.toString(), activeCategory);

      if (success) {
        if (selectedProject && selectedProject.id === projectToDelete) {
          const remainingProjects = currentProjects.filter(p => p.id !== projectToDelete);
          setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
        }
        
        toastNotifications.showDeletedToast("Proyecto");
      } else {
        toastNotifications.showErrorDeletingToast("proyecto");
      }
    }

    handleCloseDeleteDialog();
  }, [activeCategory, currentProjects, deleteProjectItem, projectToDelete, selectedProject, toastNotifications]);

  return {
    // Estado
    activeCategory,
    fullstackProjects,
    backendProjects,
    selectedProject,
    currentProjects,
    editMode,
    isCreatingNewProject,
    isDeleteDialogOpen,
    isLoading,
    
    // Acciones
    setActiveCategory: handleTabChange,
    setSelectedProject,
    setEditMode,
    addNewProject,
    handleSaveEdit,
    handleCancelEdit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete
  };
}
