// portfolio/services/api/skills/regular-skills.ts
import { API_URL } from '../index';

/**
 * Obtiene todas las habilidades agrupadas por categoría
 */
export const fetchSkills = async () => {
  try {
    const frontendSkills = await fetchSkillsByCategory('frontend');
    const backendSkills = await fetchSkillsByCategory('backend');
    const databaseSkills = await fetchSkillsByCategory('database');
    const devopsSkills = await fetchSkillsByCategory('devops');
    
    return {
      frontend: frontendSkills,
      backend: backendSkills,
      database: databaseSkills,
      devops: devopsSkills
    };
  } catch (error) {
    console.error('Error:', error);
    return { frontend: [], backend: [], database: [], devops: [] };
  }
};

/**
 * Obtiene habilidades por categoría
 */
export const fetchSkillsByCategory = async (category: string) => {
  try {
    const response = await fetch(`${API_URL}/skills?category=${category}`);
    if (!response.ok) throw new Error(`Error obteniendo skills de ${category}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

/**
 * Crea una nueva habilidad
 */
export const createSkill = async (skill: any) => {
  try {
    const skillToCreate = {
      name: skill.name,
      icon: skill.icon,
      colored: skill.colored !== undefined ? skill.colored : false,
      category: skill.category
    };
    
    const response = await fetch(`${API_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillToCreate),
    });
    
    if (!response.ok) {
      throw new Error('Error creando skill');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

/**
 * Actualiza una habilidad existente
 */
export const updateSkill = async (id: string, skill: any) => {
  try {
    const skillToUpdate = {
      name: skill.name,
      icon: skill.icon,
      colored: skill.colored !== undefined ? skill.colored : false,
      category: skill.category
    };
    
    const response = await fetch(`${API_URL}/skills/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillToUpdate),
    });
    
    if (!response.ok) {
      throw new Error('Error actualizando skill');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error detallado al actualizar skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

/**
 * Elimina una habilidad
 */
export const deleteSkill = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/skills/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error eliminando skill');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting skill:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};
