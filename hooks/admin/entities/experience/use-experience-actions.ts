import { useState, useEffect, useCallback } from "react";
import { fetchExperiences } from "@/services/api/experience";
import { createExperienceAction, updateExperienceAction, deleteExperienceAction } from "@/lib/actions/experience";
import { useToastNotifications } from "../../use-toast-notifications";
import type { Experience } from "@/components/admin/forms/experience-form";

/**
 * Hook para gestionar la experiencia laboral — reescrito para usar Server
 * Actions (lib/actions/experience.ts), Fase 4 (auditoría 2026-08-19). Carga
 * inicial propia, ya no depende de ContentProvider.
 */
export function useExperienceActions() {
  const toastNotifications = useToastNotifications();

  const [experienceContent, setExperienceContent] = useState<Experience[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isCreatingNewExperience, setIsCreatingNewExperience] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await fetchExperiences();
      setExperienceContent(result || []);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addNewExperience = useCallback(() => {
    const newExperience: Experience = {
      position: "",
      company: "",
      period: "",
      description: "",
      skills: []
    };

    setSelectedExperience(newExperience);
    setEditMode(true);
    setIsCreatingNewExperience(true);

    return newExperience;
  }, []);

  const handleCancelEdit = useCallback(() => {
    setSelectedExperience(null);
    setEditMode(false);
    setIsCreatingNewExperience(false);
  }, []);

  const handleSaveEdit = useCallback(async (updatedExperience: Experience) => {
    setIsLoading(true);
    try {
      if (isCreatingNewExperience) {
        const { isNew, _modifiedFields, ...experienceData } = updatedExperience as any;
        const created = await createExperienceAction(experienceData);
        setSelectedExperience(created);
        setEditMode(false);
        setIsCreatingNewExperience(false);
        toastNotifications.showCreatedToast("Experiencia");
        await load();
        return true;
      } else if (updatedExperience._id) {
        const { _modifiedFields = [], ...experienceData } = updatedExperience as any;
        let dataToUpdate: Partial<Experience> = { ...experienceData };
        if (_modifiedFields.length > 0) {
          dataToUpdate = {};
          _modifiedFields.forEach((field: string) => {
            (dataToUpdate as any)[field] = (updatedExperience as any)[field];
          });
        }

        const updated = await updateExperienceAction(updatedExperience._id, dataToUpdate);
        setSelectedExperience(updated);
        setEditMode(false);
        toastNotifications.showUpdatedToast("Experiencia");
        await load();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al guardar experiencia:", error);
      toastNotifications.showErrorToast("Error", "Ocurrió un error al guardar la experiencia.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isCreatingNewExperience, load, toastNotifications]);

  const handleDeleteExperience = useCallback(async (id: string) => {
    try {
      await deleteExperienceAction(id);
      await load();
      if (selectedExperience && selectedExperience._id === id) {
        setSelectedExperience(null);
        setEditMode(false);
      }
      toastNotifications.showDeletedToast("Experiencia");
      return true;
    } catch (error) {
      console.error("Error al eliminar experiencia:", error);
      toastNotifications.showErrorToast("Error", "Ocurrió un error al eliminar la experiencia.");
      return false;
    }
  }, [load, selectedExperience, toastNotifications]);

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setIsDeleteDialogOpen(true);
    setExperienceToDelete(id);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setExperienceToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (experienceToDelete) {
      await handleDeleteExperience(experienceToDelete);
      handleCloseDeleteDialog();
    }
  }, [experienceToDelete, handleDeleteExperience, handleCloseDeleteDialog]);

  return {
    experienceContent,
    isFetching,
    selectedExperience,
    editMode,
    isCreatingNewExperience,
    isDeleteDialogOpen,
    isLoading,
    setSelectedExperience,
    setEditMode,
    addNewExperience,
    handleSaveEdit,
    handleCancelEdit,
    deleteExperience: handleOpenDeleteDialog,
    handleConfirmDelete,
    handleCloseDeleteDialog
  };
}
