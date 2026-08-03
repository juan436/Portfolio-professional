import { API_URL } from './index';

export const fetchCertificates = async () => {
  try {
    const response = await fetch(`${API_URL}/certificates`);
    if (!response.ok) throw new Error('Error al obtener certificados');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

export const fetchCertificateById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/certificates/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching certificate by id:', error);
    return null;
  }
};
