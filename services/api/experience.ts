// portfolio/services/api/experience.ts
import { API_URL } from './index';
import { translateAndAddToObject } from '../client/translation';

/**
 * Obtiene todas las experiencias
 */
export const fetchExperiences = async () => {
  try {
    const response = await fetch(`${API_URL}/experience`);
    if (!response.ok) throw new Error('Error obteniendo experiencias');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Crea una nueva experiencia con traducciones automáticas
 */
export const createExperience = async (experience: any) => {
  try {
    const fieldsToTranslate = ['position', 'location', 'description'];
    const experienceWithTranslations = await translateAndAddToObject(
      experience,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate
    );
    const response = await fetch(`${API_URL}/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experienceWithTranslations),
    });

    if (!response.ok) {
      throw new Error('Error creando experiencia');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating experience:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Actualiza una experiencia existente con traducciones automáticas
 * Solo traduce los campos que realmente han sido modificados
 */
export const updateExperience = async (id: string, experience: any) => {
  try {
    // 1. Verificar qué campos modificados necesitan traducción
    const fieldsRequiringTranslation = ['position', 'location', 'description'];
    const fieldsToTranslate = Object.keys(experience).filter(field => 
      fieldsRequiringTranslation.includes(field)
    );
    
    // 2. Si no hay campos que requieran traducción, actualizar sin traducir
    if (fieldsToTranslate.length === 0) {
      const response = await fetch(`${API_URL}/experience/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experience),
      });

      if (!response.ok) {
        throw new Error('Error actualizando experiencia');
      }

      return await response.json();
    }
    
    // 3. Solo traducir los campos que están en la actualización y requieren traducción
    const experienceWithTranslations = await translateAndAddToObject(
      experience,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate as any[]
    );
    
    // 4. Enviar al backend el objeto con traducciones
    const response = await fetch(`${API_URL}/experience/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experienceWithTranslations),
    });

    if (!response.ok) {
      throw new Error('Error actualizando experiencia');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating experience:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Elimina una experiencia
 */
export const deleteExperience = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/experience/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error eliminando experiencia');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting experience:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
