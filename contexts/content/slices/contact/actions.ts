import { Dispatch, SetStateAction } from "react"
import { updateContent } from "@/services/api"
import { Content, Contact } from "../../types"

/**
 * Actualiza la sección Contact en el estado local y en el servidor
 * @param contact Datos actualizados del Contact
 * @param setContent Función para actualizar el estado global
 * @param setIsLoading Función para actualizar el estado de carga
 */
export const updateContact = async (
  contact: Contact & { _modifiedFields?: string[] },
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  // Extraer _modifiedFields para uso local
  const modifiedFields = contact._modifiedFields || [];
  // Crear una copia sin _modifiedFields para el estado local
  const { _modifiedFields, ...contactForState } = contact;
  // Actualizar el estado local sin incluir _modifiedFields
  setContent(prev => ({ ...prev, contact: contactForState }));
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
      fieldsToUpdate[field] = contactForState[field as keyof typeof contactForState];
    });
    // Pasar solo los campos modificados al servicio de API
    await updateContent('contact', fieldsToUpdate);
  } catch (error) {
    console.error("Error actualizando contact:", error);
  }
  setIsLoading(false);
}
