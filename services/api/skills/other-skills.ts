import { API_URL } from '../index';
import { translateAndAddToObject } from '../../client/translation';

/**
 * Obtiene otras habilidades
 */
export const fetchOtherSkills = async () => {
  const response = await fetch('/api/other-skills');
  return await response.json();
};

export const createOtherSkill = async (skill: any) => {
  try {
    const skillBase = {
      name: skill.name
    };
    
    const fieldsToTranslate: Array<keyof typeof skillBase> = ['name'];
    
    const skillWithTranslations = await translateAndAddToObject(
      skillBase,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate
    );
    
    const response = await fetch(`${API_URL}/other-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillWithTranslations),
    });
    
    if (!response.ok) {
      throw new Error('Error creando habilidad adicional');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating other skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

export const updateOtherSkill = async (id: string, skill: any) => {
  try {
    const fieldsToTranslate: Array<keyof typeof skill> = ['name'];
    
    const skillWithTranslations = await translateAndAddToObject(
      skill,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate
    );
    
    const response = await fetch(`${API_URL}/other-skills/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillWithTranslations),
    });
    
    if (!response.ok) {
      throw new Error('Error actualizando habilidad adicional');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating other skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

export const deleteOtherSkill = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/other-skills/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error eliminando habilidad adicional');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting other skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};
