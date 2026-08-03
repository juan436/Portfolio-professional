import { API_URL } from './index';

export interface RawTestimonial {
  _id: string;
  author: string;
  role?: string;
  email?: string;
  photo?: string;
  content: string;
  type: 'personal' | 'resultado';
  rating?: number;
  links: { type: 'proyecto' | 'automatizacion'; ref: string }[];
}

/**
 * Obtiene testimonios, filtrados opcionalmente por tipo y/o a qué proyecto/automatización están vinculados
 */
export const fetchTestimonials = async (
  params: { type?: 'personal' | 'resultado'; ref?: string } = {}
): Promise<RawTestimonial[]> => {
  try {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.ref) query.set('ref', params.ref);

    const response = await fetch(`${API_URL}/testimonials?${query.toString()}`);

    if (!response.ok) {
      throw new Error('Error al obtener testimonios');
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};
