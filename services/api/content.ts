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

export const updateContent = async (section: string, data: any) => {
  try {
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

    if (fieldsToTranslate[section]) {
      
      if (Array.isArray(data)) {
        
        
        const translatedItems = await Promise.all(
          data.map(async (item, index) => {
            const cleanItem = { ...item };
            
            if (cleanItem._modifiedFields) {
              delete cleanItem._modifiedFields;
            }
            
            const isNewItem = !cleanItem._id || cleanItem._id === '';
            
            const fieldsToTranslateForItem = Object.keys(cleanItem)
              .filter(key => 
                fieldsToTranslate[section].includes(key) && 
                key !== '_id'
              );
            if (fieldsToTranslateForItem.length === 0) {
              return cleanItem;
            }
            
            const translatedItem = await translateAndAddToObject(
              cleanItem,
              'es',
              ['en', 'fr', 'it'],
              fieldsToTranslateForItem as (keyof typeof cleanItem)[]
            );
            
            return translatedItem;
          })
        );
        
        return await sendToServer(section, translatedItems);
      } else {
        const cleanData = { ...data };
        
        if (cleanData._modifiedFields) {
          delete cleanData._modifiedFields;
        }
        
        const fieldsToTranslateForData = Object.keys(cleanData)
          .filter(key => fieldsToTranslate[section].includes(key));
        
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

export const deleteService = async (id: string) => {
  try {
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

const sendToServer = async (section: string, data: any) => {
  const payload = { [section]: data };
  
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
