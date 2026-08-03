import { API_URL } from './index';

export interface ProjectMetric {
  label: string;
  value: string;
}

/**
 * Obtiene las estadísticas (métricas medibles) de un proyecto o automatización puntual.
 * Vive separado del testimonio: lo carga el dueño del sitio, no el cliente.
 */
export const fetchProjectStats = async (ref: string): Promise<ProjectMetric[]> => {
  try {
    const response = await fetch(`${API_URL}/project-stats?ref=${encodeURIComponent(ref)}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return [];
  }
};
