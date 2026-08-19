import { useState, useEffect, useCallback } from "react";
import { fetchOtherSkills } from "@/services/api/skills/other-skills";
import { createOtherSkillAction, updateOtherSkillAction, deleteOtherSkillAction } from "@/lib/actions/other-skills";
import type { OtherSkill } from "@/contexts/content/types";
import { useToastNotifications } from "../../use-toast-notifications";

/**
 * Hook para gestionar las otras habilidades — reescrito para usar Server
 * Actions (lib/actions/other-skills.ts), Fase 4 (auditoría 2026-08-19).
 */
export function useOtherSkillsActions() {
  const toastNotifications = useToastNotifications();

  const [otherSkills, setOtherSkills] = useState<OtherSkill[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentOtherSkill, setCurrentOtherSkill] = useState<OtherSkill | null>(null);
  const [isOtherSkillDialogOpen, setIsOtherSkillDialogOpen] = useState(false);
  const [newOtherSkillName, setNewOtherSkillName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await fetchOtherSkills();
      setOtherSkills(result.data || []);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNewOtherSkillDialog = useCallback(() => {
    setCurrentOtherSkill(null);
    setNewOtherSkillName("");
    setIsOtherSkillDialogOpen(true);
  }, []);

  const openEditOtherSkillDialog = useCallback((skill: OtherSkill) => {
    setCurrentOtherSkill(skill);
    setNewOtherSkillName(skill.name);
    setIsOtherSkillDialogOpen(true);
  }, []);

  const closeOtherSkillDialog = useCallback(() => {
    setIsOtherSkillDialogOpen(false);
    setCurrentOtherSkill(null);
    setNewOtherSkillName("");
  }, []);

  const saveOtherSkill = useCallback(async () => {
    if (!newOtherSkillName.trim()) {
      toastNotifications.showErrorToast("Campo requerido", "El nombre de la habilidad es obligatorio.");
      return;
    }

    setIsLoading(true);
    try {
      if (currentOtherSkill?._id) {
        await updateOtherSkillAction(currentOtherSkill._id, newOtherSkillName.trim());
        toastNotifications.showSuccessToast("Habilidad actualizada", `La habilidad "${newOtherSkillName.trim()}" se actualizó correctamente.`);
      } else {
        await createOtherSkillAction(newOtherSkillName.trim());
        toastNotifications.showSuccessToast("Habilidad creada", `La habilidad "${newOtherSkillName.trim()}" se creó correctamente.`);
      }
      await load();
      closeOtherSkillDialog();
    } catch (error) {
      toastNotifications.showErrorToast(
        currentOtherSkill?._id ? "Error al actualizar" : "Error al crear",
        error instanceof Error ? error.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentOtherSkill, newOtherSkillName, load, closeOtherSkillDialog, toastNotifications]);

  const deleteOtherSkill = useCallback(async (skillId: string) => {
    try {
      await deleteOtherSkillAction(skillId);
      toastNotifications.showSuccessToast("Habilidad eliminada", "La habilidad ha sido eliminada correctamente.");
      await load();
    } catch (error) {
      toastNotifications.showErrorToast(
        "Error al eliminar",
        error instanceof Error ? error.message : "No se pudo eliminar la habilidad."
      );
    }
  }, [load, toastNotifications]);

  return {
    otherSkills,
    isFetching,
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
