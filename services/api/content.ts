// portfolio/services/api/content.ts
import { API_URL } from './index';
import { translateAndAddToObject } from '../client/translation';

/**
 * Obtiene todo el contenido del sitio
 */
export const fetchContent = async () => {
  try {
    const response = await fetch(`${API_URL}/content`);

    if (!response.ok) {
      throw new Error('Error al obtener contenido');
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
};

/**
 * Actualiza una sección específica del contenido
 * Traduce automáticamente solo los campos recibidos (que son los modificados)
 * Solo envía los campos modificados para reducir la carga en la base de datos
 */
export const updateContent = async (section: string, data: any) => {
  try {
    // Definir los campos a traducir según la sección
    const fieldsToTranslate: Record<string, string[]> = {
      hero: ['title', 'subtitle', 'description'],
      about: ['paragraph1', 'paragraph2', 'paragraph3'],
      services: ['title', 'description'],
      contact: ['location'],
      projects: ['title', 'description', 'tags'],
      skills: ['name'],
      otherSkills: ['name'],
      experience: ['position', 'description', 'location']
    };

    // Si la sección tiene campos definidos para traducir
    if (fieldsToTranslate[section]) {
      
      // Procesar datos según si es un array o un objeto individual
      if (Array.isArray(data)) {
        
        
        // Procesar cada elemento del array
        const translatedItems = await Promise.all(
          data.map(async (item, index) => {
            // Crear una copia limpia del item
            const cleanItem = { ...item };
            
            // Eliminar _modifiedFields si existe
            if (cleanItem._modifiedFields) {
              delete cleanItem._modifiedFields;
            }
            
            // Verificar si es un item nuevo (sin _id o con _id vacío)
            const isNewItem = !cleanItem._id || cleanItem._id === '';
            
            // Determinar los campos a traducir
            // Para items nuevos, traducir todos los campos traducibles
            // Para items existentes, traducir solo los campos presentes (que son los modificados)
            const fieldsToTranslateForItem = Object.keys(cleanItem)
              .filter(key => 
                fieldsToTranslate[section].includes(key) && 
                key !== '_id'
              );
            // Si no hay campos para traducir, devolver el item sin cambios
            if (fieldsToTranslateForItem.length === 0) {
              return cleanItem;
            }
            
            // Traducir los campos necesarios
            const translatedItem = await translateAndAddToObject(
              cleanItem,
              'es',
              ['en', 'fr', 'it'],
              fieldsToTranslateForItem as (keyof typeof cleanItem)[]
            );
            
            return translatedItem;
          })
        );
        
        // Actualizar los datos con los items traducidos
        return await sendToServer(section, translatedItems);
      } else {
        // Procesar objeto individual
        const cleanData = { ...data };
        
        // Eliminar _modifiedFields si existe
        if (cleanData._modifiedFields) {
          delete cleanData._modifiedFields;
        }
        
        // Determinar los campos a traducir
        const fieldsToTranslateForData = Object.keys(cleanData)
          .filter(key => fieldsToTranslate[section].includes(key));
        
        // Si hay campos para traducir, proceder con la traducción
        if (fieldsToTranslateForData.length > 0) {
          const translatedData = await translateAndAddToObject(
            cleanData,
            'es',
            ['en', 'fr', 'it'],
            fieldsToTranslateForData as (keyof typeof cleanData)[]
          );
          return await sendToServer(section, translatedData);
        } else {
          return await sendToServer(section, cleanData);
        }
      }
    } else {
      return await sendToServer(section, data);
    }
  } catch (error) {
    console.error(`[updateContent] Error updating ${section}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Elimina un servicio específico por su ID
 * @param id ID del servicio a eliminar
 * @returns Respuesta del servidor
 */
export const deleteService = async (id: string) => {
  try {
    // Validar que el ID no esté vacío
    if (!id || id.trim() === '') {
      console.error('[deleteService/api] ID de servicio vacío o inválido');
      return {
        success: false,
        message: 'ID de servicio inválido'
      };
    }
    
    const response = await fetch(`${API_URL}/content/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[deleteService/api] Error en la respuesta: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => {
        console.error('[deleteService/api] No se pudo parsear la respuesta de error como JSON');
        return {};
      });
      console.error('[deleteService/api] Datos de error:', errorData);
      const errorMessage = errorData.message || `Error eliminando servicio con ID ${id}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[deleteService/api] Error:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Función auxiliar para enviar datos al servidor
 */
const sendToServer = async (section: string, data: any) => {
  // Construir el payload con los datos actualizados
  const payload = { [section]: data };
  
  // Enviar la solicitud al servidor
  const response = await fetch(`${API_URL}/content`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error actualizando ${section}`);
  }

  const result = await response.json();
  return result;
};
