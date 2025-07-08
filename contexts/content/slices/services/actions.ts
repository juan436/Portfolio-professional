import { Dispatch, SetStateAction } from "react"
import { updateContent, deleteService as apiDeleteService } from "@/services/api"
import { Content, Service } from "../../types"

/**
 * Actualiza la sección Services en el estado local y en el servidor
 * @param services Lista de servicios actualizada
 * @param setContent Función para actualizar el estado global
 * @param setIsLoading Función para actualizar el estado de carga
 */
export const updateServices = async (
  services: Array<Service & { _modifiedFields?: string[] }>,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  // Procesar cada servicio para extraer _modifiedFields y crear objetos con solo campos modificados
  const processedServices = services.map((service, index) => {
    // Extraer _modifiedFields si existe
    const modifiedFields = service._modifiedFields || [];
    
    // Crear una copia sin _modifiedFields para el estado local
    const { _modifiedFields, ...serviceForState } = service;
    
    // Verificar si es un servicio nuevo (sin _id)
    const isNewService = !serviceForState._id;
    
    // Si es un servicio nuevo, enviarlo completo
    if (isNewService) {
      return { serviceForState, fieldsToUpdate: serviceForState, hasChanges: true };
    }
    
    // Si hay campos modificados, enviar el objeto completo en lugar de solo los campos modificados
    // Esto evita que se pierdan campos como "description" al actualizar solo "title"
    if (modifiedFields.length > 0) {
      return { serviceForState, fieldsToUpdate: serviceForState, hasChanges: true };
    }
    
    // Si no hay campos modificados, no incluir en la actualización
    return { serviceForState, fieldsToUpdate: null, hasChanges: false };
  });
  
  // Actualizar el estado local sin incluir _modifiedFields
  setContent(prev => ({ 
    ...prev, 
    services: processedServices.map(item => item.serviceForState) 
  }));
  
  // Filtrar solo los servicios que tienen cambios
  const servicesWithChanges = processedServices
    .filter(item => item.hasChanges)
    .map(item => item.fieldsToUpdate);
  
  // Si no hay servicios con cambios, no hacer nada más
  if (servicesWithChanges.length === 0) {
    return;
  }
  
  setIsLoading(true);
  try {
    // Enviar los servicios completos al API para cada servicio modificado
    const response = await updateContent('services', servicesWithChanges);
    
    // Si hay servicios nuevos, actualizar sus IDs desde la respuesta del servidor
    if (response && response.data && response.data.services) {
      
      // Actualizar el estado con los IDs de los servicios nuevos
      setContent(prev => {
        // Crear un mapa de IDs existentes para evitar duplicados
        const existingIds = new Set(prev.services
          .filter(service => service._id)
          .map(service => service._id?.toString()));
        
        // Crear una copia del array de servicios
        const updatedServices = [...prev.services];
        
        // Encontrar servicios sin ID en el estado local
        const servicesWithoutId = updatedServices.filter(service => !service._id);
        
        // Si hay servicios nuevos en la respuesta, asignar IDs
        if (servicesWithoutId.length > 0 && response.data.services.length > 0) {
          // Obtener solo los servicios nuevos de la respuesta (los últimos N elementos)
          const newServicesFromServer = response.data.services.slice(-servicesWithoutId.length);
          
          // Para cada servicio sin ID, asignar un ID único de la respuesta
          let serverIndex = 0;
          for (let i = 0; i < updatedServices.length; i++) {
            if (!updatedServices[i]._id && serverIndex < newServicesFromServer.length) {
              const newId = newServicesFromServer[serverIndex]._id;
              
              // Verificar que el ID no esté duplicado
              if (!existingIds.has(newId?.toString())) {
                updatedServices[i] = {
                  ...updatedServices[i],
                  _id: newId
                };
                
                // Agregar el nuevo ID al conjunto de IDs existentes
                existingIds.add(newId?.toString());
                serverIndex++;
              } else {
                console.warn(`[updateServices] Evitando duplicar ID ${newId}`);
              }
            }
          }
        }
        
        return {
          ...prev,
          services: updatedServices
        };
      });
    }
  } catch (error) {
    console.error("Error actualizando services:", error);
  }
  setIsLoading(false);
}

/**
 * Elimina un servicio específico por su ID
 * @param id ID del servicio a eliminar
 * @param content Estado actual del contenido
 * @param setContent Función para actualizar el estado global
 * @param setIsLoading Función para actualizar el estado de carga
 * @returns Booleano indicando si la operación fue exitosa
 */
export const deleteService = async (
  id: string,
  content: Content,
  setContent: Dispatch<SetStateAction<Content>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<boolean> => {
  if (!id || id.trim() === '') {
    return false;
  }
  
  const originalContent = { ...content };
  
  // Actualizar el estado local inmediatamente para mejor UX
  setContent(prev => {
    // Usar toString() para asegurar comparación correcta de IDs
    const updatedServices = prev.services.filter(service => {
      // Solo filtrar si el servicio tiene un _id y coincide con el id a eliminar
      if (!service._id) return true; // Mantener servicios sin ID
      return service._id.toString() !== id.toString(); // Comparar como strings
    });
    
    return {
      ...prev,
      services: updatedServices
    };
  });
  
  setIsLoading(true);
  
  try {
    const result = await apiDeleteService(id);
    
    if (!result.success) {
      // Si hay un error, revertir el cambio local
      console.error(`[deleteService/slice] Error eliminando servicio:`, result.message);
      setContent(prev => ({ ...originalContent }));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[deleteService/slice] Error:`, error);
    // Revertir el cambio local en caso de error
    setContent(prev => ({ ...originalContent }));
    return false;
  } finally {
    setIsLoading(false);
  }
};
