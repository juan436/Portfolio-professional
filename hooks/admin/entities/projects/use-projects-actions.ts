import { useState, useCallback, useEffect } from "react";
import { fetchProjects } from "@/services/api/projects";
import { createProjectAction, updateProjectAction, deleteProjectAction } from "@/lib/actions/projects";
import { useToastNotifications } from "../../use-toast-notifications";
import { CATEGORY_ORDER, emptyProject, type AdminProject, type ProjectCategoryValue } from "./types";

const emptyProjectsByCategory = (): Record<ProjectCategoryValue, AdminProject[]> => ({
  web: [],
  mobile: [],
  infra_backend: [],
  laboratorio: [],
  automatizacion: [],
  agente: [],
});

/**
 * Hook de Proyectos para el panel de administración — reescrito para usar
 * Server Actions (lib/actions/projects.ts) en vez del ContentProvider global
 * (auditoría 2026-08-19: Admin quedó desacoplado del Context, cada entidad
 * migra a su propio ritmo). La carga inicial sigue siendo un fetch client-side
 * propio (Admin no necesita el patrón Server Component del sitio público,
 * siempre quiere el dato más fresco al entrar).
 * @param initialCategory - Categoría activa al montar (default `"web"`).
 * @returns Proyectos agrupados por categoría + selección/edición/borrado con tabs.
 */
export function useProjectsActions(initialCategory: ProjectCategoryValue = "web") {
  const toastNotifications = useToastNotifications();

  const [activeCategory, setActiveCategoryState] = useState<ProjectCategoryValue>(initialCategory);
  const [projectsByCategory, setProjectsByCategory] = useState<Record<ProjectCategoryValue, AdminProject[]>>(
    emptyProjectsByCategory()
  );
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [lastSelectedByCategory, setLastSelectedByCategory] = useState<Record<ProjectCategoryValue, AdminProject | null>>({
    web: null,
    mobile: null,
    infra_backend: null,
    laboratorio: null,
    automatizacion: null,
    agente: null,
  });
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const currentProjects = projectsByCategory[activeCategory];
  const lastSelected = lastSelectedByCategory[activeCategory];

  const setLastSelected = useCallback((project: AdminProject | null) => {
    setLastSelectedByCategory((prev) => ({ ...prev, [activeCategory]: project }));
  }, [activeCategory]);

  // Carga inicial: todos los proyectos de una sola vez, agrupados en cliente
  // por categoría (1 request en vez de 6).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsFetching(true);
      try {
        const all = (await fetchProjects()) as AdminProject[];
        const grouped = emptyProjectsByCategory();
        for (const project of all) {
          const category = project.category as ProjectCategoryValue;
          if (grouped[category]) grouped[category].push(project);
        }
        if (!cancelled) setProjectsByCategory(grouped);
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedProject && !isTabChanging) {
      setLastSelected(selectedProject);
    }

    if (isTabChanging) {
      const lastProjectExists = lastSelected && currentProjects.some((p) => p._id === lastSelected._id);
      setSelectedProject(lastProjectExists ? lastSelected : null);
      setEditMode(false);
      setIsTabChanging(false);
    }
  }, [activeCategory, selectedProject, isTabChanging, currentProjects, lastSelected, setLastSelected]);

  const handleTabChange = useCallback((value: string) => {
    setIsTabChanging(true);
    setActiveCategoryState(value as ProjectCategoryValue);
  }, []);

  const addNewProject = useCallback(() => {
    setIsCreatingNewProject(true);
    setSelectedProject(emptyProject(activeCategory) as AdminProject);
    setEditMode(true);
  }, [activeCategory]);

  const handleSaveEdit = useCallback(async (updatedProject: AdminProject) => {
    if (isCreatingNewProject) {
      setIsLoading(true);
      try {
        const { _id, ...payload } = updatedProject;
        const newProject = await createProjectAction({ ...payload, category: activeCategory });
        setSelectedProject(newProject);
        setEditMode(false);
        setIsCreatingNewProject(false);
        toastNotifications.showCreatedToast("Proyecto");
        setProjectsByCategory((prev) => ({
          ...prev,
          [activeCategory]: [...prev[activeCategory], newProject],
        }));
      } catch (error) {
        console.error("Error al crear proyecto:", error);
        toastNotifications.showErrorCreatingToast("proyecto");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const updated = await updateProjectAction(updatedProject._id, updatedProject);
        setSelectedProject(updated);
        setEditMode(false);
        toastNotifications.showUpdatedToast("Proyecto");
        setProjectsByCategory((prev) => ({
          ...prev,
          [activeCategory]: prev[activeCategory].map((p) => (p._id === updated._id ? updated : p)),
        }));
      } catch (error) {
        console.error("Error al actualizar proyecto:", error);
        toastNotifications.showErrorUpdatingToast("proyecto");
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeCategory, isCreatingNewProject, toastNotifications]);

  const handleCancelEdit = useCallback(() => {
    if (isCreatingNewProject) {
      setSelectedProject(null);
      setIsCreatingNewProject(false);
    }
    setEditMode(false);
  }, [isCreatingNewProject]);

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setIsDeleteDialogOpen(true);
    setProjectToDelete(id);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (projectToDelete !== null) {
      try {
        const target = currentProjects.find((p) => p._id === projectToDelete);
        await deleteProjectAction(projectToDelete, activeCategory, target?.slug || "");

        if (selectedProject && selectedProject._id === projectToDelete) {
          const remaining = currentProjects.filter((p) => p._id !== projectToDelete);
          setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        }
        setProjectsByCategory((prev) => ({
          ...prev,
          [activeCategory]: prev[activeCategory].filter((p) => p._id !== projectToDelete),
        }));
        toastNotifications.showDeletedToast("Proyecto");
      } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        toastNotifications.showErrorDeletingToast("proyecto");
      }
    }
    handleCloseDeleteDialog();
  }, [activeCategory, currentProjects, projectToDelete, selectedProject, toastNotifications]);

  return {
    activeCategory,
    selectedProject,
    currentProjects,
    editMode,
    isCreatingNewProject,
    isDeleteDialogOpen,
    isLoading,
    isFetching,

    setActiveCategory: handleTabChange,
    setSelectedProject,
    setEditMode,
    addNewProject,
    handleSaveEdit,
    handleCancelEdit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}

export { CATEGORY_ORDER };
