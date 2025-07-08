import { Dispatch, SetStateAction } from "react"
import { updateContent } from "@/services/api"
import { Content, About } from "../../types"

/**
 * Actualiza la sección About en el estado local y en el servidor
 * @param about Datos actualizados del About
 * @param setContent Función para actualizar el estado global
 * @param setIsLoading Función para actualizar el estado de carga
 */
export const updateAbout = async (
  about: About & { _modifiedFields?: string[] },
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  // Extraer _modifiedFields para uso local
  const modifiedFields = about._modifiedFields || [];
  
  // Crear una copia sin _modifiedFields para el estado local
  const { _modifiedFields, ...aboutForState } = about;
  
  // Actualizar el estado local sin incluir _modifiedFields
  setContent(prev => ({ ...prev, about: aboutForState }));
  
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
      fieldsToUpdate[field] = aboutForState[field as keyof typeof aboutForState];
    });
    
    // Pasar solo los campos modificados al servicio de API
    await updateContent('about', fieldsToUpdate);
  } catch (error) {
    console.error("Error actualizando about:", error);
  }
  setIsLoading(false);
}
