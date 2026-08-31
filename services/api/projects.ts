import { API_URL } from './index';
import { translateAndAddToObject } from '../client/translation';

/**
 * Obtiene los proyectos, opcionalmente filtrados por categoría
 */
export const fetchProjects = async (category?: string) => {
  try {
    const url = category 
      ? `${API_URL}/projects?category=${category}` 
      : `${API_URL}/projects`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchProjectById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching project by id:', error);
    return null;
  }
};

export const createProject = async (project: any) => {
  try {
    const fieldsToTranslate = ['title', 'description'];
    const projectWithTranslations = await translateAndAddToObject(
      project,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate
    );
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectWithTranslations),
    });
    
    if (!response.ok) {
      throw new Error('Error creando proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

export const updateProject = async (id: string, project: any) => {
  try {
    const fieldsRequiringTranslation = ['title', 'description'];
    const fieldsToTranslate = Object.keys(project).filter(field => 
      fieldsRequiringTranslation.includes(field)
    );
    if (fieldsToTranslate.length === 0) {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        throw new Error('Error actualizando proyecto');
      }
      return await response.json();
    }
    const projectWithTranslations = await translateAndAddToObject(
      project,
      'es',
      ['en', 'fr', 'it'],
      fieldsToTranslate
    );
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectWithTranslations),
    });
    
    if (!response.ok) {
      throw new Error('Error actualizando proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};

export const deleteProject = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error eliminando proyecto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
};
