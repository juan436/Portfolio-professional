import { Dispatch, SetStateAction } from "react"
import { updateContent } from "@/services/api"
import { Content, Hero } from "../../types"

/**
 * Actualiza la sección Hero en el estado local y en el servidor
 * @param hero Datos actualizados del Hero
 * @param setContent Función para actualizar el estado global
 * @param setIsLoading Función para actualizar el estado de carga
 */
export const updateHero = async (
  hero: Hero & { _modifiedFields?: string[] },
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  // Extraer _modifiedFields para uso local
  const modifiedFields = hero._modifiedFields || [];
  // Crear una copia sin _modifiedFields para el estado local
  const { _modifiedFields, ...heroForState } = hero;
  // Actualizar el estado local sin incluir _modifiedFields
  setContent(prev => ({ ...prev, hero: heroForState }));
  // Si no hay campos modificados, no hacer nada más
  if (modifiedFields.length === 0) {
    return;
  }
  setIsLoading(true);
  try {
    // Crear un objeto que solo contenga los campos modificados
    const fieldsToUpdate: Record<string, any> = {};
    // Añadir solo los campos modificados
    modifiedFields.forEach(field => {
      fieldsToUpdate[field] = heroForState[field as keyof typeof heroForState];
    });
    // Pasar solo los campos modificados al servicio de API
    await updateContent('hero', fieldsToUpdate);
  } catch (error) {
    console.error("Error actualizando hero:", error);
  }
  setIsLoading(false);
}
