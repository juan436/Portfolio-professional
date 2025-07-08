import { useState, useEffect, useCallback } from "react";
import { useContent } from "@/contexts/content";
import { useToastNotifications } from "../../use-toast-notifications";
import type { Experience } from "@/components/admin/forms/experience-form";

/**
 * Hook para gestionar la experiencia laboral en el panel de administración
 * Encapsula toda la lógica de gestión de experiencias
 * @returns Funciones y estado para gestionar experiencias
 */
export function useExperienceActions() {
  const { 
    content, 
    createExperienceItem, 
    updateExperienceItem, 
    deleteExperienceItem 
  } = useContent();
  const toastNotifications = useToastNotifications();
  
  // Estado local para las experiencias
  const [experienceContent, setExperienceContent] = useState<Experience[]>(content.experience);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isCreatingNewExperience, setIsCreatingNewExperience] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);

  // Sincronizar con el contexto global
  useEffect(() => {
    setExperienceContent(content.experience);
  }, [content]);

  /**
   * Maneja cambios en la lista de experiencias
   */
  const handleExperienceChange = useCallback((updatedExperience: Experience[]) => {
    setExperienceContent(updatedExperience);
  }, []);

  /**
   * Añade una nueva experiencia
   */
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
    
    // Añadir la nueva experiencia al estado local
    setExperienceContent(prev => [...prev, newExperience]);
    
    return newExperience;
  }, []);

  /**
   * Cancela la edición o creación actual
   */
  const handleCancelEdit = useCallback(() => {
    if (isCreatingNewExperience) {
      // Si estábamos creando una nueva experiencia, la eliminamos del estado
      setExperienceContent(prev => prev.filter(exp => exp._id));
      setSelectedExperience(null);
    }
    
    setEditMode(false);
    setIsCreatingNewExperience(false);
  }, [isCreatingNewExperience]);

  /**
   * Crea una nueva experiencia
   */
  const handleCreateExperience = useCallback(async (experience: Omit<Experience, "_id">) => {
    setIsLoading(true);
    try {
      const result = await createExperienceItem(experience);
      
      if (result) {
        // Actualizar el estado local para reflejar la creación exitosa
        const updatedExperiences = experienceContent.map(exp => {
          if (!exp._id && 
              exp.position === experience.position && 
              exp.company === experience.company) {
            // Encontramos la experiencia que acabamos de crear, actualizamos su estado
            const updatedExp = { ...exp, _id: result._id };
            setSelectedExperience(updatedExp);
            return updatedExp;
          }
          return exp;
        });
        
        setExperienceContent(updatedExperiences);
        setEditMode(false);
        setIsCreatingNewExperience(false);
        toastNotifications.showCreatedToast("Experiencia");
        return true;
      } else {
        toastNotifications.showErrorCreatingToast("experiencia");
        return false;
      }
    } catch (error) {
      console.error("Error al crear experiencia:", error);
      toastNotifications.showErrorToast("Error", "Ocurrió un error al crear la experiencia.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createExperienceItem, experienceContent, toastNotifications]);

  /**
   * Guarda los cambios en la experiencia actual
   */
  const handleSaveEdit = useCallback(async (updatedExperience: Experience) => {
    setIsLoading(true);
    try {
      if (isCreatingNewExperience) {
        // Si es una nueva experiencia, la creamos
        const { isNew, _modifiedFields, ...experienceData } = updatedExperience;
        return await handleCreateExperience(experienceData);
      } else if (updatedExperience._id) {
        // Si es una experiencia existente, la actualizamos
        // Extraer la lista de campos modificados y eliminarla del objeto
        const { _modifiedFields = [], ...experienceData } = updatedExperience;
        // Si hay campos modificados, crear un objeto que solo contenga esos campos
        let dataToUpdate: Partial<Experience> = { ...experienceData };
        // Si hay campos modificados especificados, solo enviar esos campos
        if (_modifiedFields.length > 0) {
          dataToUpdate = { _id: updatedExperience._id };
          // Solo incluir los campos que fueron modificados
          _modifiedFields.forEach(field => {
            if (field === 'skills') {
              dataToUpdate.skills = updatedExperience.skills;
            } else if (field in updatedExperience) {
              // Usar type assertion para acceder dinámicamente a las propiedades
              (dataToUpdate as any)[field] = (updatedExperience as any)[field];
            }
          });
        }
        
        // Usar type assertion para satisfacer el tipo esperado por la función
        const success = await updateExperienceItem(updatedExperience._id, dataToUpdate as Experience);
        if (success) {
          // Actualizar el estado local para reflejar la actualización exitosa
          setSelectedExperience(updatedExperience);
          setEditMode(false);
          toastNotifications.showUpdatedToast("Experiencia");
          return true;
        } else {
          toastNotifications.showErrorUpdatingToast("experiencia");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Error al guardar experiencia:", error);
      toastNotifications.showErrorToast("Error", "Ocurrió un error al guardar la experiencia.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleCreateExperience, isCreatingNewExperience, toastNotifications, updateExperienceItem]);

  /**
   * Elimina una experiencia
   */
  const handleDeleteExperience = useCallback(async (id: string) => {
    try {
      const success = await deleteExperienceItem(id);
      
      if (success) {
        // Actualizar el estado local
        const updatedExperiences = experienceContent.filter(exp => exp._id !== id);
        setExperienceContent(updatedExperiences);
        
        // Si la experiencia eliminada era la seleccionada, deseleccionamos
        if (selectedExperience && selectedExperience._id === id) {
          setSelectedExperience(null);
          setEditMode(false);
        }
        toastNotifications.showDeletedToast("Experiencia");
        return true;
      } else {
        toastNotifications.showErrorDeletingToast("experiencia");
        return false;
      }
    } catch (error) {
      console.error("Error al eliminar experiencia:", error);
      toastNotifications.showErrorToast("Error", "Ocurrió un error al eliminar la experiencia.");
      return false;
    }
  }, [deleteExperienceItem, experienceContent, selectedExperience, toastNotifications]);

  /**
   * Abre el diálogo de confirmación de eliminación
   */
  const handleOpenDeleteDialog = useCallback((id: string) => {
    setIsDeleteDialogOpen(true);
    setExperienceToDelete(id);
  }, []);

  /**
   * Cierra el diálogo de confirmación de eliminación
   */
  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setExperienceToDelete(null);
  }, []);

  /**
   * Confirma la eliminación de la experiencia
   */
  const handleConfirmDelete = useCallback(async () => {
    if (experienceToDelete) {
      await handleDeleteExperience(experienceToDelete);
      handleCloseDeleteDialog();
    }
  }, [experienceToDelete, handleDeleteExperience, handleCloseDeleteDialog]);

  return {
    experienceContent,
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
