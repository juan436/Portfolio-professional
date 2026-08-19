import { useState, useEffect, useCallback } from "react";
import { fetchSkills } from "@/services/api/skills/regular-skills";
import { createSkillAction, updateSkillAction, deleteSkillAction } from "@/lib/actions/skills";
import type { Skill } from "@/contexts/content/types";
import { useToastNotifications } from "../../use-toast-notifications";

/**
 * Hook para gestionar las habilidades en el panel de administración —
 * reescrito para usar Server Actions (lib/actions/skills.ts) en vez del
 * ContentProvider global (Fase 4, auditoría 2026-08-19). Carga inicial
 * propia (fetch client-side), igual que el resto de entidades ya migradas.
 */
export function useSkillsActions() {
  const toastNotifications = useToastNotifications();

  const [skills, setSkills] = useState<any>({ frontend: [], backend: [], database: [], devops: [] });
  const [isFetching, setIsFetching] = useState(true);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("frontend");

  const load = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await fetchSkills();
      setSkills(result);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNewSkillForm = useCallback((category: string) => {
    setCurrentSkill({
      name: "",
      icon: "",
      colored: false,
      category
    } as Skill);
    setIsSkillFormOpen(true);
  }, []);

  const openEditSkillForm = useCallback((skill: Skill) => {
    setCurrentSkill({ ...skill });
    setIsSkillFormOpen(true);
  }, []);

  const closeSkillForm = useCallback(() => {
    setIsSkillFormOpen(false);
    setCurrentSkill(null);
  }, []);

  const saveSkill = useCallback((skill: Skill) => {
    const payload = { name: skill.name, icon: skill.icon, colored: skill.colored ?? false, category: skill.category };

    const promise = skill._id
      ? updateSkillAction(skill._id, payload)
      : createSkillAction(payload);

    promise
      .then(() => {
        toastNotifications.showSuccessToast(
          skill._id ? "Habilidad actualizada" : "Habilidad creada",
          `La habilidad "${skill.name}" se guardó correctamente.`
        );
        load();
      })
      .catch((error) => {
        toastNotifications.showErrorToast(
          skill._id ? "Error al actualizar" : "Error al crear",
          error instanceof Error ? error.message : "Ocurrió un error inesperado."
        );
      });

    closeSkillForm();
  }, [closeSkillForm, load, toastNotifications]);

  const deleteSkill = useCallback((skillId: string) => {
    deleteSkillAction(skillId)
      .then(() => {
        toastNotifications.showSuccessToast("Habilidad eliminada", "La habilidad ha sido eliminada correctamente.");
        load();
      })
      .catch((error) => {
        toastNotifications.showErrorToast(
          "Error al eliminar",
          error instanceof Error ? error.message : "No se pudo eliminar la habilidad."
        );
      });
  }, [load, toastNotifications]);

  return {
    skills,
    isFetching,
    currentSkill,
    isSkillFormOpen,
    activeTab,
    setActiveTab,
    openNewSkillForm,
    openEditSkillForm,
    closeSkillForm,
    saveSkill,
    deleteSkill
  };
}
