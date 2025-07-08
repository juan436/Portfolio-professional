import { useState, useEffect, useCallback } from "react";
import { useContent } from "@/contexts/content";
import type { OtherSkill } from "@/contexts/content/types";
import { useToastNotifications } from "../../use-toast-notifications";

/**
 * Hook para gestionar las otras habilidades en el panel de administración
 * Encapsula toda la lógica de gestión de otras habilidades
 * @returns Funciones y estado para gestionar otras habilidades
 */
export function useOtherSkillsActions() {
  const { 
    content, 
    addOtherSkill,
    editOtherSkill,
    removeOtherSkill,
    isLoading
  } = useContent();
  const toastNotifications = useToastNotifications();
  
  // Estado local para las otras habilidades
  const [otherSkills, setOtherSkills] = useState<OtherSkill[]>(content.otherSkills || []);
  const [currentOtherSkill, setCurrentOtherSkill] = useState<OtherSkill | null>(null);
  const [isOtherSkillDialogOpen, setIsOtherSkillDialogOpen] = useState(false);
  const [newOtherSkillName, setNewOtherSkillName] = useState("");

  // Sincronizar con el contexto global
  useEffect(() => {
    if (content.otherSkills) {
      setOtherSkills(content.otherSkills);
    }
  }, [content.otherSkills]);

  /**
   * Abre el diálogo para crear una nueva habilidad
   */
  const openNewOtherSkillDialog = useCallback(() => {
    setCurrentOtherSkill(null);
    setNewOtherSkillName("");
    setIsOtherSkillDialogOpen(true);
  }, []);

  /**
   * Abre el diálogo para editar una habilidad existente
   */
  const openEditOtherSkillDialog = useCallback((skill: OtherSkill) => {
    setCurrentOtherSkill(skill);
    setNewOtherSkillName(skill.name);
    setIsOtherSkillDialogOpen(true);
  }, []);

  /**
   * Cierra el diálogo de habilidades
   */
  const closeOtherSkillDialog = useCallback(() => {
    setIsOtherSkillDialogOpen(false);
    setCurrentOtherSkill(null);
    setNewOtherSkillName("");
  }, []);

  /**
   * Guarda una habilidad (nueva o editada)
   */
  const saveOtherSkill = useCallback(() => {
    if (!newOtherSkillName.trim()) {
      toastNotifications.showErrorToast(
        "Campo requerido", 
        "El nombre de la habilidad es obligatorio."
      );
      return;
    }

    if (currentOtherSkill && currentOtherSkill._id) {
      // Actualizar habilidad existente
      const updatedSkill = {
        ...currentOtherSkill,
        name: newOtherSkillName.trim()
      };
      
      editOtherSkill(currentOtherSkill._id, updatedSkill)
        .then(() => {
          toastNotifications.showSuccessToast(
            "Habilidad actualizada", 
            `La habilidad "${updatedSkill.name}" ha sido actualizada correctamente.`
          );
          closeOtherSkillDialog();
        })
        .catch(error => {
          toastNotifications.showErrorToast(
            "Error al actualizar", 
            `No se pudo actualizar la habilidad: ${error.message}`
          );
        });
    } else {
      // Crear nueva habilidad
      const newSkill: OtherSkill = {
        name: newOtherSkillName.trim()
      };
      
      addOtherSkill(newSkill)
        .then(() => {
          toastNotifications.showSuccessToast(
            "Habilidad creada", 
            `La habilidad "${newSkill.name}" ha sido creada correctamente.`
          );
          closeOtherSkillDialog();
        })
        .catch(error => {
          toastNotifications.showErrorToast(
            "Error al crear", 
            `No se pudo crear la habilidad: ${error.message}`
          );
        });
    }
  }, [currentOtherSkill, newOtherSkillName, addOtherSkill, editOtherSkill, closeOtherSkillDialog, toastNotifications]);

  /**
   * Elimina una habilidad
   */
  const deleteOtherSkill = useCallback((skillId: string) => {
    removeOtherSkill(skillId)
      .then(success => {
        if (success) {
          toastNotifications.showSuccessToast(
            "Habilidad eliminada", 
            "La habilidad ha sido eliminada correctamente."
          );
        } else {
          toastNotifications.showErrorToast(
            "Error al eliminar", 
            "No se pudo eliminar la habilidad. Inténtalo de nuevo."
          );
        }
      })
      .catch(error => {
        toastNotifications.showErrorToast(
          "Error al eliminar", 
          `No se pudo eliminar la habilidad: ${error.message}`
        );
      });
  }, [removeOtherSkill, toastNotifications]);

  return {
    otherSkills,
    currentOtherSkill,
    isOtherSkillDialogOpen,
    newOtherSkillName,
    setNewOtherSkillName,
    openNewOtherSkillDialog,
    openEditOtherSkillDialog,
    closeOtherSkillDialog,
    saveOtherSkill,
    deleteOtherSkill,
    isLoading
  };
}
